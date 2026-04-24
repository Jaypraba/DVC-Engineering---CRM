import { requireAuth } from '../../../lib/auth';
import { normaliseSurreyLead, normalisePlanningApiLead } from '../../../lib/vetting';

const HOUSEHOLDER_TYPES = ['householder', 'full', 'prior approval', 'prior_approval'];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRelevantType(type = '') {
  const t = type.toLowerCase();
  return HOUSEHOLDER_TYPES.some((k) => t.includes(k));
}

function isGranted(status = '') {
  const s = status.toLowerCase();
  return s.includes('grant') || s.includes('approved') || s.includes('permitted');
}

async function fetchSurreyHub(lpa, daysBack) {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);
  const url = `http://digitalservices.surreyi.gov.uk/developmentcontrol/0.1/applications/search?status=decided&gsscode=${lpa.gss}&limit=200`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Surrey hub ${lpa.name} returned ${res.status}`);

  const data = await res.json();
  const features = data.features || data.results || [];
  return features
    .filter((f) => {
      const props = f.properties || f;
      return isGranted(props.status || '') && isRelevantType(props.application_type || props.type || '');
    })
    .map((f) => normaliseSurreyLead(f, lpa.name));
}

async function fetchPlanningApi(lpa, daysBack) {
  const now = new Date();
  const dateTo = now.toISOString().split('T')[0];
  const dateFrom = new Date(now.setDate(now.getDate() - daysBack)).toISOString().split('T')[0];

  const url = `https://api.planning.org.uk/v1/search?key=${process.env.PLANNING_API_KEY}&lpa_name=${encodeURIComponent(lpa.name)}&date_from=${dateFrom}&date_to=${dateTo}&return_data=1`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Planning API ${lpa.name} returned ${res.status}`);

  const data = await res.json();
  const items = data.results || data.data || [];
  return items
    .filter((item) => {
      return isGranted(item.status || item.decision || '') && isRelevantType(item.application_type || item.type || '');
    })
    .map((item) => normalisePlanningApiLead(item, lpa.name, lpa.region));
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lpas = [], daysBack = 180 } = req.body || {};
  if (!lpas.length) {
    return res.status(400).json({ error: 'No LPAs specified' });
  }

  const results = [];
  const errors = [];

  for (const lpa of lpas) {
    try {
      let leads = [];
      if (lpa.source === 'surrey_hub') {
        leads = await fetchSurreyHub(lpa, daysBack);
      } else if (lpa.source === 'planning_api') {
        leads = await fetchPlanningApi(lpa, daysBack);
        await delay(300);
      }
      results.push(...leads);
    } catch (err) {
      errors.push({ lpa: lpa.name, error: err.message });
    }
  }

  return res.status(200).json({ total: results.length, results, errors });
}

export default requireAuth(handler);
