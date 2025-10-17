
import { useEffect, useMemo, useRef, useState } from 'react';
import StockChart from './components/StockChart.jsx';
import Toolbar from './components/Toolbar.jsx';
import StatsBar from './components/StatsBar.jsx';
import SymbolForm from './components/SymbolForm.jsx';

const API_PROXY = '/api/stock-prices';

async function fetchPrices(signal, symbol, opts = {}) {
  const params = new URLSearchParams({
    code: symbol.toUpperCase(),
    size: String(opts.size ?? 1500),
    sort: String(opts.sort ?? 'date'),
  });
  if (opts.from) params.set('from', opts.from);
  if (opts.to)   params.set('to', opts.to);
  const res = await fetch(`${API_PROXY}?${params.toString()}`, { method: 'GET', signal });
  if (!res.ok) throw new Error(`Proxy lỗi HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

// ===== Utils =====
const nf2 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const nfi0 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const onlyCode = v => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

function normalizeToCandles(rows) {
  const sorted = [...rows].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.map(d => {
    const open  = d.adOpen  ?? d.open;
    const high  = d.adHigh  ?? d.high;
    const low   = d.adLow   ?? d.low;
    const close = d.adClose ?? d.close;
    const t = new Date(`${d.date}T00:00:00Z`);
    const time = Math.floor(t.getTime() / 1000);
    return { time, open, high, low, close };
  });
}
function latestSnapshot(rows) {
  if (!rows.length) return null;
  const latest = [...rows].sort((a,b) => {
    const ta = new Date(`${a.date}T${a.time || '00:00:00'}`);
    const tb = new Date(`${b.date}T${b.time || '00:00:00'}`);
    return tb - ta;
  })[0];
  const market = latest.adClose ?? latest.close ?? latest.basicPrice;
  const change = latest.adChange ?? latest.change ?? null;
  const pct = latest.pctChange ?? null;
  const floor = latest.floorPrice ?? null;
  const ceil  = latest.ceilingPrice ?? null;
  const volume = latest.nmVolume ?? latest.ptVolume ?? null;
  return { code: latest.code, date: latest.date, market, change, pct, floor, ceil, volume };
}
function startOfWeekUTC(date) { const d = date.getUTCDay(); const shift = (d === 0 ? -6 : 1 - d); return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + shift)); }
function startOfMonthUTC(date) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)); }
function aggregateOHLC(candles, tf) {
  if (tf === '1d') return candles;
  const groups = new Map();
  for (const c of candles) {
    const dt = new Date(c.time * 1000);
    const kd = tf === '1w' ? startOfWeekUTC(dt) : startOfMonthUTC(dt);
    const key = kd.toISOString().slice(0,10);
    const g = groups.get(key) || { kd, items: [] };
    g.items.push(c); groups.set(key, g);
  }
  const result = [];
  for (const { kd, items } of groups.values()) {
    items.sort((a,b) => a.time - b.time);
    result.push({ time: Math.floor(kd.getTime() / 1000), open: items[0].open, high: Math.max(...items.map(i=>i.high)), low: Math.min(...items.map(i=>i.low)), close: items[items.length-1].close });
  }
  return result.sort((a,b) => a.time - b.time);
}
function computeBollingerFast(candles, period = 30, mult = 3) {
  const out = []; let mean = 0, m2 = 0; const q = [];
  for (let i=0;i<candles.length;i++) { const x = Number(candles[i].close); q.push(x);
    if (q.length <= period) { const d = x - mean; mean += d / q.length; m2 += d * (x - mean); if (q.length===period) { const sd = Math.sqrt(m2/period); out.push({ time: candles[i].time, middle: mean, upper: mean+mult*sd, lower: mean-mult*sd }); } }
    else { const old=q.shift(); const om=mean; mean = mean - (old - mean)/period; m2 = m2 - (old - om)*(old - mean); const d = x - mean; mean += d/period; m2 += d*(x-mean); const sd = Math.sqrt(m2/period); out.push({ time: candles[i].time, middle: mean, upper: mean+mult*sd, lower: mean-mult*sd }); }
  }
  return out;
}

export default function App() {
  const [symbol, setSymbol] = useState('TCB');
  const [timeframe, setTimeframe] = useState('1d');
  const [chartType, setChartType] = useState('candlestick');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [dailyCandles, setDailyCandles] = useState([]);
  const [snap, setSnap] = useState(null);
  const abortRef = useRef(null);

  async function load(symbol_) {
    const code = onlyCode(symbol_);
    setSymbol(code);
    if (!code) { setErr('Vui lòng nhập mã hợp lệ (A-Z/0-9, tối đa 6 ký tự).'); setDailyCandles([]); setSnap(null); return; }
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true); setErr('');
      const raw = await fetchPrices(abortRef.current.signal, code);
      if (!raw.length) { setErr(`Không tìm thấy dữ liệu cho mã ${code}.`); setDailyCandles([]); setSnap(null); return; }
      setSnap(latestSnapshot(raw));
      setDailyCandles(normalizeToCandles(raw));
    } catch (e) {
      if (e.name === 'AbortError') return; // bị hủy do request mới
      setErr(e.message || String(e)); setDailyCandles([]); setSnap(null);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(symbol); }, []);

  const candles = useMemo(() => aggregateOHLC(dailyCandles, timeframe), [dailyCandles, timeframe]);
  const bb = useMemo(() => computeBollingerFast(candles, 30, 3), [candles]);

  const status = useMemo(() => {
    if (loading) return 'Đang tải dữ liệu...';
    if (err) return `Lỗi: ${err}`;
    if (!dailyCandles.length) return 'Không có dữ liệu.';
    const tfLabel = timeframe === '1d' ? '1D' : timeframe === '1w' ? '1W' : '1M';
    return `Hiển thị ${tfLabel} cho ${symbol.toUpperCase()} (số phiên: ${candles.length}).`;
  }, [loading, err, dailyCandles, candles, timeframe, symbol]);

  const priceColorClass = useMemo(() => (!snap || snap.change == null) ? '' : (snap.change >= 0 ? 'up' : 'down'), [snap]);

  return (
    <div className="container">
      <div className="header">
        <SymbolForm
          value={symbol}
          onChange={v => setSymbol(onlyCode(v))}
          onSubmit={() => load(symbol)}
          loading={loading}
        />
        <Toolbar timeframe={timeframe} setTimeframe={setTimeframe} chartType={chartType} setChartType={setChartType} />
      </div>

      <div className="chartWrap">
        <StockChart candles={candles} bb={bb} chartType={chartType} />
      </div>

      <StatsBar symbol={symbol} snap={snap} nf={nf2} nfi0={nfi0} priceColorClass={priceColorClass} />
      <div className="status">{status}</div>
      {err && <div className="error" role="alert">{err}</div>}
    </div>
  );
}
