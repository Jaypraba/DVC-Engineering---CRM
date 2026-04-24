import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

// ── helpers ──────────────────────────────────────────────────────────────────
const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d)) / 86400000) : null;
const fmtCcy = (n) => '£' + Number(n || 0).toLocaleString('en-GB');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
const statusColor = (s) => s === 'Hot' ? '#F4822A' : s === 'Warm' ? '#b86c00' : '#8a96a8';
const statusBg = (s) => s === 'Hot' ? '#FEF0E6' : s === 'Warm' ? '#fff7ec' : '#F8F7F5';
const readColor = (n) => n >= 70 ? '#F4822A' : n >= 45 ? '#b86c00' : '#8a96a8';
const isStagnant = (l) => daysSince(l.last_contact) > 7 && !['Won','Lost'].includes(l.stage);

function detectProjectType(desc = '', appType = '') {
  const t = (desc + ' ' + appType).toLowerCase();
  if (t.includes('loft') || t.includes('dormer')) return 'Loft Conversion';
  if (t.includes('rear extension') || t.includes('single storey rear')) return 'Rear Extension';
  if (t.includes('side extension') || t.includes('side return')) return 'Side Extension';
  if (t.includes('new dwelling') || t.includes('new build') || t.includes('erection of')) return 'New Build';
  if (t.includes('basement') || t.includes('underpinning')) return 'Basement';
  if (t.includes('garage conversion')) return 'Garage Conversion';
  if (t.includes('outbuilding') || t.includes('garden room')) return 'Outbuilding';
  if (t.includes('front extension') || t.includes('porch')) return 'Front Extension';
  return 'Other';
}
const FEE_MAP = { 'Loft Conversion': 3200, 'Rear Extension': 2800, 'Side Extension': 2600, 'New Build': 6500, 'Basement': 5500, 'Garage Conversion': 1800, 'Outbuilding': 1600, 'Front Extension': 2200, 'Other': 2000 };
const estimateFee = (pt) => FEE_MAP[pt] || 2000;

function scoreLeadClient(lead) {
  let s = 20;
  const app = (lead.application_type || '').toLowerCase();
  if (app.includes('householder')) s += 25;
  else if (app.includes('full')) s += 20;
  else if (app.includes('prior')) s += 15;
  if (['New Build', 'Basement', 'Loft Conversion', 'Rear Extension'].includes(lead.project_type)) s += 30;
  else s += 10;
  const days = lead.days_post_decision || daysSince(lead.decision_date) || 999;
  if (days <= 30) s += 25; else if (days <= 60) s += 20; else if (days <= 90) s += 15;
  else if (days <= 180) s += 10; else if (days <= 365) s += 5;
  return Math.min(s, 100);
}

function normaliseLead(src, id) {
  const pt = detectProjectType(src.development_description, src.application_type);
  const fee = estimateFee(pt);
  const days = daysSince(src.decision_date);
  const score = scoreLeadClient({ ...src, project_type: pt, days_post_decision: days });
  const status = score >= 70 ? 'Hot' : score >= 45 ? 'Warm' : 'Cold';
  return { id, lpa_name: src.lpa_name, lpa_app_no: src.lpa_app_no, site_address: src.site_address, application_type: src.application_type, development_description: src.development_description, decision: src.decision, decision_date: src.decision_date, valid_date: src.valid_date, region: src.region || 'London', source: src.source || 'london_pld', project_type: pt, estimated_fee: fee, readiness_score: score, status, stage: 'Initial Contact' };
}

const LONDON_LPAS = ['Barking and Dagenham','Barnet','Bexley','Brent','Bromley','Camden','City of London','Croydon','Ealing','Enfield','Greenwich','Hackney','Hammersmith and Fulham','Haringey','Harrow','Havering','Hillingdon','Hounslow','Islington','Kensington and Chelsea','Kingston upon Thames','Lambeth','Lewisham','Merton','Newham','Redbridge','Richmond upon Thames','Southwark','Sutton','Tower Hamlets','Waltham Forest','Wandsworth','Westminster'];

const NATIONAL_REGIONS = [
  { id: 'west_midlands', label: 'Birmingham & West Midlands', lpas: [{ name:'Birmingham',source:'planning_api',region:'West Midlands'},{name:'Coventry',source:'planning_api',region:'West Midlands'},{name:'Dudley',source:'planning_api',region:'West Midlands'},{name:'Sandwell',source:'planning_api',region:'West Midlands'},{name:'Solihull',source:'planning_api',region:'West Midlands'},{name:'Walsall',source:'planning_api',region:'West Midlands'},{name:'Wolverhampton',source:'planning_api',region:'West Midlands'}] },
  { id: 'east_midlands', label: 'Milton Keynes / Northampton / Luton', lpas: [{name:'Milton Keynes',source:'planning_api',region:'East Midlands'},{name:'West Northamptonshire',source:'planning_api',region:'East Midlands'},{name:'North Northamptonshire',source:'planning_api',region:'East Midlands'},{name:'Luton',source:'planning_api',region:'East Midlands'},{name:'Central Bedfordshire',source:'planning_api',region:'East Midlands'}] },
  { id: 'surrey', label: 'Surrey', lpas: [{name:'Elmbridge',source:'surrey_hub',gss:'E07000207',region:'Surrey'},{name:'Epsom and Ewell',source:'surrey_hub',gss:'E07000208',region:'Surrey'},{name:'Guildford',source:'surrey_hub',gss:'E07000209',region:'Surrey'},{name:'Mole Valley',source:'surrey_hub',gss:'E07000210',region:'Surrey'},{name:'Reigate and Banstead',source:'surrey_hub',gss:'E07000211',region:'Surrey'},{name:'Runnymede',source:'surrey_hub',gss:'E07000212',region:'Surrey'},{name:'Spelthorne',source:'surrey_hub',gss:'E07000213',region:'Surrey'},{name:'Surrey Heath',source:'surrey_hub',gss:'E07000214',region:'Surrey'},{name:'Tandridge',source:'surrey_hub',gss:'E07000215',region:'Surrey'},{name:'Waverley',source:'surrey_hub',gss:'E07000216',region:'Surrey'},{name:'Woking',source:'surrey_hub',gss:'E07000217',region:'Surrey'}] },
  { id: 'west_sussex', label: 'West Sussex', lpas: [{name:'Adur',source:'planning_api',region:'West Sussex'},{name:'Arun',source:'planning_api',region:'West Sussex'},{name:'Chichester',source:'planning_api',region:'West Sussex'},{name:'Crawley',source:'planning_api',region:'West Sussex'},{name:'Horsham',source:'planning_api',region:'West Sussex'},{name:'Mid Sussex',source:'planning_api',region:'West Sussex'},{name:'Worthing',source:'planning_api',region:'West Sussex'}] },
  { id: 'east_sussex', label: 'East Sussex & Brighton', lpas: [{name:'Brighton and Hove',source:'planning_api',region:'East Sussex'},{name:'Eastbourne',source:'planning_api',region:'East Sussex'},{name:'Hastings',source:'planning_api',region:'East Sussex'},{name:'Lewes',source:'planning_api',region:'East Sussex'},{name:'Rother',source:'planning_api',region:'East Sussex'},{name:'Wealden',source:'planning_api',region:'East Sussex'}] },
];

