
export default function SymbolForm({ value, onChange, onSubmit, loading }) {
  return (
    <form className="symbolForm" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
      <input
        className="symbolInput"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Nhập mã (VD: TCB, VCB, FPT)"
        inputMode="latin"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Mã cổ phiếu"
      />
      <button type="submit" className="button primary" disabled={loading}>
        {loading ? (<span style={{display:'inline-flex',alignItems:'center',gap:8}}><span className="spinner"/>Đang tải...</span>) : 'Xem biểu đồ'}
      </button>
      <span className="hint">Nhấn Enter hoặc bấm "Xem biểu đồ"</span>
    </form>
  );
}
