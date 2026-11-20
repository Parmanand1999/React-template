# DPDP Consent Plugin: Project Overview and Timeline

**Team:** 1 full-stack developer · **Total:** 104 working days (~21 weeks)
**Stack:** Node.js + Express, MongoDB, React (admin panel), Web Components (plugin UI)

---

## 1. What we are building

India's **Digital Personal Data Protection (DPDP) Act, 2023** requires every website and app that collects personal data from Indian users to:

- tell users clearly what data is collected and why (a **notice**),
- take their **consent** separately for each purpose,
- let them **withdraw** consent as easily as they gave it,
- respect their **rights** to see, correct, or delete their data, raise a complaint, and name a nominee,
- get **verifiable parental consent** for users under 18 and avoid tracking or targeted ads for them,
- **report data breaches** to the Data Protection Board and to affected users.

Most obligations take effect around **May 2027**. Penalties go up to **₹250 crore** per violation.

We are building a **consent management plugin** that handles the technical side of these requirements. A business adds one line of code to its website or app, and the plugin takes care of the notice, consent, withdrawal, user rights, and record keeping.

> This is a technical product. It helps businesses comply but does not replace legal advice. Legal points in this plan will be reviewed by a lawyer before launch.

---

## 2. Who uses it

| Who | What they see | What they do |
|---|---|---|
| **Website visitor** (end user) | A consent banner and privacy controls on the website or app | Accept or reject purposes, change choices later, withdraw consent, submit data rights requests |
| **Business / site owner** (our customer) | An admin panel | Set up purposes and notice text, design the banner, view consent records, handle rights requests and breaches |
| **Customer's developer** | Install instructions and documentation | Add the script tag or SDK, mark tracking scripts, connect webhooks |

---

## 3. The three parts of the product

### 3.1 Plugin (Web SDK)
A small JavaScript file the customer adds to their website with a single `<script>` tag. It:
- shows the consent banner on the first visit, in the user's language,
- shows a preference center with a separate on/off switch for each purpose (nothing is pre-selected),
- **blocks tracking scripts** (Google Analytics, Meta Pixel, etc.) until the user agrees to that purpose,
- keeps a "Manage consent" button always visible so users can change or withdraw consent,
- asks the user's age and runs a parent OTP flow for users under 18,
- provides a form for data rights requests.

The same plugin will later be packaged for React, WordPress, and mobile apps (Android, iOS, Flutter, React Native).

### 3.2 Admin panel
A web dashboard for our customers. Main screens:
- **Dashboard:** consent numbers, acceptance rate, withdrawals, pending requests
- **Websites & Apps:** each website or app gets its own ID and settings
- **Purposes & Notice:** what data is used for, how long it is kept, notice text and versions, languages
- **Banner Designer:** brand colour, position, text, with a live preview
- **Consent Logs:** every consent record with its receipt, searchable and exportable
- **Rights Requests:** user requests with deadlines, status, and replies
- **Breach Reports:** record breaches and notify users
- **Install Plugin:** ready-to-copy code for each platform
- **Settings:** company details, Grievance Officer, team members and roles

### 3.3 Backend (API + database)
The server behind both the plugin and the admin panel. One backend serves every platform. It:
- stores configuration (purposes, notice text, banner design),
- keeps the **consent ledger**: an append-only record of every consent. Records are never edited or deleted, and each record is linked to the previous one with a hash, so any tampering can be detected. This is the business's proof of consent if the Data Protection Board asks,
- handles rights requests, parental verification, and breach records,
- sends events to the customer's own systems (webhooks), for example "this user withdrew marketing consent",
- keeps all data in India (Mumbai region).

---

## 4. How it works (user journey)