const STAGES = ['Initial Contact','Awaiting Quote','Proposal Sent','Survey Booked','In Progress','Won','Lost'];
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'import', label: 'Import', icon: '⊕' },
  { id: 'leads', label: 'Leads', icon: '≡' },
  { id: 'pipeline', label: 'Pipeline', icon: '◧' },
  { id: 'email', label: 'Email', icon: '✉' },
  { id: 'assign', label: 'Assign', icon: '◈' },
  { id: 'alerts', label: 'Alerts', icon: '⚑' },
  { id: 'financial', label: 'Financial', icon: '£' },
  { id: 'apisetup', label: 'API Setup', icon: '⚙' },
];
const BOTTOM_NAV = ['dashboard','import','leads','email','alerts'];

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  }, []);
  return { toasts, add };
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

// ── Wordmark ──────────────────────────────────────────────────────────────────
function Wordmark({ size = 22 }) {
  return (
    <div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: size, letterSpacing: '-0.5px', lineHeight: 1 }}>
        <span style={{ color: '#0A1628' }}>DVC </span>
        <span style={{ color: '#F4822A' }}>ENGINEERING</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <div style={{ width: 32, height: 3, background: '#F4822A', borderRadius: 2 }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#8a96a8', textTransform: 'uppercase' }}>CRM</span>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ view, setView, user, onLogout, alertCount }) {
  return (
    <aside style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: '#fff', borderRight: '1px solid #E4E0D8', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      <div style={{ padding: '24px 20px 16px' }}>
        <Wordmark />
      </div>
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 20px', border: 'none', background: active ? '#FEF0E6' : 'transparent', color: active ? '#F4822A' : '#3d4f6b', fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: active ? 600 : 400, cursor: 'pointer', borderLeft: active ? '3px solid #F4822A' : '3px solid transparent', textAlign: 'left', transition: '150ms all', position: 'relative' }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.id === 'alerts' && alertCount > 0 && (
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: '#c0392b', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{alertCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid #E4E0D8' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0A1628', marginBottom: 2 }}>{user?.name}</div>
        <div style={{ fontSize: 11, color: '#8a96a8', textTransform: 'capitalize', marginBottom: 12 }}>{user?.role}</div>
        <button className="btn btn-outline" style={{ width: '100%', fontSize: 13 }} onClick={onLogout}>Sign Out</button>
      </div>
    </aside>
  );
}

// ── Bottom Nav (mobile) ───────────────────────────────────────────────────────
function BottomNav({ view, setView, alertCount }) {
  const items = NAV_ITEMS.filter(n => BOTTOM_NAV.includes(n.id));
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 62, background: '#fff', borderTop: '1px solid #E4E0D8', display: 'flex', zIndex: 100 }}>
      {items.map(item => {
        const active = view === item.id;
        return (
          <button key={item.id} onClick={() => setView(item.id)}
            style={{ flex: 1, border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: active ? '#F4822A' : '#8a96a8', fontSize: 10, fontWeight: active ? 600 : 400, fontFamily: "'Barlow', sans-serif", cursor: 'pointer', position: 'relative' }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
            {item.id === 'alerts' && alertCount > 0 && (
              <span style={{ position: 'absolute', top: 8, right: '20%', background: '#c0392b', color: '#fff', fontSize: 9, borderRadius: 8, minWidth: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{alertCount}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('dvc_token', data.token);
      onLogin(data.token, data.user);
    } catch { setError('Network error — please try again'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8F7F5', padding: 20 }}>
      <div style={{ marginBottom: 32 }}><Wordmark size={28} /></div>
      <div className="surface" style={{ width: '100%', maxWidth: 380, padding: 32 }}>
        <p style={{ margin: '0 0 24px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a96a8', textAlign: 'center' }}>Client Intelligence Platform</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="t-label" style={{ display: 'block', marginBottom: 6 }}>Email</label>
            <input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@dvceng.com" required autoFocus />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="t-label" style={{ display: 'block', marginBottom: 6 }}>Password</label>
            <input className="field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p style={{ color: '#c0392b', fontSize: 13, margin: '0 0 14px', textAlign: 'center' }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
      <p style={{ marginTop: 24, fontSize: 12, color: '#8a96a8' }}>DVC Engineering Ltd · London EC2A 4NE</p>
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 6 }}>
        <div style={{ width: 32, height: 3, background: '#F4822A', borderRadius: 2, marginRight: 12, flexShrink: 0 }} />
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: '#0A1628', margin: 0 }}>{title}</h1>
      </div>
      {subtitle && <p style={{ margin: '0 0 0 44px', fontSize: 14, color: '#8a96a8' }}>{subtitle}</p>}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="surface" style={{ padding: '18px 20px' }}>
      <div className="t-label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 30, color: accent || '#0A1628', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────────
function Pill({ status }) {
  return <span className={`pill pill-${(status||'cold').toLowerCase()}`}>{status}</span>;
}

// ── ReadinessBar ──────────────────────────────────────────────────────────────
function ReadinessBar({ score }) {
  const col = readColor(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="bar-track" style={{ flex: 1 }}>
        <div className="bar-fill" style={{ width: `${score}%`, background: col }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: col, minWidth: 28 }}>{score}</span>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ leads }) {
  const total = leads.length;
  const hot = leads.filter(l => l.status === 'Hot').length;
  const pipeline = leads.reduce((s, l) => s + (l.estimated_fee || 0), 0);
  const avgRead = total ? Math.round(leads.reduce((s, l) => s + (l.readiness_score || 0), 0) / total) : 0;
  const stagnant = leads.filter(isStagnant).length;

  const regionCounts = {};
  leads.forEach(l => { regionCounts[l.region || 'Unknown'] = (regionCounts[l.region || 'Unknown'] || 0) + 1; });
  const typeCounts = {};
  leads.forEach(l => { typeCounts[l.project_type || 'Other'] = (typeCounts[l.project_type || 'Other'] || 0) + 1; });

  const maxRegion = Math.max(...Object.values(regionCounts), 1);
  const maxType = Math.max(...Object.values(typeCounts), 1);

  const recent = [...leads].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)).slice(0, 8);

  return (
    <div className="fade-up">
      <PageHeader title="Overview" subtitle={`${total} leads across ${Object.keys(regionCounts).length} regions`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Leads" value={total} />
        <StatCard label="Hot Leads" value={hot} accent="#F4822A" />
        <StatCard label="Pipeline Value" value={fmtCcy(pipeline)} />
        <StatCard label="Avg Readiness" value={`${avgRead}%`} accent={readColor(avgRead)} />
        <StatCard label="Stagnant" value={stagnant} accent={stagnant > 0 ? '#c0392b' : undefined} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="surface" style={{ padding: 20 }}>
          <div className="t-heading" style={{ marginBottom: 16 }}>Activity by Region</div>
          {Object.entries(regionCounts).sort((a,b)=>b[1]-a[1]).map(([r, c]) => (
            <div key={r} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#3d4f6b' }}>{r}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c}</span>
              </div>
              <div className="bar-track"><div className="bar-fill bar-fill-hot" style={{ width: `${(c/maxRegion)*100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="surface" style={{ padding: 20 }}>
          <div className="t-heading" style={{ marginBottom: 16 }}>Project Types</div>
          {Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).map(([t, c]) => (
            <div key={t} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#3d4f6b' }}>{t}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c}</span>
              </div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(c/maxType)*100}%`, background: '#0A1628' }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="surface" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div><div className="t-label">Pipeline Value</div><div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:'#0A1628' }}>{fmtCcy(pipeline)}</div></div>
        <div><div className="t-label">Projected Monthly (3% conv.)</div><div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:'#F4822A' }}>{fmtCcy(Math.round(pipeline*0.03))}</div></div>
        <div><div className="t-label">Hot Conversion Rate</div><div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:'#1a8a4a' }}>{total ? Math.round((hot/total)*100) : 0}%</div></div>
      </div>
      <div className="surface" style={{ padding: 20 }}>
        <div className="t-heading" style={{ marginBottom: 16 }}>Recent Activity</div>
        {recent.length === 0 && <p style={{ color: '#8a96a8', fontSize: 14 }}>No leads yet — import to get started.</p>}
        {recent.map(l => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0EDE8' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0A1628' }}>{l.site_address || l.lpa_app_no}</div>
              <div style={{ fontSize: 12, color: '#8a96a8' }}>{l.lpa_name} · {l.stage}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Pill status={l.status} />
              <span style={{ fontSize: 12, color: '#8a96a8' }}>{daysSince(l.last_contact) != null ? `${daysSince(l.last_contact)}d ago` : 'New'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Import ────────────────────────────────────────────────────────────────────
function ImportView({ token, onImported, addToast }) {
  const [selectedLPAs, setSelectedLPAs] = useState([]);
  const [daysBack, setDaysBack] = useState(180);
  const [minScore, setMinScore] = useState(0);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });
  const [selectedRegions, setSelectedRegions] = useState([]);

  const authFetch = (url, opts = {}) => fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) } });

  const toggleLPA = (lpa) => setSelectedLPAs(s => s.includes(lpa) ? s.filter(x => x !== lpa) : [...s, lpa]);
  const toggleRegion = (id) => setSelectedRegions(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  async function importLondon() {
    if (!selectedLPAs.length) { addToast('Select at least one borough', 'error'); return; }
    setImporting(true);
    setProgress({ pct: 10, msg: 'Querying Planning London Datahub…' });
    try {
      const res = await authFetch('/api/planning/london', { method: 'POST', body: JSON.stringify({ lpas: selectedLPAs, daysBack }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      const hits = data.hits?.hits || [];
      setProgress({ pct: 50, msg: `Processing ${hits.length} results…` });
      const normed = hits.map(h => normaliseLead(h._source || h, h._source?.lpa_app_no || h._id)).filter(l => l.readiness_score >= minScore);
      setProgress({ pct: 80, msg: `Importing ${normed.length} leads…` });
      const imp = await authFetch('/api/leads', { method: 'POST', body: JSON.stringify({ leads: normed, importMeta: { source: 'london_pld', lpas: selectedLPAs, totalFetched: hits.length, filters: { daysBack, minScore } } }) });
      const impData = await imp.json();
      setProgress({ pct: 100, msg: `Done — ${impData.imported} leads imported` });
      addToast(`Imported ${impData.imported} leads from ${selectedLPAs.length} boroughs`, 'success');
      onImported();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setTimeout(() => { setImporting(false); setProgress({ pct: 0, msg: '' }); }, 1500); }
  }

  async function importNational() {
    const regions = NATIONAL_REGIONS.filter(r => selectedRegions.includes(r.id));
    if (!regions.length) { addToast('Select at least one region', 'error'); return; }
    setImporting(true);
    const allLPAs = regions.flatMap(r => r.lpas);
    let allResults = [];
    for (let i = 0; i < allLPAs.length; i++) {
      const lpa = allLPAs[i];
      setProgress({ pct: Math.round((i / allLPAs.length) * 80), msg: `Processing ${lpa.name}…` });
      try {
        const res = await authFetch('/api/planning/national', { method: 'POST', body: JSON.stringify({ lpas: [lpa], daysBack }) });
        const data = await res.json();
        allResults = [...allResults, ...(data.results || [])];
      } catch {}
    }
    setProgress({ pct: 90, msg: `Importing ${allResults.length} leads…` });
    const filtered = allResults.filter(l => (l.readiness_score || 0) >= minScore);
    try {
      const imp = await authFetch('/api/leads', { method: 'POST', body: JSON.stringify({ leads: filtered, importMeta: { source: 'national', lpas: allLPAs.map(l => l.name), totalFetched: allResults.length } }) });
      const impData = await imp.json();
      setProgress({ pct: 100, msg: `Done — ${impData.imported} leads imported` });
      addToast(`Imported ${impData.imported} national leads`, 'success');
      onImported();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setTimeout(() => { setImporting(false); setProgress({ pct: 0, msg: '' }); }, 1500); }
  }

  const FilterControls = () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
      <div>
        <label className="t-label" style={{ display: 'block', marginBottom: 6 }}>Decisions within</label>
        <select className="field" style={{ width: 160 }} value={daysBack} onChange={e => setDaysBack(Number(e.target.value))}>
          <option value={90}>3 months</option>
          <option value={180}>6 months</option>
          <option value={365}>12 months</option>
          <option value={540}>18 months</option>
        </select>
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <label className="t-label" style={{ display: 'block', marginBottom: 6 }}>Min Readiness Score: {minScore}</label>
        <input type="range" min={0} max={80} value={minScore} onChange={e => setMinScore(Number(e.target.value))} style={{ width: '100%' }} />
      </div>
    </div>
  );

  return (
    <div className="fade-up">
      <PageHeader title="Import Planning Data" subtitle={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>Planning data portals <span style={{ background:'#FEF0E6', color:'#F4822A', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:6 }}>PLD + National</span></span>} />
      {importing && (
        <div className="surface" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#3d4f6b' }}>{progress.msg}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{progress.pct}%</span>
          </div>
          <div className="bar-track" style={{ height: 8 }}>
            <div className="bar-fill bar-fill-hot" style={{ width: `${progress.pct}%`, transition: 'width 400ms' }} />
          </div>
        </div>
      )}
      <div className="surface" style={{ padding: 24, marginBottom: 24 }}>
        <div className="t-heading" style={{ marginBottom: 6 }}>Section A — London Boroughs</div>
        <p style={{ fontSize: 13, color: '#8a96a8', margin: '0 0 16px' }}>Planning London Datahub · Elasticsearch API</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button className="btn btn-outline" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setSelectedLPAs([...LONDON_LPAS])}>All</button>
          <button className="btn btn-outline" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setSelectedLPAs([])}>None</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {LONDON_LPAS.map(lpa => {
            const sel = selectedLPAs.includes(lpa);
            return <button key={lpa} onClick={() => toggleLPA(lpa)}
              style={{ padding: '5px 12px', borderRadius: 7, border: `1.5px solid ${sel ? '#0A1628' : '#E4E0D8'}`, background: sel ? '#0A1628' : '#fff', color: sel ? '#fff' : '#3d4f6b', fontSize: 12, fontWeight: sel ? 600 : 400, cursor: 'pointer', transition: '150ms all', fontFamily: "'Barlow', sans-serif" }}>{lpa}</button>;
          })}
        </div>
        <FilterControls />
        <button className="btn btn-primary" onClick={importLondon} disabled={importing || !selectedLPAs.length}>
          {importing ? 'Importing…' : `Query ${selectedLPAs.length} Borough${selectedLPAs.length !== 1 ? 's' : ''}`}
        </button>
      </div>
      <div className="surface" style={{ padding: 24 }}>
        <div className="t-heading" style={{ marginBottom: 6 }}>Section B — National Regions</div>
        <p style={{ fontSize: 13, color: '#8a96a8', margin: '0 0 16px' }}>Surrey Hub · api.planning.org.uk</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
          {NATIONAL_REGIONS.map(r => {
            const sel = selectedRegions.includes(r.id);
            return (
              <div key={r.id} onClick={() => toggleRegion(r.id)}
                style={{ padding: 16, borderRadius: 8, border: `2px solid ${sel ? '#0A1628' : '#E4E0D8'}`, background: sel ? '#F8F7F5' : '#fff', cursor: 'pointer', transition: '150ms all' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: sel ? '#0A1628' : '#3d4f6b', marginBottom: 6 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: '#8a96a8' }}>{r.lpas.length} LPAs</div>
              </div>
            );
          })}
        </div>
        <FilterControls />
        <button className="btn btn-primary" onClick={importNational} disabled={importing || !selectedRegions.length}>
          {importing ? 'Importing…' : `Import ${selectedRegions.length} Region${selectedRegions.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}

// ── LeadDrawer ────────────────────────────────────────────────────────────────
function LeadDrawer({ lead, token, onClose, onSave, onCompose, onAssign, addToast }) {
  const [form, setForm] = useState({ contact_name: lead.contact_name||'', email: lead.email||'', phone: lead.phone||'', stage: lead.stage||'Initial Contact', notes: lead.notes||'', auto_reengage: lead.auto_reengage||false });
  const [saving, setSaving] = useState(false);
  const authFetch = (url, opts={}) => fetch(url, { ...opts, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...(opts.headers||{}) } });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await authFetch(`/api/leads/${lead.id}`, { method:'PATCH', body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Save failed');
      onSave({ ...lead, ...data });
      addToast('Lead saved', 'success');
    } catch(e) { addToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  const days = daysSince(lead.decision_date);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const drawerStyle = isMobile
    ? { position:'fixed', bottom:0, left:0, right:0, height:'92vh', background:'#fff', borderRadius:'16px 16px 0 0', zIndex:200, boxShadow:'0 -4px 32px rgba(0,0,0,0.15)', overflowY:'auto' }
    : { position:'fixed', top:0, right:0, width:420, height:'100vh', background:'#fff', borderLeft:'1px solid #E4E0D8', zIndex:200, overflowY:'auto', boxShadow:'-4px 0 24px rgba(0,0,0,0.08)' };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:199 }} />
      <div style={drawerStyle}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #E4E0D8', display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:'#0A1628', marginBottom:2 }}>{lead.site_address || lead.lpa_app_no}</div>
            <div style={{ fontSize:12, color:'#8a96a8' }}>{lead.lpa_app_no} · {lead.lpa_name}</div>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:22, cursor:'pointer', color:'#8a96a8', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:'20px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {[['Readiness', `${lead.readiness_score}/100`, readColor(lead.readiness_score)],['Status', lead.status, statusColor(lead.status)],['Est. Fee', fmtCcy(lead.estimated_fee), '#0A1628'],['Days Post-Decision', days != null ? `${days}d` : '—', days > 270 ? '#c0392b' : '#0A1628']].map(([l,v,c]) => (
              <div key={l} className="surface" style={{ padding:'12px 14px' }}>
                <div className="t-label" style={{ marginBottom:4 }}>{l}</div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:c }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:16 }}>
            {[['Project Type',lead.project_type],['Application Type',lead.application_type],['Decision Date',fmtDate(lead.decision_date)],['Region',lead.region],['Source',lead.source]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0EDE8' }}>
                <span className="t-label">{l}</span>
                <span style={{ fontSize:13, fontWeight:500, color:'#0A1628' }}>{v||'—'}</span>
              </div>
            ))}
          </div>
          {lead.development_description && (
            <div style={{ background:'#F8F7F5', borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
              <p style={{ margin:0, fontSize:13, color:'#3d4f6b', fontStyle:'italic', lineHeight:1.6 }}>{lead.development_description}</p>
            </div>
          )}
          <div style={{ marginBottom:16 }}>
            <div className="t-heading" style={{ marginBottom:12 }}>CRM Details</div>
            {[['Contact Name','contact_name','text'],['Email','email','email'],['Phone','phone','tel']].map(([label,key,type]) => (
              <div key={key} style={{ marginBottom:10 }}>
                <label className="t-label" style={{ display:'block', marginBottom:4 }}>{label}</label>
                <input className="field" type={type} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} />
              </div>
            ))}
            <div style={{ marginBottom:10 }}>
              <label className="t-label" style={{ display:'block', marginBottom:4 }}>Stage</label>
              <select className="field" value={form.stage} onChange={e => setForm(f=>({...f,stage:e.target.value}))}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:10 }}>
              <label className="t-label" style={{ display:'block', marginBottom:4 }}>Notes</label>
              <textarea className="field" rows={3} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} style={{ resize:'vertical' }} />
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:16 }}>
              <input type="checkbox" checked={form.auto_reengage} onChange={e => setForm(f=>({...f,auto_reengage:e.target.checked}))} />
              <span style={{ fontSize:13, color:'#3d4f6b' }}>Auto Re-engage (14-day cycle)</span>
            </label>
            {lead.calendar_engineer && (
              <div style={{ background:'#edf7f2', border:'1px solid #b0e0c8', borderRadius:7, padding:'8px 12px', marginBottom:12, fontSize:13, color:'#1a8a4a' }}>
                Assigned to {lead.calendar_engineer}
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex:1 }}>{saving?'Saving…':'Save'}</button>
            <button className="btn btn-orange" onClick={() => onCompose(lead)} style={{ flex:1 }}>Email</button>
            <button className="btn btn-outline" onClick={() => onAssign(lead)} style={{ flex:1 }}>Assign</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Leads ─────────────────────────────────────────────────────────────────────
function LeadsView({ leads, setLeads, token, onCompose, onAssign, addToast }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [sort, setSort] = useState('readiness_score');
  const [selected, setSelected] = useState(null);

  const regions = [...new Set(leads.map(l => l.region).filter(Boolean))].sort();
  const filtered = leads
    .filter(l => !search || (l.site_address||'').toLowerCase().includes(search.toLowerCase()) || (l.lpa_app_no||'').toLowerCase().includes(search.toLowerCase()))
    .filter(l => !filterStatus || l.status === filterStatus)
    .filter(l => !filterRegion || l.region === filterRegion)
    .sort((a,b) => {
      if (sort==='readiness_score') return (b.readiness_score||0)-(a.readiness_score||0);
      if (sort==='newest') return new Date(b.decision_date||0)-new Date(a.decision_date||0);
      if (sort==='fee') return (b.estimated_fee||0)-(a.estimated_fee||0);
      return 0;
    });

  function handleSave(updated) {
    setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
    setSelected(updated);
  }

  return (
    <div className="fade-up">
      <PageHeader title="Leads" subtitle={`${filtered.length} of ${leads.length} leads`} />
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <input className="field" placeholder="Search address or ref…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:'1 1 200px', maxWidth:300 }} />
        <select className="field" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:130 }}>
          <option value="">All Statuses</option>
          {['Hot','Warm','Cold'].map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="field" value={filterRegion} onChange={e=>setFilterRegion(e.target.value)} style={{ width:150 }}>
          <option value="">All Regions</option>
          {regions.map(r=><option key={r}>{r}</option>)}
        </select>
        <select className="field" value={sort} onChange={e=>setSort(e.target.value)} style={{ width:150 }}>
          <option value="readiness_score">By Readiness</option>
          <option value="newest">By Newest</option>
          <option value="fee">By Fee</option>
        </select>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {filtered.length === 0 && <div className="surface" style={{ padding:32, textAlign:'center', color:'#8a96a8' }}>No leads found. Import data to get started.</div>}
        {filtered.map(l => {
          const stag = isStagnant(l);
          return (
            <div key={l.id} onClick={()=>setSelected(l)} className="surface"
              style={{ padding:'14px 18px', cursor:'pointer', transition:'150ms all', borderLeft:`3px solid ${stag?'#c0392b':statusColor(l.status)}`, background:stag?'#fff8f7':'#fff', display:'flex', alignItems:'center', gap:16 }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=''}>
              <div style={{ flex:'1 1 200px', minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'#0A1628', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.site_address||l.lpa_app_no}</div>
                <div style={{ fontSize:12, color:'#8a96a8' }}>{l.lpa_name} · {l.lpa_app_no}</div>
              </div>
              <div style={{ fontSize:12, color:'#3d4f6b', minWidth:80, display:'none' }} className="desktop-only">{l.region}</div>
              <div style={{ fontSize:12, color:'#3d4f6b', minWidth:100, display:'none' }} className="desktop-only">{l.project_type}</div>
              <div style={{ minWidth:120, display:'none' }} className="desktop-only"><ReadinessBar score={l.readiness_score||0} /></div>
              <div style={{ fontSize:13, fontWeight:600, minWidth:70, textAlign:'right' }}>{fmtCcy(l.estimated_fee)}</div>
              <div style={{ fontSize:12, color:'#8a96a8', minWidth:80, display:'none' }} className="desktop-only">{fmtDate(l.decision_date)}</div>
              <Pill status={l.status} />
            </div>
          );
        })}
      </div>
      {selected && <LeadDrawer lead={selected} token={token} onClose={()=>setSelected(null)} onSave={handleSave} onCompose={onCompose} onAssign={onAssign} addToast={addToast} />}
    </div>
  );
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
function PipelineView({ leads }) {
  const cols = STAGES.map(stage => {
    const cards = leads.filter(l => l.stage === stage);
    const total = cards.reduce((s,l)=>s+(l.estimated_fee||0),0);
    return { stage, cards, total };
  });
  const stageColor = { 'Initial Contact':'#8a96a8','Awaiting Quote':'#b86c00','Proposal Sent':'#F4822A','Survey Booked':'#1a8a4a','In Progress':'#0A1628','Won':'#1a8a4a','Lost':'#c0392b' };
  return (
    <div className="fade-up">
      <PageHeader title="Pipeline" subtitle="Kanban view across all project stages" />
      <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:16 }}>
        {cols.map(({ stage, cards, total }) => (
          <div key={stage} style={{ minWidth:230, flex:'0 0 230px', background:'#F8F7F5', borderRadius:10, padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:700, color:stageColor[stage]||'#0A1628' }}>{stage}</span>
              <span style={{ fontSize:11, background:'#fff', border:'1px solid #E4E0D8', borderRadius:5, padding:'2px 7px', color:'#8a96a8' }}>{cards.length}</span>
            </div>
            <div style={{ fontSize:11, color:'#8a96a8', marginBottom:10 }}>{fmtCcy(total)}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {cards.map(l => {
                const stag = isStagnant(l);
                return (
                  <div key={l.id} className="surface" style={{ padding:'10px 12px', borderLeft:`3px solid ${stag?'#c0392b':stageColor[stage]||'#E4E0D8'}`, background:stag?'#fff8f7':'#fff' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0A1628', marginBottom:3, lineHeight:1.3 }}>{l.site_address||l.lpa_app_no}</div>
                    <div style={{ fontSize:11, color:'#8a96a8', marginBottom:6 }}>{l.project_type}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <Pill status={l.status} />
                      <span style={{ fontSize:11, color: stag ? '#c0392b' : '#8a96a8' }}>{daysSince(l.last_contact) != null ? `${daysSince(l.last_contact)}d` : 'New'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Email Composer ─────────────────────────────────────────────────────────────
function EmailView({ leads, token, initialLead, addToast }) {
  const [selectedId, setSelectedId] = useState(initialLead?.id || '');
  const [contactName, setContactName] = useState(initialLead?.contact_name || '');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const authFetch = (url, opts={}) => fetch(url, { ...opts, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...(opts.headers||{}) } });
  const lead = leads.find(l=>l.id===selectedId) || initialLead;

  async function generate() {
    if (!lead) { addToast('Select a lead first', 'error'); return; }
    setLoading(true); setPreview(null);
    try {
      const res = await authFetch('/api/email/send', { method:'POST', body:JSON.stringify({ leadId:lead.id, contactName, tone, previewOnly:true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Generation failed');
      setPreview(data);
    } catch(e) { addToast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  async function send() {
    if (!lead?.email) { addToast('Lead has no email address — add one first in the drawer', 'error'); return; }
    setSending(true);
    try {
      const res = await authFetch('/api/email/send', { method:'POST', body:JSON.stringify({ leadId:lead.id, contactName, tone }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Send failed');
      addToast(`Email sent to ${lead.email}`, 'success');
      setPreview(null);
    } catch(e) { addToast(e.message, 'error'); }
    finally { setSending(false); }
  }

  const tones = ['Professional','Warm','Urgent','Brief','Neighbourly'];
  return (
    <div className="fade-up">
      <PageHeader title="Email Composer" subtitle="AI-generated outreach emails via Resend" />
      <div className="surface" style={{ padding:24, maxWidth:720 }}>
        {!initialLead && (
          <div style={{ marginBottom:18 }}>
            <label className="t-label" style={{ display:'block', marginBottom:6 }}>Select Lead</label>
            <select className="field" value={selectedId} onChange={e=>setSelectedId(e.target.value)}>
              <option value="">— choose a lead —</option>
              {leads.map(l=><option key={l.id} value={l.id}>{l.site_address||l.lpa_app_no} ({l.lpa_name})</option>)}
            </select>
          </div>
        )}
        {lead && (
          <div style={{ background:'#F8F7F5', borderRadius:8, padding:'12px 16px', marginBottom:18, display:'flex', gap:20, flexWrap:'wrap' }}>
            <div><span className="t-label">Address</span><div style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{lead.site_address}</div></div>
            <div><span className="t-label">Project</span><div style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{lead.project_type}</div></div>
            <div><span className="t-label">Decision</span><div style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{fmtDate(lead.decision_date)}</div></div>
          </div>
        )}
        <div style={{ marginBottom:18 }}>
          <label className="t-label" style={{ display:'block', marginBottom:6 }}>Contact Name (optional)</label>
          <input className="field" placeholder="e.g. Mr Smith" value={contactName} onChange={e=>setContactName(e.target.value)} style={{ maxWidth:280 }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label className="t-label" style={{ display:'block', marginBottom:8 }}>Tone</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {tones.map(t => (
              <button key={t} onClick={()=>setTone(t)}
                style={{ padding:'7px 16px', borderRadius:7, border:`1.5px solid ${tone===t?'#0A1628':'#E4E0D8'}`, background:tone===t?'#0A1628':'#fff', color:tone===t?'#fff':'#3d4f6b', fontSize:13, fontWeight:tone===t?600:400, cursor:'pointer', fontFamily:"'Barlow',sans-serif", transition:'150ms all' }}>{t}</button>
            ))}
          </div>
        </div>
        <button className="btn btn-orange" onClick={generate} disabled={loading || !lead} style={{ marginBottom:20 }}>
          {loading ? 'Generating…' : 'Generate Email'}
        </button>
        {loading && <div style={{ color:'#8a96a8', fontSize:13, marginBottom:16 }}>Calling Claude AI…</div>}
        {preview && (
          <div style={{ marginTop:4 }}>
            <div style={{ background:'#F8F7F5', border:'1px solid #E4E0D8', borderRadius:'8px 8px 0 0', padding:'10px 14px', fontSize:13, fontWeight:600, color:'#3d4f6b' }}>{preview.subject}</div>
            <div style={{ border:'1px solid #E4E0D8', borderTop:'none', borderRadius:'0 0 8px 8px', padding:16, fontSize:14, lineHeight:1.7, color:'#0A1628', whiteSpace:'pre-wrap', minHeight:140 }}>{preview.body}</div>
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              <button className="btn btn-outline" onClick={()=>{ navigator.clipboard.writeText(preview.subject+'\n\n'+preview.body); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
                style={{ background:copied?'#edf7f2':'', borderColor:copied?'#1a8a4a':'', color:copied?'#1a8a4a':'' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button className="btn btn-primary" onClick={send} disabled={sending}>{sending?'Sending…':'Send Email'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Assign ────────────────────────────────────────────────────────────────────
function AssignView({ leads, users, token, initialLead, addToast }) {
  const [leadId, setLeadId] = useState(initialLead?.id || '');
  const [engineerEmail, setEngineerEmail] = useState('');
  const [eventType, setEventType] = useState('Site Survey');
  const [eventDate, setEventDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [notifyDirector, setNotifyDirector] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const authFetch = (url, opts={}) => fetch(url, { ...opts, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...(opts.headers||{}) } });
  const lead = leads.find(l=>l.id===leadId) || initialLead;
  const eventTypes = ['Site Survey','Project Kick-off','Deadline','Follow-up','Review'];

  async function handleAssign() {
    if (!leadId || !engineerEmail || !eventDate) { addToast('Please fill all required fields', 'error'); return; }
    setLoading(true); setSuccess(null);
    try {
      const res = await authFetch('/api/assign', { method:'POST', body:JSON.stringify({ leadId, engineerEmail, eventType, eventDate, durationMins:duration, notes, notifyDirector }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Assignment failed');
      const eng = users.find(u=>u.email===engineerEmail);
      setSuccess({ engineer: eng?.name || engineerEmail, eventType, eventDate });
      addToast('Lead assigned and calendar event created', 'success');
    } catch(e) { addToast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fade-up">
      <PageHeader title="Assign Lead" subtitle="Create O365 calendar events and briefing emails" />
      <div className="surface" style={{ padding:24, maxWidth:640 }}>
        {success ? (
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:'#0A1628', marginBottom:8 }}>Assignment Confirmed</div>
            <div style={{ fontSize:14, color:'#3d4f6b', marginBottom:24 }}>
              {success.eventType} added to <strong>{success.engineer}'s</strong> Outlook calendar<br />
              {fmtDate(success.eventDate)}
            </div>
            <button className="btn btn-primary" onClick={()=>{ setSuccess(null); setLeadId(''); setEngineerEmail(''); setEventDate(''); setNotes(''); }}>Assign Another</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:16 }}>
              <label className="t-label" style={{ display:'block', marginBottom:6 }}>Lead *</label>
              <select className="field" value={leadId} onChange={e=>setLeadId(e.target.value)}>
                <option value="">— select lead —</option>
                {leads.map(l=><option key={l.id} value={l.id}>{l.site_address||l.lpa_app_no} ({l.lpa_name})</option>)}
              </select>
            </div>
            {lead && (
              <div style={{ background:'#F8F7F5', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#3d4f6b' }}>
                {lead.project_type} · {fmtCcy(lead.estimated_fee)} est. · {lead.status}
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <label className="t-label" style={{ display:'block', marginBottom:6 }}>Engineer *</label>
              <select className="field" value={engineerEmail} onChange={e=>setEngineerEmail(e.target.value)}>
                <option value="">— select engineer —</option>
                {users.map(u=><option key={u.id} value={u.email}>{u.name} ({u.role})</option>)}
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label className="t-label" style={{ display:'block', marginBottom:8 }}>Event Type *</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {eventTypes.map(t=>(
                  <button key={t} onClick={()=>setEventType(t)}
                    style={{ padding:'7px 14px', borderRadius:7, border:`1.5px solid ${eventType===t?'#0A1628':'#E4E0D8'}`, background:eventType===t?'#0A1628':'#fff', color:eventType===t?'#fff':'#3d4f6b', fontSize:13, cursor:'pointer', fontFamily:"'Barlow',sans-serif", transition:'150ms all' }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
              <div>
                <label className="t-label" style={{ display:'block', marginBottom:6 }}>Date & Time *</label>
                <input className="field" type="datetime-local" value={eventDate} onChange={e=>setEventDate(e.target.value)} />
              </div>
              <div>
                <label className="t-label" style={{ display:'block', marginBottom:6 }}>Duration</label>
                <div style={{ display:'flex', gap:6 }}>
                  {[60,90,120,180].map(d=>(
                    <button key={d} onClick={()=>setDuration(d)}
                      style={{ flex:1, padding:'8px 4px', borderRadius:7, border:`1.5px solid ${duration===d?'#0A1628':'#E4E0D8'}`, background:duration===d?'#0A1628':'#fff', color:duration===d?'#fff':'#3d4f6b', fontSize:12, cursor:'pointer', fontFamily:"'Barlow',sans-serif" }}>{d}m</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label className="t-label" style={{ display:'block', marginBottom:6 }}>Notes</label>
              <textarea className="field" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Briefing notes for the engineer…" style={{ resize:'vertical' }} />
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:20, fontSize:13, color:'#3d4f6b' }}>
              <input type="checkbox" checked={notifyDirector} onChange={e=>setNotifyDirector(e.target.checked)} />
              Notify Director (CC on briefing email)
            </label>
            <button className="btn btn-primary" onClick={handleAssign} disabled={loading} style={{ width:'100%' }}>
              {loading ? 'Assigning…' : 'Assign & Create Calendar Event'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Alerts ────────────────────────────────────────────────────────────────────
function AlertsView({ leads, onCompose, onAssign }) {
  const now = Date.now();
  const thirtyMonthsMs = 30 * 30 * 86400000;
  const stagnant = leads.filter(l => daysSince(l.last_contact) > 7 && !['Won','Lost'].includes(l.stage)).sort((a,b) => (daysSince(b.last_contact)||0)-(daysSince(a.last_contact)||0));
  const overdue = leads.filter(l => (l.days_post_decision||daysSince(l.decision_date)||0) > 270 && l.stage === 'Initial Contact');
  const lapseRisk = leads.filter(l => l.decision_date && (now - new Date(l.decision_date)) > thirtyMonthsMs && !['Won','Lost'].includes(l.stage));
  const highValue = leads.filter(l => (l.estimated_fee||0) >= 4000 && l.status !== 'Hot' && l.stage === 'Initial Contact');
  const total = stagnant.length + overdue.length + lapseRisk.length + highValue.length;

  function AlertCard({ lead, metric, metricLabel, borderColor, bgColor, onCompose, onAssign }) {
    return (
      <div style={{ background:'#fff', border:`1px solid #E4E0D8`, borderLeft:`4px solid ${borderColor}`, borderRadius:8, padding:'14px 16px', marginBottom:8, background:bgColor||'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#0A1628', marginBottom:2 }}>{lead.site_address||lead.lpa_app_no}</div>
            <div style={{ fontSize:12, color:'#8a96a8' }}>{lead.project_type} · {lead.lpa_name}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:12, fontWeight:600, color:borderColor }}>{metric}</div>
            <div style={{ fontSize:11, color:'#8a96a8' }}>{metricLabel}</div>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#0A1628' }}>{fmtCcy(lead.estimated_fee)}</span>
          <div style={{ display:'flex', gap:6 }}>
            <button className="btn btn-outline" style={{ padding:'5px 12px', fontSize:12 }} onClick={()=>onCompose(lead)}>Email</button>
            <button className="btn btn-primary" style={{ padding:'5px 12px', fontSize:12 }} onClick={()=>onAssign(lead)}>Assign</button>
          </div>
        </div>
      </div>
    );
  }

  function Section({ title, color, leads, metric, metricLabel }) {
    if (!leads.length) return null;
    return (
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ width:4, height:20, background:color, borderRadius:2 }} />
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:18, color:'#0A1628' }}>{title}</span>
          <span style={{ fontSize:12, background:'#fff', border:'1px solid #E4E0D8', borderRadius:5, padding:'2px 8px', color:'#8a96a8' }}>{leads.length}</span>
        </div>
        {leads.map(l => <AlertCard key={l.id} lead={l} metric={metric(l)} metricLabel={metricLabel} borderColor={color} onCompose={onCompose} onAssign={onAssign} />)}
      </div>
    );
  }

  return (
    <div className="fade-up">
      <PageHeader title="Alerts" subtitle={`${total} leads requiring attention`} />
      {total === 0 && <div className="surface" style={{ padding:32, textAlign:'center', color:'#8a96a8' }}>No alerts — all leads are in good shape.</div>}
      <Section title="Stagnant Leads" color="#c0392b" leads={stagnant} metric={l=>`${daysSince(l.last_contact)||0}d idle`} metricLabel="since last contact" />
      <Section title="Overdue — No Progress" color="#b86c00" leads={overdue} metric={l=>`${l.days_post_decision||daysSince(l.decision_date)||0}d post-decision`} metricLabel="still Initial Contact" />
      <Section title="Planning Lapse Risk" color="#c0392b" leads={lapseRisk} metric={l=>{ const m=Math.floor((Date.now()-new Date(l.decision_date))/2592000000); return `${m} months`; }} metricLabel="since decision" />
      <Section title="High Value Untouched" color="#F4822A" leads={highValue} metric={l=>fmtCcy(l.estimated_fee)} metricLabel="estimated fee" />
    </div>
  );
}

