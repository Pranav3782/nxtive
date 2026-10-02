# Architecture

## Layers

1. **`app/`** — Routing/presentation only. Three route groups: `(storefront)`, `(auth)`, `(admin)`. Each has its own layout so storefront and admin can scale, deploy-reason, and evolve independently while sharing the same codebase and shared UI layer.

2. **`app/api/`** — Server route handlers for anything privileged or externally triggered: Razorpay webhook, delivery webhook, payment order-creation/verification, order mutation, delivery tracking. Nothing here is imported by client components; it's an entry point, not a library.

3. **`features/*`** — Domain modules (auth, catalog, cart, checkout, orders, payments, delivery, admin-dashboard). Each feature owns its components/hooks/state and a `server/` subfolder for server actions specific to that domain. Features expose one `index.ts` — cross-feature imports go through that surface, preventing tangled internal imports.

4. **`server/`** — Privileged, provider-facing code that must never reach the browser:
   - `server/payments/` — `provider.interface.ts` defines `PaymentProvider`; `razorpay/` is the concrete adapter. Swapping providers = new adapter + interface conformance, no changes elsewhere.
   - `server/delivery/` — same pattern via `DeliveryProvider`, with `providers/` holding concrete courier integrations and `adapters/` translating to app-domain shapes.

5. **`lib/firebase/`** — Three explicit files: `client.ts` (browser-safe, `NEXT_PUBLIC_*`), `server.ts` (server-rendered reads, still non-privileged), `admin.ts` (Admin SDK, marked `server-only`, uses non-public env vars). This split is the main safeguard against leaking Admin credentials into the client bundle.

6. **`components/`, `types/`, `constants/`, `config/`, `validation/`, `utils/`** — Shared, cross-feature layers. Kept intentionally small and specific (no catch-all `utils.ts`); each file is one responsibility.

## Data flow (example: checkout → payment → order → delivery)

```
Storefront UI (features/checkout)
   -> calls app/api/payments/create-order (server route)
        -> server/payments (PaymentProvider -> Razorpay adapter)
   -> client confirms payment (Razorpay checkout.js)
   -> app/api/payments/verify (server route)
        -> server/payments adapter verifies signature
        -> features/orders/server creates order (via lib/firebase/admin)
   -> app/api/webhooks/razorpay confirms payment status asynchronously
   -> features/orders/server triggers server/delivery (DeliveryProvider -> partner adapter)
   -> app/api/webhooks/delivery receives shipment status updates
   -> Admin dashboard (app/(admin)/admin/orders) reads order/shipment state via features/admin-dashboard/server
```

## Security boundary

- Anything touching `FIREBASE_ADMIN_*`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, or delivery-partner secrets lives only under `server/`, `lib/firebase/admin.ts`, or `app/api/*`, and is marked with `import "server-only"`.
- Client code only ever talks to these through `fetch` calls to `app/api/*` route handlers — never by importing server modules directly.

## Extensibility

- New payment gateway → add `server/payments/<provider>/adapter.ts` implementing `PaymentProvider`.
- New delivery partner → add `server/delivery/providers/<provider>.ts` implementing `DeliveryProvider`.
- New admin capability → new page under `app/(admin)/admin/*` + server actions under `features/admin-dashboard/server`.
- Structure intentionally avoids deep nesting or premature abstraction — grows by adding files/features, not by restructuring.
