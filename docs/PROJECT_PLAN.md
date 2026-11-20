# DPDP Consent Plugin: Project Plan

**Version:** 1.3 (backend: Node + Express, DB: MongoDB; timeline: 104 working days, [TIMELINE.md](TIMELINE.md)) · **Date:** 20 Nov 2026 · **Team:** 1 full-stack developer
**Prototype:** [`prototype/admin-panel.html`](../prototype/admin-panel.html)

> Yeh document technical plan hai, legal advice nahi. DPDP Act aur Rules ki jo baatein yahan likhi hain (deadlines, timelines, sections), unhe launch se pehle kisi lawyer se confirm karwa lena.

---

## Contents

1. [Project kya hai](#1-project-kya-hai)
2. [DPDP requirements aur unke features](#2-dpdp-requirements-aur-unke-features)
3. [Scope: MVP mein kya hai, baad mein kya](#3-scope-mvp-mein-kya-hai-baad-mein-kya)
4. [Architecture](#4-architecture)
5. [Tech stack](#5-tech-stack)
6. [Repo structure](#6-repo-structure)
7. [Database design](#7-database-design)
8. [API design](#8-api-design)
9. [Web SDK design](#9-web-sdk-design)
10. [Admin panel (frontend)](#10-admin-panel-frontend)
11. [Security aur compliance ki engineering](#11-security-aur-compliance-ki-engineering)
12. [Testing strategy](#12-testing-strategy)
13. [DevOps: environments, CI/CD, monitoring](#13-devops-environments-cicd-monitoring)
14. [Phase-wise plan](#14-phase-wise-plan)
15. [Timeline](#15-timeline)
16. [Definition of Done aur working rules](#16-definition-of-done-aur-working-rules)
17. [Risks aur unka plan](#17-risks-aur-unka-plan)
18. [Launch checklist](#18-launch-checklist)
19. [Glossary](#19-glossary)

---

## 1. Project kya hai

Ek **consent management plugin**. Koi bhi website, web app ya mobile app ise lagakar DPDP Act 2023 ke technical kaam pure kar sake. Isme ye sab aata hai: notice dikhana, consent lena, consent wapas lena, user rights requests sambhalna, bachchon ka parental consent, aur audit ke liye records rakhna.

**Teen hisse hain:**

| Hissa | Kaun use karega | Kya hai |
|---|---|---|
| **Web SDK + Plugin UI** | End user (website visitor) | Banner, preference center, rights form. Ek `<script>` tag se lagta hai. |
| **Admin panel** | Humara customer (site owner) | Purposes, banner design, consent logs, rights requests, breach reports |
| **Backend API** | Dono ke peeche | Config, consent ledger, rights requests, webhooks |

**Goal:**
- **MVP:** Koi bhi website sirf ek script tag lagakar DPDP-ready consent le sake. Admin panel se sab manage ho.
- **Timeline:** Poora project **104 working days (~21 weeks)** mein. Pilot customer par core consent flow **Week 8**, MVP launch **Week 15**, poora product **Week 21**. DPDP ki zyadatar obligations **May 2027 ke aas-paas** lagu hongi (Rules November 2025 mein notify hue the, aur 18 mahine ka phase-in hai).

---

## 2. DPDP requirements aur unke features

| DPDP requirement | Act / Rules | Humara feature | Phase |
|---|---|---|---|
| Data lene se pehle saaf notice | Sec 5 | Banner + preference center, notice versioning | 1, 2 |
| Notice English + 8th Schedule ki bhashaon mein | Sec 5(3) | Translations table, language switcher | 2, 6 |
| Consent free, specific, informed, clear affirmative action | Sec 6(1) | Purpose-wise toggles, koi pre-tick nahi, Accept aur Reject barabar | 2 |
| Consent withdraw karna utna hi aasaan | Sec 6(4) | Hamesha dikhne wala "Manage consent" button, withdraw API | 2 |
| Withdraw ke baad processing band | Sec 6(6) | Script blocking, `consent.withdrawn` webhook | 2 |
| Consent Manager ke saath kaam | Sec 6(7)–(9) | Baad mein: Consent Manager integration | 8 |
| Consent ka proof dena (burden on fiduciary) | Sec 6(10) | Append-only ledger, hash chain, receipts, export | 1, 3 |
| Data accuracy, security safeguards | Sec 8(3), 8(5) | Encryption, access control, audit logs | 4 |
| Breach ki khabar Board aur users ko | Sec 8(6) + Rules | Breach register, notice templates, deadline tracker | 4 |
| Purpose khatam hone par data delete | Sec 8(7) + Rules | Retention period per purpose, retention jobs, reminders | 3, 4 |
| Grievance officer / DPO ki details publish karna | Sec 8(9) | Settings → banner aur rights form mein dikhana | 3 |
| Bachche (18 se kam): verifiable parental consent | Sec 9(1) | Age gate + parent OTP flow | 4 |
| Bachchon ki tracking / targeted ads nahi | Sec 9(3) | Under-18 par sab non-essential purposes lock | 2, 4 |
| Access ka adhikar | Sec 11 | Rights request: "Show my data" | 4 |
| Correction aur erasure | Sec 12 | Rights request: correct / delete | 4 |
| Grievance redressal | Sec 13 | Grievance request + deadline (Rules mein ~90 din, confirm karna) | 4 |
| Nominee banana | Sec 14 | Rights request: nominate | 4 |
| Penalty ₹250 crore tak | Sec 33, Schedule | (Hamare customer ki wajah: product ki value) | — |

> **Note:** Humara product customer ko technical tools deta hai. Legal zimmedari phir bhi customer (Data Fiduciary) ki rahegi. Ye baat Terms of Service mein saaf likhni hai.

---

## 3. Scope: MVP mein kya hai, baad mein kya

### MVP (Phase 0 se 5, 74 working days)
- Backend API (Node + Express), MongoDB, append-only consent ledger
- Web SDK: script tag, script blocking, banner, preferences, "Manage consent" button, receipt, rights form, parental OTP
- Languages: **English + Hindi** (structure 22 bhashaon ke liye ready)
- Admin panel: prototype ki saari screens
- Webhooks (consent changed, withdrawn, rights request)
- Deployment India region mein, docs site, 2 se 3 pilot customers

### Post-MVP (Phase 6 se 8)
- React / Next.js package, Vue wrapper, WordPress plugin
- Baaki 20 bhashayein (professional translation)
- Android, iOS, Flutter, React Native SDKs (pehle WebView-based)
- Billing aur plans, self-serve signup
- Consent Manager integration, cookie scanner, DPIA templates, SSO

### Abhi bilkul nahi
- Apna Consent Manager registration (iske liye Board ke saath registration aur alag compliance chahiye)
- Legal advice ya compliance certificate dena

---

## 4. Architecture

```
                       ┌──────────────────────────────────────┐
                       │          Customer ki website          │
                       │  <script src=".../dpdp.js"            │
                       │          data-site-id="site_xxx">     │
                       │   ┌──────────────┐  ┌──────────────┐  │
                       │   │ @dpdp/core   │  │ @dpdp/ui     │  │
                       │   │ state, block │  │ web comps    │  │
                       │   └──────┬───────┘  └──────────────┘  │
                       └──────────┼────────────────────────────┘
                                  │ HTTPS (public site key)
          ┌───────────────────────▼───────────────────────────┐
          │            API server (Node + Express)             │
          │  Public API (/v1/config, /v1/consent, ...)         │
          │  Admin API  (/v1/admin/...)  ← JWT session         │
          │  Workers: webhooks, emails, SMS, retention jobs    │
          └───────┬───────────────┬────────────────┬──────────┘
                  │               │                │
          ┌───────▼──────┐ ┌──────▼──────┐  ┌──────▼───────┐
          │ MongoDB      │ │ Redis       │  │ Email / SMS  │
          │ ledger, data │ │ queue, rate │  │ (OTP, notices)│
          └──────────────┘ │ limit, cache│  └──────────────┘
                           └─────────────┘
          ┌─────────────────────────┐      ┌────────────────────────┐
          │ Admin panel (React SPA) │      │ CDN: dpdp.js + config  │
          │ app.<domain>            │      │ cdn.<domain>/v1/...     │
          └─────────────────────────┘      └────────────────────────┘
```

**Main faisle (decisions):**

1. **Ek backend, sab platforms.** Website, React, Android: sab ek hi REST API use karenge.
2. **Headless core + alag UI.** `@dpdp/core` mein sirf logic (state, storage, API, script blocking). `@dpdp/ui` mein Web Components. Mobile WebView aur admin ka live preview bhi isi UI ko use karenge.
3. **Web Components (Lit).** Ye React, Vue, Angular aur plain HTML sab mein chalte hain, isliye UI ek baar banega.
4. **Append-only ledger.** Consent records kabhi update ya delete nahi honge, sirf nayi entry judegi. Har entry ka hash pichhli entry ke hash se juda hoga (hash chain), taaki koi chhed-chhaad pakdi ja sake.
5. **Config CDN se.** Banner config (purposes, text, colors) CDN par cache hoga, taaki customer ki site slow na ho aur API par load kam rahe.
6. **Data India mein.** Saara data Mumbai region (ap-south-1) mein store hoga.
7. **Modular monolith.** Ek akela developer microservices nahi sambhal sakta. Ek API server rahega jisme alag modules honge, aur ek worker process.

---

## 5. Tech stack

Ek developer ke liye: **ek hi language (TypeScript)** har jagah, aur jaani-pehchaani, boring technology.

| Layer | Choice | Kyun |
|---|---|---|
| Language | **TypeScript** | Frontend, SDK, backend sab ek language mein |
| Monorepo | **pnpm workspaces + Turborepo** | Shared types, ek command se build/test |
| Backend framework | **Node.js 20 LTS + Express 4** | Simple, sabse zyada jaani-pehchaani, bahut saare middleware ready |
| Database | **MongoDB 7** (replica set) | Flexible documents, consent purposes aur translations JSON jaise hi store |
| ODM | **Mongoose 8** + **migrate-mongo** | Schemas, validation, hooks. Indexes aur data changes migrations se |
| Express ke helpers | **helmet**, **cors**, **express-rate-limit** (Redis store), **pino-http**, **cookie-parser** | Security headers, CORS, rate limit, logging |
| Queue / cache | **Redis + BullMQ** | Webhooks, emails, retention jobs |
| Validation | **Zod** (shared schemas) | Ek schema backend aur frontend dono mein |
| SDK core | TypeScript, **tsup** / Vite library mode | Chhota bundle (IIFE + ESM) |
| SDK UI | **Lit** (Web Components) | Framework se independent, ~5KB |
| Admin panel | **React 18 + Vite + TanStack Query + React Router** | Fast, SPA hi kaafi hai (SEO ki zaroorat nahi) |
| Admin UI kit | **Tailwind CSS + shadcn/ui** | Tables, forms, dialogs jaldi bante hain |
| Charts | **Recharts** | Dashboard ke liye kaafi |
| Auth | Email + password (argon2) + email OTP, JWT in httpOnly cookie | Simple aur safe |
| Email | **AWS SES** (ya Resend) | Simple SMTP / API |
| SMS OTP | **MSG91** (ya koi DLT-registered Indian provider) | India mein SMS ke liye DLT registration chahiye |
| Hosting | **AWS Mumbai**: ECS Fargate ya Lightsail/EC2 se shuru | Data localisation |
| DB hosting | **MongoDB Atlas** (AWS Mumbai, ap-south-1). Dev ke liye free M0, production M10 se | Managed backups, replica set, encryption built-in |
| CDN | **CloudFront** (ya Cloudflare) | SDK aur config fast deliver karna |
| Testing | **Vitest**, **Supertest**, **mongodb-memory-server**, **Playwright** | Unit, API (in-memory Mongo replica set), E2E |
| CI/CD | **GitHub Actions** | Repo ke saath built-in |
| Monitoring | **Sentry** (errors), **Grafana Cloud / CloudWatch** (metrics, logs), **UptimeRobot** | Errors, metrics aur uptime ek jagah |
| Docs site | **Docusaurus** ya **Astro Starlight** | Markdown se docs |

> Shuruaat mein ECS ki jagah ek EC2 / Lightsail machine par Docker Compose bhi chal sakta hai. Customers badhne par ECS par shift karna.

---

## 6. Repo structure

```
dpdp-consent/                    (monorepo root)
├── apps/
│   ├── api/                     Node + Express backend (public + admin API)
│   │   ├── src/
│   │   │   ├── app.ts           express app: helmet, cors, json, routes, error handler
│   │   │   ├── server.ts        DB connect + listen
│   │   │   ├── config/          env (Zod se validate), mongo, redis
│   │   │   ├── middlewares/     auth (session), siteKey, requireRole, validate(zod),
│   │   │   │                    rateLimit, requestId, errorHandler
│   │   │   ├── models/          Mongoose schemas (section 7)
│   │   │   ├── modules/         har module mein: routes.ts, controller.ts, service.ts
│   │   │   │   ├── auth/        login, signup, OTP, sessions
│   │   │   │   ├── orgs/        organisation, members, roles
│   │   │   │   ├── sites/       sites, API keys
│   │   │   │   ├── purposes/    purposes, retention
│   │   │   │   ├── notices/     notice versions, translations
│   │   │   │   ├── banner/      banner config
│   │   │   │   ├── consent/     public consent API, ledger, receipts
│   │   │   │   ├── parental/    parent OTP flow
│   │   │   │   ├── rights/      rights requests
│   │   │   │   ├── breaches/    breach register
│   │   │   │   ├── webhooks/    endpoints, deliveries, retries
│   │   │   │   ├── stats/       dashboard numbers (aggregation pipelines)
│   │   │   │   └── audit/       admin audit log
│   │   │   ├── lib/             hashChain, crypto, mailer, sms, logger (pino)
│   │   │   └── jobs/            BullMQ queue definitions
│   │   ├── migrations/          migrate-mongo scripts (indexes, data changes)
│   │   └── test/
│   ├── worker/                  BullMQ jobs (webhooks, email, SMS, retention)
│   ├── admin/                   React admin panel  ← yeh repo (dpdp-frontend)
│   ├── docs/                    Docusaurus docs site
│   └── demo-site/               Testing ke liye demo website
├── packages/
│   ├── core/                    @dpdp/core: headless SDK
│   ├── ui/                      @dpdp/ui: Lit web components
│   ├── browser/                 dpdp.js: core + ui ka CDN bundle
│   ├── react/                   @dpdp/react (Phase 6)
│   ├── shared/                  Zod schemas, types, constants
│   └── i18n/                    Banner ke translations (en, hi, ...)
├── mobile/                      (Phase 7) android/, ios/, flutter/
├── wordpress/                   (Phase 6) PHP plugin
├── infra/                       docker-compose, Terraform / scripts
├── .github/workflows/
└── docs/                        Yeh plan, ADRs, runbooks
```

> Abhi ka folder `dpdp-frontend` aage chalkar `apps/admin` ban sakta hai. Mera suggestion hai ki shuru se hi upar wala monorepo banao, taaki shared types har jagah ek jaise rahein.

---

## 7. Database design

**Database: MongoDB** (Mongoose ODM ke saath). Har collection mein `_id` (ObjectId), aur `timestamps: true` se `createdAt` / `updatedAt`. Jo collections append-only hain, unme sirf `createdAt` hoga.

**MongoDB ke liye zaroori setup:**
- **Replica set zaroori hai** (local par bhi single-node replica set), kyunki consent save karte waqt **transactions** chahiye: event + current state + chain head ek saath update hon.
- Production: **MongoDB Atlas, AWS Mumbai (ap-south-1)** region mein, taaki data India mein rahe.
- Har collection par **JSON Schema validator** (`$jsonSchema`) bhi lagao, sirf Mongoose par bharosa mat karo.
- Har query mein `orgId` / `siteId` filter hona chahiye. Iske liye ek Mongoose plugin ya repository helper banao jo bina `siteId` ke query chalne hi na de.
- Indexes `migrate-mongo` scripts se banao. Production par `autoIndex: false` rakho.

### 7.1 Collections

**Account aur setup**

| Collection | Main fields | Indexes / note |
|---|---|---|
| `organizations` | name, address, grievanceOfficer {name, email}, dpoEmail, webhookSecret | Customer company |
| `users` | email, passwordHash, name, emailVerifiedAt | unique `email` |
| `memberships` | orgId, userId, role (`admin`, `dpo`, `developer`, `viewer`) | unique `{orgId, userId}` |
| `sites` | orgId, name, domainOrPackage, platform, status, allowedOrigins[], **chainHead** {seq, hash} | `{orgId}`. `chainHead` hash chain ka last point hai (7.2) |
| `apiKeys` | siteId, type (`public`, `secret`), keyHash, prefix, lastUsedAt, revokedAt | unique `keyHash` |

**Notice aur purposes**

| Collection | Main fields | Indexes / note |
|---|---|---|
| `purposes` | siteId, key (`analytics`), required, retentionDays, linkedScripts[], isActive, sortOrder | unique `{siteId, key}` |
| `noticeVersions` | siteId, version (`v1.2`), status (`draft`, `live`, `archived`), publishedAt, **snapshot** {purposes[], translations{en:{...}, hi:{...}}} | `{siteId, status}`. Publish ke baad document kabhi nahi badlega |
| `bannerConfigs` | siteId, position, brandColor, logoUrl, showAgeGate, theme {} | unique `{siteId}` |

> MongoDB mein translations alag collection ki jagah **noticeVersion ke andar embed** karna behtar hai. Ek notice ke saath uske saare texts ek hi document mein, ek hi read mein.

**Consent (sabse important)**

| Collection | Main fields | Indexes / note |
|---|---|---|
| `principals` | siteId, externalId (SDK ka anonymous ID ya customer ka user ID), linkedUserId, ageGroup | unique `{siteId, externalId}` |
| `consentEvents` | siteId, principalId, receiptId, seq, action (`ACCEPT_ALL`, `REJECT_ALL`, `CUSTOM`, `UPDATE`, `WITHDRAW`), purposes {analytics: true, ...}, noticeVersionId, lang, platform, ageGroup, parentVerificationId, ipHash, uaHash, prevHash, hash, createdAt | **Append-only.** unique `{siteId, seq}`, unique `receiptId`, `{siteId, createdAt: -1}`, `{siteId, principalId, createdAt: -1}`, `{siteId, action, createdAt: -1}` |
| `consentStates` | siteId, principalId, purposes {}, lastEventId, noticeVersionId, updatedAt | unique `{siteId, principalId}`. Fast reads ke liye (events se dobara banaya ja sakta hai) |
| `parentalVerifications` | siteId, principalId, guardianPhoneHash, method (`sms_otp`), verifiedAt, attempts | Phone plain text mein nahi |
| `otps` | purpose, targetHash, codeHash, attempts, expiresAt | **TTL index** `expiresAt`: MongoDB khud delete karega |

**Rights, breaches, system**

| Collection | Main fields | Indexes / note |
|---|---|---|
| `rightsRequests` | siteId, principalId, requestId, type (`access`, `correction`, `erasure`, `grievance`, `nominate`), email (encrypted), details, status, dueAt, resolvedAt, **events[]** {actor, action, note, at} | `{siteId, status, dueAt}`. Timeline `events` array mein embed (`$push` se hi judega) |
| `breaches` | orgId, title, discoveredAt, affectedCount, dataCategories[], boardReportedAt, usersNotifiedAt, status | `{orgId, discoveredAt: -1}` |
| `webhookEndpoints` | siteId, url, events[], secret, isActive | `{siteId}` |
| `webhookDeliveries` | endpointId, event, payload, statusCode, attempt, nextRetryAt | TTL: 30 din baad delete |
| `auditLogs` | orgId, userId, action, entity, entityId, diff {}, ip, createdAt | Append-only, `{orgId, createdAt: -1}` |
| `counters` | _id (jaise `receipt`), seq | IDs ke liye (zaroorat ho to) |

### 7.2 Hash chain (ledger ka proof)

Har site ke liye consent events ek chain mein jude honge:

```
hash_n = SHA256( prevHash + canonicalJson(event_n) )
```

**MongoDB mein race condition se bachna:** Ek hi site par do consent ek saath aaye, to dono ek hi `prevHash` utha sakte hain. Isliye har consent save **ek transaction** mein hoga:

```
session.withTransaction(async () => {
  1. sites.findOneAndUpdate({ _id: siteId }, { $inc: { 'chainHead.seq': 1 } }, { new: true })
       → naya seq milta hai, aur site document lock ho jaata hai
  2. prevHash = purana chainHead.hash
  3. hash = sha256(prevHash + canonicalJson(event))
  4. consentEvents.insertOne({ ...event, seq, prevHash, hash })
  5. sites.updateOne({ _id: siteId }, { $set: { 'chainHead.hash': hash } })
  6. consentStates.updateOne({ siteId, principalId }, { $set: {...} }, { upsert: true })
})
```

`{siteId, seq}` par unique index ek extra safety hai: do event ek hi `seq` le hi nahi sakte. Transaction conflict par MongoDB driver retry kar leta hai.

- `canonicalJson` matlab keys hamesha ek hi order mein (jaise `fast-json-stable-stringify`), taaki hash har baar same bane.
- Har raat ek job chain verify karegi. Koi gadbad mile to alert jaayega.
- Har din ka last hash alag storage mein (S3 Object Lock) save hoga, taaki DB ka admin bhi chupchaap badlav na kar sake.

### 7.3 Append-only ko MongoDB mein lagu karna

MongoDB mein row-level permissions nahi hote, isliye 3 layer:
1. **Code:** `ConsentEvent` model par `updateOne`, `deleteOne`, `findOneAndUpdate` wagaira ke Mongoose pre-hooks jo error throw karein.
2. **Database user:** App ke DB user ko ek custom role do jisme `consentEvents` aur `auditLogs` par sirf `find` aur `insert` ho, `update` aur `remove` nahi (Atlas mein custom role se).
3. **Proof:** hash chain + S3 anchor. Koi chhed-chhaad kare to verify job pakad lega.

### 7.4 Dashboard aur logs ki queries

- Dashboard stats: **aggregation pipeline** (`$match` site + date → `$group` by day + action). Bade data par har ghante ek `dailyStats` collection mein pre-compute kar lena.
- Consent Logs pagination: `skip` mat use karo. **Cursor pagination** karo `{createdAt, _id}` ke basis par.
- Search (receipt ID / principal ID): exact match index se. Full-text search ki zaroorat nahi.

### 7.5 Personal data kam se kam

- IP aur user agent ka sirf **salted hash** rakhenge, raw nahi.
- Guardian phone ka hash. OTP bhejne ke liye phone sirf kuch minute Redis mein rahega.
- Rights request ki email zaroori hai (jawab dena hai). Request close hone ke kuch samay baad ise mask kar denge.

---

## 8. API design

**Base URL:** `https://api.<domain>/v1`
**Format:** JSON. Errors ka format: `{ "error": { "code": "INVALID_PURPOSE", "message": "..." } }`

### 8.1 Public API (SDK use karega)

Auth: `X-Site-Key: pk_live_xxx` header. Request ka `Origin` site ke `allowed_origins` se match hona chahiye. Rate limit IP aur site ke hisaab se.

| Method | Endpoint | Kaam |
|---|---|---|
| GET | `/config/{siteId}?lang=hi` | Purposes, live notice, texts, banner config (CDN cached, 5 min) |
| POST | `/consent` | Consent save. Body: principalId, action, purposes, noticeVersion, lang, ageGroup. Return: receiptId |
| POST | `/consent/withdraw` | Saare non-essential purposes band |
| GET | `/consent/{principalId}` | Current state + last receipt |
| GET | `/receipts/{receiptId}` | Receipt ka detail (principal ke token se) |
| POST | `/parental-consent/otp` | Guardian phone par OTP bhejna |
| POST | `/parental-consent/verify` | OTP check, `parentVerificationId` return |
| POST | `/rights-requests` | Rights request banana (email OTP ke baad) |
| POST | `/rights-requests/verify-email` | Requester ki email OTP se verify |

### 8.2 Server API (customer ka backend use karega)

Auth: `Authorization: Bearer sk_live_xxx` (secret key, sirf server par).

| Method | Endpoint | Kaam |
|---|---|---|
| GET | `/server/consent/{externalUserId}` | "Kya is user ka marketing consent hai?" |
| POST | `/server/principals/link` | Anonymous ID ko logged-in user ID se jodna |
| POST | `/server/consent` | Server side se consent record (jaise call center) |

### 8.3 Admin API (admin panel use karega)

Auth: session cookie (httpOnly JWT) + CSRF token. Har request par role check.

| Area | Endpoints |
|---|---|
| Auth | `POST /admin/auth/signup`, `/login`, `/verify-otp`, `/logout`, `/forgot-password`, `GET /admin/me` |
| Org & team | `GET/PUT /admin/org`, `GET/POST/DELETE /admin/org/members` |
| Sites | `GET/POST /admin/sites`, `GET/PATCH/DELETE /admin/sites/{id}`, `POST /admin/sites/{id}/keys/rotate`, `GET /admin/sites/{id}/install-status` |
| Purposes | `GET/POST /admin/sites/{id}/purposes`, `PATCH/DELETE /admin/purposes/{pid}` |
| Notices | `GET /admin/sites/{id}/notices`, `POST .../notices/draft`, `PUT .../notices/draft/translations/{lang}`, `POST .../notices/publish` |
| Banner | `GET/PUT /admin/sites/{id}/banner` |
| Consent logs | `GET /admin/sites/{id}/consents?action=&from=&to=&q=&cursor=`, `GET /admin/consents/{receiptId}`, `POST /admin/sites/{id}/consents/export` (async CSV) |
| Stats | `GET /admin/sites/{id}/stats?range=7d` |
| Rights | `GET /admin/sites/{id}/rights-requests?status=`, `GET/PATCH /admin/rights-requests/{id}`, `POST /admin/rights-requests/{id}/reply` |
| Breaches | `GET/POST /admin/breaches`, `PATCH /admin/breaches/{id}`, `POST /admin/breaches/{id}/notify-users` |
| Webhooks | `GET/POST/DELETE /admin/sites/{id}/webhooks`, `POST /admin/webhooks/{id}/test` |
| Audit | `GET /admin/audit-logs` |

### 8.4 Webhooks (hum customer ko bhejenge)

| Event | Kab |
|---|---|
| `consent.updated` | Koi bhi consent save hua |
| `consent.withdrawn` | User ne withdraw kiya (customer ko processing band karni hai) |
| `rights.requested` | Nayi rights request aayi |
| `rights.updated` | Request ka status badla |

Har webhook mein `X-DPDP-Signature: sha256=...` (HMAC) header hoga. Fail hone par retry: 1 min, 5 min, 30 min, 2 ghante, 12 ghante.

> API ka poora spec **OpenAPI 3** file mein likhna (`apps/api/openapi.yaml`). Usse docs aur Postman collection apne aap ban jaayenge.

---

## 9. Web SDK design

### 9.1 Packages

| Package | Size target (gzip) | Kaam |
|---|---|---|
| `@dpdp/core` | < 8 KB | Config fetch, state, storage, API client, events, script blocking |
| `@dpdp/ui` | < 15 KB | `<dpdp-banner>`, `<dpdp-preferences>`, `<dpdp-parent-consent>`, `<dpdp-fab>`, `<dpdp-receipt>`, `<dpdp-rights-form>` |
| `dpdp.js` (browser bundle) | < 25 KB total | core + ui, IIFE build, CDN par |

### 9.2 Load hone ka flow

```
1. <script data-site-id> load hua
2. localStorage se pichhla consent padha (principalId, purposes, noticeVersion)
3. Saath mein config fetch (CDN se, cached)
4. Agar consent nahi hai, YA noticeVersion purana hai  → banner dikhao
   Agar consent hai aur notice same hai               → sirf FAB dikhao
5. Allowed purposes ki blocked scripts activate karo
6. User choice → POST /consent → localStorage update → scripts update → events fire
```

### 9.3 Script blocking

Customer apni scripts aise likhega:

```html
<script type="text/plain" data-dpdp-purpose="analytics" src="https://.../gtag.js"></script>
<iframe data-dpdp-purpose="marketing" data-src="https://..."></iframe>
```

SDK consent milne par nayi `<script>` banakar asli `type` aur `src` ke saath daalega.
Withdraw par: page reload karke block karna (jo script chal chuki hai use rok nahi sakte), aur jo cookies list mein hain unhe hatana.

**Phase 8 (advanced):** `MutationObserver` se aisi scripts ko bhi pakadna jo customer ne tag nahi ki. Ye mushkil kaam hai, isliye MVP mein nahi.

### 9.4 Public JS API

```ts
DPDP.init({ siteId, lang?: 'auto' | 'en' | 'hi', userId?: string })
DPDP.hasConsent(purpose: string): boolean
DPDP.getState(): ConsentState
DPDP.openPreferences(): void
DPDP.openRightsForm(): void
DPDP.withdraw(): Promise<Receipt>
DPDP.setLanguage(lang: string): void
DPDP.on('ready' | 'change' | 'withdraw' | 'bannerShown', handler)
DPDP.identify(userId: string)   // login ke baad anonymous ID ko user se jodna
```

### 9.5 UI ke rules (checklist)

- Accept all, Reject all aur Choose purposes barabar size, barabar contrast
- Koi toggle pehle se on nahi (essential ke alawa)
- Har purpose ke saath "kab tak rakhenge" dikhe
- Keyboard se poora chale, screen reader labels, focus trap modal mein (WCAG 2.1 AA)
- Mobile par bottom sheet
- Customer ka CSS humare UI ko na tode: **Shadow DOM**
- RTL ki zaroorat nahi (Urdu ke liye baad mein dekhna)
- Banner ka text customer badal sake, lekin DPDP ke zaroori hisse (withdraw, rights link, grievance contact) hata na sake

### 9.6 Browser support
Chrome, Edge, Firefox, Safari ke last 2 versions, aur Android Chrome / iOS Safari. Build target ES2018.

---

## 10. Admin panel (frontend)

Ye `dpdp-frontend` repo ka asli kaam hai. Screens prototype jaisi hi hongi.

### 10.1 Screens aur routes

| Route | Screen | Main components |
|---|---|---|
| `/login`, `/signup`, `/verify`, `/forgot-password` | Auth | AuthForm, OtpInput |
| `/onboarding` | Pehli site add karna, 3 steps | Stepper, SiteForm, InstallSnippet |
| `/` | Dashboard | StatCard, ConsentChart, PurposeMeter, ActivityList, AlertsList |
| `/sites` | Websites & Apps | DataTable, SiteFormDialog, StatusPill |
| `/sites/:id/purposes` | Purposes & Notice | PurposeTable, PurposeDialog, NoticeVersionCard, LanguagePicker |
| `/sites/:id/banner` | Banner Designer | BannerSettingsForm, **LivePreview (`@dpdp/ui` hi use karega)** |
| `/sites/:id/preview` | Plugin UI preview | StepTabs, DeviceFrame, LivePreview |
| `/sites/:id/consents` | Consent Logs | Filters, DataTable (cursor pagination), ReceiptDialog, ExportButton |
| `/sites/:id/rights` | Rights Requests | StatusTabs, DataTable, RequestDrawer, Timeline, ReplyBox |
| `/breaches` | Breach Reports | BreachTable, BreachForm, NotifyUsersDialog |
| `/sites/:id/install` | Install Plugin | PlatformTabs, CodeBlock + Copy, InstallStatus, ApiKeyCard |
| `/settings` | Organisation, team, webhooks | OrgForm, MembersTable, InviteDialog, WebhookTable |
| `/audit` | Audit log | DataTable |

### 10.2 Frontend architecture

```
apps/admin/src/
├── app/            router, providers (QueryClient, Auth, Theme)
├── pages/          har route ka page component
├── features/       feature-wise: sites/, purposes/, consents/, rights/ ...
│   └── consents/   api.ts (TanStack Query hooks), components/, types.ts
├── components/ui/  shadcn components (Button, Dialog, Table ...)
├── lib/            apiClient (fetch wrapper), auth, format (dates, numbers en-IN)
└── i18n/           admin panel ke texts (English pehle)
```

- **Server data:** TanStack Query (caching, refetch, loading states)
- **Forms:** React Hook Form + Zod (wahi schemas jo Express ke `validate()` middleware mein lagte hain, `@dpdp/shared` se)
- **Tables:** TanStack Table
- **Roles:** `viewer` sirf dekh sakta hai, `developer` install aur webhooks, `dpo` rights aur breaches, `admin` sab kuch. UI mein button chhupana aur backend par check karna, dono zaroori hain.
- **Dates:** sab IST mein dikhana, DB mein UTC.

---

## 11. Security aur compliance ki engineering

| Area | Kya karna hai |
|---|---|
| Transport | Har jagah HTTPS, HSTS |
| Auth | argon2 password hash, login par email OTP (2FA), session 12 ghante, logout everywhere |
| Authorization | Har admin endpoint par org aur role check (ek customer doosre ka data na dekh sake: **sabse bada risk**) |
| API keys | Public key sirf public API ke liye, aur origin check ke saath. Secret key hash karke store. Rotate ka option. |
| Rate limiting | Public API: IP + site ke hisaab se (Redis). OTP: per phone 3 baar per 15 min. |
| Input | Har input Zod se validate (`validate()` middleware). **NoSQL injection** se bachne ke liye `express-mongo-sanitize` aur Mongoose `strictQuery`. Query mein kabhi raw `req.body` object mat daalo. |
| XSS | Banner mein customer ka text **escape** karke dikhana (Lit apne aap karta hai). Admin mein `dangerouslySetInnerHTML` nahi. |
| CSRF | Admin API par SameSite cookies + CSRF token |
| Encryption | Atlas encryption at rest, sensitive fields (emails) ke liye app-level encryption (ya MongoDB Client-Side Field Level Encryption) |
| Ledger | DB user ka custom role: `consentEvents` par sirf `find` + `insert`. Mongoose hooks, hash chain + raat ko verify (section 7.3). |
| Backups | Atlas continuous backup / snapshots, har mahine ek baar restore test |
| Retention | Raat ka job: retention period khatam hone par customer ko webhook aur reminder. Hamare apne logs 90 din baad delete. |
| Logging | Logs mein personal data nahi (email, phone, IP mask) |
| Secrets | AWS Secrets Manager / SSM, code mein kabhi nahi |
| Dependencies | Dependabot / Renovate, `pnpm audit` CI mein |
| Pen test | Launch se pehle OWASP Top 10 checklist khud, aur budget ho to ek external pen test |
| Hamari apni compliance | Hum khud bhi customer ke Data Processor hain: Privacy Policy, DPA (Data Processing Agreement), Terms, breach process |

---

## 12. Testing strategy

| Type | Tool | Kya test hoga | Target |
|---|---|---|---|
| Unit | Vitest | core SDK (state, blocking, storage), hash chain, validation | core > 90% coverage |
| API / integration | Vitest + Supertest + mongodb-memory-server (replica set mode, taaki transactions test hon) | Har endpoint, roles, cross-org access na ho | Saare endpoints |
| Component | Vitest + Testing Library | Admin forms, tables | Main flows |
| E2E | Playwright | Demo site par: banner → accept → script load → withdraw → script block. Admin: login → site add → purpose → publish. | 15 se 20 main flows |
| Cross-browser | Playwright (Chromium, Firefox, WebKit) | SDK | Har release |
| Accessibility | axe-core (Playwright) | Banner, preferences | 0 serious issues |
| Performance | Lighthouse CI, bundle size check | dpdp.js < 25 KB, LCP par asar < 50ms | CI fail ho agar limit cross |
| Load | k6 | `/config` aur `/consent` | 200 req/s (MVP ke liye kaafi) |
| Postman | Postman collection + CLI | API smoke tests deploy ke baad | Har deploy |

---

## 13. DevOps: environments, CI/CD, monitoring

**Environments**

| Env | Kahan | Kab deploy |
|---|---|---|
| local | Docker Compose (MongoDB single-node replica set, Redis, Mailpit) | — |
| staging | AWS Mumbai (chhoti machine) | `main` branch par har merge |
| production | AWS Mumbai | Git tag (`v1.2.0`) par |

**CI (GitHub Actions), har pull request par:** lint → type check → unit tests → API tests → build → bundle size check → E2E (staging se pehle)

**SDK release:**
- `cdn/<domain>/v1/dpdp.js` (major version pinned, minor updates apne aap)
- `cdn/<domain>/v1.2.0/dpdp.js` (exact version, jo customer pin karna chahe)
- npm par `@dpdp/core`, `@dpdp/ui` (changesets se version)
- Breaking change sirf v2 mein

**Monitoring**
- Sentry: API, worker, admin aur SDK ke errors (SDK mein sampling, aur koi personal data nahi)
- Uptime checks: `/health`, `/v1/config/demo`
- Alerts: API error rate > 1%, webhook failures, hash chain mismatch, queue backlog
- Status page (Phase 5)

---

## 14. Phase-wise plan

> Har phase ke din aur weeks [section 15](#15-timeline) aur [TIMELINE.md](TIMELINE.md) ke hisaab se hain.

Har phase ke end mein kuch **chalne wala** hona chahiye, sirf aadha bana code nahi.

### Phase 0: Setup aur foundation (3 din · Week 1)
**Goal:** Repo, tools aur faisle tay.
- [ ] DPDP Act + Rules 2025 ek baar khud padhna, notes `docs/legal-notes.md` mein
- [ ] Scope final (section 3), product ka naam aur domain
- [ ] Monorepo setup: pnpm, Turborepo, TypeScript, ESLint, Prettier, Husky
- [ ] Docker Compose: MongoDB (`--replSet rs0`, single node), Redis, Mailpit
- [ ] GitHub repo, branch rules, PR template, GitHub Actions (lint + test)
- [ ] ADR (Architecture Decision Records) folder, pehle 3 ADR: monorepo, Express + MongoDB, Lit
- [ ] Figma / prototype se final screen list

**Deliverable:** `pnpm dev` se khaali API, admin aur demo site chal jaayein. CI green.

### Phase 1: Backend core (17 din · Week 1 – 4)
**Goal:** Consent save aur fetch ho, admin ka data API se manage ho.
- [ ] Express app skeleton: middlewares (helmet, cors, validate, errorHandler, requestId, logger)
- [ ] Mongoose models (section 7), JSON Schema validators, migrate-mongo se indexes, seed script
- [ ] Auth: signup, login, email OTP, sessions, forgot password
- [ ] Orgs, memberships, roles guard
- [ ] Sites + API keys (public/secret), origin check
- [ ] Purposes CRUD, notice draft → publish (snapshot), translations
- [ ] Banner config API
- [ ] Public `/config` (cache headers ke saath)
- [ ] Public `/consent`, `/consent/withdraw`, `/consent/{id}`: transaction ke andar ledger + hash chain + `consentStates`, concurrency test (100 parallel consents, chain toote nahi)
- [ ] Receipts
- [ ] Webhooks: endpoints, HMAC signing, BullMQ retry worker
- [ ] Rate limiting, error format, request logging (PII masked)
- [ ] OpenAPI spec + Postman collection
- [ ] API tests (cross-org access ke tests zaroor)

**Deliverable:** Postman se poora flow: org → site → purposes → publish → consent → withdraw → ledger mein entries, hash chain verify.

### Phase 2: Web SDK (14 din · Week 5 – 7)
**Goal:** Kisi bhi website par script tag se banner chale.
- [ ] `@dpdp/core`: config loader, storage, principal ID, API client (retry, offline queue)
- [ ] Script / iframe blocking, activation, withdraw par reload
- [ ] Event system + public `DPDP.*` API
- [ ] `@dpdp/ui` (Lit + Shadow DOM): banner, preferences, FAB, receipt
- [ ] Age gate UI (parent flow ka backend Phase 4 mein, abhi UI + mock)
- [ ] i18n: en + hi, language auto-detect
- [ ] Theming: brand color, position, light/dark
- [ ] Accessibility: keyboard, focus trap, ARIA
- [ ] `dpdp.js` IIFE build, size budget, staging CDN par upload
- [ ] Demo site (`apps/demo-site`) jisme GA aur Meta Pixel blocked hon
- [ ] Unit tests + Playwright E2E (3 browsers)

**Deliverable:** Demo site par asli banner, scripts block/unblock, consent ledger mein jaata hua.

### Phase 3: Admin panel (19 din · Week 7 – 11)
**Goal:** Customer bina developer ki madad ke sab set kar sake.
- [ ] Project setup: Vite + React + Tailwind + shadcn, router, API client, auth guard
- [ ] Auth pages + onboarding wizard
- [ ] App shell: sidebar, site switcher, roles ke hisaab se menu
- [ ] Sites + Install page (code snippets, install status check, API key rotate)
- [ ] Purposes & Notice: CRUD, publish flow, languages
- [ ] Banner Designer: settings + **`@dpdp/ui` se live preview**
- [ ] Plugin UI preview page (7 steps, desktop/mobile)
- [ ] Consent Logs: filters, cursor pagination, receipt dialog, CSV export (async job + email link)
- [ ] Dashboard: stats API + charts
- [ ] Settings: org, grievance officer, team invite, webhooks
- [ ] Audit log page
- [ ] Empty states, loading, errors, toasts, mobile responsive

**Deliverable:** Naya customer signup karke 15 minute mein apni site par banner live kar de.

### Phase 4: DPDP ke baaki features (9 din · Week 11 – 13)
**Goal:** Rights, bachche, breach, retention.
- [ ] Parental consent: SMS OTP (MSG91, DLT template), verification record, under-18 lock
- [ ] Rights request: SDK form, requester email OTP, API, admin page (drawer, timeline, reply, status)
- [ ] Due-date tracking + reminder emails (7 din pehle, 1 din pehle)
- [ ] Breach register + users ko notice bhejne ka flow + Board report ka template
- [ ] Retention jobs: purpose ki retention khatam → webhook + email reminder
- [ ] Notice version change → purane users ko re-consent banner
- [ ] Email templates (en + hi): receipt, request received, request resolved, breach notice

**Deliverable:** Prototype ki saari screens asli data ke saath chal rahi hain.

### Phase 5: Hardening, docs, beta, launch (12 din · Week 13 – 15)
**Goal:** Production-ready aur pehle customers.
- [ ] Security checklist (section 11), OWASP Top 10, dependency audit
- [ ] Load test (k6), CDN caching tune
- [ ] Hash chain nightly verify + S3 Object Lock anchor
- [ ] Production infra: MongoDB Atlas (M10, Mumbai, IP access list / VPC peering), Redis, ECS/EC2, CloudFront, backups, alerts, status page
- [ ] Docs site: Quick start (5 minute), script blocking guide, JS API reference, REST API (OpenAPI), webhooks, FAQ, DPDP explainer
- [ ] Legal: Terms, Privacy Policy, DPA, lawyer review (product copy + banner default text)
- [ ] Beta: Anvi Real Estate + 2 se 3 aur sites par lagana, feedback, bug fixing
- [ ] Landing page + pricing page (simple)
- [ ] **MVP launch**

**Deliverable:** Production par 3 sites live, docs public.

### Phase 6: Wrappers aur bhashayein (7 din · Week 15 – 17)
- [ ] `@dpdp/react` (Provider, `useConsent`, Next.js SSR-safe)
- [ ] Vue / Angular ke liye docs (Web Components seedhe chal jaate hain)
- [ ] WordPress plugin (settings page, script inject, WordPress.org par submit)
- [ ] 20 aur bhashaon ke translations (professional translator + review), language fallback

### Phase 7: Mobile SDKs (13 din · Week 17 – 19)
- [ ] Shared: `@dpdp/ui` ka mobile bundle jo WebView mein chale, JS ↔ native bridge
- [ ] Android SDK (Kotlin, WebView, SharedPreferences, Maven Central / JitPack)
- [ ] iOS SDK (Swift, WKWebView, UserDefaults, Swift Package Manager)
- [ ] Flutter plugin (pub.dev) + React Native (npm)
- [ ] Sample apps + docs

### Phase 8: Business aur advanced (10 din · Week 19 – 21)
- [ ] Billing (Razorpay subscriptions), plans aur limits
- [ ] Self-serve signup polish, in-app onboarding tips
- [ ] Cookie / script scanner (site crawl karke trackers dhundna)
- [ ] Consent Manager integration (jab registered Consent Managers aa jaayein)
- [ ] SSO (Google Workspace), more roles
- [ ] A/B testing banner text (consent rate badhane ke liye, bina dark pattern ke)

---

## 15. Timeline

**Total:** 104 working days (~21 weeks), 1 developer. 1 week = 5 working days (Monday–Friday). Ek phase jis week mein khatam hota hai, agla phase usi week mein shuru ho sakta hai. Phase-wise description: [TIMELINE.md](TIMELINE.md). Ticket-wise tasks aur estimates: [WORK_ITEMS.md](WORK_ITEMS.md).

| Phase | Kaam | Working days | Weeks | Result |
|---|---|---|---|---|
| 0 | Project setup | 3 | Week 1 | Monorepo, CI, local env |
| 1 | Backend (API + database) | 17 | Week 1 – 4 | Consent API + ledger |
| 2 | Plugin / Web SDK | 14 | Week 5 – 7 | Script tag se banner chalta hai |
| 3 | Admin panel | 19 | Week 7 – 11 | Customer khud setup kar sake |
| 4 | DPDP ke baaki features | 9 | Week 11 – 13 | Rights, parental, breach, retention |
| 5 | Testing, production, launch | 12 | Week 13 – 15 | **MVP launch** |
| 6 | React, WordPress, 22 bhashayein | 7 | Week 15 – 17 | React, WordPress, 22 bhashayein |
| 7 | Mobile SDKs | 13 | Week 17 – 19 | Android, iOS, Flutter, RN |
| 8 | Billing aur advanced features | 10 | Week 19 – 21 | Billing, scanner |
| | **Total** | **104** | **~21 weeks** | |

**Pilot:** Week 8 · **MVP (Phase 0–5):** Week 15, 74 working days · **Poora product (Phase 0–8):** Week 21, 104 working days

```
Week        1    3    5    7    9    11   13   15   17   19   21
Phase 0     █
Phase 1     ████
Phase 2              ███
Phase 3                   █████
Phase 4                         ███
Phase 5                            ███  ← MVP launch
Phase 6                                ███
Phase 7                                    ███
Phase 8                                        ███
```

**Pilot (Week 8):** Phase 0, 1 aur 2 khatam hone ke baad (Week 7), admin panel ke bina setup developer khud karega. Production server aur monitoring lagakar pilot customer (jaise Anvi Real Estate) par consent banner, withdraw aur consent records live honge. Admin panel aur rights requests Phase 3 aur 4 ke baad.

**104 din mein karne ke liye:** Ye timeline tight hai. Har phase mein sirf zaroori kaam pehle karo. Time kam pade to Phase 8 ke features (scanner, A/B testing, SSO) aur Phase 7 mein Flutter / React Native sabse pehle aage khisakne wale items hain.

**Kabhi mat chhodna:** ledger + hash chain, withdraw, script blocking, cross-org security, backups.

---

## 16. Definition of Done aur working rules

**Ek feature tab "done" hai jab:**
- [ ] Code merged, CI green
- [ ] Tests likhe (unit / API / E2E jo lagu ho)
- [ ] Staging par chal raha hai aur khud test kiya
- [ ] Loading, empty aur error states bane hain
- [ ] Docs / OpenAPI update
- [ ] Koi personal data logs mein nahi

**Akele developer ke liye routine:**
- **Har hafte Monday:** is hafte ke 3 goals likho (GitHub Projects board par)
- **Har din:** subah sabse mushkil kaam, shaam ko chhote fixes aur review
- **Har hafte Friday:** staging par demo khud ko, aur ek line changelog
- **Har phase ke end mein:** retro: kya late hua, plan update karo
- Ek waqt mein ek hi feature branch. Chhote PRs, khud review karke merge.
- AI tools (Claude Code) boilerplate, tests aur docs ke liye. Security aur ledger ka code khud dhyan se padhna.

---

## 17. Risks aur unka plan

| Risk | Asar | Plan |
|---|---|---|
| DPDP Rules / deadlines mein badlav | Features badalne padein | Rules par nazar, config-driven design (texts, timelines DB mein), lawyer se quarterly check |
| Ek hi developer, bimar / chhutti | Timeline khiske | 15% buffer, fast-track list (15.3), docs aur ADR taaki koi aur samajh sake |
| Script blocking har site par kaam na kare | Customer ki complaint | Saaf docs, demo examples, support, Phase 8 mein auto-blocking |
| Customer ki site slow ho | Customer chhod de | Size budget CI mein, CDN, async loading |
| Cross-tenant data leak | Bahut bada (legal + reputation) | Har query mein org filter, tests, code review checklist |
| SMS DLT registration mein time | Parental flow late | Week 1 (Phase 0) mein hi DLT registration shuru karo |
| Bade players (OneTrust wagaira) se competition | Sales mushkil | India-first: Hindi + 22 bhashayein, DPDP-specific features, Indian data hosting |
| Scope creep | MVP late | Har nayi idea `docs/ideas.md` mein, MVP ke baad dekho |

---

## 18. Launch checklist

**Product**
- [ ] Demo site par saare flows (accept, reject, custom, withdraw, under-18, rights) pass
- [ ] Banner default text lawyer ne review kiya
- [ ] en + hi texts native speaker ne check kiye
- [ ] Docs: quick start ek naye developer ne 15 minute mein follow kiya

**Tech**
- [ ] Backups on aur restore test kiya
- [ ] Alerts kaam kar rahe hain (ek test alert bheja)
- [ ] Hash chain verify job chal raha hai
- [ ] Rate limits on
- [ ] `dpdp.js` < 25 KB gzip
- [ ] Sentry release tracking on
- [ ] Prod secrets SSM mein, `.env` repo mein nahi

**Legal / business**
- [ ] Terms of Service, Privacy Policy, DPA live
- [ ] Hamara apna grievance contact
- [ ] Pricing page
- [ ] Support email aur response process

---

## 19. Glossary

| Term | Matlab |
|---|---|
| Data Principal | Jiska data hai (website ka user) |
| Data Fiduciary | Jo data lekar uska use tay karta hai (hamara customer) |
| Data Processor | Jo fiduciary ki taraf se data process kare (**hum**) |
| Consent Manager | Board ke saath registered entity jo users ke consents manage karti hai |
| Notice version | Notice ka ek fixed snapshot. Text badla to naya version. |
| Purpose | Data lene ka ek kaam (analytics, marketing...) |
| Receipt | Consent ka proof jo user ko milta hai |
| Ledger | Saare consent events ki append-only list |
| Hash chain | Har entry ka hash pichhli entry se juda, taaki badlav pakda ja sake |
| Principal ID | SDK ka anonymous ID jo browser mein save hota hai |
| FAB | Floating Action Button ("Manage consent") |
| DLT | India mein commercial SMS bhejne ke liye zaroori registration |
| ADR | Architecture Decision Record: kyun koi faisla liya, uska note |
