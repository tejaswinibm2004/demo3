# CountingLab — counting / aggregation demo

An analytics dashboard with deliberately wrong numbers. Self-contained: push this folder as its own GitHub repo.

## Run locally

```bash
cp config.example.js config.js   # set window.BUGSHIELD_KEY
# or use the root repo: npm run demo  ->  http://localhost:5173/counting-lab
```

## Deploy

Render **Static Site** using the included `render.yaml`; set `BUGSHIELD_KEY`. Build script writes `config.js` and `version.json`.

## Planted bugs

1. `countOrders` accumulator starts at **1** instead of 0.
2. Loop uses `i <= list.length` — off-by-one.
3. Revenue `reduce` starts at **1**, inflating the total.
4. Average divides by `length - 1`.
5. Conversion percentage is multiplied by 100 **twice**.
6. Pagination uses `Math.floor` instead of `Math.ceil`, hiding the last page.

With 7 orders the dashboard shows **16 orders** instead of 7.

## Demo value

These are low-risk logic errors, so the fix should go through with **zero human clicks** — a clean contrast to the gated account-lab and cart-lab bugs.

Suggested report: *"The order count says 16 but there are only 7 orders, and revenue has an extra dollar."*
