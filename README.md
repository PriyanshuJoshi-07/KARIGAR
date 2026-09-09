# KARIGAR

AI-driven market linkage and smart cataloging app for marginalized artisans. Built as a complete SIH 2026 prototype: language-first onboarding, voice-led seller cataloging, buyer marketplace, cart, demo checkout, and reviews.

Demo mode is on by default. The walkthrough works without live commercial AI keys. The UI does not claim that a third-party model is running.

## Features

- 13 Indian languages, with optional “speak your language”
- Buyer and seller roles
- Seller flow: photos, vision hint, optional photo improve, voice details, description, price, delivery, promotion, publish
- Buyer marketplace: search, filters, product pages, cart, demo order, reviews
- Seeded catalog of six crafts: basket, vase, painting, wooden craft, lamp, textile
- REST API, Prisma/PostgreSQL, demo AI services

## Architecture

```
client/     React + TypeScript + Tailwind (Vite)
server/     Node.js + Express REST API
prisma/     Schema, seed
shared/     Language list, DTO types
docs/       Extra notes
```

Frontend proxies `/api` and `/uploads` to the backend on port 3001.

## Tech stack

- Frontend: React 18, TypeScript, Tailwind CSS, i18next, React Router
- Backend: Express, Prisma ORM
- Database: PostgreSQL
- AI (demo): local vision heuristics, description/promotion templates, deterministic delivery, browser speech

## Install

```bash
# From the repository root
npm install
npm install --prefix server
npm install --prefix client
```

## Database setup

PostgreSQL 15+ is required.

```bash
# Create role and database (example)
sudo -u postgres psql -c "CREATE USER karigar WITH PASSWORD 'karigar' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE karigar OWNER karigar;"
```

Copy environment files:

```bash
cp .env.example .env
```

## Prisma migrate and seed

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Seed creates 6 categories, 6 artisans, 6 products, buyers, and reviews.

Demo login emails (password `karigar123`):

- Buyer: `ananya@karigar.demo`
- Seller: `meera@karigar.demo`

The live UI uses guest sessions; those emails are for seeded data inspection.

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default 3001) |
| `CLIENT_ORIGIN` | Frontend origin for CORS |
| `DEMO_MODE` | `true` to run without external AI APIs |
| `OPENAI_API_KEY` | Optional, unused in demo mode |
| `VISION_API_KEY` | Optional |
| `SPEECH_API_KEY` | Optional |
| `IMAGE_ENHANCE_API_KEY` | Optional |
| `UPLOAD_DIR` | Uploaded photo directory |
| `MAX_IMAGE_MB` | Max upload size |

Do not put API keys in the frontend.

## AI configuration and demo mode

When `DEMO_MODE=true`:

- Image analysis returns structured sample results from filename/hint
- Description and promotion use the artisan’s supplied fields
- Speech uses the browser Web Speech API, then the server stores the transcript
- Craft research uses a built-in reference table
- Delivery fees are a deterministic function of origin, destination and size
- Photo “enhance” is a preview treatment; no paid retouching API is called

The banner states this clearly.

To plug in a real provider later, keep `DEMO_MODE=false` and implement the bodies in `server/src/ai/` using keys from `.env` only.

## Run frontend and backend

```bash
# API
npm run dev:server

# Vite app (new terminal)
npm run dev:client

# Or both
npm run dev
```

- Frontend: http://localhost:5173
- API health: http://localhost:3001/api/health

## Testing

```bash
npm run test:server
npm run test --prefix client
npm run typecheck --prefix server
npm run typecheck --prefix client
```

## Deployment

Build both apps, serve the Vite `client/dist` behind any static host, and run `server` with `NODE_ENV=production`. Point `CLIENT_ORIGIN` at the public frontend origin. Keep `DEMO_MODE=true` for jury demos unless keys are provisioned.

## SIH demo flows

Seller: Language → Seller → Photo → AI detect → Enhance → Voice details → Transcript → Description → Price → Delivery → Promotion → Publish → product visible in marketplace.

Buyer: Language → Buyer → Marketplace (6 products) → Search → Filter → Product → Cart → Checkout → Demo order → Confirmation → Review.
