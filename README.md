# Bothell Garden Plan

Static site for the 2026 spring/summer vegetable garden plan. Covers bed layouts (4×10, 3×9, 3×3 herbs), tomato pots, harvest cues, and the shopping list.

## Pages

- `index.html` — overview with all bed plans
- `bed-4x10.html`, `bed-3x9.html`, `bed-3x3.html` — per-bed detail pages
- `pots.html` — tomato pot plan
- `harvest.html` — harvest cues
- `shopping.html` — shopping list

## Hosting

Served via GitHub Pages. `.nojekyll` disables Jekyll processing. To view locally, open `index.html` in a browser, or:

```
python3 -m http.server 8000
```

and visit http://localhost:8000.
