import { requireAuth } from '../../../lib/auth';
import { parseTravelQuery, scoreDeal, summariseDeals } from '../../../lib/travel/ai';
import {
  searchFlightOffers,
  searchFlightInspiration,
  searchCheapestDates,
  searchHotels,
  getPriceMetrics,
  isAmadeusConfigured,
} from '../../../lib/travel/amadeus';

// POST /api/travel/search { query: "cheap week in Lisbon in September under £200" }
// Natural-language in, AI-scored flight and hotel deals out.
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAmadeusConfigured()) {
    return res.status(503).json({ error: 'Amadeus API is not configured. Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET (free at developers.amadeus.com).' });
  }

  const { query } = req.body || {};
  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const parsed = await parseTravelQuery(query.trim(), today);

    let flights = [];
    let hotels = [];
    const warnings = [];

    const wantFlights = parsed.searchType !== 'hotels';
    const wantHotels = parsed.searchType === 'hotels' || parsed.searchType === 'both';

    if (wantFlights) {
      if (parsed.mode === 'anywhere' || !parsed.destination) {
        // No fixed destination: sweep for the cheapest places to fly.
        try {
          const inspiration = await searchFlightInspiration({
            origin: parsed.origin || 'LON',
            departureDate: parsed.flexibleDates ? undefined : parsed.departureDate,
            maxPrice: parsed.maxPriceGBP || undefined,
            oneWay: !parsed.returnDate && !parsed.nights,
            duration: parsed.nights || undefined,
          });
          flights = inspiration.map((f) => ({ ...f, carrier: null, stops: null, kind: 'inspiration' }));
        } catch (err) {
          warnings.push(`Destination sweep failed: ${err.message}`);
        }
      } else {
        try {
          flights = (await searchFlightOffers({
            origin: parsed.origin || 'LON',
            destination: parsed.destination,
            departureDate: parsed.departureDate,
            returnDate: parsed.returnDate || undefined,
            adults: parsed.adults || 1,
            cabin: parsed.cabin,
            nonStop: parsed.nonStop,
            maxPrice: parsed.maxPriceGBP || undefined,
          })).map((f) => ({ ...f, kind: 'offer' }));
        } catch (err) {
          warnings.push(`Flight search failed: ${err.message}`);
        }

        // Flexible dates: also surface the cheapest date combos on the route.
        if (parsed.flexibleDates) {
          try {
            const dates = await searchCheapestDates({
              origin: parsed.origin || 'LON',
              destination: parsed.destination,
              oneWay: !parsed.returnDate && !parsed.nights,
              duration: parsed.nights || undefined,
            });
            const cheapest = dates.sort((a, b) => a.price - b.price).slice(0, 8);
            flights = flights.concat(cheapest.map((f) => ({ ...f, carrier: null, stops: null, kind: 'flexible-date' })));
          } catch {
            // cheapest-dates has narrow route coverage; skip quietly
          }
        }

        // Price context so we can label real discounts, not just low numbers.
        const metrics = await getPriceMetrics({
          origin: parsed.origin || 'LON',
          destination: parsed.destination,
          departureDate: parsed.departureDate,
        });
        if (metrics) {
          flights = flights.map((f) => ({ ...f, ...scoreDeal(f.price, metrics), typicalPrice: metrics.median }));
        }
      }
      flights.sort((a, b) => a.price - b.price);
      flights = flights.slice(0, 25);
    }

    if (wantHotels && parsed.hotelCityCode) {
      try {
        const checkIn = parsed.departureDate;
        const nights = parsed.nights || (parsed.returnDate
          ? Math.max(1, Math.round((new Date(parsed.returnDate) - new Date(parsed.departureDate)) / 86400000))
          : 3);
        const checkOut = parsed.returnDate || new Date(new Date(checkIn).getTime() + nights * 86400000).toISOString().slice(0, 10);
        hotels = await searchHotels({
          cityCode: parsed.hotelCityCode,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: parsed.adults || 1,
        });
      } catch (err) {
        warnings.push(`Hotel search failed: ${err.message}`);
      }
    }

    const verdict = (flights.length || hotels.length)
      ? await summariseDeals({ interpretation: parsed.interpretation, flights, hotels })
      : null;

    return res.status(200).json({ parsed, flights, hotels, verdict, warnings });
  } catch (err) {
    console.error('Travel search error:', err);
    return res.status(500).json({ error: err.message || 'Travel search failed' });
  }
}

export default requireAuth(handler);
