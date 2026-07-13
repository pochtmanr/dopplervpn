# Prompt 02 — Favicon ≥48px (Google result favicon eligibility)

You are working in `/Volumes/RomanSSD/Developer28062026/doppler/landing` — the Next.js 15 App Router
marketing site for Doppler VPN (dopplervpn.org). This prompt is self-contained.

## Ground rules (do not skip)

- Never commit anything under `.secrets/` or `seo-plan/data/`.
- Do NOT `git push` without asking the user — pushes to main auto-deploy to production (Vercel).
- Verify with `npm run build` before committing.

## Problem (pre-audited)

Google requires a favicon of **at least 48×48** to show it in search results. Currently:

- `public/favicon.ico` is a mislabeled 32×32 PNG (verify: `file public/favicon.ico`).
- The metadata icon list in `src/app/[locale]/layout.tsx` ~line 87–94 only declares 32px and 16px
  PNGs (plus apple-touch-icon). Google never sees a ≥48px icon.
- A perfectly good `public/icon-192.png` already exists.

## Fix

1. Add the 192px icon to the `icons.icon` array in `src/app/[locale]/layout.tsx`:
   `{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }` (keep the existing entries).
2. Rebuild `public/favicon.ico` as a real multi-layer ICO including a 48×48 layer, sourced from
   `public/icon-192.png`. On this machine prefer macOS-native tools or Python/Pillow if available;
   e.g. `python3 -c "from PIL import Image; Image.open('public/icon-192.png').save('public/favicon.ico', sizes=[(16,16),(32,32),(48,48)])"` —
   if Pillow isn't installed, use `sips` to make PNG sizes and any available ico packer, or ask the
   user before installing anything. Verify the result with `file public/favicon.ico` and by opening it.
3. Sanity-check `public/site.webmanifest` still references valid icon files.

## Verification

1. `npm run build` passes; `npm run dev` and confirm the icon link tags render (view-source, look
   for `icon-192.png` and the icon list).
2. Commit; **ask the user before pushing**.
3. Post-deploy: `curl -sI https://www.dopplervpn.org/favicon.ico` (200, sane size) and
   `curl -s https://www.dopplervpn.org/en | grep -o '<link rel="icon"[^>]*>'`.
4. Ask the user to request re-indexing of the homepage in the GSC UI (Search Console → URL
   inspection → `https://www.dopplervpn.org/en` → Request indexing) — API write access isn't set up
   for this, it's a 30-second manual step.
5. Note the deploy date in `seo-plan/00-PLAN.md` deploy log. Favicon changes take days–weeks to
   reflect in SERPs; the monitor pass (prompt 07) checks it.
