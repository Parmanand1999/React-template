# DPDP Consent Plugin: Work Items (Backlog)

**Version:** 1.1 · **Total:** 104 working days (~21 weeks) · **Team:** 1 full-stack developer
**Stack:** Node.js + Express, MongoDB (Mongoose), Redis + BullMQ, React (admin), Lit (SDK UI), TypeScript everywhere
**Related:** [PROJECT_PLAN.md](PROJECT_PLAN.md) (architecture, DB, API design) · [TIMELINE.md](TIMELINE.md) (phase-wise overview)

Yeh document Azure DevOps / Jira ke backlog jaisa hai. Har ticket ko seedha board par copy karke use kar sakte ho.

---

## Kaise padhna hai

**Hierarchy:** `Epic (E1)` → `Ticket (DPDP-1xx)` → `Tasks (checklist)`

**Har ticket mein:**
- **Type:** Story (user ko dikhne wala feature), Task (technical kaam), Spike (research), Chore (setup / maintenance)
- **Estimate:** din mein. 1 din = ~6 ghante focused kaam. 0.5 = aadha din.
- **Depends on:** pehle kaunsa ticket khatam hona chahiye
- **Description:** kya aur kyun
- **Tasks:** developer ko kya-kya karna hai (files, endpoints, components)
- **Acceptance criteria (AC):** ticket "Done" tab hai jab ye sab sach ho

**Estimates ke baare mein:** Har epic ka total [TIMELINE.md](TIMELINE.md) ke phases se match karta hai (total 104 din). Ye tight estimates hain, isliye har ticket mein pehle Tasks ke zaroori hisse aur AC pure karo, nice-to-have baad mein.

**Definition of Done (har ticket par lagu):** code merged, CI green, tests likhe, staging par khud check kiya, OpenAPI / docs update, logs mein koi personal data nahi.

---

## Summary

| Epic | Working days | Weeks |
|---|---|---|
| E0 · Setup | 3 | Week 1 |
| E1 · Backend core | 17 | Week 1 – 4 |
| E2 · Web SDK | 14 | Week 5 – 7 |
| E3 · Admin panel | 19 | Week 7 – 11 |
| E4 · DPDP features | 9 | Week 11 – 13 |
| E5 · Hardening + launch **(MVP launch)** | 12 | Week 13 – 15 |
| E6 · Wrappers + bhashayein | 7 | Week 15 – 17 |
| E7 · Mobile SDKs | 13 | Week 17 – 19 |
| E8 · Business + advanced | 10 | Week 19 – 21 |
| **Total** | **104** | **~21 weeks** |

- **Pilot (ek customer par live):** Week 8
- **MVP (E0 se E5):** 74 working days, Week 15
- **Poora product (E0 se E8):** 104 working days, Week 21
- 1 week = 5 working days (Monday–Friday). Chhuttiyan aur leave isme nahi gine gaye; unke hisaab se weeks aage khiskenge.

> **Tight plan:** 104 din ek developer ke liye tight hai, isliye alag buffer tickets nahi rakhe. Time kam pade to pehle E8 (DPDP-802 scanner, 803 SSO, 805 A/B testing) aur E7 mein DPDP-704 / 705 (Flutter, React Native) aage khisakao. Ledger, withdraw, script blocking, cross-tenant security aur backups kabhi mat kaato.

---

## E0 · Setup (3 din)

### DPDP-001 · Monorepo aur tooling setup
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** —

**Description:**
Ek monorepo banana hai jisme backend, admin, SDK aur shared code ek saath rahein. Isse types aur validation schemas har jagah ek jaise rahenge.

**Tasks:**
- [ ] `pnpm init`, `pnpm-workspace.yaml` (`apps/*`, `packages/*`)
- [ ] Turborepo: `turbo.json` mein `build`, `dev`, `lint`, `test`, `typecheck` pipelines
- [ ] Root `tsconfig.base.json` (strict mode, path aliases)
- [ ] ESLint (typescript-eslint) + Prettier, shared config `packages/config`
- [ ] Husky + lint-staged (commit se pehle lint + format)
- [ ] Khaali folders: `apps/api`, `apps/worker`, `apps/admin`, `apps/demo-site`, `packages/core`, `packages/ui`, `packages/shared`
- [ ] `.nvmrc` (Node 20), `.editorconfig`, `.gitignore`, `README.md`

**AC:**
- `pnpm install` aur `pnpm build` root se bina error chalte hain
- Galat format wala code commit karne par hook use rok deta hai

---

### DPDP-002 · Local Docker environment
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** DPDP-001

**Description:**
Local development ke liye MongoDB (replica set mode, kyunki transactions chahiye), Redis aur ek fake email server.

**Tasks:**
- [ ] `infra/docker-compose.yml`: `mongo:7` with `--replSet rs0`, ek init script jo `rs.initiate()` chalaye
- [ ] `redis:7`
- [ ] `axllent/mailpit` (SMTP 1025, UI 8025)
- [ ] `.env.example` with `MONGO_URI=mongodb://localhost:27017/dpdp?replicaSet=rs0`, `REDIS_URL`, `SMTP_*`
- [ ] Root script: `pnpm infra:up`, `pnpm infra:down`

**AC:**
- `pnpm infra:up` ke baad `rs.status()` mein `PRIMARY` dikhe
- Mailpit UI `localhost:8025` par khule

---

### DPDP-003 · CI pipeline (GitHub Actions)
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** DPDP-001

**Description:**
Har pull request par lint, typecheck, test aur build automatic chalein.

**Tasks:**
- [ ] `.github/workflows/ci.yml`: Node 20, pnpm cache, `turbo run lint typecheck test build`
- [ ] Turbo cache (local cache ya GitHub cache)
- [ ] `main` branch protection: PR + CI green zaroori
- [ ] PR template (`.github/pull_request_template.md`): kya badla, kaise test kiya, screenshots

**AC:**
- Ek test PR par CI chale aur green ho
- Fail hone wale test ke saath merge button disabled ho

---

### DPDP-004 · Shared package (`@dpdp/shared`)
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-001

**Description:**
Backend, admin aur SDK teeno ek hi Zod schemas aur constants use karenge. Isse frontend aur backend ka validation kabhi alag nahi hoga.

**Tasks:**
- [ ] Zod install, `src/schemas/` folder
- [ ] Constants: `CONSENT_ACTIONS`, `RIGHTS_TYPES`, `ROLES`, `AGE_GROUPS`, `PLATFORMS`, `LANGS`
- [ ] Base schemas: `objectIdSchema`, `paginationSchema` (cursor + limit), `errorResponseSchema`
- [ ] ID helpers: `receiptId()` → `RCPT-XXXXXX`, `requestId()` → `REQ-XXXXXX` (nanoid, custom alphabet)
- [ ] Build: tsup (ESM + CJS + `.d.ts`)

**AC:**
- `apps/api` aur `apps/admin` dono `import { CONSENT_ACTIONS } from '@dpdp/shared'` kar sakein
- Unit tests ID helpers ke format ke liye

---

### DPDP-005 · DPDP notes, ADRs, DLT registration
**Type:** Spike · **Estimate:** 0.5 din · **Depends on:** —

**Description:**
DPDP Act aur Rules 2025 padhkar developer ke kaam ki baatein note karni hain. Saath mein bade faislon ke ADR likhne hain. SMS ke liye DLT registration bhi isi hafte shuru karna hai, kyunki usme hafte lag sakte hain.

**Tasks:**
- [ ] `docs/legal-notes.md`: notice, consent, withdraw, children, rights, breach, retention ke points + section numbers + open questions (lawyer ke liye)
- [ ] `docs/adr/0001-monorepo.md`, `0002-express-mongodb.md`, `0003-lit-web-components.md`
- [ ] SMS provider (MSG91 ya doosra) par account + DLT entity registration + OTP template submit

**AC:**
- 3 ADR merged
- DLT application submitted (reference number note kiya)

---

### DPDP-006 · Coding conventions aur board setup
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** —

**Description:**
Akele developer ke liye bhi ek saaf process chahiye, taaki kaam track ho aur baad mein koi aur jude to samajh sake.

**Tasks:**
- [ ] GitHub Projects / Azure Boards par is document ke epics aur tickets daalna
- [ ] Branch naming: `feat/DPDP-115-consent-api`, `fix/DPDP-...`
- [ ] Commit format: Conventional Commits (`feat(api): ...`)
- [ ] `docs/CONTRIBUTING.md`: setup steps, scripts, conventions

**AC:**
- Board par saare E0 aur E1 tickets hain
- Naya developer `CONTRIBUTING.md` padhkar 30 minute mein project chala sake

---

## E1 · Backend core (17 din)

### DPDP-101 · Express app skeleton
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-001, DPDP-002

**Description:**
Express API ka basic dhaancha, jisme saare common middlewares aur error handling ek jagah hon. Iske upar baaki saare modules banenge.

