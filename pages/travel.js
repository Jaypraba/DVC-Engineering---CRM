import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (n, ccy = 'GBP') => (ccy === 'GBP' ? '£' : ccy === 'EUR' ? '€' : '$') + Number(n || 0).toLocaleString('en-GB');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
const TIER_STYLE = {
  clearance: { bg: '#c0392b', fg: '#fff', label: 'CLEARANCE' },
  great: { bg: '#FEF0E6', fg: '#F4822A', label: 'GREAT DEAL' },
  good: { bg: '#fff7ec', fg: '#b86c00', label: 'GOOD PRICE' },
  typical: { bg: '#F8F7F5', fg: '#8a96a8', label: 'TYPICAL' },
  poor: { bg: '#F8F7F5', fg: '#8a96a8', label: 'ABOVE TYPICAL' },
};

const EXAMPLES = [
  'Cheapest places to fly from London in September under £150',
  'Return flights London to Lisbon, first week of October, under £120',
  'Flights and hotel in Barcelona for a long weekend next month, 2 adults',
  'One-way to New York in November, any cabin, best deal',
];

function TierBadge({ tier, discountPct }) {
  const s = TIER_STYLE[tier];
  if (!s) return null;
  return (
    <span style={{ background: s.bg, color: s.fg, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {tier === 'clearance' || !discountPct ? s.label : `${discountPct}% BELOW TYPICAL`}
    </span>
  );
}

function Card({ children, style }) {
  return <div style={{ background: '#fff', border: '1px solid #E4E0D8', borderRadius: 10, padding: 18, ...style }}>{children}</div>;
}

// ── Flight result card ────────────────────────────────────────────────────────
function FlightCard({ f }) {
  return (
    <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 180 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0A1628' }}>
          {f.origin} <span style={{ color: '#F4822A' }}>→</span> {f.destination}
        </div>
        <div style={{ fontSize: 12, color: '#8a96a8', marginTop: 3 }}>
          {fmtDate(f.departureDate)}{f.returnDate ? ` – ${fmtDate(f.returnDate)}` : ' · one-way'}
          {f.carrier ? ` · ${f.carrier}` : ''}
          {f.stops === 0 ? ' · direct' : f.stops > 0 ? ` · ${f.stops} stop${f.stops > 1 ? 's' : ''}` : ''}
          {f.kind === 'flexible-date' ? ' · flexible-date find' : ''}
        </div>
        {f.seatsLeft && f.seatsLeft <= 4 && (
          <div style={{ fontSize: 11, color: '#c0392b', fontWeight: 600, marginTop: 3 }}>Only {f.seatsLeft} seats at this price</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TierBadge tier={f.tier} discountPct={f.discountPct} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0A1628' }}>{fmtPrice(f.price, f.currency)}</div>
          {f.typicalPrice && <div style={{ fontSize: 11, color: '#8a96a8' }}>typically {fmtPrice(f.typicalPrice)}</div>}
        </div>
      </div>
    </Card>
  );
}

function HotelCard({ h }) {
  return (
    <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0A1628', textTransform: 'capitalize' }}>{(h.name || '').toLowerCase()}</div>
        <div style={{ fontSize: 12, color: '#8a96a8', marginTop: 3 }}>
          {fmtDate(h.checkInDate)} – {fmtDate(h.checkOutDate)}
          {h.roomDescription ? ` · ${h.roomDescription}` : ''}
          {h.cancellable ? ' · free cancellation' : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0A1628' }}>{fmtPrice(h.perNight, h.currency)}<span style={{ fontSize: 12, fontWeight: 400, color: '#8a96a8' }}>/night</span></div>
        <div style={{ fontSize: 11, color: '#8a96a8' }}>{fmtPrice(h.total, h.currency)} total</div>
      </div>
    </Card>
  );
}

// ── AI Search tab ─────────────────────────────────────────────────────────────
function SearchTab({ authFetch }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function runSearch(q) {
    const text = (q || query).trim();
    if (!text) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await authFetch('/api/travel/search', { method: 'POST', body: JSON.stringify({ query: text }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder='Describe your trip, e.g. "cheap week in Portugal in September under £200"'
            style={{ flex: 1, minWidth: 240, padding: '12px 14px', border: '1px solid #E4E0D8', borderRadius: 8, fontSize: 14, fontFamily: "'Barlow', sans-serif", outline: 'none' }}
          />
          <button onClick={() => runSearch()} disabled={loading}
            style={{ background: '#F4822A', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: "'Barlow', sans-serif" }}>
            {loading ? 'Hunting…' : 'Find Deals'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => { setQuery(ex); runSearch(ex); }}
              style={{ background: '#F8F7F5', border: '1px solid #E4E0D8', borderRadius: 14, padding: '5px 12px', fontSize: 12, color: '#3d4f6b', cursor: 'pointer', fontFamily: "'Barlow', sans-serif" }}>
              {ex}
            </button>
          ))}
        </div>
      </Card>

      {loading && (
        <Card style={{ textAlign: 'center', color: '#8a96a8', fontSize: 14 }}>
          AI is parsing your request, sweeping fares and checking typical prices…
        </Card>
      )}
      {error && <Card style={{ borderColor: '#c0392b', color: '#c0392b', fontSize: 14 }}>{error}</Card>}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {result.parsed?.interpretation && (
            <div style={{ fontSize: 13, color: '#8a96a8' }}>Understood as: <em>{result.parsed.interpretation}</em></div>
          )}
          {result.verdict && (
            <Card style={{ background: '#FEF0E6', borderColor: '#F4822A' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#F4822A', letterSpacing: '0.08em', marginBottom: 6 }}>AI VERDICT</div>
              <div style={{ fontSize: 14, color: '#0A1628', lineHeight: 1.55 }}>{result.verdict}</div>
            </Card>
          )}
          {result.flights?.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginTop: 6 }}>Flights ({result.flights.length})</div>
              {result.flights.map((f, i) => <FlightCard key={i} f={f} />)}
            </>
          )}
          {result.hotels?.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginTop: 6 }}>Hotels ({result.hotels.length})</div>
              {result.hotels.map((h, i) => <HotelCard key={i} h={h} />)}
            </>
          )}
          {!result.flights?.length && !result.hotels?.length && (
            <Card style={{ color: '#8a96a8', fontSize: 14 }}>
              No results for this search. {result.warnings?.length ? result.warnings.join(' ') : 'Try broadening the dates or budget.'}
            </Card>
          )}
          {result.warnings?.length > 0 && result.flights?.length > 0 && (
            <div style={{ fontSize: 12, color: '#b86c00' }}>{result.warnings.join(' · ')}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Clearance tab ─────────────────────────────────────────────────────────────
function ClearanceTab({ authFetch }) {
  const [deals, setDeals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorFaresOnly, setErrorFaresOnly] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/api/travel/clearance?enrich=1');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setDeals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const items = (deals?.deals || []).filter((d) => !errorFaresOnly || d.isErrorFare);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 13, color: '#8a96a8' }}>
          Live error fares and flash sales from Secret Flying, Fly4free and The Flight Deal.
          {deals ? ` ${deals.errorFareCount} error fare${deals.errorFareCount === 1 ? '' : 's'} right now.` : ''}
        </div>
        <label style={{ fontSize: 13, color: '#3d4f6b', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={errorFaresOnly} onChange={(e) => setErrorFaresOnly(e.target.checked)} />
          Error fares only
        </label>
      </div>
      {loading && <Card style={{ textAlign: 'center', color: '#8a96a8', fontSize: 14 }}>Scanning deal feeds…</Card>}
      {error && <Card style={{ borderColor: '#c0392b', color: '#c0392b', fontSize: 14 }}>{error}</Card>}
      {!loading && !error && items.length === 0 && (
        <Card style={{ color: '#8a96a8', fontSize: 14 }}>Nothing matching right now. Check back later — error fares appear and vanish within hours.</Card>
      )}
      {items.map((d, i) => (
        <Card key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: '#0A1628', textDecoration: 'none', lineHeight: 1.4 }}>
              {d.title}
            </a>
            <div style={{ fontSize: 11, color: '#8a96a8', marginTop: 4 }}>
              {d.source}{d.publishedAt ? ` · ${new Date(d.publishedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {d.isErrorFare && (
              <span style={{ background: '#c0392b', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8 }}>ERROR FARE</span>
            )}
            {d.price && <div style={{ fontSize: 17, fontWeight: 800, color: '#0A1628' }}>{fmtPrice(d.price.amount, d.price.currency)}</div>}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Alerts tab ────────────────────────────────────────────────────────────────
function AlertsTab({ authFetch }) {
  const [data, setData] = useState({ alerts: [], hits: [] });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ origin: 'LON', destination: '', maxPrice: '', minDiscountPct: 20, notifyEmail: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await authFetch('/api/travel/alerts');
      const d = await res.json();
      if (res.ok) setData(d);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createAlert() {
    if (!form.origin) return;
    setSaving(true); setError('');
    try {
      const res = await authFetch('/api/travel/alerts', {
        method: 'POST',
        body: JSON.stringify({
          origin: form.origin,
          destination: form.destination || null,
          maxPrice: form.maxPrice ? Number(form.maxPrice) : null,
          minDiscountPct: Number(form.minDiscountPct) || 20,
          notifyEmail: form.notifyEmail || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to create alert');
      setForm({ origin: 'LON', destination: '', maxPrice: '', minDiscountPct: 20, notifyEmail: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAlert(a) {
    await authFetch('/api/travel/alerts', { method: 'PATCH', body: JSON.stringify({ id: a.id, active: !a.active }) });
    await load();
  }
  async function deleteAlert(a) {
    if (!confirm(`Delete alert "${a.label}"?`)) return;
    await authFetch(`/api/travel/alerts?id=${a.id}`, { method: 'DELETE' });
    await load();
  }

  const inputStyle = { padding: '10px 12px', border: '1px solid #E4E0D8', borderRadius: 8, fontSize: 13, fontFamily: "'Barlow', sans-serif", outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 12 }}>New Deal Alert</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input style={{ ...inputStyle, width: 90 }} placeholder="From (LON)" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value.toUpperCase() })} maxLength={3} />
          <input style={{ ...inputStyle, width: 130 }} placeholder="To (blank = any)" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value.toUpperCase() })} maxLength={3} />
          <input style={{ ...inputStyle, width: 120 }} placeholder="Max £ (total)" type="number" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} />
          <input style={{ ...inputStyle, width: 130 }} placeholder="Min % off (20)" type="number" value={form.minDiscountPct} onChange={(e) => setForm({ ...form, minDiscountPct: e.target.value })} />
          <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Notify email (defaults to you)" value={form.notifyEmail} onChange={(e) => setForm({ ...form, notifyEmail: e.target.value })} />
          <button onClick={createAlert} disabled={saving}
            style={{ background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Barlow', sans-serif" }}>
            {saving ? 'Saving…' : 'Create Alert'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#8a96a8', marginTop: 10 }}>
          Scanned daily at 06:00 UTC. You get an email when a fare drops under your cap or 20%+ below the typical route price. Leave destination blank to watch for clearance fares anywhere.
        </div>
        {error && <div style={{ fontSize: 13, color: '#c0392b', marginTop: 8 }}>{error}</div>}
      </Card>

      {loading && <Card style={{ textAlign: 'center', color: '#8a96a8', fontSize: 14 }}>Loading alerts…</Card>}
      {!loading && data.alerts.length === 0 && <Card style={{ color: '#8a96a8', fontSize: 14 }}>No alerts yet. Create one above and the daily scan does the rest.</Card>}

      {data.alerts.map((a) => {
        const hits = data.hits.filter((h) => h.alert_id === a.id).slice(0, 3);
        return (
          <Card key={a.id} style={{ opacity: a.active ? 1 : 0.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0A1628' }}>{a.label}</div>
                <div style={{ fontSize: 12, color: '#8a96a8', marginTop: 3 }}>
                  {a.max_price ? `under ${fmtPrice(a.max_price)} · ` : ''}{a.min_discount_pct}%+ off typical · {a.notify_email}
                  {a.last_run ? ` · last scan ${new Date(a.last_run).toLocaleDateString('en-GB')}` : ' · not yet scanned'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleAlert(a)} style={{ background: 'transparent', border: '1px solid #E4E0D8', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#3d4f6b', fontFamily: "'Barlow', sans-serif" }}>
                  {a.active ? 'Pause' : 'Resume'}
                </button>
                <button onClick={() => deleteAlert(a)} style={{ background: 'transparent', border: '1px solid #E4E0D8', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#c0392b', fontFamily: "'Barlow', sans-serif" }}>
                  Delete
                </button>
              </div>
            </div>
            {hits.length > 0 && (
              <div style={{ marginTop: 12, borderTop: '1px solid #F0EDE8', paddingTop: 10 }}>
                {hits.map((h) => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#3d4f6b', padding: '4px 0' }}>
                    <span>{h.origin} → {h.destination} · {fmtDate(h.departure_date)}{h.carrier ? ` · ${h.carrier}` : ''}</span>
                    <span style={{ fontWeight: 700, color: '#0A1628' }}>
                      {fmtPrice(h.price, h.currency)}{h.discount_pct ? <span style={{ color: '#F4822A', fontWeight: 600 }}> ({h.discount_pct}% off)</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'search', label: 'AI Search', icon: '✦' },
  { id: 'clearance', label: 'Clearance Fares', icon: '⚡' },
  { id: 'alerts', label: 'Deal Alerts', icon: '⚑' },
];

export default function TravelPage() {
  const [token, setToken] = useState(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState('search');

  useEffect(() => {
    setToken(localStorage.getItem('dvc_token'));
    setChecked(true);
  }, []);

  const authFetch = useCallback((url, opts = {}) =>
    fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) } }),
  [token]);

  if (!checked) return null;

  return (
    <>
      <Head>
        <title>Travel Deals | DVC</title>
      </Head>
      <div style={{ minHeight: '100vh', background: '#F8F7F5', fontFamily: "'Barlow', sans-serif" }}>
        <header style={{ background: '#0A1628', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.5px' }}>
              DVC <span style={{ color: '#F4822A' }}>TRAVEL</span>
            </div>
            <div style={{ fontSize: 11, color: '#8a96a8', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>
              AI Deal Finder · Flights · Hotels · Error Fares
            </div>
          </div>
          <a href="/" style={{ color: '#8a96a8', fontSize: 13, textDecoration: 'none' }}>← Back to CRM</a>
        </header>

        {!token ? (
          <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
            <Card>
              <div style={{ fontSize: 15, color: '#0A1628', marginBottom: 12 }}>Sign in to the CRM first to use the deal finder.</div>
              <a href="/" style={{ display: 'inline-block', background: '#F4822A', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Go to Login</a>
            </Card>
          </div>
        ) : (
          <main style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 80px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ background: tab === t.id ? '#0A1628' : '#fff', color: tab === t.id ? '#fff' : '#3d4f6b', border: '1px solid #E4E0D8', borderRadius: 20, padding: '9px 18px', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: "'Barlow', sans-serif" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            {tab === 'search' && <SearchTab authFetch={authFetch} />}
            {tab === 'clearance' && <ClearanceTab authFetch={authFetch} />}
            {tab === 'alerts' && <AlertsTab authFetch={authFetch} />}
          </main>
        )}
      </div>
    </>
  );
}
