
// api/stock-prices.mjs
const BASE = 'https://api-finfo.vndirect.com.vn/v4/stock_prices';
export default { async fetch(request) {
  try {
    const url = new URL(request.url);
    const code = (url.searchParams.get('code') || 'TCB').toUpperCase();
    const size = url.searchParams.get('size') || '1500';
    const sort = url.searchParams.get('sort') || 'date';
    const from = url.searchParams.get('from');
    const to   = url.searchParams.get('to');
    let q = `code:${encodeURIComponent(code)}`;
    if (from) q += `~date:gte:${from}`; if (to) q += `~date:lte:${to}`;
    const target = `${BASE}?sort=${encodeURIComponent(sort)}&size=${encodeURIComponent(size)}&q=${q}`;
    const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), 10_000);
    const upstream = await fetch(target, { method: 'GET', headers: { 'Accept': 'application/json' }, signal: ac.signal });
    clearTimeout(timer);
    const body = await upstream.text();
    const headers = { 'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };
    return new Response(body, { status: upstream.status, headers });
  } catch (err) {
    const msg = (err && err.name === 'AbortError') ? 'Upstream timeout' : (err?.message || String(err));
    return Response.json({ error: msg }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
  }
} };
