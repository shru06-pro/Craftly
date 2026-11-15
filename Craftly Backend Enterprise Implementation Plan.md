# Craftly Backend: Enterprise Implementation Plan

*Based on a code review of the uploaded `craftly` frontend (React 19, Vite 8, React Router 7). Prepared 26 October 2026.*

## 1. Executive summary

Craftly is a polished single-page storefront for a **multi-artisan, made-to-order marketplace** (Chikankari, Bagru, leather, jewellery, pottery). Today it is 100% client-side: eight hard-coded products, cart and wishlist in `localStorage`, a simulated checkout (`setTimeout` plus a random `CRF-IN-xxxxxx` ID), a validation-only auth modal, and a rule-based advisor that searches the in-memory catalogue.

The backend is therefore not a thin CRUD layer. Four things make it non-trivial:

1. **Server-authoritative money**: prices, tailoring fees, shipping, coupons and tax are all computed in the browser today.
2. **Made-to-order, not stock-based**: items have colour variants (some “made-to-order shade”, no photo), bespoke body measurements, monograms and lead times. Fulfilment depends on artisan capacity and acceptance, not on inventory counts.
3. **A marketplace, not a shop**: orders must split per artisan, with per-artisan production milestones, shipments, payouts and compliance.
4. **Regulated Indian commerce**: UPI/COD payments, GST, e-commerce operator rules, and DPDP Act obligations (body measurements and addresses are personal data).

**Recommendation in one paragraph:** build a **TypeScript modular monolith** (NestJS) on **PostgreSQL**, deployed on **AWS Mumbai (ap-south-1)**, with Redis, a queue for async work, S3 + CDN for media, Razorpay for payments, and an outbox pattern for reliable events. Add an **artisan portal** and an **ops/admin console** as first-class deliverables. Keep module boundaries strict so any module can be extracted into a service later, but do not start with microservices. Expect roughly **22 weeks** with a team of 5 to reach a production launch (Section 10).

## 2. What the frontend tells us

### 2.1 Inventory of what must become server-side

| Frontend today | Where | Backend responsibility |
| --- | --- | --- |
| 8 products, categories, featured artisan, reviews | `data/mockProducts.js` | Catalogue, Artisan, Media, Review services plus admin CRUD |
| Search, filter (customisable, 4.9+, under ₹1,500), sort | `HomePage.jsx` (client-side) | Search/filter API with pagination and facets |
| Cart in `localStorage` with full product objects embedded | `CartContext.jsx` | Server cart (guest plus user), merge on login, price re-validation |
| Subtotal, tailoring fee (₹350), shipping (free at ₹1,499, else ₹99), coupons | `CartContext.jsx` | Pricing engine (single source of truth) |
| Coupons `CRAFTLY10`, `FIRSTCRAFT`, `ATELIER500` | hard-coded in bundle | Coupon service with rules, usage limits, expiry, audit |
| Wishlist in `localStorage` | `WishlistContext.jsx` | Per-user wishlist, synced across devices |
| Checkout (address, pincode, phone, UPI/NetBanking/COD) | `CheckoutModal.jsx` | Order, Payment, Address, Shipment services |
| Sign in / sign up (no backend; says so in a code comment) | `AuthModal.jsx` | Identity, sessions, password reset, OTP, roles |
| Newsletter “Dispatch” (sets a boolean) | `DispatchNewsletter.jsx` | Subscriber store, double opt-in, unsubscribe, ESP sync |
| Craft Advisor (regex NLP over `MOCK_PRODUCTS`) | `assistantNLP.js` | Assistant API backed by catalogue search |
| Custom sizing (6 measurements, in/cm, ranges, 3 fit options) | `CustomSizingForm.jsx` | Validated, versioned measurement profiles |
| “Milestone updates on WhatsApp & SMS” | `CheckoutModal.jsx` copy | Notification service plus production-milestone tracking |
| Footer policies (Shipping, Returns & Refunds) | `FooterModal.jsx` | CMS or policy engine; rules must match actual behaviour |

### 2.2 Issues to fix as part of integration

These are concrete findings from the code, ordered by severity.

