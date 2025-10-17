
export default function StatsBar({ symbol, snap, nf, nfi0, priceColorClass }) {
  if (!snap) return null;
  const changeTxt = snap.change != null ? `${snap.change > 0 ? '+' : ''}${nf.format(snap.change)} (${snap.pct != null ? (snap.pct > 0 ? '+' : '') + nf.format(snap.pct) + '%' : ''})` : '';
  const vol = snap.volume != null ? nfi0.format(snap.volume) : '—';
  return (
    <div className="stats">
      <div className="card">
        <h4>{symbol.toUpperCase()} • Thị giá</h4>
        <div className={`value ${priceColorClass}`}>{nf.format(snap.market)}</div>
        <div className="sub">{snap.date} <span className="badge">{changeTxt}</span></div>
      </div>
      <div className="card">
        <h4>Giá trần</h4>
        <div className="value up">{snap.ceil != null ? nf.format(snap.ceil) : '—'}</div>
        <div className="sub">Biên trên phiên</div>
      </div>
      <div className="card">
        <h4>Giá sàn</h4>
        <div className="value down">{snap.floor != null ? nf.format(snap.floor) : '—'}</div>
        <div className="sub">Biên dưới phiên</div>
      </div>
      <div className="card">
        <h4>Khối lượng (nmVolume)</h4>
        <div className="value">{vol}</div>
        <div className="sub">Tổng khớp lệnh trong ngày</div>
      </div>
    </div>
  );
}
