# KARIGAR architecture

## Request path

Buyer and seller UI in `client/` talk only to same-origin `/api`. Vite (dev) and any production reverse proxy forward that prefix to Express on port 3001.

## AI layer

`server/src/ai/` is an interface, not a vendor SDK:

- `vision.ts` — product type / material
- `imageEnhancement.ts` — enhance hook
- `speech.ts` — transcript + rupee parse
- `description.ts` — listing copy
- `research.ts` — craft background
- `promotion.ts` — reel script / caption
- `pricing.ts` — delivery estimate
- `language.ts` — locale helpers

All of these honour `DEMO_MODE`.

## Data

Prisma models live in `prisma/schema.prisma`. Products belong to a seller profile and a category. Carts are per user (including generated guest buyers). Orders snapshot line items so later product edits do not change history.