1. **Client-trusted pricing.** The cart stores the entire `product` object (including `price`) in `localStorage`, and totals are derived from it. Anyone can edit prices or coupons. The server must recompute every total from IDs and configuration, and snapshot prices onto the order.
2. **State mutation bug in `addToCart`.** The updater does `copy[existingIndex].quantity += quantity`, which mutates the previous state object. In React StrictMode (enabled in `main.jsx`) updaters run twice in development, so quantities can double-count. This disappears once the cart is server-backed, but fix it first if the localStorage cart is kept as a guest fallback.
3. **Coupons are public.** All three codes are visible in the shipped JavaScript. Move validation server-side with per-user limits and expiry.
4. **Payment status is faked.** The confirmation screen prints the payment mode as “Confirmed” for every method, including COD, and clears the cart immediately. Payment state must come only from gateway webhooks.
5. **Address model is too thin.** The state dropdown has 17 entries (India has 28 states and 8 UTs) and includes “Delhi NCR”, which is not a state. Derive state and serviceability from the PIN code server-side.
6. **Weak auth rules.** Minimum password length is 6 in the UI. The server policy should follow current guidance (min 8–12, allow long passphrases, breached-password check), and the UI should be aligned.
7. **Unstructured data.** `leadTime` is a string (“4-6 business days”), `artisan` is embedded in every product, and sizes are free-form strings (pottery uses `'180ml Standard Chai Cups (Box of 4)'` as a “size”). These need real columns and relations.
8. **Marketing claims that become obligations.** Copy such as “over 85% of proceeds go directly to artisan guilds”, “certified generational artisans”, “verified collector reviews” and WhatsApp/SMS milestone updates implies features and data the backend must actually support (payout ledger, artisan verification workflow, verified-purchase reviews, notifications). Either build them or soften the copy.
9. **Assets.** Artisan avatars and the pottery product images load from Unsplash URLs; they should move to your own storage/CDN.
10. **SEO and sharing.** A client-rendered Vite SPA gives poor link previews and weaker crawlability for product pages. Also, `product/:id` and `products/:id` both resolve to the same page, which needs one canonical URL.
11. **Hygiene.** There are no tests, no TypeScript, no environment config, and the README is stale (it says React 18 and Router v6; `package.json` has React 19 and Router 7). The checkout form is pre-filled with sample personal data and a sample UPI ID, which must be removed before real users see it.

## 3. Target architecture

### 3.1 Principles

- **Modular monolith first.** One deployable, strict module boundaries (no cross-module table access), events between modules. Extract services only when a measured need appears (e.g. notifications, search).
- **Server is the source of truth** for price, availability, order state and payment state.
- **Money as integers (paise)**, never floats; currency stored with every amount.
- **Idempotency everywhere** money or state changes (idempotency keys on checkout, webhooks de-duplicated by event ID).
- **Async by default** for anything slow or third-party (email, SMS, WhatsApp, shipping labels, image processing).
- **Auditable**: every admin and artisan action is logged with actor, time and before/after.

### 3.2 Technology decisions

| Concern | Recommendation | Why / alternatives |
| --- | --- | --- |
| Language / framework | TypeScript, NestJS (Fastify adapter) | Same language as the frontend, DI and module system suit a modular monolith. Alternatives: Spring Boot or Go if your team already knows them |
| Database | PostgreSQL 16 (RDS/Aurora, Multi-AZ) | Relational integrity for orders and money, JSONB for measurement snapshots, FTS and trigram for early search |
| Cache / rate limit | Redis (ElastiCache) | Sessions, rate limits, carts cache, locks |
| Queue / jobs | BullMQ on Redis to start; SQS if you prefer fully managed | Retries, scheduling, dead-letter queues |
| Search | Postgres FTS plus `pg_trgm` at launch; OpenSearch or Meilisearch when the catalogue passes a few thousand SKUs | Avoids early operational weight |
| Media | S3 + CloudFront; image resize pipeline (Lambda or `sharp` worker) | Responsive variants, WebP/AVIF |
| Payments | Razorpay (UPI, cards, NetBanking, COD handling, split settlements via Route) | Cashfree and PayU are comparable; choose by marketplace-settlement support and fees |
| Shipping | Shiprocket or Delhivery API aggregation | Serviceability by PIN, rate quote, labels, tracking webhooks |
| Email | AWS SES or Postmark | Transactional vs marketing streams separated |
| SMS / WhatsApp | MSG91 / Gupshup / Twilio | Requires DLT registration (SMS) and approved WhatsApp templates |
| Identity | Build on Postgres with Argon2id, **or** managed (Cognito, Auth0, Keycloak) | See 3.3 |
| Hosting | AWS `ap-south-1`, ECS Fargate (EKS only if you already run Kubernetes) | Indian data residency and latency |
| IaC / CI | Terraform; GitHub Actions (the repo is already on GitHub) | Reviewable, repeatable environments |
| Observability | OpenTelemetry → Grafana/Prometheus/Loki or Datadog; Sentry | Traces across API, workers and third parties |

