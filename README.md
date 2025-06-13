# MyTaxReceipt.org

MyTaxReceipt.org is a Next.js / TypeScript project that lets folks punch in their basic info and see an eye-opening breakdown of where their *federal income tax* really goes.  It also generates ready-to-send emails (or AI prompts) so people can hassle their reps about that spending.

## Quick start

```bash
# Install deps
pnpm i

# Start dev server
pnpm dev
```

## Production build

```bash
pnpm build    # ⏳ compiles & bundles
pnpm start    # 🔥 serves the built app
```

## Where to tweak the mock budget numbers 🗒️

All mock spending data now lives in a dedicated JSON file:

```
src/data/tax-spending.json
```

This file contains the `referenceTotalTax` value and a `detailedBreakdown` array. Each item in that array has:

* `category` – top-level bucket name (e.g. "Health")
* `percentage` – slice of the pie ‑ change these to match reality
* (Optional) `subItems` – more granular programs you can list with `amountPerDollar` values

Tweak these numbers and the charts + accordion will instantly update.

## Branch strategy

* **development** – day-to-day work (default local branch)
* **main** – production-ready code

`master` has been deleted to keep things tidy.

---
Made with 💸 + ☕️
