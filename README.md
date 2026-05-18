# The Authority Drift

Static marketing site for **Michael N. Fineman** and *The Authority Drift* book launch.

- Live target domain: [authoritydriftbook.com](https://authoritydriftbook.com) (canonical - this site + Brandon's SLO funnel pages live here)
- Vercel staging: [authority-drift-website.vercel.app](https://authority-drift-website.vercel.app)
- Author: Michael N. Fineman
- Operations: Kenneth Villar / BrewedOps
- Stack: Vanilla HTML / CSS / JS - no build step

## Local development

```bash
python3 -m http.server 5500
# then open http://localhost:5500/
```

## Deploy

Pushed to Vercel via GitHub integration. No build command needed - Vercel serves the static files directly.

Configuration is in `vercel.json`:
- Clean URLs enabled (`/privacy` resolves to `privacy.html`)
- Aggressive caching on `/assets/` (1 year, immutable)
- Short cache on CSS/JS (1 hour, must-revalidate) so updates ship cleanly

## Structure

| File | Purpose |
|---|---|
| `index.html` | Homepage |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Service |
| `referral.html` | Referral landing page |
| `styles.css` | All site styles |
| `script.js` | Reveal animations, marquee, drawer |
| `tbw.js` | The Brewed Web hooks (analytics + interactions) |
| `assets/` | Images, video, fonts |
| `robots.txt` | SEO crawl rules |
| `sitemap.xml` | SEO sitemap |

## Brand decisions locked

- The book = **The Authority Drift**
- Self-led course = **The Authority Reset Course**
- 8-week cohort = **The Authority Reset Executive Program**
- Community = **The Authority Reset Community**
- Capstone = **High Level Experience**
- Triad: *authority alignment, identity, decision clarity*

The funnel does conversion. The website does authority.