### 3.3 Identity decision

Indian shoppers expect **phone OTP** and **Google sign-in** alongside email/password. Managed identity gets you OTP, social login, MFA and breach protection faster; building it gives more control and lower per-user cost. For a team of five, a **managed provider for customers** plus **role-based access for staff and artisans** is the pragmatic default. Whichever you choose: httpOnly, `SameSite` cookies (not tokens in `localStorage`), short-lived access tokens, rotating refresh tokens, and device/session listing.

### 3.4 Logical view

```
Browser (React SPA / prerendered pages)
   │  HTTPS, httpOnly cookies, OpenAPI client
   ▼
CloudFront + WAF ──► ALB ──► API (NestJS modules)
                              ├─ Identity   ├─ Catalogue   ├─ Pricing
                              ├─ Cart       ├─ Checkout    ├─ Orders
                              ├─ Payments   ├─ Fulfilment  ├─ Artisans
                              ├─ Reviews    ├─ Assistant   ├─ Notifications
                              └─ Admin/Audit
                    PostgreSQL ── Redis ── S3 ── Queue ──► Workers
                    (outbox → events)                 (email, SMS, WhatsApp,
                                                       shipping, images, payouts)
External: Razorpay · Shiprocket/Delhivery · SES · MSG91/Gupshup · Sentry
```

Three client surfaces share the same API: the **customer storefront** (existing), a new **artisan portal** (accept orders, post milestones, manage listings, view payouts), and an **ops/admin console** (catalogue, orders, refunds, coupons, moderation, reporting).

## 4. Domain model

Core entities and the decisions behind them.

| Entity | Key fields / notes |
| --- | --- |
| **User** | id, email, phone, password hash (if self-hosted), status, marketing consent, consent timestamps |
| **Role / Membership** | customer, artisan (scoped to a studio), support, ops, admin |
| **Address** | user, name, phone, line1, locality, city, state (derived), PIN, geo-validated flag |
| **MeasurementProfile** | user, unit, bust, waist, hips, shoulder, sleeve, length, fit preference, version. Treated as sensitive personal data; copied (snapshotted) into the order item |
| **Artisan / Studio** | name, studio, craft, location, state, verification status and documents, bio, payout account reference, commission terms |
| **Category** | id, name, parent, sort order |
| **Product** | studio, category, name, descriptions, base price (paise), compare-at price, HSN code, tax class, materials, customisable flags, `allowsCustomMeasurements`, tailoring fee, lead time min/max days, status (draft, review, live, archived) |
| **ProductVariant** | product, colour name and hex, size or pack option, SKU, price delta, `isPhotographedSample`, made-to-order flag |
| **Media** | owner, S3 key, alt text, variants (sizes), sort order |
| **CapacitySlot** | studio, week, max made-to-order units (drives lead time and “pause orders”) |
| **Cart / CartItem** | owner (user or guest token), product, variant, size, measurements snapshot, monogram, quantity, price quote ID and expiry |
| **Coupon / Redemption** | code, type (percent or flat), caps, min cart, validity, per-user and global limits, eligibility rules |
| **Order** | number (human-friendly, e.g. `CRF-IN-…` generated server-side), user, address snapshot, totals, tax breakup, status |
| **OrderItem / Fulfilment** | one fulfilment group per studio; item snapshot (name, price, config, measurements); production status; SLA timestamps |
| **ProductionMilestone** | fulfilment, type (materials ready, embroidery/print done, tailoring done, QC passed), photo, note, notified flag |
| **Payment / Refund** | gateway order and payment IDs, method, status, amount, raw webhook payload reference |
| **Shipment** | fulfilment, carrier, AWB, label, status events, delivered-at |
| **ReturnRequest** | order item, reason, type (standard vs made-to-measure), status, resolution |
| **PayoutLedger** | studio, order item, gross, commission, TCS/TDS, net, settlement batch, status |
| **Review** | verified order item, rating, text, photos, moderation state, studio reply |
| **WishlistItem** | user, product |
| **NewsletterSubscriber** | email, double-opt-in state, source, unsubscribe token |
| **AssistantSession / Message** | user or guest, messages, retrieved product IDs, feedback (for quality review) |
| **AuditLog / OutboxEvent** | actor, action, entity, diff; transactional outbox for reliable event publishing |

