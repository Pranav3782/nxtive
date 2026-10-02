# NXTIVE

Folder-structure scaffold for a production-grade men's ecommerce app.
This repo contains **structure only** — no business logic is implemented.

## Stack
Next.js (App Router) · TypeScript · Firebase (Auth/Firestore/Storage/Admin) · Razorpay · Delivery-partner adapter layer

## Layout

```
src/
  app/                 Routes only (App Router)
    (storefront)/      Customer-facing pages
    (auth)/            Login/register pages
    (admin)/admin/     Admin dashboard pages (isolated route group)
    api/                Server route handlers (webhooks, payments, orders, delivery)
  features/            Domain modules (auth, catalog, cart, checkout, orders, payments, delivery, admin-dashboard)
  server/              Server-only privileged logic (payment & delivery provider adapters)
  lib/firebase/        Firebase client / server / admin SDK setup (strictly separated)
  components/          Shared, feature-agnostic UI primitives & layout shells
  types/                Shared TypeScript types
  constants/            App-wide constants (routes, status enums)
  config/               Env access + non-secret site config
  validation/           Zod schemas
  utils/                 Small single-purpose helpers (no dumping-ground utils)
tests/                 unit / integration / e2e
docs/                  Additional documentation
```

## Key rules encoded in this structure

- **`src/app`** holds routing only — no business logic lives in page files.
- **`src/features/*`** is organized by domain, not by technical type. Each feature exposes a single `index.ts` as its public surface.
- **`src/server/*`** and any file importing `"server-only"` (e.g. `lib/firebase/admin.ts`, `server/payments/razorpay/*`) can **never** be imported from client components. This is how Firebase Admin credentials and Razorpay secrets stay out of the browser bundle.
- **Payments** and **delivery** are each behind a provider interface (`provider.interface.ts`) with a concrete adapter implementation. Swapping Razorpay or a delivery partner means adding/replacing an adapter, not touching feature code.
- **Admin** routes live under their own route group (`(admin)/admin`) with their own layout, so the admin dashboard can evolve (auth guard, nav, data needs) independently of the storefront.
- No monolithic `utils/` or `services/` — each file has one clear responsibility.

See `ARCHITECTURE.md` for the data-flow description.
