// Claude helpers for the travel deals finder: natural-language query parsing,
// deal scoring, and alert digest copy.

const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(systemPrompt, userPrompt, maxTokens = 1024) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${await response.text()}`);
  }
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in AI response');
  return JSON.parse(match[0]);
}

// Turn "cheap week somewhere hot in September from London under £250" into
// structured search parameters.
export async function parseTravelQuery(query, today) {
  const system = `You convert natural-language travel requests into JSON search parameters. Today's date is ${today}. Respond with ONLY a JSON object, no prose, with these fields:
{
  "searchType": "flights" | "hotels" | "both",
  "mode": "route" | "anywhere",           // "anywhere" when no specific destination is given
  "origin": "IATA city/airport code",      // default "LON" if unstated
  "destination": "IATA code or null",      // null when mode is "anywhere"
  "destinationCity": "city name or null",
  "hotelCityCode": "IATA city code for hotel search or null",
  "departureDate": "YYYY-MM-DD",           // pick a sensible date if vague; never in the past
  "returnDate": "YYYY-MM-DD or null",      // null for one-way
  "flexibleDates": true | false,           // true when dates are vague ("in September", "next month")
  "nights": number or null,
  "adults": number,                        // default 1
  "cabin": "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST" | "ANY",
  "nonStop": true | false,
  "maxPriceGBP": number or null,           // total budget cap if stated
  "interpretation": "one short sentence restating the request"
}
Use official IATA codes (LON, PAR, NYC, BCN, LIS, DXB...). If the user names a region ("somewhere hot", "Europe"), keep mode "anywhere". Dates in the past are invalid; roll them to the next occurrence.`;
  const raw = await callClaude(system, query, 700);
  return extractJson(raw);
}

// Local, deterministic deal scoring against typical route prices.
// discountPct > 0 means cheaper than the historical median.
export function scoreDeal(price, metrics) {
  if (!metrics || !metrics.median || !price) {
    return { discountPct: null, tier: 'unknown', score: 50 };
  }
  const discountPct = Math.round(((metrics.median - price) / metrics.median) * 100);
  let tier = 'typical';
  if (price <= metrics.minimum * 1.05 || discountPct >= 45) tier = 'clearance';
  else if (discountPct >= 25) tier = 'great';
  else if (discountPct >= 10) tier = 'good';
  else if (discountPct < -10) tier = 'poor';
  const score = Math.max(0, Math.min(100, 50 + discountPct));
  return { discountPct, tier, score };
}

// One Claude call to produce a short expert verdict over the result set.
export async function summariseDeals({ interpretation, flights = [], hotels = [] }) {
  const system = `You are a sharp travel deals analyst. Given search results with pricing context, write a verdict in 2-3 sentences: whether the prices are genuinely good, which specific option is the standout, and one actionable tip (book now vs wait, nearby airport, shift dates). British English. No em dashes. No markdown headers. Be specific with prices and names.`;
  const user = JSON.stringify({
    request: interpretation,
    flights: flights.slice(0, 10).map((f) => ({
      route: `${f.origin}-${f.destination}`, price: f.price, currency: f.currency,
      date: f.departureDate, carrier: f.carrier, stops: f.stops,
      discountVsTypicalPct: f.discountPct, tier: f.tier,
    })),
    hotels: hotels.slice(0, 8).map((h) => ({ name: h.name, perNight: h.perNight, total: h.total, currency: h.currency })),
  });
  try {
    const text = await callClaude(system, user, 400);
    return text.trim();
  } catch {
    return null; // verdict is a nice-to-have; never fail the search over it
  }
}

// Extract structured deal data from clearance/error-fare headlines.
export async function parseClearanceHeadlines(items) {
  const system = `You extract flight deal data from deal-site headlines. Respond with ONLY a JSON object: {"deals":[...]} where each deal has:
{"index": number,                       // index of the input item
 "origin": "city or airport name or null",
 "destination": "city or null",
 "price": number or null,               // numeric price in the headline
 "currency": "GBP"|"USD"|"EUR"|null,
 "roundTrip": true|false|null,
 "isErrorFare": true|false}             // true only if headline suggests a mistake/error fare or extreme discount
Skip items that are not flight or hotel deals (omit them from the output).`;
  const user = JSON.stringify(items.map((it, index) => ({ index, title: it.title })));
  try {
    const raw = await callClaude(system, user, 1500);
    const parsed = extractJson(raw);
    return parsed.deals || [];
  } catch {
    return [];
  }
}

// Intro copy for the deal alert email digest.
export async function writeAlertIntro({ label, dealCount, bestDeal }) {
  const system = 'You write one short, punchy intro sentence for a travel deal alert email. British English. No em dashes. No exclamation overload. Mention the best price found.';
  const user = `Alert: "${label}". ${dealCount} matching deal(s) found. Best: ${bestDeal}`;
  try {
    const text = await callClaude(system, user, 120);
    return text.trim();
  } catch {
    return `We found ${dealCount} deal(s) matching your alert.`;
  }
}
