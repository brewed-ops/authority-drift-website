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

### Migration checklist

- [ ] Replicate the routing rules in `vercel.json` (clean URLs - `/privacy` -> `privacy.html`, etc.).
- [ ] Replicate the cache headers: `/assets/*` = 1 year immutable; `*.css`, `*.js` = 1 hour, must-revalidate.
- [ ] Keep both form `POST` URLs intact (see *Forms + integrations* below). Don't proxy or rewrite them.
- [ ] Keep the Meta Pixel `<script>` + `<noscript>` blocks in the `<head>` of every HTML page. Pixel ID is `3864806837147722`.
- [ ] After DNS cutover, send a test submission through each form and verify the contact lands in the **Authority Drift** GHL location.

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
| `privacy.html` | Privacy Policy |
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

Field names in the POST body are mapped 1:1 to GHL contact fields. Don't rename them without coordinating with Kenneth - downstream GHL workflows (notifications, branching by interest type, etc.) read those exact keys.

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
