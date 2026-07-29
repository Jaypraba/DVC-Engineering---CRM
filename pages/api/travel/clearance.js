import { requireAuth } from '../../../lib/auth';
import { fetchClearanceDeals } from '../../../lib/travel/clearance';
import { parseClearanceHeadlines } from '../../../lib/travel/ai';

// GET /api/travel/clearance[?enrich=1]
// Aggregated error fares and flash sales from public deal feeds.
// enrich=1 runs Claude over the headlines to extract routes/prices.
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, failedSources } = await fetchClearanceDeals();

    let enriched = items;
    if (req.query.enrich === '1' && items.length && process.env.ANTHROPIC_API_KEY) {
      const extracted = await parseClearanceHeadlines(items.slice(0, 30));
      const byIndex = new Map(extracted.map((d) => [d.index, d]));
      enriched = items.map((item, i) => {
        const ai = byIndex.get(i);
        if (!ai) return item;
        return {
          ...item,
          origin: ai.origin || null,
          destination: ai.destination || null,
          price: item.price || (ai.price ? { amount: ai.price, currency: ai.currency || 'USD' } : null),
          roundTrip: ai.roundTrip,
          isErrorFare: item.isErrorFare || ai.isErrorFare,
        };
      });
    }

    return res.status(200).json({
      deals: enriched,
      errorFareCount: enriched.filter((d) => d.isErrorFare).length,
      failedSources,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Clearance feed error:', err);
    return res.status(500).json({ error: 'Failed to fetch clearance deals' });
  }
}

export default requireAuth(handler);
