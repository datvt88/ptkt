
import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

export default function StockChart({ candles = [], bb = [], chartType = 'candlestick' }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const mainSeriesRef = useRef(null);
  const middleRef = useRef(null);
  const upperRef = useRef(null);
  const lowerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;
    const chart = createChart(containerRef.current, {
      height: containerRef.current.clientHeight,
      layout: { background: { type: 'solid', color: '#0b1426' }, textColor: '#d1d4dc' },
      grid: { vertLines: { color: '#1f2940' }, horzLines: { color: '#1f2940' } },
      rightPriceScale: { borderColor: '#2a3450' },
      timeScale: { borderColor: '#2a3450', timeVisible: false, secondsVisible: false },
    });
    chartRef.current = chart;

    middleRef.current = chart.addLineSeries({ color: '#f1c40f', lineWidth: 2, title: 'BB Middle' });
    upperRef.current  = chart.addLineSeries({ color: '#3498db', lineWidth: 1, title: 'BB Upper' });
    lowerRef.current  = chart.addLineSeries({ color: '#e67e22', lineWidth: 1, title: 'BB Lower' });

    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
      chart.timeScale().fitContent();
    });
    ro.observe(containerRef.current);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    if (mainSeriesRef.current) { chartRef.current.removeSeries(mainSeriesRef.current); mainSeriesRef.current = null; }
    mainSeriesRef.current = (chartType === 'candlestick')
      ? chartRef.current.addSeries(CandlestickSeries, { upColor: '#26a69a', downColor: '#ef5350', wickUpColor: '#26a69a', wickDownColor: '#ef5350', borderVisible: true })
      : chartRef.current.addLineSeries({ color: '#4bffb5', lineWidth: 2, title: 'Close' });
  }, [chartType]);

  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current) return;
    if (chartType === 'candlestick') mainSeriesRef.current.setData(candles);
    else mainSeriesRef.current.setData(candles.map(c => ({ time: c.time, value: c.close })));

    middleRef.current.setData(bb.map(d => ({ time: d.time, value: d.middle })));
    upperRef.current.setData(bb.map(d => ({ time: d.time, value: d.upper })));
    lowerRef.current.setData(bb.map(d => ({ time: d.time, value: d.lower })));
    chartRef.current.timeScale().fitContent();
  }, [candles, bb, chartType]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