// ── Financial ─────────────────────────────────────────────────────────────────
function FinancialView() {
  const engineers = [
    { name:'Engineer 1 (Director)', role:'Director', region:'London' },
    { name:'Engineer 2', role:'Senior Engineer', region:'London' },
    { name:'Engineer 3', role:'Engineer', region:'Surrey/SE' },
    { name:'Engineer 4', role:'Engineer', region:'Midlands' },
  ];
  const scenarios = [
    { label:'Conservative', util:70, projects:403, revenue:887000 },
    { label:'Target Year 1', util:78, projects:449, revenue:988000, highlight:true },
    { label:'Optimised Year 2', util:85, projects:490, revenue:1080000 },
  ];
  const costs = [['Payroll (4 engineers)',162757],['Director salary',60000],['PI Insurance',7500],['Office / software / other',28000]];
  const totalCost = costs.reduce((s,[,v])=>s+v,0);
  return (
    <div className="fade-up">
      <PageHeader title="Financial Model" subtitle="Team capacity and revenue projections" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14, marginBottom:28 }}>
        {engineers.map((e,i) => (
          <div key={i} className="surface" style={{ padding:'16px 18px' }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#0A1628', marginBottom:4 }}>{e.name}</div>
            <div style={{ fontSize:12, color:'#8a96a8', marginBottom:10 }}>{e.role} · {e.region}</div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="t-label">Projects/week</span><span style={{ fontSize:13, fontWeight:600 }}>3</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              <span className="t-label">Annual output</span><span style={{ fontSize:13, fontWeight:600 }}>144</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:'#F8F7F5', borderRadius:10, padding:'14px 20px', marginBottom:28, display:'flex', gap:32, flexWrap:'wrap' }}>
        <div><span className="t-label">Team Capacity</span><div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:24, color:'#0A1628' }}>12/week</div></div>
        <div><span className="t-label">Annual Capacity</span><div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:24 }}>576 projects</div></div>
        <div><span className="t-label">Avg Project Fee</span><div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:24 }}>£2,200</div></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
        {scenarios.map(s => (
          <div key={s.label} className="surface" style={{ padding:20, border:s.highlight?'2px solid #F4822A':'1px solid #E4E0D8', background:s.highlight?'#FEF0E6':'#fff' }}>
            {s.highlight && <div style={{ fontSize:10, fontWeight:700, color:'#F4822A', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>Target</div>}
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:16, color:'#0A1628', marginBottom:10 }}>{s.label}</div>
            <div style={{ marginBottom:6 }}><span className="t-label">Utilisation</span><div style={{ fontWeight:700 }}>{s.util}%</div></div>
            <div style={{ marginBottom:6 }}><span className="t-label">Projects/year</span><div style={{ fontWeight:700 }}>{s.projects}</div></div>
            <div><span className="t-label">Revenue</span><div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:s.highlight?'#F4822A':'#0A1628' }}>{fmtCcy(s.revenue)}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
        <div className="surface" style={{ padding:20 }}>
          <div className="t-heading" style={{ marginBottom:14 }}>Cost Breakdown</div>
          {costs.map(([l,v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0EDE8' }}>
              <span style={{ fontSize:13, color:'#3d4f6b' }}>{l}</span>
              <span style={{ fontSize:13, fontWeight:600 }}>{fmtCcy(v)}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0 0', fontWeight:700 }}>
            <span>Total Overhead</span><span>{fmtCcy(totalCost)}</span>
          </div>
        </div>
        <div className="surface" style={{ padding:20, background:'#F8F7F5' }}>
          <div className="t-heading" style={{ marginBottom:14 }}>Profit Waterfall — Target</div>
          {[['Revenue','£988,000','#1a8a4a'],['Overhead','(£258,257)','#c0392b'],['Gross Profit','£729,743','#0A1628'],['Corp Tax 25%','(£182,436)','#c0392b'],['Net Profit','£547,307','#F4822A'],['Net Margin','55.4%','#F4822A']].map(([l,v,c]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #E4E0D8' }}>
              <span style={{ fontSize:13, color:'#3d4f6b' }}>{l}</span>
              <span style={{ fontSize:14, fontWeight:700, color:c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="surface" style={{ padding:20 }}>
        <div className="t-heading" style={{ marginBottom:14 }}>Conversion Funnel</div>
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:4 }}>
          {[['550','New leads/week','#8a96a8'],['→30%','Contact rate','#b86c00'],['→3%','Conversion','#F4822A'],['12','Wins/week','#1a8a4a'],['£26,400','Pipeline/week','#0A1628']].map(([v,l,c],i) => (
            <div key={i} style={{ textAlign:'center', padding:'10px 16px', background:'#F8F7F5', borderRadius:8, margin:2 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:c }}>{v}</div>
              <div style={{ fontSize:11, color:'#8a96a8', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── API Setup ─────────────────────────────────────────────────────────────────
function ApiSetupView() {
  const [copied, setCopied] = useState('');
  const apis = [
    { name:'Planning London Datahub', endpoint:'https://planningdata.london.gov.uk/api-guest/applications/_search', status:'Active', desc:'Elasticsearch API for all 33 London boroughs. No registration required — pass header X-API-AllowRequest.' },
    { name:'api.planning.org.uk', endpoint:'https://api.planning.org.uk/v1/search', status:'Key Required', desc:'National planning data. Request a key at api.planning.org.uk. Set PLANNING_API_KEY in env vars.' },
    { name:'Surrey Planning Hub', endpoint:'http://digitalservices.surreyi.gov.uk/developmentcontrol/0.1/', status:'Free', desc:'GeoJSON API for Surrey LPAs. No key required — uses GSS codes per district.' },
    { name:'Microsoft Graph API', endpoint:'https://graph.microsoft.com/v1.0/', status:'Azure Required', desc:'O365 calendar integration. Requires Azure app registration with Calendars.ReadWrite permissions.' },
  ];
  const envVars = [
    ['NEXT_PUBLIC_SUPABASE_URL','Supabase project URL'],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY','Supabase anonymous key'],
    ['SUPABASE_SERVICE_ROLE_KEY','Supabase service role key (server only)'],
    ['JWT_SECRET','Min 32 chars, random string'],
    ['RESEND_API_KEY','From Resend dashboard'],
    ['EMAIL_FROM','crm@dvceng.com (after domain verification)'],
    ['ANTHROPIC_API_KEY','From Anthropic console'],
    ['MS_TENANT_ID','Azure Entra tenant ID'],
    ['MS_CLIENT_ID','Azure app client ID'],
    ['MS_CLIENT_SECRET','Azure app client secret'],
    ['PLD_API_HEADER','Planning London Datahub header value'],
    ['PLANNING_API_KEY','api.planning.org.uk key'],
    ['DIRECTOR_EMAIL','jesan@dvceng.com'],
    ['CRON_SECRET','Min 32 chars — used to authenticate Vercel cron calls'],
  ];
  const azureSteps = ['Go to portal.azure.com → Microsoft Entra ID → App registrations','Click New registration → name it "DVC Engineering CRM"','Set redirect URI to https://crm.dvceng.com (Web type)','Copy the Application (client) ID and Directory (tenant) ID','Under API permissions → Add → Microsoft Graph → Application permissions','Add Calendars.ReadWrite and User.Read.All → Grant admin consent','Under Certificates & secrets → New client secret → copy value immediately','Add all 3 values (tenant, client, secret) to Vercel environment variables'];

  return (
    <div className="fade-up">
      <PageHeader title="API Setup" subtitle="Configuration and integration guide" />
      <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:28 }}>
        {apis.map(api => (
          <div key={api.name} className="surface" style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:16, color:'#0A1628' }}>{api.name}</div>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:6, background:api.status==='Active'||api.status==='Free'?'#edf7f2':'#FEF0E6', color:api.status==='Active'||api.status==='Free'?'#1a8a4a':'#F4822A' }}>{api.status}</span>
            </div>
            <div style={{ fontSize:12, color:'#8a96a8', fontFamily:'monospace', marginBottom:8, background:'#F8F7F5', padding:'4px 8px', borderRadius:5, wordBreak:'break-all' }}>{api.endpoint}</div>
            <div style={{ fontSize:13, color:'#3d4f6b' }}>{api.desc}</div>
          </div>
        ))}
      </div>
      <div className="surface" style={{ padding:20, marginBottom:24 }}>
        <div className="t-heading" style={{ marginBottom:14 }}>Azure App Registration — Steps</div>
        {azureSteps.map((step,i) => (
          <div key={i} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid #F0EDE8' }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background:'#F4822A', color:'#fff', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
            <span style={{ fontSize:13, color:'#3d4f6b', lineHeight:1.5 }}>{step}</span>
          </div>
        ))}
      </div>
      <div className="surface" style={{ padding:20 }}>
        <div className="t-heading" style={{ marginBottom:14 }}>Environment Variables</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr>
              <th style={{ textAlign:'left', padding:'6px 12px', color:'#8a96a8', fontSize:11, textTransform:'uppercase', borderBottom:'2px solid #E4E0D8' }}>Variable</th>
              <th style={{ textAlign:'left', padding:'6px 12px', color:'#8a96a8', fontSize:11, textTransform:'uppercase', borderBottom:'2px solid #E4E0D8' }}>Description</th>
            </tr></thead>
            <tbody>{envVars.map(([k,v]) => (
              <tr key={k}>
                <td style={{ padding:'7px 12px', fontFamily:'monospace', fontSize:12, color:'#F4822A', borderBottom:'1px solid #F0EDE8' }}>{k}</td>
                <td style={{ padding:'7px 12px', color:'#3d4f6b', borderBottom:'1px solid #F0EDE8' }}>{v}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('dashboard');
  const [composeTarget, setComposeTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { toasts, add: addToast } = useToast();

  // Check auth on mount
  useEffect(() => {
    const stored = localStorage.getItem('dvc_token');
    if (!stored) { setAuthChecked(true); return; }
    fetch('/api/users/index', { headers: { Authorization: `Bearer ${stored}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setToken(stored);
          try { const payload = JSON.parse(atob(stored.split('.')[1])); setUser(payload); } catch {}
        } else { localStorage.removeItem('dvc_token'); }
      })
      .catch(() => localStorage.removeItem('dvc_token'))
      .finally(() => setAuthChecked(true));
  }, []);

  const authFetch = useCallback((url, opts = {}) =>
    fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) } }),
    [token]);

  // Load data when authenticated
  useEffect(() => {
    if (!token) return;
    authFetch('/api/leads').then(r => r.json()).then(d => Array.isArray(d) && setLeads(d)).catch(() => {});
    authFetch('/api/users/index').then(r => r.json()).then(d => Array.isArray(d) && setUsers(d)).catch(() => {});
  }, [token, authFetch]);

  function handleLogin(tok, usr) { setToken(tok); setUser(usr); }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('dvc_token');
    setToken(null); setUser(null); setLeads([]); setUsers([]);
  }

  function onImported() {
    authFetch('/api/leads').then(r => r.json()).then(d => Array.isArray(d) && setLeads(d)).catch(() => {});
    setView('leads');
  }

  function onCompose(lead) { setComposeTarget(lead); setView('email'); }
  function onAssign(lead) { setAssignTarget(lead); setView('assign'); }

  // Alert count
  const alertCount = leads.filter(l => isStagnant(l) || (l.days_post_decision||daysSince(l.decision_date)||0) > 270).length;

  if (!authChecked) return null;
  if (!token) return <LoginScreen onLogin={handleLogin} />;

  function renderView() {
    switch (view) {
      case 'dashboard': return <Dashboard leads={leads} />;
      case 'import': return <ImportView token={token} onImported={onImported} addToast={addToast} />;
      case 'leads': return <LeadsView leads={leads} setLeads={setLeads} token={token} onCompose={onCompose} onAssign={onAssign} addToast={addToast} />;
      case 'pipeline': return <PipelineView leads={leads} />;
      case 'email': return <EmailView leads={leads} token={token} initialLead={composeTarget} addToast={addToast} />;
      case 'assign': return <AssignView leads={leads} users={users} token={token} initialLead={assignTarget} addToast={addToast} />;
      case 'alerts': return <AlertsView leads={leads} onCompose={onCompose} onAssign={onAssign} />;
      case 'financial': return <FinancialView />;
      case 'apisetup': return <ApiSetupView />;
      default: return <Dashboard leads={leads} />;
    }
  }

  return (
    <>
      <Head>
        <title>DVC Engineering CRM</title>
        <meta name="description" content="DVC Engineering Client Intelligence Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{`
        @media (min-width: 769px) {
          .sidebar { display: flex !important; }
          .bottom-nav { display: none !important; }
          .main-content { margin-left: 220px !important; padding: 36px 40px !important; }
          .desktop-only { display: block !important; }
        }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .bottom-nav { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 20px 16px 80px !important; }
        }
      `}</style>
      <div className="sidebar" style={{ display: 'flex' }}>
        <Sidebar view={view} setView={(v) => { setView(v); if (v === 'email') setComposeTarget(null); if (v === 'assign') setAssignTarget(null); }} user={user} onLogout={handleLogout} alertCount={alertCount} />
      </div>
      <main className="main-content" style={{ minHeight: '100vh' }}>
        {renderView()}
      </main>
      <div className="bottom-nav" style={{ display: 'none' }}>
        <BottomNav view={view} setView={setView} alertCount={alertCount} />
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );
}
