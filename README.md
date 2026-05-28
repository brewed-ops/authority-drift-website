# The Authority Drift

Static marketing site for **Michael N. Fineman** and *The Authority Drift* book launch.

| | |
|---|---|
| Funnel domain (Brandon / Impact Maker Publishing) | [authoritydriftbook.com](https://authoritydriftbook.com) |
| Website target domain (Percepture-hosted) | **authoritydrift.com** (DNS to be added at GoDaddy) |
| Current staging | [authority-drift-website.vercel.app](https://authority-drift-website.vercel.app) |
| Author | Michael N. Fineman |
| Operations (until handoff) | Kenneth Villar - kenneth@authoritydriftbook.com |
| Stack | Vanilla HTML / CSS / JS - no build step |

---

## Handoff notes (Percepture)

This site is currently auto-deployed to Vercel from `main` in this repo. Per the May 21 launch meeting, the plan is:

- **Funnel stays** on `authoritydriftbook.com` (Brandon's GHL build - leave it alone).
- **Website moves** to `authoritydrift.com`, hosted by Percepture. GoDaddy DNS access is held by Mike + Kenneth; coordinate with us when you're ready to add records.

Whatever host you move to, please preserve the items below or things break silently.

### State at handoff (May 29, 2026)

Everything in this repo is production-ready. The deployment sequence is gated on Percepture's DNS work:

1. **Now:** site is live + correct at `authority-drift-website.vercel.app`. All forms wired to GHL. All A2P-compliance pieces in place on `text-updates.html` (consent UI + STOP/HELP + Privacy link + frequency + data-rates).
2. **Percepture takes over hosting** → moves the repo content to your hosting platform of choice, cuts GoDaddy DNS to point `authoritydrift.com` + `www.authoritydrift.com` at it. Migration checklist below.
3. **After DNS resolves** to the real site at `authoritydrift.com`, Mike clicks "Start Now" on the red A2P banner in GHL and submits the Twilio TCR brand + campaign. The campaign URL is `https://authoritydrift.com/text-updates`.
4. **TCR approves** (typical 1-3 weeks) → Kenneth toggles the GHL workflow `03. SMS Opt-Ins From Website` from Draft to Published, welcome SMS goes live.

**Do not change `text-updates.html`, the `CONSENT_TEXT` constant in `script.js`, or `privacy.html` (Section 15) once submission goes in.** Any change after TCR approval requires resubmission.

### Migration checklist

- [ ] Replicate the routing rules in `vercel.json` (clean URLs - `/privacy` -> `privacy.html`, etc.).
- [ ] Replicate the cache headers: `/assets/*` = 1 year immutable; `*.css`, `*.js` = 1 hour, must-revalidate.
- [ ] Keep both form `POST` URLs intact (see *Forms + integrations* below). Don't proxy or rewrite them.
- [ ] Keep the Meta Pixel `<script>` + `<noscript>` blocks in the `<head>` of every HTML page. Pixel ID is `3864806837147722`.
- [ ] After DNS cutover, send a test submission through each form and verify the contact lands in the **Authority Drift** GHL location.
- [ ] Confirm `https://authoritydrift.com/text-updates` resolves to the real opt-in page (not a landing/parking redirect). This URL is what Twilio TCR reviewers will scrape - it MUST show the actual form with the consent checkbox, STOP/HELP/Privacy text, on a publicly reachable URL.
- [ ] Confirm `https://authoritydrift.com/privacy.html` resolves and is reachable from `/text-updates` (the Privacy Policy link in the consent label - same domain, no login wall, no off-site redirect).

---

## Local development

No build step. Serve the directory:

```bash
python3 -m http.server 5500
# then open http://localhost:5500/
```

## Deploy (current)

Auto-deployed to Vercel via the GitHub integration: push to `main`, Vercel ships it. No build command; static files are served directly. Config in `vercel.json`.

---

## Structure

| File | Purpose |
|---|---|
| `index.html` | Homepage |
| `book-call.html` | Application / book-a-strategy-session page (Executive Program, 1:1 Coaching, Mastermind Speaking Inquiry) |
| `referral.html` | "Refer a friend / sponsor a friend" page |
| `text-updates.html` | **A2P 10DLC SMS opt-in page** - the URL submitted to Twilio TCR as proof-of-consent. Do not remove or change the form/consent text without re-submitting the campaign. |
| `privacy.html` | Privacy Policy (includes A2P-required SMS clauses in Section 15) |
| `terms.html` | Terms of Service |
| `styles.css` | All site styles |
| `script.js` | Reveal animations, marquee, mobile nav, form handlers + GHL webhook POSTs |
| `tbw.js` | Interaction polish (book carousel, etc.) |
| `assets/` | Images, video, fonts. `assets/events/` holds the experiential-events gallery + the helicopter clip in the marquee. |
| `robots.txt` | SEO crawl rules |
| `sitemap.xml` | SEO sitemap |
| `vercel.json` | Vercel-only routing + cache config |

---

## Forms + integrations

### Form webhooks (GHL inbound, location `oxe72L0Uva4DN1UM1qJx`)

Both forms POST `application/json` directly to GHL. The GHL inbound webhook **rejects `text/plain`**, so don't change the `Content-Type`.

| Form | File | Webhook |
|---|---|---|
| Refer a friend | `referral.html` | `https://services.leadconnectorhq.com/hooks/oxe72L0Uva4DN1UM1qJx/webhook-trigger/4fced324-e420-4190-9ddb-265abc681cac` |
| Book a call / Application | `book-call.html` | `https://services.leadconnectorhq.com/hooks/oxe72L0Uva4DN1UM1qJx/webhook-trigger/ca6dd07f-acd4-4b78-80c6-162472d4023f` |
| Text Updates (SMS opt-in) | `text-updates.html` | `https://services.leadconnectorhq.com/hooks/oxe72L0Uva4DN1UM1qJx/webhook-trigger/bfe3334b-154e-4b8f-abd1-0cc5e1dd6ed3` (dedicated **`03. SMS Opt-Ins From Website`** workflow) |

Field names in the POST body are mapped 1:1 to GHL contact fields. Don't rename them without coordinating with Kenneth - downstream GHL workflows (notifications, branching by interest type, etc.) read those exact keys.

---

## A2P 10DLC compliance (READ before changing the SMS opt-in flow)

The `text-updates.html` page is the **Twilio TCR opt-in proof URL** submitted with the A2P campaign registration. Carriers and Twilio reviewers navigate to this exact URL and verify that:

1. The consent checkbox is **unchecked by default**.
2. The visible consent label includes the brand name (**The Authority Drift**), message frequency (**varies**), **"Msg & data rates may apply"**, the **STOP** and **HELP** keywords, and a link to the Privacy Policy.
3. The Privacy Policy link resolves and contains a Section 15 covering SMS opt-in/out/data-sharing/frequency/HELP.

If any of those are removed, broken, or moved to a different URL, the carrier compliance posture breaks and Twilio can suspend message delivery. **Coordinate with Kenneth or Mike before changing this page or its consent text.** The exact consent string is also mirrored inside `script.js` (the `CONSENT_TEXT` constant) so each submission is logged with proof of what the user agreed to.

`/privacy`, `/terms`, and `/text-updates` must all stay reachable on the same domain (`authoritydrift.com` post-migration) without any login wall or redirects to off-domain pages.

### Meta Pixel

- ID: **`3864806837147722`** (init + PageView in the `<head>` of every HTML page).
- Server-side Purchase / Subscribe / Lead conversion events are handled inside GHL workflows by a third-party CAPI contractor (Mehrab / Creative Saikat). Don't add client-side conversion events without coordinating - duplicates muddy the attribution.

---

## Brand decisions locked (May 2026)

- The book = **The Authority Drift**
- Self-led course = **The Authority Reset Course**
- 8-week cohort = **The Authority Reset Executive Program**
- Community = **The Authority Reset Community**
- Capstone trip = **High Level Experience**
- Triad: *authority alignment, identity, decision clarity*

The funnel does conversion. The website does authority.

---

## Contact for handoff questions

**Kenneth Villar** - kenneth@authoritydriftbook.com (WhatsApp via Mike).
Mike: WhatsApp / michaelnfineman@gmail.com.