**Design notes**

- **Snapshot, don’t reference, at order time.** Order items copy name, price, tax, configuration and measurements, so later catalogue edits never change history.
- **Lead time becomes data.** Replace the `"4-6 business days"` string with min/max days plus studio capacity, so promised dates are computed, not typed.
- **Pottery and “pack” items** use a variant option type (size, pack, capacity), not a size string.

## 5. Critical flows and business rules

### 5.1 Pricing engine (single source of truth)

Input: cart lines plus coupon plus destination PIN. Output: a signed **price quote** valid for a short window, containing line totals, tailoring fees, discount, shipping, tax (GST) and grand total, in paise.

- Rules must be **data-driven and effective-dated** (shipping threshold, tailoring fee, coupon rules, tax rates), not constants in code. GST rates and thresholds for apparel have changed in recent years, so have your CA confirm the rate tables and HSN mapping before launch.
- Decide and document edge rules the frontend currently leaves implicit: whether free shipping is judged **before or after discounts**, whether tailoring fees count toward the threshold (today they do not), coupon stacking, and rounding.
- The same engine serves the cart drawer, checkout and the assistant, so numbers can never disagree.

### 5.2 Checkout and payment

1. Client calls `POST /v1/checkout/sessions` with an **idempotency key**. Server re-prices, reserves capacity, creates a `PENDING_PAYMENT` order and a gateway order.
2. Client completes payment through the gateway SDK (UPI intent/collect, card, NetBanking).
3. **The webhook, not the browser callback, confirms payment.** Verify signature, de-duplicate by event ID, move the order to `PAID`, release the capacity hold if it fails or expires.
4. A reconciliation job compares gateway records to orders daily and flags mismatches.
5. **COD**: confirm by OTP or call, apply a COD fee and value cap if desired, and track return-to-origin risk. COD is high-risk for made-to-measure goods, so consider disabling it for custom-sized items.
6. Never touch card data; rely on the gateway’s hosted fields so you stay out of PCI scope beyond SAQ-A.

### 5.3 Order lifecycle

```
PENDING_PAYMENT → PAID → AWAITING_ARTISAN → ACCEPTED → IN_PRODUCTION
   → QC_PASSED → READY_TO_SHIP → SHIPPED → DELIVERED → COMPLETED
Branches: CANCELLED · PAYMENT_FAILED · ARTISAN_DECLINED (auto-refund or reassign)
          · RETURN_REQUESTED → RETURN_RECEIVED → REFUNDED
```

- The parent order has a derived status; each **studio fulfilment** has its own status and SLA timers (e.g. accept within 24h, else escalate).
- Artisans post milestones from the portal; each milestone triggers a customer notification (WhatsApp/SMS/email, per consent).
- **Cancellation and returns policy** must reflect reality for made-to-measure items. This is a legal and business decision, and the footer copy must match it.

### 5.4 Payouts and tax

A marketplace that collects money on artisans’ behalf has e-commerce-operator obligations (GST registration and TCS, income-tax TDS on sellers, invoicing). Model a **payout ledger** from day one, and have a CA confirm current rates and filing duties. Razorpay Route or an equivalent split-settlement feature reduces how much money you hold, but does not remove the reporting.

### 5.5 Reviews

Only users with a delivered order item can review it (this is what makes “verified collector reviews” true). Moderation queue, studio replies, abuse reporting, and rating aggregates updated asynchronously.

### 5.6 Craft Advisor

