<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes
Static single-page Next app (no backend). Live: mytaxreceipt.org, Vercel project `my-tax-reciept`; pushing to `main` deploys production. Repo name misspelling is intentional history.
- Gates: `npm test`, `npm run typecheck`, `npm run build`. CI (`.github/workflows/ci.yml`, Node 22) also runs `build:data` and fails if `src/data/budget.json` differs, so regenerate, never hand-edit.
- Data flow: `data/budget-fy2026.json` (sourced, Treasury MTS) -> `scripts/build-budget.mjs` (friendly labels live here) -> `src/data/budget.json`. New markable program needs a label, `src/data/blurbs.ts`, and both directions in `src/data/reasons.ts`; tests enforce it.
- Stay nonpartisan: reasons argue both sides at equal strength; org stances need first-party evidence, never inferred from ideology.
- Traction: only cite what is in the README. "Millions of visits" and "front page" are unverified.
- AI prompt URLs: cap 1900 encoded chars (2,000 seen intact on Grok and Perplexity, once on ChatGPT; Claude only seen redirecting to login with the prompt kept). Gemini, Copilot, duck.ai did not prefill, hence Copy prompt.
- `.printer-feed` clip-path clips the top only so the receipt prints out of the slot; shadow must stay on that wrapper because `.receipt` clip-path would cut it.
- Less strike is a CSS background on an inline span (`.pen-strike`, `box-decoration-break: clone`), not an SVG. `.rc-program-line` is flex, which blockifies direct children; an absolute SVG or a background on the flex item lands between wrapped lines on phones.
- README screenshots in `docs/screenshots/` are captured from `next start` at 1280x820 with $18,500 entered, Defense open, procurement Less, military construction More. Wait ~1.5s for the print animation, and set `scroll-behavior: auto` before scripted scrolling.
- "ignored package-lock.json in /Users/trevorrosato" build warning is a stray file on Trevor's machine, not a repo issue.
