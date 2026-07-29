// Amadeus Self-Service API client (flights + hotels).
// Free test tier: https://developers.amadeus.com — set AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET.
// AMADEUS_ENV=production switches to the live endpoint.

const BASE_URL = process.env.AMADEUS_ENV === 'production'
  ? 'https://api.amadeus.com'
  : 'https://test.api.amadeus.com';

let cachedToken = null; // { token, expiresAt }

async function getToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30000) {
    return cachedToken.token;
  }
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET are not set');
  }
  const res = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
  });
  if (!res.ok) {
    throw new Error(`Amadeus auth failed: ${await res.text()}`);
  }
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 1799) * 1000 };
  return cachedToken.token;
}

async function amadeusGet(path, params = {}) {
  const token = await getToken();
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const res = await fetch(`${BASE_URL}${path}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body?.errors?.[0]?.detail || body?.errors?.[0]?.title || res.statusText;
    const err = new Error(`Amadeus ${path}: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

// Round-trip / one-way priced offers for a specific route and dates.
export async function searchFlightOffers({ origin, destination, departureDate, returnDate, adults = 1, cabin, nonStop, maxPrice, currency = 'GBP', max = 20 }) {
  const body = await amadeusGet('/v2/shopping/flight-offers', {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    returnDate,
    adults,
    travelClass: cabin && cabin !== 'ANY' ? cabin : undefined,
    nonStop: nonStop ? 'true' : undefined,
    maxPrice: maxPrice ? Math.floor(maxPrice) : undefined,
    currencyCode: currency,
    max,
  });
  const carriers = body.dictionaries?.carriers || {};
  return (body.data || []).map((o) => {
    const out = o.itineraries?.[0];
    const back = o.itineraries?.[1];
    const firstSeg = out?.segments?.[0];
    const lastSeg = out?.segments?.[out.segments.length - 1];
    const carrierCode = o.validatingAirlineCodes?.[0] || firstSeg?.carrierCode;
    return {
      id: o.id,
      price: parseFloat(o.price?.grandTotal || o.price?.total || 0),
      currency: o.price?.currency || currency,
      origin: firstSeg?.departure?.iataCode,
      destination: lastSeg?.arrival?.iataCode,
      departureDate: firstSeg?.departure?.at?.slice(0, 10),
      returnDate: back?.segments?.[0]?.departure?.at?.slice(0, 10) || null,
      carrier: carriers[carrierCode] || carrierCode || 'Unknown',
      carrierCode,
      stops: (out?.segments?.length || 1) - 1,
      duration: out?.duration?.replace('PT', '').toLowerCase() || '',
      seatsLeft: o.numberOfBookableSeats || null,
    };
  });
}

// "Anywhere cheap" — cheapest destinations from an origin. This is the
// clearance-hunting workhorse: Amadeus surfaces heavily discounted fares here.
export async function searchFlightInspiration({ origin, departureDate, maxPrice, oneWay = false, duration }) {
  const body = await amadeusGet('/v1/shopping/flight-destinations', {
    origin,
    departureDate,
    maxPrice: maxPrice ? Math.floor(maxPrice) : undefined,
    oneWay: oneWay ? 'true' : undefined,
    duration,
  });
  return (body.data || []).map((d) => ({
    origin: d.origin,
    destination: d.destination,
    departureDate: d.departureDate,
    returnDate: d.returnDate || null,
    price: parseFloat(d.price?.total || 0),
    currency: body.meta?.currency || 'EUR',
    bookingLink: d.links?.flightOffers || null,
  }));
}

// Flexible dates — cheapest departure/return date combos for a fixed route.
export async function searchCheapestDates({ origin, destination, departureDate, oneWay = false, duration }) {
  const body = await amadeusGet('/v1/shopping/flight-dates', {
    origin,
    destination,
    departureDate,
    oneWay: oneWay ? 'true' : undefined,
    duration,
  });
  return (body.data || []).map((d) => ({
    origin: d.origin,
    destination: d.destination,
    departureDate: d.departureDate,
    returnDate: d.returnDate || null,
    price: parseFloat(d.price?.total || 0),
    currency: body.meta?.currency || 'EUR',
  }));
}

// Historical price quartiles for a route+date. Lets us say "42% below typical".
export async function getPriceMetrics({ origin, destination, departureDate, currency = 'GBP' }) {
  try {
    const body = await amadeusGet('/v1/analytics/itinerary-price-metrics', {
      originIataCode: origin,
      destinationIataCode: destination,
      departureDate,
      currencyCode: currency,
    });
    const metrics = body.data?.[0]?.priceMetrics || [];
    const byRank = {};
    for (const m of metrics) byRank[m.quartileRanking] = parseFloat(m.amount);
    if (byRank.MEDIUM === undefined) return null;
    return {
      minimum: byRank.MINIMUM,
      firstQuartile: byRank.FIRST,
      median: byRank.MEDIUM,
      thirdQuartile: byRank.THIRD,
      maximum: byRank.MAXIMUM,
    };
  } catch {
    return null; // metrics are best-effort; not all routes are covered
  }
}

// Hotels: list properties in a city, then price the best available rates.
export async function searchHotels({ cityCode, checkInDate, checkOutDate, adults = 1, maxHotels = 12, currency = 'GBP' }) {
  const list = await amadeusGet('/v1/reference-data/locations/hotels/by-city', {
    cityCode,
    radius: 20,
    radiusUnit: 'KM',
    hotelSource: 'ALL',
  });
  const hotelIds = (list.data || []).slice(0, maxHotels * 3).map((h) => h.hotelId);
  if (hotelIds.length === 0) return [];

  const offers = await amadeusGet('/v3/shopping/hotel-offers', {
    hotelIds: hotelIds.slice(0, 40).join(','),
    checkInDate,
    checkOutDate,
    adults,
    currency,
    bestRateOnly: 'true',
  });

  const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000));
  return (offers.data || [])
    .filter((h) => h.available !== false && h.offers?.length)
    .map((h) => {
      const offer = h.offers[0];
      const total = parseFloat(offer.price?.total || 0);
      return {
        hotelId: h.hotel?.hotelId,
        name: h.hotel?.name || 'Hotel',
        cityCode: h.hotel?.cityCode,
        checkInDate: offer.checkInDate,
        checkOutDate: offer.checkOutDate,
        roomDescription: offer.room?.typeEstimated?.category?.replace(/_/g, ' ').toLowerCase() || '',
        total,
        perNight: Math.round((total / nights) * 100) / 100,
        currency: offer.price?.currency || currency,
        cancellable: !!offer.policies?.cancellations?.length,
      };
    })
    .sort((a, b) => a.total - b.total)
    .slice(0, maxHotels);
}

export function isAmadeusConfigured() {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}