Keep the existing rule-based logic as the **deterministic fallback**, move it behind `POST /v1/assistant/query`, and back it with real catalogue search (so “under ₹1000” and colour filters hit live data). If you later add an LLM, constrain it to retrieved catalogue records and the pricing API, never free-text prices or stock, and keep the honesty guard the current code already has. Rate-limit, log for quality review, and strip personal data from stored transcripts.

## 6. API design

- **REST + OpenAPI 3.1**, versioned under `/v1`. Generate a typed client for the frontend from the spec; run contract tests in CI.
- Cursor pagination, consistent error envelope (`code`, `message`, `details`, `requestId`), `Idempotency-Key` header on mutating payment/order calls, ETags on catalogue reads.

| Area | Representative endpoints |
| --- | --- |
| Catalogue | `GET /products` (search, filters, sort, facets), `GET /products/{slug}`, `GET /categories`, `GET /artisans/{id}` |
| Auth / account | `POST /auth/register`, `/auth/login`, `/auth/otp/request`, `/auth/otp/verify`, `/auth/refresh`, `/auth/password/forgot`, `GET/PATCH /me`, `/me/addresses`, `/me/measurements` |
| Cart | `GET /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/{id}`, `POST /cart/coupon`, `POST /cart/merge` |
| Checkout | `POST /checkout/quote`, `POST /checkout/sessions`, `POST /payments/webhooks/razorpay` |
| Orders | `GET /orders`, `GET /orders/{number}`, `POST /orders/{number}/cancel`, `POST /orders/{number}/returns` |
| Wishlist | `GET/PUT/DELETE /wishlist/{productId}` |
| Reviews | `GET /products/{id}/reviews`, `POST /order-items/{id}/review` |
| Newsletter | `POST /newsletter/subscribe`, `GET /newsletter/confirm`, `GET /newsletter/unsubscribe` |
| Assistant | `POST /assistant/query` |
| Artisan portal | `/studio/products`, `/studio/orders`, `/studio/orders/{id}/accept`, `/studio/orders/{id}/milestones`, `/studio/payouts` |
| Admin | `/admin/products`, `/admin/orders`, `/admin/refunds`, `/admin/coupons`, `/admin/reviews`, `/admin/artisans`, `/admin/reports` |

## 7. Security, privacy and compliance

**Application security**

- Target **OWASP ASVS Level 2**. Threat-model checkout, auth and the artisan portal before building them.
- Argon2id for passwords (if self-hosted), MFA for staff and artisans, RBAC with studio-scoped permissions (an artisan can only see their own fulfilments), object-level authorisation tests on every endpoint.
- Input validation with schemas on every request; parameterised queries only; output encoding; strict CSP; CSRF protection for cookie auth; CORS allow-list.
- Rate limiting and bot protection on login, OTP, coupon and assistant endpoints (OTP and coupon endpoints are classic abuse targets).
- Webhook signature verification; secrets in AWS Secrets Manager; no secrets in the repo or frontend bundle.
- Dependency and container scanning, SAST, and a pre-launch penetration test.

**Privacy (India)**

- The **Digital Personal Data Protection Act, 2023** and its Rules apply to customer data. Plan for: notice and purpose-limited consent (separate consent for marketing and WhatsApp), access/erasure/correction requests, breach notification, retention limits, and a grievance contact. Obligations are phased, so confirm current commencement dates with counsel.
- Treat **body measurements, addresses and phone numbers** as sensitive in practice: encrypt at rest (KMS), field-level encryption for measurements, restrict artisan visibility to what is needed for their item, and purge on erasure or after the retention window.
- Keep production data in an Indian region; document any cross-border processors (email, analytics, LLM vendors).

**Commerce compliance** (confirm with legal and your CA)

- Consumer Protection (E-Commerce) Rules, 2020: grievance officer, seller details, clear return/refund terms, no misleading claims.
- GST invoicing, HSN codes, e-commerce operator TCS, seller TDS.
- Telecom rules: DLT registration for SMS, approved WhatsApp templates, opt-in records.
- Craft claims: if you assert GI-tagged crafts (e.g. Lucknow Chikankari) or “natural dye” and “vegetable-tanned”, keep verification evidence in the artisan and product records.

## 8. Platform, DevOps and operations

