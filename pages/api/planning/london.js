import { requireAuth } from '../../../lib/auth';
import { APPLICATION_TYPES_LONDON } from '../../../lib/lpas';

const PLD_ENDPOINT = 'https://planningdata.london.gov.uk/api-guest/applications/_search';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lpas = [], daysBack = 180 } = req.body || {};
  if (!lpas.length) {
    return res.status(400).json({ error: 'No LPAs specified' });
  }

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);
  const sinceDateStr = sinceDate.toISOString().split('T')[0];

  const esQuery = {
    query: {
      bool: {
        must: [
          { terms: { 'lpa_name.raw': lpas } },
          { terms: { 'application_type.raw': APPLICATION_TYPES_LONDON } },
          { term: { 'decision.raw': 'Granted' } },
          { range: { decision_date: { gte: sinceDateStr } } },
        ],
      },
    },
    _source: [
      'lpa_name', 'lpa_app_no', 'site_address', 'application_type',
      'development_description', 'decision', 'decision_date', 'valid_date',
      'uprn', 'site_easting', 'site_northing',
    ],
    size: 200,
    sort: [{ decision_date: { order: 'desc' } }],
  };

  try {
    const response = await fetch(PLD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-AllowRequest': process.env.PLD_API_HEADER || '',
      },
      body: JSON.stringify(esQuery),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('PLD API error:', response.status, text);
      return res.status(502).json({ error: `Planning portal returned ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return res.status(504).json({ error: 'Planning portal request timed out' });
    }
    console.error('London planning fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch planning data' });
  }
}

export default requireAuth(handler);