**Tasks:**
- [ ] `apps/api/src/app.ts`: `express()`, `helmet()`, `cors()` (abhi admin origin ke liye), `express.json({ limit: '100kb' })`, `cookie-parser`
- [ ] `config/env.ts`: Zod se `process.env` validate (galat env par app start hi na ho)
- [ ] `lib/logger.ts`: pino + `pino-http`, PII redaction (`email`, `phone`, `authorization`, `cookie`)
- [ ] `middlewares/requestId.ts`: har request ko `x-request-id`
- [ ] `middlewares/validate.ts`: `validate({ body, query, params })` Zod schemas se
- [ ] `lib/errors.ts`: `AppError(code, status, message)`, `NotFound`, `Forbidden`, wagaira
- [ ] `middlewares/errorHandler.ts`: format `{ error: { code, message, requestId } }`, Zod errors ka saaf message
- [ ] `GET /health` (DB + Redis ping)
- [ ] `server.ts`: graceful shutdown (SIGTERM par DB connection band)
- [ ] Module pattern ka ek example: `modules/health/routes.ts`

**AC:**
- `pnpm --filter api dev` se server chale, `/health` 200 de
- Galat body par 400 aur saaf error JSON
- Unknown route par 404 JSON
- Logs mein email ya password kabhi plain na dikhe (test)

---

### DPDP-102 · MongoDB connection aur base plugins
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-101

**Description:**
MongoDB se connection, aur kuch common Mongoose plugins jo har model par lagenge. Sabse important: **tenant guard**, taaki koi query bina `orgId` / `siteId` ke chal hi na sake (ek customer doosre ka data na dekh sake).

**Tasks:**
- [ ] `config/mongo.ts`: `mongoose.connect`, retry, `autoIndex` sirf dev mein
- [ ] Global settings: `strictQuery: true`, `sanitizeFilter: true`
- [ ] Plugin `toJSON`: `_id` → `id`, `__v` hatana, sensitive fields hatana
- [ ] Plugin `tenantGuard`: `find*`, `count*`, `update*`, `aggregate` mein `orgId` ya `siteId` filter na ho to error (opt-out sirf internal jobs ke liye)
- [ ] Helper `withTransaction(fn)` (session + retry)
- [ ] `migrate-mongo` setup: `apps/api/migrations/`, script `pnpm --filter api migrate:up`

**AC:**
- Bina `siteId` ke `Purpose.find({})` error de (unit test)
- Transaction helper ka test (rollback hone par kuch save na ho)
- `migrate:up` chalne par migrations collection bane

---

### DPDP-103 · Mongoose models, validators, indexes
**Type:** Task · **Estimate:** 1.5 din · **Depends on:** DPDP-102