- **Environments:** local (Docker Compose), dev, staging (production-like, payment sandbox), production. Separate AWS accounts for prod and non-prod.
- **CI/CD:** GitHub Actions: lint, typecheck, unit and integration tests (Testcontainers), OpenAPI diff check, container scan, migration dry-run, deploy to staging, smoke tests, manual approval to production, blue/green or rolling deploy with automatic rollback.
- **Database:** versioned migrations (expand/contract, no destructive change in one release), automated backups, point-in-time recovery, quarterly restore drills, read replica when reporting load appears.
- **SLOs (starting targets):** 99.9% monthly availability; p95 catalogue read under 300 ms; checkout session creation p95 under 800 ms; webhook processing under 5 s; **RPO 5 minutes, RTO 1 hour**.
- **Observability:** structured logs with request IDs, distributed tracing across API, workers and third parties, business dashboards (conversion funnel, payment success rate by method, artisan SLA breaches), alerting on SLO burn rate and on stuck orders (paid but not accepted after N hours).
- **Resilience:** timeouts, retries with backoff and circuit breakers on all third parties; dead-letter queues with replay tooling; graceful degradation (storefront browsing still works if payments or notifications are down).
- **Cost and scale:** start small (two API tasks, one worker, a single Multi-AZ database); autoscale on CPU and queue depth; CDN for all catalogue reads. Festive-season traffic (Diwali, wedding season) should be load-tested at 5–10× normal.

## 9. Frontend migration plan

The UI can stay almost entirely as is; the data layer changes.

1. **Add an API layer:** environment-based base URL, a generated OpenAPI client, and **TanStack Query** for caching and loading/error states.
2. **Replace `MOCK_PRODUCTS`** in `HomePage`, `ProductDetailPage`, `WishlistPage`, `QuickViewModal` and `assistantNLP` with API calls. Move filtering and sorting to query parameters (the `?search=` URL sync already exists).
3. **Rewrite `CartContext`** as a thin wrapper over the cart API: the cart stores IDs and configuration only, totals come from the quote endpoint. Keep a guest token so `localStorage` holds only an opaque cart ID, then merge on login.
4. **Replace `CheckoutModal`’s `setTimeout`** with the checkout session plus gateway SDK, a pending-payment state, and polling/redirect handling for UPI. Remove the pre-filled sample data.
5. **Wire `AuthModal`** to real endpoints; add OTP, forgot-password and email-verification screens; add an account area (orders, addresses, saved measurements).
6. **Wishlist** syncs to the server for signed-in users; keep local storage for guests.
7. **New screens:** order history and tracking with milestone timeline, returns, review submission, newsletter confirmation.
8. **SEO and performance:** add prerendering or SSR for product and category pages (either a prerender step on Vite or a move to a framework such as Next.js or React Router framework mode), canonical URLs, structured data (`Product`, `Offer`), Open Graph tags, and responsive images from the CDN.
9. **Quality:** migrate gradually to TypeScript, add component tests (Vitest and Testing Library), end-to-end tests (Playwright) for browse → cart → pay → track, and update the README.

## 10. Delivery roadmap

Assumes a team of about 5: 2 backend engineers, 1 full-stack/frontend, 1 DevOps/SRE (part-time), 1 QA (part-time), plus product and design support. Durations are planning estimates, not commitments, and should be re-baselined after Phase 0.

| Phase | Weeks | Scope | Exit criteria |
| --- | --- | --- | --- |
| **0. Foundations** | 1–2 | Repo structure, NestJS skeleton, Docker Compose, Terraform baseline, CI/CD, environments, observability baseline, ADRs for key decisions, threat model, compliance checklist with legal/CA | “Hello world” deploys to staging through the pipeline; ADRs signed off |
| **1. Catalogue and identity** | 3–6 | Schema and migrations, seed script from `mockProducts.js`, catalogue and search APIs, media pipeline, artisan entity, auth (email, OTP, Google), profile, addresses, admin console v1 (catalogue CRUD) | Storefront browses live data; staff can edit products; login works end to end |
| **2. Cart, pricing, checkout** | 7–10 | Pricing engine and quotes, server cart and merge, coupons, measurement profiles, Razorpay integration, webhooks, reconciliation, idempotency, order creation | Test-mode payments succeed and fail correctly; totals match the pricing spec; no client-trusted prices |
| **3. Fulfilment and artisan portal** | 11–14 | Order lifecycle and SLA timers, artisan portal (accept, milestones, listings), shipping integration, tracking webhooks, cancellations and returns v1, audit log | A test order flows from payment to delivered with milestones and tracking |
| **4. Engagement and trust** | 15–18 | Notifications (email, SMS, WhatsApp, templates, consent), verified reviews and moderation, wishlist sync, newsletter double opt-in, assistant API on live search, payout ledger and reports | Notification delivery rates and review flow validated in staging |
| **5. Hardening and launch** | 19–22 | Load and failover tests, penetration test and fixes, DPDP and policy review, runbooks and on-call, backup restore drill, SEO prerendering, soft launch to a limited audience, then full launch | SLO dashboards live, pen-test criticals closed, rollback rehearsed, go/no-go sign-off |