1. A visitor opens the customer's website. The plugin loads and fetches the site's settings.
2. The visitor has no saved consent, so the **banner** appears. All tracking scripts stay blocked.
3. The visitor confirms their age, then chooses **Accept all**, **Reject all**, or **Choose purposes**.
4. The choice is saved in the **consent ledger** and the visitor gets a **receipt**.
5. Scripts for the accepted purposes load. Rejected ones stay blocked.
6. Later, the visitor clicks **Manage consent** to change or withdraw their choice. The ledger records the change, scripts are stopped, and the customer's systems are notified.
7. The visitor can open **Your data rights** to request access, correction, deletion, raise a grievance, or name a nominee. The request appears in the admin panel with a deadline.
8. If the business changes its notice, returning visitors see the banner again and give fresh consent.

---

## 5. Timeline summary

1 week = 5 working days (Monday to Friday). A phase can start in the same week the previous phase ends.

| Phase | Work | Working days | Weeks |
|---|---|---|---|
| 0 | Project setup | 3 | Week 1 |
| 1 | Backend (API + database) | 17 | Week 1 – 4 |
| 2 | Plugin / Web SDK | 14 | Week 5 – 7 |
| 3 | Admin panel | 19 | Week 7 – 11 |
| 4 | Remaining DPDP features | 9 | Week 11 – 13 |
| 5 | Testing, production, launch | 12 | Week 13 – 15 |
| 6 | React, WordPress, 22 languages | 7 | Week 15 – 17 |
| 7 | Mobile SDKs | 13 | Week 17 – 19 |
| 8 | Billing and advanced features | 10 | Week 19 – 21 |
| | **Total** | **104** | **~21 weeks** |

- **Pilot (live on one customer site):** Week 8
- **MVP launch (Phases 0–5):** Week 15, 74 working days
- **Full product (Phases 0–8):** Week 21, 104 working days

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

---

## 6. Phases in detail

### Phase 0 · Project setup
**3 working days · Week 1**

Prepare the ground before building features: code repository structure, development tools, and automatic checks on every code change. Note down the DPDP Act and Rules requirements that affect development. Apply for **DLT registration** (required in India to send SMS OTPs) this week, because approval can take several weeks.

**Outcome:** The project runs on the developer's machine, and every code change is checked automatically.

---

### Phase 1 · Backend (API + database)
**17 working days · Week 1 – 4**

Build the server that everything else depends on:
- Sign up and login for customers, with email OTP
- Companies, team members, and roles (Admin, DPO, Developer, Viewer)
- Websites and apps, each with its own API keys
- Purposes and notice text, with version history
- **Consent ledger:** save each consent as a tamper-evident, append-only record
- Consent withdrawal and consent receipts
- Webhooks to notify the customer's systems
- Security: rate limits, and tests that make sure one customer can never see another customer's data

**Outcome:** Saving consent, withdrawing it, and reading the records all work through the API.

---

### Phase 2 · Plugin / Web SDK
**14 working days · Week 5 – 7**

Build the plugin that runs on the customer's website:
- Works on any website with one `<script>` tag
- Consent banner, preference center, and "Manage consent" button
- Tracking scripts stay blocked until consent is given
- Age question and the under-18 parent consent screen
- English and Hindi
- Works well on mobile screens, with keyboard, and with screen readers
- A demo website for testing

**Outcome:** The real banner runs on the demo website, and scripts load or stay blocked based on consent.

---

### Phase 3 · Admin panel
**19 working days · Week 7 – 11**

Build the customer dashboard, following the approved prototype:
- Login, sign up, and a first-time setup wizard
- Dashboard with consent numbers and charts
- Websites & Apps, and the Install page with code for each platform
- Purposes, notice versions, and languages
- Banner Designer with live preview, and a preview of every plugin screen
- Consent Logs with search, filters, receipts, and CSV export
- Settings: company details, Grievance Officer, team members, webhooks, audit log

**Outcome:** A new customer can sign up and put the banner live on their site without help.

---

### Phase 4 · Remaining DPDP features
**9 working days · Week 11 – 13**