**Description:**
[PROJECT_PLAN.md section 7](PROJECT_PLAN.md#7-database-design) ke hisaab se saare collections ke models, MongoDB JSON Schema validators aur indexes.

**Tasks:**
- [ ] Models: `Organization`, `User`, `Membership`, `Site` (with `chainHead`), `ApiKey`, `Purpose`, `NoticeVersion` (snapshot + translations embed), `BannerConfig`, `Principal`, `ConsentEvent`, `ConsentState`, `ParentalVerification`, `Otp`, `RightsRequest` (events embed), `Breach`, `WebhookEndpoint`, `WebhookDelivery`, `AuditLog`
- [ ] `ConsentEvent` aur `AuditLog`: `updateOne`, `updateMany`, `findOneAndUpdate`, `deleteOne`, `deleteMany`, `replaceOne` par pre-hook jo error throw kare
- [ ] Migration `001-indexes.js`: section 7.1 ke saare unique aur compound indexes, TTL indexes (`otps.expiresAt`, `webhookDeliveries`)
- [ ] Migration `002-validators.js`: `collMod` se `$jsonSchema` (required fields aur enums)
- [ ] TypeScript types models se export

**AC:**
- `migrate:up` ke baad `db.consentEvents.getIndexes()` mein saare indexes dikhein
- `ConsentEvent.updateOne(...)` error de (test)
- Required field ke bina `insertOne` direct Mongo shell se bhi fail ho (validator)

---

### DPDP-104 · Seed script
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** DPDP-103

**Description:**
Local aur staging par demo data, taaki admin aur SDK ka kaam bina manual setup ke shuru ho sake.

**Tasks:**
- [ ] `pnpm --filter api seed`: 1 org (Demo Realty), 1 admin user, 2 sites, 4 purposes, live notice v1.2 (en + hi), banner config, ~50 consent events (hash chain ke saath), 6 rights requests
- [ ] `--reset` flag jo pehle data saaf kare (sirf non-production)

**AC:**
- Seed ke baad login ho sake (`owner@demo.local` / password `.env.example` mein)
- Production env mein seed chalane par script mana kar de

---

### DPDP-105 · Signup aur email verification
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-103

**Description:**
Naya customer apna account bana sake. Email OTP se verify hone ke baad hi login ho.

**Tasks:**
- [ ] `POST /v1/admin/auth/signup` { name, email, password, orgName }: user + org + admin membership (transaction mein)
- [ ] Password: argon2id, min 10 char, common password check
- [ ] `lib/otp.ts`: 6 digit code, hash karke `otps` mein, 10 min expiry, max 5 attempts
- [ ] `lib/mailer.ts`: nodemailer (dev mein Mailpit, prod mein SES)
- [ ] `POST /v1/admin/auth/verify-email` { email, code }
- [ ] `POST /v1/admin/auth/resend-otp` (rate limit: 3 / 15 min)

**AC:**
- Signup ke baad Mailpit mein OTP email aaye
- Galat OTP 5 baar daalne par code invalid ho jaaye
- Same email se dobara signup par 409

---

### DPDP-106 · Login, 2FA OTP, sessions
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-105

**Description:**
Admin panel ka login. Password ke baad email OTP (2FA). Session httpOnly cookie mein, taaki JS se token chori na ho.

**Tasks:**
- [ ] `POST /v1/admin/auth/login` → password check → OTP bhejo → `{ otpRequired: true, loginToken }`
- [ ] `POST /v1/admin/auth/login/verify` → JWT session cookie (`httpOnly`, `secure`, `sameSite=lax`, 12h)
- [ ] Session revoke ke liye `users.sessionVersion` (logout everywhere)
- [ ] `middlewares/auth.ts`: cookie se user, `req.user`
- [ ] CSRF: double-submit token (`x-csrf-token` header) state-changing requests par
- [ ] `POST /v1/admin/auth/logout`, `POST /v1/admin/auth/logout-all`, `GET /v1/admin/me` (user + memberships)
- [ ] Login rate limit: 5 / 15 min per email + IP

**AC:**
- Bina OTP ke session na mile
- Cookie JS (`document.cookie`) se na padhi ja sake
- Logout-all ke baad purani cookie 401 de
- CSRF token ke bina POST 403 de

---

### DPDP-107 · Forgot / reset password
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-106

**Tasks:**
- [ ] `POST /v1/admin/auth/forgot-password` (email exist kare ya na kare, response hamesha same)
- [ ] Reset link: random token (hash DB mein), 30 min expiry, ek baar use
- [ ] `POST /v1/admin/auth/reset-password` { token, password } → `sessionVersion++`

**AC:**
- Reset ke baad saare purane sessions invalid
- Ek token do baar use na ho

---

### DPDP-108 · Organisations, members, roles
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-106

**Description:**
Ek org mein kai log, alag roles ke saath: `admin`, `dpo`, `developer`, `viewer`. Har admin endpoint par role check.

**Tasks:**
- [ ] `middlewares/orgContext.ts`: header `x-org-id` ya default org → `req.org`, membership check
- [ ] `middlewares/requireRole(...roles)`
- [ ] Permission matrix `@dpdp/shared/permissions.ts` (admin UI bhi yahi use karega)
- [ ] `GET/PUT /v1/admin/org` (naam, address, grievance officer, DPO email)
- [ ] `GET /v1/admin/org/members`, `POST /v1/admin/org/invites` (email + role → invite link), `POST /v1/admin/invites/accept`, `PATCH/DELETE /v1/admin/org/members/:id`
- [ ] Aakhri admin ko hataya ya downgrade na kiya ja sake

**AC:**
- `viewer` role se `PUT /org` par 403
- Invite link 7 din baad expire
- Doosre org ka member ID bhejne par 404 (403 nahi, taaki existence leak na ho)

---

### DPDP-109 · Sites CRUD
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-108

**Tasks:**
- [ ] `GET/POST /v1/admin/sites`, `GET/PATCH/DELETE /v1/admin/sites/:id` (delete = soft delete / archive)
- [ ] Fields: name, domainOrPackage, platform (enum), allowedOrigins[] (URL validation), status
- [ ] Site create par `chainHead: { seq: 0, hash: GENESIS }` aur default banner config + essential purpose

**AC:**
- Naya site banate hi uske paas ek "Essential" purpose ho
- `allowedOrigins` mein `http://` sirf `localhost` ke liye allowed

---

### DPDP-110 · API keys aur site key middleware
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-109

**Description:**
SDK public key se aur customer ka server secret key se humari API call karega.

**Tasks:**
- [ ] Key format: `pk_live_` / `sk_live_` + 32 random chars. DB mein sirf SHA-256 hash + pehle 8 chars (dikhane ke liye)
- [ ] Site create par ek public key apne aap bane
- [ ] `POST /v1/admin/sites/:id/keys` (secret key sirf ek baar dikhegi), `POST .../keys/:keyId/revoke`, `POST .../keys/rotate`
- [ ] `middlewares/siteKey.ts`: `X-Site-Key` header → site, `Origin` ko `allowedOrigins` se match karo
- [ ] `middlewares/secretKey.ts`: `Authorization: Bearer sk_...`
- [ ] Key lookup Redis mein 60 sec cache, `lastUsedAt` batch mein update

**AC:**
- Galat origin se public key wali request 403
- Revoke ke 60 sec ke andar key band
- Secret key DB dump mein bhi plain text na mile

---

### DPDP-111 · Purposes CRUD
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-109

**Tasks:**
- [ ] `GET/POST /v1/admin/sites/:id/purposes`, `PATCH/DELETE /v1/admin/purposes/:pid`
- [ ] Fields: key (slug, unique per site), required, retentionDays, linkedScripts[], isActive, sortOrder
- [ ] `essential` purpose delete ya non-required na ho sake
- [ ] Badlav hone par site par flag `noticeDirty: true` (naya notice publish karna padega)

**AC:**
- Duplicate key par 409
- Purpose badalne se live notice nahi badalta (wo publish se hi badlega)

---

### DPDP-112 · Notice versions aur translations
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-111

**Description:**
Notice ka text aur purposes ek version mein freeze hote hain. User ne jis version par consent diya, wo hamesha wapas dikhaya ja sake.

**Tasks:**
- [ ] `GET /v1/admin/sites/:id/notices` (list), `GET .../notices/draft` (na ho to bana do)
- [ ] `PUT .../notices/draft/translations/:lang` { title, body, purposeTexts: { analytics: { name, description } } }
- [ ] `POST .../notices/publish`: validation (English + har active purpose ka text zaroori), current purposes ka snapshot, version `v1.3` auto, purana `live` → `archived`, sab ek transaction mein
- [ ] Publish par CDN config cache purge job (E5 mein asli CDN, abhi Redis cache clear)

**AC:**
- English text na ho to publish 422
- Publish ke baad `live` sirf ek version ho
- Archived version kabhi edit na ho sake

---

### DPDP-113 · Banner config API
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-109

**Tasks:**
- [ ] `GET/PUT /v1/admin/sites/:id/banner` { position: bar|box|center, brandColor (hex), logoUrl, showAgeGate, theme }
- [ ] Color contrast check (brand color par white text readable ho, warna warning)

**AC:**
- Invalid hex par 400
- Update ke baad public config mein naya data aaye

---

### DPDP-114 · Public config endpoint
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-110, DPDP-112, DPDP-113

**Description:**
SDK page load par yahi endpoint call karega. Ye bahut zyada call hoga, isliye fast aur cached hona chahiye.

**Tasks:**
- [ ] `GET /v1/config/:siteId?lang=hi`: live notice snapshot (sirf requested lang + en fallback), banner config, grievance contact, languages list
- [ ] Response Redis mein cache (key: site + lang + notice version), publish / banner update par invalidate
- [ ] Headers: `Cache-Control: public, max-age=300`, `ETag`
- [ ] Is endpoint par site key zaroori nahi (CDN cache ke liye), sirf siteId. Koi secret data response mein nahi.

**AC:**
- Doosri request Redis se aaye (< 20 ms local)
- `If-None-Match` par 304
- Live notice na ho to 404 `NOTICE_NOT_PUBLISHED`

---

### DPDP-115 · Consent API + hash chain ledger
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-114

**Description:**
Project ka sabse important hissa. User ka har consent ek append-only ledger mein save hota hai, hash chain ke saath. Ek hi transaction mein event, chain head aur current state update hote hain ([PROJECT_PLAN 7.2](PROJECT_PLAN.md#72-hash-chain-ledger-ka-proof)).

**Tasks:**
- [ ] `lib/canonicalJson.ts` (`fast-json-stable-stringify`), `lib/hashChain.ts`: `computeHash(prevHash, event)`
- [ ] `POST /v1/consent` (siteKey middleware): body `{ principalId, action, purposes, noticeVersion, lang, platform, ageGroup, parentVerificationId? }`
- [ ] Validation: purposes sirf us notice version ke purposes hon, required purposes hamesha `true`, `noticeVersion` live ho ya pichhla (grace)
- [ ] Under-18: `parentVerificationId` zaroori, non-essential purposes server par `false` force
- [ ] Principal upsert (`{siteId, externalId}`)
- [ ] Transaction: `sites.findOneAndUpdate($inc chainHead.seq)` → hash → `consentEvents.insertOne` → `sites.updateOne(chainHead.hash)` → `consentStates.updateOne(upsert)`
- [ ] IP aur user agent ka salted hash (`HASH_SALT` env)
- [ ] Response: `{ receiptId, createdAt, purposes }`
- [ ] Webhook event `consent.updated` queue mein daalo (E1-118 tak sirf stub)

**AC:**
- 3 consents ke baad chain verify ho: har event ka `prevHash` = pichhle ka `hash`
- Required purpose `false` bhejne par bhi `true` save ho
- Galat notice version par 422
- Transaction beech mein fail ho to koi bhi document na bane (test)

---

### DPDP-116 · Withdraw, state, receipt endpoints
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-115

**Tasks:**
- [ ] `POST /v1/consent/withdraw` { principalId } → `WITHDRAW` event (saare non-essential `false`), webhook `consent.withdrawn`
- [ ] `GET /v1/consent/:principalId` → current state + last receipt + notice version
- [ ] `GET /v1/receipts/:receiptId?principalId=` → receipt detail (principal match zaroori)
- [ ] Server API: `GET /v1/server/consent/:externalUserId` (secret key)

**AC:**
- Withdraw ke baad state mein saare non-essential `false`
- Doosre principal ki receipt maangne par 404

---

### DPDP-117 · Concurrency tests aur chain verifier
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-115

**Tasks:**
- [ ] `lib/verifyChain.ts`: site ke saare events `seq` order mein padhkar hash dobara compute, pehli gadbad ka `seq` return
- [ ] CLI: `pnpm --filter api chain:verify --site <id>`
- [ ] Test: 100 parallel `POST /consent` ek hi site par → chain valid, `seq` 1 se 100 bina gap

**AC:**
- Parallel test 10 baar lagatar pass
- Kisi event ka `purposes` DB mein haath se badlo → verifier wahi `seq` pakde

---

### DPDP-118 · Webhooks + BullMQ worker
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-116

**Description:**
Customer ke server ko events bhejna, taaki consent withdraw hone par wo marketing wagaira band kar sake.

**Tasks:**
- [ ] `apps/worker`: BullMQ worker process, queue `webhooks`
- [ ] Admin: `GET/POST/DELETE /v1/admin/sites/:id/webhooks`, `POST /v1/admin/webhooks/:id/test`
- [ ] Payload: `{ id, type, createdAt, data }`, header `X-DPDP-Signature: t=<ts>,v1=<hmac_sha256>`
- [ ] Retry: 1m, 5m, 30m, 2h, 12h (BullMQ backoff), 10 sec timeout
- [ ] `webhookDeliveries` mein har attempt (TTL 30 din)
- [ ] 50 lagatar failure par endpoint auto-disable + admin ko email
- [ ] Signature verify karne ka Node code sample docs ke liye

**AC:**
- webhook.site / local test server par event pahunche aur signature verify ho
- Server down ho to retry schedule ke hisaab se dobara bheje
- Worker restart hone par queue ka data na khoye

---

### DPDP-119 · Rate limit aur security middlewares
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-110

**Tasks:**
- [ ] `express-rate-limit` + `rate-limit-redis`: public API per IP (60/min) aur per site (configurable), admin per user
- [ ] `express-mongo-sanitize` (`$` aur `.` wale keys hatana)
- [ ] `helmet` config final, CORS: public API par site ke `allowedOrigins`, admin API par sirf admin domain
- [ ] `hpp` (HTTP parameter pollution)
- [ ] Body size limits

**AC:**
- `{ "email": { "$gt": "" } }` jaisi body se login bypass na ho (test)
- Limit cross karne par 429 + `Retry-After` header

---

### DPDP-120 · OpenAPI spec + Postman collection
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-118

**Tasks:**
- [ ] `zod-to-openapi` se schemas se `openapi.yaml` generate (hand-written ki jagah)
- [ ] `/docs` par Swagger UI (sirf dev / staging)
- [ ] Postman collection OpenAPI se import, environments (local, staging), auth flow scripts
- [ ] Postman CLI se smoke test: signup → site → purpose → publish → consent → withdraw

**AC:**
- `postman collection run` local par green
- Har endpoint OpenAPI mein ho (CI check)

---

### DPDP-121 · Cross-tenant security tests
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-119

**Description:**
Sabse bada risk: ek customer doosre ka data dekh le. Iske liye alag test suite.

**Tasks:**
- [ ] Do orgs ka fixture, har admin endpoint par doosre org ki ID se request → 404
- [ ] Public API: site A ki key se site B ka consent / receipt → 404
- [ ] Test helper jo naye endpoint ke liye ye test apne aap yaad dilaye (route list se compare)

**AC:**
- Saare admin routes cross-tenant suite mein covered (CI check fail ho agar naya route test ke bina aaye)

---

## E2 · Web SDK (14 din)

### DPDP-201 · SDK core package setup aur build
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** DPDP-004

**Tasks:**
- [ ] `packages/core`: tsup, outputs ESM + IIFE (`window.DPDP`), target ES2018
- [ ] `size-limit` CI check: core < 8 KB gzip
- [ ] Vitest + `happy-dom`

**AC:**
- `pnpm --filter core build` se `dist/dpdp-core.iife.js` bane
- Size limit cross hone par CI fail

---

### DPDP-202 · Config loader, storage, principal ID
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-201, DPDP-114

**Tasks:**
- [ ] `storage.ts`: localStorage adapter (try/catch, fallback memory), key `dpdp:<siteId>`
- [ ] Principal ID: pehli visit par `crypto.randomUUID()`, storage mein
- [ ] `config.ts`: `GET /config/:siteId?lang=`, localStorage mein ETag ke saath cache, timeout 3 sec
- [ ] Language detect: `data-lang` → `navigator.language` → `en`
- [ ] Config load fail ho to site na toote: banner nahi dikhega, saari non-essential scripts blocked rahengi (safe default)

**AC:**
- Private mode / storage blocked mein bhi error na aaye
- API down ho to page normal chale aur scripts blocked rahein

---

### DPDP-203 · SDK API client
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-202

**Tasks:**
- [ ] `api.ts`: `fetch` wrapper, `X-Site-Key`, 2 retry with backoff
- [ ] Offline queue: consent POST fail ho to storage mein rakho, agli load par bhejo
- [ ] Page close par pending request `navigator.sendBeacon` se

**AC:**
- Network off karke consent do → network on karke reload → ledger mein entry aaye

---

### DPDP-204 · Consent state, public DPDP API, events
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-203

**Tasks:**
- [ ] State: `{ principalId, purposes, noticeVersion, receiptId, updatedAt }`
- [ ] `shouldShowBanner()`: consent nahi hai YA noticeVersion purana hai
- [ ] Public API: `init`, `hasConsent`, `getState`, `acceptAll`, `rejectAll`, `save(purposes)`, `withdraw`, `openPreferences`, `openRightsForm`, `setLanguage`, `identify`, `on/off`
- [ ] Events: `ready`, `change`, `withdraw`, `bannerShown`, `bannerClosed`
- [ ] Script tag se auto-init (`data-site-id`)

**AC:**
- Unit tests har public method ke liye
- `DPDP.on('change')` save ke baad fire ho

---

### DPDP-205 · Script aur iframe blocking
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-204

**Description:**
Customer ki tracking scripts tab tak na chalein jab tak us purpose ka consent na mile. SDK ka sabse mushkil hissa, isliye sabse zyada test.

**Tasks:**
- [ ] `<script type="text/plain" data-dpdp-purpose="analytics">` dhundhna (inline + `src` dono)
- [ ] Consent par nayi `<script>` banakar original attributes copy, order maintain (`async`/`defer` respect)
- [ ] `<iframe data-dpdp-purpose data-src>` → `src` set
- [ ] Page load ke baad aane wali tagged scripts ke liye `MutationObserver`
- [ ] Withdraw: config ki cookie list (`_ga`, `_fbp`...) delete karo, phir `location.reload()` (option se band ho sake)
- [ ] Ek purpose ek baar hi activate ho (double load na ho)

**AC:**
- Demo site par GA aur Meta Pixel: consent se pehle network tab mein request nahi, consent ke baad request
- Inline script ka order sahi rahe (test page par 3 dependent scripts)
- Withdraw ke baad `_ga` cookie hat jaaye

---

### DPDP-206 · UI package setup (Lit + Shadow DOM)
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** DPDP-201

**Tasks:**
- [ ] `packages/ui`: Lit 3, components `dpdp-*` prefix
- [ ] Theme CSS variables (`--dpdp-brand`, `--dpdp-radius`, font) config se
- [ ] Light / dark (`prefers-color-scheme`)
- [ ] Storybook ya simple `dev.html` jisme saare components dikhein
- [ ] size-limit: ui < 15 KB gzip

**AC:**
- Customer ki site ka CSS (`* { color: red }`) humare banner par asar na kare

---

### DPDP-207 · `<dpdp-banner>` component
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-206, DPDP-204

**Description:**
Pehli visit par dikhne wala banner. Design prototype ke "Plugin UI → Banner" step jaisa.

**Tasks:**
- [ ] Positions: bar, box, center. Mobile (< 640px) par bottom sheet
- [ ] Title, body, language switch, grievance contact, notice version
- [ ] Buttons: Reject all, Choose purposes, Accept all, teeno same size aur style weight
- [ ] Age gate slot (DPDP-210)
- [ ] Events core ko: accept / reject / open preferences

**AC:**
- Accept aur Reject ke beech koi visual farak nahi (sirf color, size same)
- 320px width par bhi bina horizontal scroll ke dikhe

---

### DPDP-208 · `<dpdp-preferences>` component
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-207

**Tasks:**
- [ ] Modal (desktop) / bottom sheet (mobile)
- [ ] Har purpose: naam, description, retention ("Kept for 13 months"), toggle
- [ ] Essential: "Always on", toggle disabled
- [ ] Pehli baar khule to saare toggles off. Baad mein khule to current state.
- [ ] Save, Reject all; agar consent hai to "Withdraw all consent"
- [ ] Under-18: non-essential toggles disabled + note

**AC:**
- Koi toggle pehle se on nahi (pehli baar)
- Escape se band, focus wapas trigger button par

---

### DPDP-209 · `<dpdp-fab>`, toast, `<dpdp-receipt>`
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-208

**Tasks:**
- [ ] FAB: "Manage consent" (position config se, `data-dpdp-fab="false"` se band agar customer apna link de)
- [ ] Toast: "Your choices are saved · View receipt", 5 sec
- [ ] Receipt: ID, time, notice version, language, purposes ✓/✕, Change choices, Withdraw

**AC:**
- FAB hamesha visible (DPDP: withdraw utna hi aasaan)
- Receipt data API (`/receipts/:id`) se aaye

---

### DPDP-210 · Age gate aur `<dpdp-parent-consent>` UI
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-207

**Tasks:**
- [ ] Banner mein "Are you 18 or older?" (config `showAgeGate`)
- [ ] Under 18 → parent consent component: guardian mobile, Send OTP, OTP input, Verify
- [ ] Abhi API mock (asli API DPDP-402 mein)

**AC:**
- Under-18 select karne par seedha Accept all na ho sake
- Verify ke baad preferences khule jisme non-essential lock

---

### DPDP-211 · i18n (en + hi)
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-207

**Tasks:**
- [ ] `packages/i18n`: UI strings (buttons, labels) `en.json`, `hi.json`
- [ ] Notice texts config se (customer ke), UI strings package se
- [ ] Language switch se poora UI re-render, choice storage mein
- [ ] Devanagari font fallback stack

**AC:**
- Hindi mein koi English UI string na bache (purposes ke alawa jo customer ne na diye hon)

---

### DPDP-212 · Accessibility
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-209

**Tasks:**
- [ ] Focus trap modal mein, `aria-modal`, `role="dialog"`, labels
- [ ] Poora flow sirf keyboard se
- [ ] Contrast check, `prefers-reduced-motion`
- [ ] axe-core Playwright test

**AC:**
- axe: 0 serious / critical issues
- NVDA / VoiceOver se banner padha ja sake (manual check)

---

### DPDP-213 · `dpdp.js` browser bundle + CDN
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-212

**Tasks:**
- [ ] `packages/browser`: core + ui ek IIFE file, total < 25 KB gzip
- [ ] Versioned output: `v1/dpdp.js`, `v1.0.0/dpdp.js`
- [ ] Staging S3 bucket + CloudFront par upload script
- [ ] SRI hash generate (docs ke liye)

**AC:**
- Staging CDN URL se demo site par banner chale

---

### DPDP-214 · Demo site
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** DPDP-213

**Tasks:**
- [ ] `apps/demo-site`: simple HTML site (prototype jaisi), GA + Meta Pixel + fake reco script tagged
- [ ] Ek page jahan SDK events console aur screen par log hon (debugging ke liye)

**AC:**
- `pnpm --filter demo-site dev` se chale, saare flows try ho sakein

---

### DPDP-215 · SDK tests (unit + E2E)
**Type:** Task · **Estimate:** 1.5 din · **Depends on:** DPDP-214

**Tasks:**
- [ ] Unit: core > 90% coverage
- [ ] Playwright (Chromium, Firefox, WebKit): accept, reject, custom, withdraw, reload persistence, notice version change, under-18, offline queue
- [ ] Mobile viewport tests
- [ ] CI mein API + demo site start karke E2E

**AC:**
- 3 browsers mein saare E2E green
- CI mein E2E 10 minute ke andar

---

## E3 · Admin panel (19 din)

> Design reference: [prototype/admin-panel.html](../prototype/admin-panel.html)

### DPDP-301 · Admin project setup
**Type:** Chore · **Estimate:** 0.5 din · **Depends on:** DPDP-001

**Tasks:**
- [ ] `apps/admin`: Vite + React 18 + TypeScript
- [ ] Tailwind + shadcn/ui init, theme tokens (prototype ke colors), dark mode
- [ ] React Router (routes section 10.1), TanStack Query provider
- [ ] `lib/apiClient.ts`: `fetch` wrapper (`credentials: 'include'`, CSRF header, error ko `AppError` mein)
- [ ] Global error boundary, 404 page
- [ ] Vite proxy `/v1` → API (dev mein CORS ki dikkat nahi)

**AC:**
- `pnpm --filter admin dev` se khaali shell chale, API se `/health` call ho

---

### DPDP-302 · Auth pages
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-301, DPDP-107

**Tasks:**
- [ ] Pages: Login, Login OTP, Signup, Verify email, Forgot password, Reset password, Accept invite
- [ ] `OtpInput` component (6 boxes, paste support)
- [ ] React Hook Form + Zod (`@dpdp/shared` schemas)
- [ ] `useAuth()` hook (`/me`), `RequireAuth` route guard, logout
- [ ] Session expire (401) par login page + redirect back

**AC:**
- Poora flow: signup → OTP → login → OTP → dashboard
- Galat password par saaf error, field ke neeche

---

### DPDP-303 · Onboarding wizard
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-302, DPDP-306

**Description:**
Naya customer pehli baar login kare to 3 step mein uski site live ho jaaye.

**Tasks:**
- [ ] Step 1: Website add (naam, URL, platform)
- [ ] Step 2: Purposes chunna (suggested list: analytics, marketing, personalisation) + English text
- [ ] Step 3: Install code + "Check installation" button
- [ ] Skip option, baad mein dashboard par "Setup pending" card

**AC:**
- Naya user 15 minute ke andar demo site par banner live kar sake (khud time karke check)

---

### DPDP-304 · App shell aur navigation
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-302

**Tasks:**
- [ ] Sidebar (groups: Overview, Setup, Plugin, Records, Developer), mobile drawer
- [ ] Top bar: site switcher (URL mein `siteId`), user menu
- [ ] Role ke hisaab se menu items (`permissions.ts`)
- [ ] Rights Requests par "New" badge count

**AC:**
- `viewer` ko Settings / Install ke edit buttons na dikhein
- Site badalne par current page usi site ka data dikhaye

---

### DPDP-305 · Shared UI components
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-301

**Tasks:**
- [ ] `DataTable` (TanStack Table): sorting, cursor pagination ("Load more" / next-prev), row click, empty state
- [ ] `StatusPill`, `EmptyState`, `ConfirmDialog` (type karke confirm, delete ke liye), `CodeBlock` (copy button), `PageHeader`, `StatCard`, `Drawer`
- [ ] Toasts (sonner)
- [ ] Date format helper (IST, `en-IN`)

**AC:**
- Har component ka ek test ya story

---

### DPDP-306 · Websites & Apps page
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-305, DPDP-109

**Tasks:**
- [ ] List table: naam, URL, platform, site ID (copy), consents, status, created
- [ ] Add / edit dialog (allowed origins multi-input)
- [ ] Archive with confirm

**AC:**
- Add karte hi switcher mein nayi site dikhe

---

### DPDP-307 · Install Plugin page
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-306, DPDP-110

**Tasks:**
- [ ] Platform tabs (HTML, React, WordPress, Android, iOS), code mein siteId bhara hua
- [ ] "Check installation": API `GET /v1/admin/sites/:id/install-status` (pichhle 24 ghante mein `/config` call aaya ya nahi, backend mein chhota counter)
- [ ] API keys card: public key dikhana, secret key generate (ek baar dikhegi), rotate, revoke

**AC:**
- Secret key dialog band hone ke baad dobara na dikhe
- Demo site par script lagane ke baad status "Installed" ho

---

### DPDP-308 · Purposes page
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-305, DPDP-111

**Tasks:**
- [ ] Table: naam, description, retention, scripts, active toggle, required badge
- [ ] Add / edit dialog: key (auto slug), retention (days / months picker), linked scripts (tags input)
- [ ] Drag se order badalna (`sortOrder`)
- [ ] "Notice update pending" banner jab `noticeDirty` true ho

**AC:**
- Essential purpose ka delete button disabled + tooltip

---

### DPDP-309 · Notice versions aur languages
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-308, DPDP-112

**Tasks:**
- [ ] Version list: version, status, published date, kitne consents is version par
- [ ] Draft editor: language tabs, title, body, har purpose ka naam aur description, character count
- [ ] Missing translations ka indicator
- [ ] Publish confirm dialog: "Purane users ko dobara banner dikhega"
- [ ] Archived version read-only view

**AC:**
- English adhoori ho to Publish button disabled + reason

---

### DPDP-310 · Banner Designer + live preview
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-309, DPDP-209

**Description:**
Settings form + live preview. Preview mein **asli `@dpdp/ui` components** chalenge (mock data ke saath), taaki jo admin dekhe wahi user ko dikhe.

**Tasks:**
- [ ] `@dpdp/ui` ko admin mein import, preview mode (API calls band, mock core)
- [ ] Form: position, brand color (picker + presets), logo upload (S3 presigned URL), age gate toggle
- [ ] Preview frame: desktop / mobile toggle, language toggle
- [ ] Unsaved changes warning
- [ ] Save → `PUT /banner`

**AC:**
- Color badalte hi preview bina reload ke badle
- Save ke 5 min ke andar demo site par naya color (CDN cache)

---

### DPDP-311 · Plugin UI preview page
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-310

**Tasks:**
- [ ] 7 steps (prototype jaisa): banner, under 18, preferences, after consent, receipt, rights form, request sent
- [ ] Desktop / mobile, language switch
- [ ] Right side notes (DPDP rule + component name)

**AC:**
- Har step asli components se render ho (static image nahi)

---

### DPDP-312 · Consent Logs page
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-305, DPDP-116

**Tasks:**
- [ ] Backend: `GET /v1/admin/sites/:id/consents?action=&platform=&from=&to=&q=&cursor=` (cursor `{createdAt,_id}`)
- [ ] Filters URL query mein (share ho sake)
- [ ] Table: time, receipt, principal, action pill, purpose chips, platform, age, notice
- [ ] Row click → receipt dialog (hash, prevHash, masked IP hash)

**AC:**
- 1 lakh events par bhi page < 500 ms (index use ho, `explain()` check)

---

### DPDP-313 · Consent CSV export
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-312, DPDP-118

**Tasks:**
- [ ] `POST /v1/admin/sites/:id/consents/export` (filters ke saath) → BullMQ job
- [ ] Worker: Mongo cursor se stream → CSV → S3 (private) → 24 ghante ka signed URL email mein
- [ ] UI: "Export shuru, email aayega" toast + exports list

**AC:**
- 1 lakh rows ka export memory bina badhaye ho (stream)
- Link 24 ghante baad kaam na kare

---

### DPDP-314 · Dashboard (stats API + UI)
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-312

**Tasks:**
- [ ] Backend: `GET /v1/admin/sites/:id/stats?range=7d|30d` aggregation: total, by day + action, purpose-wise acceptance %, withdrawals, pending rights requests + nearest due
- [ ] Bade data ke liye: hourly job jo `dailyStats` collection bharta hai
- [ ] UI: 4 StatCards, consent bar chart (Recharts), purpose meters, recent activity, alerts card
- [ ] Skeleton loading

**AC:**
- Seed data ke saath numbers Consent Logs se match karein (manual cross-check)

---

### DPDP-315 · Organisation settings
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-305, DPDP-108

**Tasks:**
- [ ] Form: company naam, address, grievance officer (naam, email, phone), DPO email
- [ ] Ye details public config mein jaati hain, iska note form par

**AC:**
- Save ke baad banner mein naya grievance email

---

### DPDP-316 · Team members aur invites
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-315

**Tasks:**
- [ ] Members table, role change dropdown, remove
- [ ] Invite dialog, pending invites list, resend / cancel

**AC:**
- Khud ko remove na kar sake, aakhri admin ka role na badle

---

### DPDP-317 · Webhooks settings UI
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-305, DPDP-118

**Tasks:**
- [ ] Endpoints list, add (URL + events checkboxes), delete, "Send test event"
- [ ] Signing secret dikhana (reveal button) + signature verify ka code sample
- [ ] Recent deliveries (status code, attempt)

**AC:**
- Test event ka result (status code) UI mein dikhe

---

### DPDP-318 · Audit log
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-305

**Tasks:**
- [ ] Backend middleware `audit(action, entity)`: admin ke har create/update/delete par before/after diff `auditLogs` mein
- [ ] `GET /v1/admin/audit-logs?cursor=`
- [ ] UI table: kisne, kya, kab, diff dialog

**AC:**
- Purpose edit karne par audit log mein entry with diff

---

### DPDP-319 · Responsive, states aur component tests
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-318

**Tasks:**
- [ ] Har page: loading skeleton, empty state, error state (retry)
- [ ] 375px width par har page check
- [ ] Testing Library tests: auth forms, purpose dialog, filters
- [ ] Playwright admin E2E: login → site add → purpose → publish → banner color

**AC:**
- Admin E2E CI mein green

---

## E4 · DPDP features (9 din)

### DPDP-401 · OTP service + SMS provider (DLT)
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-005, DPDP-105

**Tasks:**
- [ ] `lib/sms.ts`: provider adapter (MSG91), DLT template ID, dev mein console log
- [ ] `otp.ts` ko generic banana: channel email / sms, purpose (`login`, `parental`, `rights`)
- [ ] Rate limits: per phone 3 / 15 min, per IP 10 / ghanta

**AC:**
- Staging par asli phone par OTP aaye
- Limit cross par 429

---

### DPDP-402 · Parental consent flow
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-401, DPDP-210

**Tasks:**
- [ ] `POST /v1/parental-consent/otp` { principalId, guardianPhone }
- [ ] `POST /v1/parental-consent/verify` { principalId, code } → `parentalVerifications` (phone hash) → `parentVerificationId`
- [ ] SDK: mock hatakar asli API, error states (galat OTP, expired, limit)
- [ ] Consent API under-18 rules (DPDP-115) ke saath end-to-end test

**AC:**
- Under-18 consent bina verification ke 422
- Ledger entry mein `ageGroup: under18` + `parentVerificationId`

---

### DPDP-403 · Rights request public API
**Type:** Story · **Estimate:** 1 din · **Depends on:** DPDP-401

**Tasks:**
- [ ] `POST /v1/rights-requests/verify-email` { email } → OTP
- [ ] `POST /v1/rights-requests` { type, email, code, details, principalId? } → `REQ-XXXXXX`, `dueAt` (config: default 90 din), email encrypt
- [ ] Requester ko acknowledgement email, org ke DPO ko notification email
- [ ] Webhook `rights.requested`

**AC:**
- Bina email OTP ke request na bane
- `dueAt` sahi calculate (test)

---

### DPDP-404 · `<dpdp-rights-form>` component
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-403, DPDP-211

**Tasks:**
- [ ] Form: type select, email, OTP step, details, grievance officer info
- [ ] Success state: request ID, due date, Board ka note
- [ ] Footer link ke liye `DPDP.openRightsForm()`

**AC:**
- Prototype ke steps 6 aur 7 jaisa flow, en + hi

---

### DPDP-405 · Rights Requests admin page
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-403, DPDP-305

**Tasks:**
- [ ] Backend: list (status filter, cursor), detail, `PATCH` status (`in_progress`, `resolved`, `rejected` + reason), `POST reply` (email + `events[]` mein `$push`)
- [ ] UI: status tabs with counts, table (deadline paas ho to warning color), drawer: user info, message, timeline, reply box, actions
- [ ] Erasure type par checklist note ("legal retention check kiya?")

**AC:**
- Resolve karne par user ko email + timeline mein entry
- Reject bina reason ke na ho

---

### DPDP-406 · Due date reminders job
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-405

**Tasks:**
- [ ] BullMQ repeatable job (roz subah 9 IST): 7 din aur 1 din baad due requests → DPO / admins ko email
- [ ] Overdue par dashboard alert

**AC:**
- Test mein fake clock se sahi din par email

---

### DPDP-407 · Breach register
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-305

**Tasks:**
- [ ] Backend: `GET/POST /v1/admin/breaches`, `PATCH` (board reported date, status)
- [ ] `POST /v1/admin/breaches/:id/notify-users`: template se email affected users ko (customer CSV upload kare ya webhook se apne system se bheje)
- [ ] Board report ka draft text generate (copy karne ke liye)
- [ ] UI: list, add form, detail with checklist (Board ko report, users ko notice) aur time since discovery

**AC:**
- Breach create karte hi DPO / admins ko email alert

---

### DPDP-408 · Retention jobs
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-118

**Tasks:**
- [ ] Roz ka job: har purpose ki retention ke hisaab se principals jinka consent purana ho gaya → webhook `retention.expired` { principalIds, purpose }
- [ ] Admin dashboard par "Retention due" card
- [ ] Humare apne data ki cleanup: masked emails (closed rights requests 1 saal baad), old deliveries (TTL)

**AC:**
- Fake clock test: 13 mahine purane analytics consent par webhook

---

### DPDP-409 · Re-consent on notice change
**Type:** Story · **Estimate:** 0.5 din · **Depends on:** DPDP-204, DPDP-309

**Tasks:**
- [ ] SDK: stored `noticeVersion` != live version → banner dobara, "Hamari notice badli hai" text
- [ ] Naya consent aane tak purana consent hi valid
- [ ] Admin: version list mein "is version par kitne users" count

**AC:**
- Naya version publish karke demo site reload → updated banner

---

### DPDP-410 · Email templates (en + hi)
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-403

**Tasks:**
- [ ] `react-email` ya MJML se templates: OTP, invite, consent receipt, rights acknowledged, rights resolved / rejected, breach notice, due reminder, webhook disabled
- [ ] Har template en + hi, plain-text version bhi

**AC:**
- Gmail aur Outlook mein sahi dikhe (Mailpit + ek asli inbox test)

---

## E5 · Hardening + launch (12 din)

### DPDP-501 · Security review aur fixes
**Type:** Task · **Estimate:** 1.5 din · **Depends on:** E1–E4

**Tasks:**
- [ ] OWASP Top 10 checklist har module par (`docs/security-review.md`)
- [ ] `pnpm audit`, Dependabot on
- [ ] Secrets scan (gitleaks) CI mein
- [ ] OWASP ZAP baseline scan staging par
- [ ] Mila hua har issue ka ticket aur fix

**AC:**
- Koi high / critical issue open nahi

---

### DPDP-502 · Load test aur performance
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-504

**Tasks:**
- [ ] k6 scripts: `/config` (cached) aur `/consent`
- [ ] Target: `/consent` 200 req/s, p95 < 300 ms. `/config` CDN se
- [ ] Mongo slow query log check, missing indexes

**AC:**
- Results `docs/perf.md` mein, targets pure

---

### DPDP-503 · Nightly chain verify + S3 anchor
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-117

**Tasks:**
- [ ] Roz raat job: har active site ka `verifyChain` (incremental: pichhle anchor se aage)
- [ ] Har site ka last `{seq, hash}` S3 bucket (Object Lock, compliance mode) mein
- [ ] Mismatch par alert (email + Sentry)

**AC:**
- Jaan-boojhkar ek event badlo staging par → subah alert

---

### DPDP-504 · Production infrastructure
**Type:** Task · **Estimate:** 1.5 din · **Depends on:** E1

**Tasks:**
- [ ] MongoDB Atlas M10, ap-south-1, custom DB role (consentEvents par sirf find + insert), IP access list / VPC peering
- [ ] Redis (ElastiCache ya managed)
- [ ] API + worker: Docker images, ECS Fargate ya EC2 + Docker Compose
- [ ] Admin: S3 + CloudFront (static), SDK: alag CloudFront distribution
- [ ] Domains: `api.`, `app.`, `cdn.`, `docs.` + SSL (ACM)
- [ ] Secrets: SSM Parameter Store
- [ ] Staging bhi isi tarah (chhoti machines)

**AC:**
- Prod par `/health` green, admin login, demo site par CDN se banner

---

### DPDP-505 · Deploy pipelines aur SDK release
**Type:** Task · **Estimate:** 1 din · **Depends on:** DPDP-504

**Tasks:**
- [ ] GitHub Actions: `main` → staging auto deploy, tag `v*` → prod (manual approval)
- [ ] Migrations deploy se pehle (`migrate:up`)
- [ ] SDK release: changesets, CDN par `v1/` (latest 1.x) + exact version, npm publish
- [ ] Rollback steps `docs/runbooks/rollback.md`

**AC:**
- Ek tag push se prod deploy, aur pichhle version par rollback test kiya

---

### DPDP-506 · Monitoring aur alerts
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-504

**Tasks:**
- [ ] Sentry: api, worker, admin, SDK (sampling, PII scrubbing)
- [ ] Uptime checks: `/health`, `/v1/config/<demo>`, admin, CDN file
- [ ] Alerts: 5xx rate, queue backlog, webhook failure rate, chain mismatch
- [ ] Status page

**AC:**
- Test alert email / phone par aaye

---

### DPDP-507 · Backup restore drill
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** DPDP-504

**Tasks:**
- [ ] Atlas snapshot se naye cluster par restore, chain verify chalao
- [ ] Steps `docs/runbooks/restore.md` mein

**AC:**
- Restore ke baad chain valid aur data count match

---

### DPDP-508 · Docs site
**Type:** Task · **Estimate:** 2 din · **Depends on:** DPDP-505

**Tasks:**
- [ ] Docusaurus / Starlight setup, `docs.` domain
- [ ] Pages: Quick start (5 min), Script blocking guide, JS API reference, REST API (OpenAPI se), Webhooks (signature verify samples: Node, PHP, Python), Under-18 flow, Rights requests, FAQ, DPDP explainer for developers
- [ ] Har code sample copy-paste karke chalta ho

**AC:**
- Ek naya developer (dost / colleague) sirf docs padhkar 15 minute mein integrate kare

---

### DPDP-509 · Legal pages aur lawyer review fixes
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** —

**Tasks:**
- [ ] Terms, Privacy Policy, DPA pages (lawyer ka text)
- [ ] Banner ka default text aur admin ke helper texts lawyer ke feedback ke hisaab se
- [ ] Signup par Terms + DPA accept (version ke saath save)

**AC:**
- Lawyer ke saare comments resolved

---

### DPDP-510 · Beta rollout aur bug fixing
**Type:** Task · **Estimate:** 2.5 din · **Depends on:** DPDP-508

**Tasks:**
- [ ] Anvi Real Estate + 2–3 aur sites par integration (khud baithkar)
- [ ] Feedback form, har issue ka ticket
- [ ] Bugs fix, rozana staging deploy

**AC:**
- 3 sites prod par live, koi P1 bug open nahi

---

### DPDP-511 · Landing page
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** —

**Tasks:**
- [ ] Product page: kya hai, kaise kaam karta hai, demo video / GIF, docs link, contact / signup
- [ ] SEO basics, apne hi plugin se apni site par consent

**AC:**
- Landing page par humara khud ka banner chal raha ho

---

### DPDP-512 · MVP launch
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** sab

**Tasks:**
- [ ] [PROJECT_PLAN launch checklist](PROJECT_PLAN.md#18-launch-checklist) poori
- [ ] Tag `v1.0.0`, signup public
- [ ] Announcement

**AC:**
- Checklist ke saare items ✓

---

## E6 · Wrappers + bhashayein (7 din)

### DPDP-601 · `@dpdp/react` package
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** MVP
**Description:** React aur Next.js developers ke liye aasaan integration.
**Tasks:** `DPDPProvider`, `useConsent()`, `<ConsentGate purpose="analytics">`, Next.js App Router example (SSR mein `window` safe), npm publish, docs page.
**AC:** Next.js 14 example app mein SSR error ke bina kaam kare.

### DPDP-602 · WordPress plugin
**Type:** Story · **Estimate:** 3 din · **Depends on:** MVP
**Tasks:** PHP plugin (settings page: siteId), `wp_head` mein script, popular plugins (Site Kit, Pixel) ki scripts auto-tag karne ka option, WordPress coding standards, WordPress.org submission.
**AC:** Fresh WordPress par install → siteId daalo → banner live. WordPress.org review submit.

### DPDP-603 · 20 aur bhashayein
**Type:** Task · **Estimate:** 2 din · **Depends on:** MVP
**Tasks:** UI strings translator ko bhejna, `i18n` files merge, Noto fonts fallback, har language ka screenshot check, admin draft editor mein saari languages.
**AC:** 22 languages mein banner bina text overflow ke.

### DPDP-604 · Vue / Angular examples
**Type:** Task · **Estimate:** 0.5 din · **Depends on:** MVP
**Tasks:** Vue 3 aur Angular sample apps jisme seedha `dpdp.js` + `DPDP.on('change')`, docs pages.
**AC:** Dono samples repo mein aur docs mein link.

## E7 · Mobile SDKs (13 din)

### DPDP-701 · Mobile web bundle + native bridge
**Type:** Spike + Task · **Estimate:** 1.5 din · **Depends on:** MVP
**Description:** Mobile par UI dobara nahi banana. `@dpdp/ui` WebView mein chalega, native code ke saath ek bridge se baat karega.
**Tasks:** `mobile.html` bundle (offline, app ke andar packaged), bridge protocol (`postMessage` JSON: `ready`, `consentSaved`, `close`), storage native side par, spec `docs/mobile-bridge.md`.
**AC:** Bridge spec final, ek test HTML jo dono taraf messages bheje.

### DPDP-702 · Android SDK
**Type:** Story · **Estimate:** 3.5 din · **Depends on:** DPDP-701
**Tasks:** Kotlin library, `DPDP.init(context, siteId)`, `showBannerIfNeeded(activity)` (bottom sheet + WebView), `hasConsent()`, `onChange {}`, SharedPreferences, offline queue (WorkManager), sample app, Maven Central / JitPack publish.
**AC:** Sample app par banner, consent ledger mein `platform: android`.

### DPDP-703 · iOS SDK
**Type:** Story · **Estimate:** 3.5 din · **Depends on:** DPDP-701
**Tasks:** Swift package, WKWebView sheet, UserDefaults, same API as Android, sample app, Swift Package Manager release.
**AC:** iOS sample app par poora flow, `platform: ios`.

### DPDP-704 · Flutter plugin
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-702, DPDP-703
**Tasks:** Dart API jo native SDKs ko call kare (method channels), example app, pub.dev publish.
**AC:** Android + iOS dono par Flutter example chale.

### DPDP-705 · React Native package
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-702, DPDP-703
**Tasks:** Native module wrapper, TypeScript types, Expo config plugin, example app, npm publish.
**AC:** RN example dono platforms par chale.

### DPDP-706 · Sample apps, docs, publishing
**Type:** Task · **Estimate:** 1.5 din · **Depends on:** DPDP-705
**Tasks:** Mobile docs pages, Install page mein mobile tabs update, app store privacy label guidance.
**AC:** Docs se mobile integration 30 minute mein.

## E8 · Business + advanced (10 din)

### DPDP-801 · Billing aur plans (Razorpay)
**Type:** Story · **Estimate:** 3.5 din · **Depends on:** MVP
**Tasks:** Plans (limits: sites, monthly consents, team members), Razorpay subscriptions + webhooks, usage counter (monthly consents per org), limit cross par soft warning (consent kabhi block nahi), Billing page, invoices (GST details).
**AC:** Test mode mein subscribe → plan active → cancel flow.

### DPDP-802 · Script / cookie scanner v1
**Type:** Story · **Estimate:** 3 din · **Depends on:** MVP
**Tasks:** Worker mein Playwright se customer ki site crawl (5–10 pages), third-party scripts aur cookies list, known trackers DB (GA, Meta, Hotjar...) se purpose suggest, admin mein report + "Purpose se link karo".
**AC:** Demo site scan mein GA aur Meta Pixel sahi purpose ke saath detect.

### DPDP-803 · Google SSO
**Type:** Story · **Estimate:** 1 din · **Depends on:** MVP
**Tasks:** Google OAuth (Workspace domain restrict option), existing account link.
**AC:** Google se login, org membership same.

### DPDP-804 · Onboarding polish
**Type:** Story · **Estimate:** 1 din · **Depends on:** MVP
**Tasks:** In-app checklist (site add, purposes, publish, install, webhook), empty states mein guides, welcome email sequence.
**AC:** Checklist 100% hone par celebrate state.

### DPDP-805 · Banner text A/B testing
**Type:** Story · **Estimate:** 1.5 din · **Depends on:** DPDP-314
**Tasks:** Do notice text variants, SDK random assign (stored), stats variant-wise. **Rule:** Accept / Reject ka design kabhi variant mein nahi badlega (no dark patterns).
**AC:** Dashboard par variant-wise acceptance rate.

## Day-wise schedule

Har ticket ka working day number aur week. Day 1 = project ka pehla working day. 1 week = 5 working days.

**E0 · Setup**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-001 | Monorepo aur tooling setup | 0.5 | 1 | Week 1 |
| DPDP-002 | Local Docker environment | 0.5 | 1 | Week 1 |
| DPDP-003 | CI pipeline (GitHub Actions) | 0.5 | 2 | Week 1 |
| DPDP-004 | Shared package (`@dpdp/shared`) | 0.5 | 2 | Week 1 |
| DPDP-005 | DPDP notes, ADRs, DLT registration | 0.5 | 3 | Week 1 |
| DPDP-006 | Coding conventions aur board setup | 0.5 | 3 | Week 1 |

**E1 · Backend core**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-101 | Express app skeleton | 0.5 | 4 | Week 1 |
| DPDP-102 | MongoDB connection aur base plugins | 1 | 4–5 | Week 1 |
| DPDP-103 | Mongoose models, validators, indexes | 1.5 | 5–6 | Week 1 – 2 |
| DPDP-104 | Seed script | 0.5 | 7 | Week 2 |
| DPDP-105 | Signup aur email verification | 1 | 7–8 | Week 2 |
| DPDP-106 | Login, 2FA OTP, sessions | 1 | 8–9 | Week 2 |
| DPDP-107 | Forgot / reset password | 0.5 | 9 | Week 2 |
| DPDP-108 | Organisations, members, roles | 1 | 10 | Week 2 |
| DPDP-109 | Sites CRUD | 0.5 | 11 | Week 3 |
| DPDP-110 | API keys aur site key middleware | 1 | 11–12 | Week 3 |
| DPDP-111 | Purposes CRUD | 0.5 | 12 | Week 3 |
| DPDP-112 | Notice versions aur translations | 1 | 13 | Week 3 |
| DPDP-113 | Banner config API | 0.5 | 14 | Week 3 |
| DPDP-114 | Public config endpoint | 0.5 | 14 | Week 3 |
| DPDP-115 | Consent API + hash chain ledger | 1.5 | 15–16 | Week 3 – 4 |
| DPDP-116 | Withdraw, state, receipt endpoints | 0.5 | 16 | Week 4 |
| DPDP-117 | Concurrency tests aur chain verifier | 0.5 | 17 | Week 4 |
| DPDP-118 | Webhooks + BullMQ worker | 1.5 | 17–18 | Week 4 |
| DPDP-119 | Rate limit aur security middlewares | 0.5 | 19 | Week 4 |
| DPDP-120 | OpenAPI spec + Postman collection | 1 | 19–20 | Week 4 |
| DPDP-121 | Cross-tenant security tests | 0.5 | 20 | Week 4 |

**E2 · Web SDK**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-201 | SDK core package setup aur build | 0.5 | 21 | Week 5 |
| DPDP-202 | Config loader, storage, principal ID | 1 | 21–22 | Week 5 |
| DPDP-203 | SDK API client | 0.5 | 22 | Week 5 |
| DPDP-204 | Consent state, public DPDP API, events | 1 | 23 | Week 5 |
| DPDP-205 | Script aur iframe blocking | 1.5 | 24–25 | Week 5 |
| DPDP-206 | UI package setup (Lit + Shadow DOM) | 0.5 | 25 | Week 5 |
| DPDP-207 | `<dpdp-banner>` component | 1 | 26 | Week 6 |
| DPDP-208 | `<dpdp-preferences>` component | 1 | 27 | Week 6 |
| DPDP-209 | `<dpdp-fab>`, toast, `<dpdp-receipt>` | 1 | 28 | Week 6 |
| DPDP-210 | Age gate aur `<dpdp-parent-consent>` UI | 1 | 29 | Week 6 |
| DPDP-211 | i18n (en + hi) | 1 | 30 | Week 6 |
| DPDP-212 | Accessibility | 1 | 31 | Week 7 |
| DPDP-213 | `dpdp.js` browser bundle + CDN | 1 | 32 | Week 7 |
| DPDP-214 | Demo site | 0.5 | 33 | Week 7 |
| DPDP-215 | SDK tests (unit + E2E) | 1.5 | 33–34 | Week 7 |

**E3 · Admin panel**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-301 | Admin project setup | 0.5 | 35 | Week 7 |
| DPDP-302 | Auth pages | 1.5 | 35–36 | Week 7 – 8 |
| DPDP-303 | Onboarding wizard | 0.5 | 37 | Week 8 |
| DPDP-304 | App shell aur navigation | 1 | 37–38 | Week 8 |
| DPDP-305 | Shared UI components | 1 | 38–39 | Week 8 |
| DPDP-306 | Websites & Apps page | 1 | 39–40 | Week 8 |
| DPDP-307 | Install Plugin page | 1 | 40–41 | Week 8 – 9 |
| DPDP-308 | Purposes page | 1 | 41–42 | Week 9 |
| DPDP-309 | Notice versions aur languages | 1.5 | 42–43 | Week 9 |
| DPDP-310 | Banner Designer + live preview | 1.5 | 44–45 | Week 9 |
| DPDP-311 | Plugin UI preview page | 1 | 45–46 | Week 9 – 10 |
| DPDP-312 | Consent Logs page | 1 | 46–47 | Week 10 |
| DPDP-313 | Consent CSV export | 1 | 47–48 | Week 10 |
| DPDP-314 | Dashboard (stats API + UI) | 1.5 | 48–49 | Week 10 |
| DPDP-315 | Organisation settings | 0.5 | 50 | Week 10 |
| DPDP-316 | Team members aur invites | 1 | 50–51 | Week 10 – 11 |
| DPDP-317 | Webhooks settings UI | 0.5 | 51 | Week 11 |
| DPDP-318 | Audit log | 1 | 52 | Week 11 |
| DPDP-319 | Responsive, states aur component tests | 1 | 53 | Week 11 |

**E4 · DPDP features**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-401 | OTP service + SMS provider (DLT) | 0.5 | 54 | Week 11 |
| DPDP-402 | Parental consent flow | 1 | 54–55 | Week 11 |
| DPDP-403 | Rights request public API | 1 | 55–56 | Week 11 – 12 |
| DPDP-404 | `<dpdp-rights-form>` component | 0.5 | 56 | Week 12 |
| DPDP-405 | Rights Requests admin page | 1.5 | 57–58 | Week 12 |
| DPDP-406 | Due date reminders job | 0.5 | 58 | Week 12 |
| DPDP-407 | Breach register | 1.5 | 59–60 | Week 12 |
| DPDP-408 | Retention jobs | 1 | 60–61 | Week 12 – 13 |
| DPDP-409 | Re-consent on notice change | 0.5 | 61 | Week 13 |
| DPDP-410 | Email templates (en + hi) | 1 | 62 | Week 13 |

**E5 · Hardening + launch**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-501 | Security review aur fixes | 1.5 | 63–64 | Week 13 |
| DPDP-502 | Load test aur performance | 0.5 | 64 | Week 13 |
| DPDP-503 | Nightly chain verify + S3 anchor | 0.5 | 65 | Week 13 |
| DPDP-504 | Production infrastructure | 1.5 | 65–66 | Week 13 – 14 |
| DPDP-505 | Deploy pipelines aur SDK release | 1 | 67 | Week 14 |
| DPDP-506 | Monitoring aur alerts | 0.5 | 68 | Week 14 |
| DPDP-507 | Backup restore drill | 0.5 | 68 | Week 14 |
| DPDP-508 | Docs site | 2 | 69–70 | Week 14 |
| DPDP-509 | Legal pages aur lawyer review fixes | 0.5 | 71 | Week 15 |
| DPDP-510 | Beta rollout aur bug fixing | 2.5 | 71–73 | Week 15 |
| DPDP-511 | Landing page | 0.5 | 74 | Week 15 |
| DPDP-512 | MVP launch | 0.5 | 74 | Week 15 |

**E6 · Wrappers + bhashayein**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-601 | `@dpdp/react` package | 1.5 | 75–76 | Week 15 – 16 |
| DPDP-602 | WordPress plugin | 3 | 76–79 | Week 16 |
| DPDP-603 | 20 aur bhashayein | 2 | 79–81 | Week 16 – 17 |
| DPDP-604 | Vue / Angular examples | 0.5 | 81 | Week 17 |

**E7 · Mobile SDKs**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-701 | Mobile web bundle + native bridge | 1.5 | 82–83 | Week 17 |
| DPDP-702 | Android SDK | 3.5 | 83–86 | Week 17 – 18 |
| DPDP-703 | iOS SDK | 3.5 | 87–90 | Week 18 |
| DPDP-704 | Flutter plugin | 1.5 | 90–91 | Week 18 – 19 |
| DPDP-705 | React Native package | 1.5 | 92–93 | Week 19 |
| DPDP-706 | Sample apps, docs, publishing | 1.5 | 93–94 | Week 19 |

**E8 · Business + advanced**

| Ticket | Kaam | Din | Day # | Week |
|---|---|---|---|---|
| DPDP-801 | Billing aur plans (Razorpay) | 3.5 | 95–98 | Week 19 – 20 |
| DPDP-802 | Script / cookie scanner v1 | 3 | 98–101 | Week 20 – 21 |
| DPDP-803 | Google SSO | 1 | 101–102 | Week 21 |
| DPDP-804 | Onboarding polish | 1 | 102–103 | Week 21 |
| DPDP-805 | Banner text A/B testing | 1.5 | 103–104 | Week 21 |

---

## Pilot (Week 8)

Ek pilot customer (jaise Anvi Real Estate) par core consent flow MVP se pehle live karna hai. Order:

1. **E0 + E1 + E2** poore (Week 7 tak): API + SDK ready
2. Admin ki jagah **seed script / Postman** se purposes aur notice set karo
3. E5 ke sirf **DPDP-504, 505, 506** (production infra, deploy, monitoring) pehle kar lo
4. **Week 8:** pilot site par consent banner, withdraw aur ledger live
5. Phir E3, E4 aur baaki E5 normal order mein

Admin panel aur rights requests pilot customer ko Phase 3 aur 4 ke baad milenge.

---

## Dependencies ka map (short)

```
E0 ─► E1 (backend) ─┬─► E2 (SDK) ─┬─► E3 (admin) ─► E4 (DPDP) ─► E5 (launch)
                    │             │
                    └─────────────┴─► DPDP-310 Banner Designer ko SDK UI chahiye
E5 ─► E6 (wrappers) ─► E7 (mobile) ─► E8 (business)
```

- Admin (E3) ke kuch pages (DPDP-301 se 305) E2 ke saath parallel shuru ho sakte hain agar SDK mein atak jao.
- DPDP-005 (DLT registration) ka wait E4 tak hai, isliye pehle hafte mein hi apply karna zaroori hai.
