
# React VN Stocks – Bollinger Bands (Vercel)

Webapp React vẽ nến Nhật + Bollinger Bands (30,3) dùng `lightweight-charts` v5.
Có **ô nhập mã cổ phiếu** để người dùng nhập mã (VD: TCB, VCB, FPT) → hiển thị **thông tin giá** (Thị giá, Trần, Sàn, Khối lượng) **kèm biểu đồ**.
Dùng **proxy Vercel Functions** để ổn định CORS.

## Chạy local
```bash
npm i
npm run dev
```

## Build/preview
```bash
npm run build
npm run preview
```

## Deploy Vercel
```bash
npm i -g vercel
vercel
vercel --prod
```

## Lưu ý
- `lightweight-charts` v5: `chart.addSeries(CandlestickSeries, options)`.
- Intraday cần time là UNIX seconds + bật `timeVisible`.
- Proxy: `/api/stock-prices?code=TCB&size=1500&sort=date`.
