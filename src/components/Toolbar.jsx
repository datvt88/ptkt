
export default function Toolbar({ timeframe, setTimeframe, chartType, setChartType }) {
  const TF = ['1d','1w','1m'];
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {TF.map(tf => (
          <button key={tf} className="button" style={{ background: timeframe === tf ? '#3a7bd5' : '#1f2940', border: '1px solid #2a3450', color: '#fff' }} onClick={() => setTimeframe(tf)}>{tf.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
        <button className="button" style={{ background: chartType === 'candlestick' ? '#3a7bd5' : '#1f2940', border: '1px solid #2a3450', color: '#fff' }} onClick={() => setChartType('candlestick')}>Candlestick</button>
        <button className="button" style={{ background: chartType === 'line' ? '#3a7bd5' : '#1f2940', border: '1px solid #2a3450', color: '#fff' }} onClick={() => setChartType('line')}>Line</button>
      </div>
    </div>
  );
}
