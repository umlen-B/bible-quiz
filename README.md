# Gospel of Mark — Bible Quiz Practice

559 multiple-choice questions across all sixteen chapters of Mark, nine mock papers,
and the full passage shown for every answer in WEB, KJV or Hindi.

© 2026 Johnson Bhengra. All rights reserved.

---

## What the site does

- **Landing page** listing the books available. Only Mark for now; the layout is built to take more.
- **Theme and language** live in the header on every screen and are saved to the browser's
  `localStorage` under `bq.theme`, `bq.lang` and `bq.tr`. They survive a refresh and a return visit.
  Choosing हिन्दी also switches the scripture to Hindi automatically.
- **559 questions**, sixteen chapter sets and nine mock papers, with the full passage shown
  for every answer in WEB, KJV or Hindi.

---

## Before you push: two things to edit

**1. `public/CNAME`** — replace the placeholder with your actual domain, no `https://`, no trailing slash:

```
markquiz.yourdomain.com
```

If you are **not** using a custom domain, delete `public/CNAME` entirely and set
`base` in `vite.config.js` to `"/your-repo-name/"`.

**2. Nothing else.** `base` is already `"/"`, which is what a custom domain needs.

---

## Deploy

```bash
git init
git add .
git commit -m "Bible quiz on the Gospel of Mark"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Then in the repository on GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

That is the whole setup. Every push to `main` rebuilds and republishes. Watch it run
under the **Actions** tab; the first run takes about a minute.

---

## Namecheap DNS

Namecheap dashboard → **Domain List** → **Manage** next to your domain → **Advanced DNS**.

### Option A — subdomain (recommended, e.g. `quiz.yourdomain.com`)

Add one record:

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME Record | `quiz` | `YOUR-USERNAME.github.io.` | Automatic |

Put `quiz.yourdomain.com` in `public/CNAME`.

A subdomain is easier: one record, and it survives if you ever move the root domain elsewhere.

### Option B — root domain (e.g. `yourdomain.com`)

Delete any existing A records for `@` first, including Namecheap's default parking
records, then add these five:

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | `185.199.108.153` | Automatic |
| A Record | `@` | `185.199.109.153` | Automatic |
| A Record | `@` | `185.199.110.153` | Automatic |
| A Record | `@` | `185.199.111.153` | Automatic |
| CNAME Record | `www` | `YOUR-USERNAME.github.io.` | Automatic |

Put `yourdomain.com` in `public/CNAME`.

Also switch **Nameservers** (on the Domain tab) to **Namecheap BasicDNS** if it is
currently set to anything else, or the Advanced DNS records will be ignored.

### Then, back on GitHub

**Settings → Pages → Custom domain** → type your domain → **Save**. Wait for the DNS
check to pass, then tick **Enforce HTTPS**. The certificate can take up to an hour;
if the box is greyed out, DNS has not propagated yet.

---

## Troubleshooting

**Blank white page.** Almost always `base` in `vite.config.js`. Custom domain needs `"/"`.
A `username.github.io/repo-name/` URL needs `"/repo-name/"`.

**"Domain does not resolve to the GitHub Pages server."** DNS has not propagated. Check with
`dig quiz.yourdomain.com +short` — you want to see the GitHub IPs or `username.github.io`.
Namecheap usually takes 30 minutes; it can take longer.

**Custom domain keeps unsetting itself.** The `public/CNAME` file and the GitHub Settings
field disagree. Make them identical.

**HTTPS unavailable.** Remove the custom domain in Settings, save, add it back. This
re-triggers certificate issuing.

---

## Running it locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`.

---

## Credits

Scripture texts are in the public domain:

- **WEB** — World English Bible
- **KJV** — King James Version
- **हिन्दी** — Hindi Old Version
