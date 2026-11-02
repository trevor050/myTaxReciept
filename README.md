# MyTaxReceipt

An itemized receipt for your federal taxes. Enter what you paid and see your share of every line of the federal budget, mark what you'd change, and get a letter to Congress built from your choices.

**Live:** https://mytaxreceipt.org

Recommended by [Recomendo](https://archive.recomendo.com/posts/where-your-tax-dollars-actually-go), [Deal Secrets](https://dealsecrets.substack.com/p/strap-the-featured-packed-amazfit?open=false), and [Idea Surplus Disorder](https://www.ideasurplusdisorder.com/122/), with 300+ upvotes on [r/InternetIsBeautiful](https://www.reddit.com/r/InternetIsBeautiful/comments/1laxodq/).

## What it does

- **Live receipt.** Every line updates as you type, from your Form 1040 total or an estimate from your income.
- **Work time.** Add your hourly pay to see each line in hours of work.
- **Mark it up.** Mark any program Less or More. Your marks become a letter that cites the real figures and your share of each.
- **AI handoff.** Sends a compact, self-contained prompt to ChatGPT, Claude, Perplexity, or Grok. It sheds detail as needed to fit in a URL.
- **Groups on both sides.** Finds organizations working on the lines you marked, with a link to each position where one was checked, and shows who argues the other side.
- **Private by design.** Everything runs in your browser. Your amount only leaves it if you copy a share link.

## The data

Spending comes from the [Monthly Treasury Statement](https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/) for fiscal 2026 (final September figures): $7.40 trillion in outlays against $5.40 trillion in receipts. Every category reconciles to the Treasury total, with explicit residual lines rather than rounding. Negative lines are offsetting receipts, which is how the budget actually counts them.

Each line is a proportional share of the whole budget, not a trace of your dollars. See [docs/budget-methodology.md](docs/budget-methodology.md) for category mapping, known gaps, and why some programs have no separately reported figure.

`data/budget-fy2026.json` is the full sourced dataset. `npm run build:data` generates the slim version the site ships.

## Development

```bash
npm install
npm run dev        # http://localhost:9002
npm test
npm run typecheck
```

Built with Next.js, React, TypeScript, and Tailwind CSS. No backend, database, or API keys.

## License

MIT
