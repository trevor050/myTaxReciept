<div align="center">
  <img src="/share.png" width="100%" alt="MyTaxReceipt preview"/>
</div>

# 💸 MyTaxReceipt.org

👉 **Live:** https://mytaxreceipt.org

Punch in your income → instantly see where every federal tax dollar *actually* lands. Then fire off a politely-spicy e-mail to your representatives in one click. Democracy, but with charts.

---

## ✨ Features

• Interactive donut chart & breakdown accordion  
• Per-dollar + per-hour "time spent working" perspective  
• AI-generated e-mails (plus ready-made prompt)  
• Resource suggestions for taking action  
• Dark-mode & responsive mobile flows  
• Observability via Vercel Analytics **and** Speed Insights

## 🛠️ Stack

• Next.js 15 (App Router) + React 18  
• TypeScript everywhere  
• Tailwind CSS + Radix UI primitives  
• Vercel Analytics & Speed Insights baked in  
• Genkit / Google AI for LLM calls  
• Firebase (auth & data) coming soon ☁️

## 🚀 Getting Started

```bash
# 1. Install deps
pnpm i    # or npm install / yarn

# 2. Run the dev server
pnpm dev  # http://localhost:9002
```

### Environment variables (‽)

Create a `.env.local` and fill in anything marked `process.env.*` in the codebase—most notably API keys for Genkit / Google AI if you want e-mail generation to work.

## 🏗️ Building for Production

```bash
pnpm build   # ⏳ compiles & bundles
pnpm start   # 🔥 serves the built app
```

Deploying to Vercel? Just push to `main` (see Branch Strategy) and let the UI do its thing.

## 🎯 Adjusting the budget data

Numbers live in [`src/services/tax-spending.ts`](src/services/tax-spending.ts).

```ts
export const REFERENCE_TOTAL_TAX = 20000; // 👈 your test income here

export const detailedBreakdown = [
  { category: 'Health', percentage: 14.7 },
  // ...
];
```

Tweak percentages (or add / remove categories) and the UI updates auto-magically.

## 🌳 Branch Strategy

| Branch | Purpose |
| ------ | ------- |
| `dev`  | active development |
| `main` | production-ready & auto-deployed |

(`master` was yeeted for clarity.)

## 📈 Observability

Analytics dashboards are pre-wired—no extra code needed:

```tsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

<Analytics />
<SpeedInsights />
```

Make sure Speed Insights is **enabled** for the project in the Vercel dashboard so you actually see numbers roll in.

## 🤝 Contributing

1. Fork / branch off `dev`  
2. `pnpm install`  
3. Make your change & keep it snappy  
4. Push → open PR into `dev`  
5. CI & Vercel Preview will handle the rest

## 📜 License

MIT — free as in freedom *and* beer.

---
Made with caffeine, chaos and a hint of civic duty ☕️