Complete the remaining legal requirements:
- **Users under 18:** verification through an OTP sent to the parent's mobile
- **Data rights requests:** users can ask to see, correct, or delete their data, raise a grievance, or name a nominee. Admins handle each request in the panel, with deadline reminders.
- **Breach register:** record data breaches and email affected users
- **Data retention:** reminders when data must be deleted after its retention period
- **Re-consent:** ask users again when the notice changes
- Email templates in English and Hindi

**Outcome:** Every screen from the prototype works with real data.

---

### Phase 5 · Testing, production, and launch
**12 working days · Week 13 – 15**

Make the product ready for real customers:
- Security review and fixes, load testing
- Production servers in India (Mumbai), backups, monitoring, and alerts
- Nightly automatic integrity check of consent records
- Documentation website for developers
- Terms of Service, Privacy Policy, and Data Processing Agreement (after lawyer review)
- **Beta:** go live on Anvi Real Estate and 2–3 more sites, and fix the issues found
- Product landing page

**Outcome:** 🚀 **MVP launch in Week 15**, with at least 3 sites live in production.

---

### Phase 6 · React, WordPress, and 22 languages
**7 working days · Week 15 – 17**

- Ready-made package for React and Next.js apps
- WordPress plugin, submitted to WordPress.org
- Banner available in 20 more Indian languages (22 in total)
- Example projects for Vue and Angular

**Outcome:** React apps and WordPress sites can add the plugin easily, and the banner supports 22 languages.

---

### Phase 7 · Mobile SDKs
**13 working days · Week 17 – 19**

- Android SDK and iOS SDK
- Flutter and React Native packages
- Sample apps and mobile documentation

Mobile apps show the same banner inside the app, so the UI does not have to be rebuilt for each platform.

**Outcome:** Mobile apps can use the plugin.

---

### Phase 8 · Billing and advanced features
**10 working days · Week 19 – 21**

- Plans and online payments (Razorpay)
- Website scanner that finds tracking scripts automatically
- Sign in with Google
- Better onboarding for new customers
- A/B testing of banner text, without dark patterns

**Outcome:** The product is ready to sell with paid plans.

---

## 7. Pilot in Week 8

The full MVP arrives in Week 15. One pilot customer will get the core features earlier:

1. Finish Phases 0, 1, and 2 (by Week 7): backend and plugin are ready.
2. The developer sets up the pilot site directly, without the admin panel.
3. Set up the production server and monitoring.
4. **Week 8:** the consent banner, withdrawal, and consent records go live on the pilot customer's site (for example, Anvi Real Estate).

The pilot customer gets the admin panel and rights requests after Phases 3 and 4.

---

## 8. Milestones

| Week | Milestone |
|---|---|
| Week 1 | Project setup complete |
| Week 4 | Backend API ready |
| Week 7 | Plugin live on the demo website |
| Week 8 | Pilot customer live |
| Week 11 | Admin panel complete |
| Week 13 | All DPDP features complete |
| **Week 15** | **MVP public launch** |
| Week 17 | React, WordPress, 22 languages |
| Week 19 | Mobile SDKs |
| Week 21 | Full product, with billing |

---

## 9. Risks to the timeline

| Risk | Impact | Plan |
|---|---|---|
| 104 days is a tight plan for one developer | Phases may slip | Build only the essentials in each phase first. If time runs short, move Phase 8 features (scanner, A/B testing, Google sign-in) and the Flutter / React Native packages later. |
| DLT registration for SMS takes time | Parent OTP flow delayed | Apply in Week 1 |
| DPDP Rules or deadlines change | Features need changes | Keep texts and timelines configurable, and review with a lawyer regularly |
| Script blocking behaves differently on some sites | Customer complaints | Clear documentation, examples, and hands-on help during the beta |

**Never cut:** the consent ledger, consent withdrawal, script blocking, customer data isolation, and backups.

> Technical design: [PROJECT_PLAN.md](PROJECT_PLAN.md) · Ticket-wise tasks and estimates: [WORK_ITEMS.md](WORK_ITEMS.md)