**Parallel tracks:** legal/CA onboarding (GST, TCS/TDS, policies) from week 1; artisan onboarding and content migration from Phase 1; UX work for the artisan portal and account pages from Phase 2.

## 11. Quality gates and testing strategy

- **Unit tests** for pricing, coupon and lifecycle logic (these are the highest-risk rules; aim for exhaustive table-driven tests).
- **Integration tests** against real Postgres and Redis (Testcontainers); payment webhook replay and duplicate-delivery tests.
- **Contract tests** from the OpenAPI spec so frontend and backend cannot drift.
- **End-to-end tests** (Playwright) for the golden paths, run on every staging deploy.
- **Load tests** (k6) for browse, search and checkout; **failure injection** for gateway timeouts and webhook delays.
- **Security tests:** automated scanning in CI plus an external penetration test before launch.
- **Definition of done:** tests, migration, OpenAPI update, metrics and alerts, docs, and security review for any change touching auth, money or personal data.

## 12. Risks and open questions

| Risk / question | Impact | Mitigation / decision needed |
| --- | --- | --- |
| Marketplace tax and payout obligations are misunderstood | Legal and financial exposure | Engage a CA in week 1; model the payout ledger early |
| Returns policy for made-to-measure items is undefined | Disputes, chargebacks | Decide policy with legal; encode in the order state machine and footer copy |
| Artisans have limited digital literacy or connectivity | Slow acceptance, missed SLAs | Mobile-first portal, WhatsApp-based prompts, an ops-assisted mode, local-language support |
| COD abuse on custom items | Losses | Restrict COD for custom-sized items, OTP confirmation, value caps |
| Third-party dependency outages (payments, shipping) | Lost orders | Retries, queues, status page, manual fallbacks |
| Scope creep into microservices or an LLM-first assistant | Delay and cost | Hold the modular-monolith decision; ship the rule-based assistant on live data first |
| Marketing claims not backed by data | Reputational and regulatory | Audit all claims (“85% to artisans”, “certified”, “verified”) against what the system can prove |

**Decisions I need from you to firm up the plan**

1. How many artisans and SKUs at launch, and in 12 months? (This drives search, capacity and ops tooling.)
2. Will Craftly collect payments and pay artisans out, or are artisans merchants of record?
3. Is COD in scope at launch? For which categories?
4. Is the team comfortable with TypeScript/Node, or is there a stronger skill set (Java, Go, Python)?
5. Do you need the artisan portal at launch, or can ops enter milestones on their behalf for the first release?
6. Target launch date and budget envelope (for sizing infrastructure and the team).

## 13. Immediate next steps (first two weeks)

1. Confirm the answers above and record the main choices as ADRs (framework, identity, payments, hosting, SEO approach).
2. Create the backend repository (or a monorepo with `apps/web`, `apps/api`, `packages/api-client`), CI pipeline, and a staging environment.
3. Write the OpenAPI draft for catalogue, cart, quote and checkout so frontend and backend can work in parallel.
4. Design the database schema from Section 4 and write a seed script that imports the eight existing products, the featured artisan and the sample reviews.
5. Start legal/CA conversations on GST, marketplace payouts, returns policy and DPDP obligations.
6. Fix the quick wins in the current frontend (cart mutation bug, remove pre-filled checkout data, correct the README, single canonical product URL) so the migration starts from a clean base.
