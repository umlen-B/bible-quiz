# Bible Quiz — the Gospel of Mark

559 multiple-choice questions across all sixteen chapters of Mark, nine mock papers,
and the full passage shown for every answer in WEB, KJV or Hindi.

Live at **https://bible-quiz.bhengra.co.in**

© 2026 Johnson Bhengra. All rights reserved.

---

## What the site does

- **Landing page** listing the books available. Only Mark for now; the layout is built to take more.
- **Theme and language** live in the header on every screen and are saved to the browser's
  `localStorage` under `bq.theme`, `bq.lang`, `bq.tr` and `bq.mode`. They survive a refresh
  and a return visit. Choosing हिन्दी also switches the scripture to Hindi automatically.
- **559 questions**, sixteen chapter sets and nine mock papers, with the full passage shown
  for every answer in WEB, KJV or Hindi.

---

## Routes

Every paper has its own URL, so a chapter or a mock can be bookmarked and shared.

| URL | What it is |
|---|---|
| `/` | Books index |
| `/new-testament/mark` | Mark: chapters and mock papers |
| `/new-testament/mark/ch-1` … `ch-16` | One chapter |
| `/new-testament/mark/all` | All 559 questions |
| `/new-testament/mark/mock-full-1` … `-3` | Full papers, 100 questions, any chapter |
| `/new-testament/mark/mock-1-to-8-1` … `-3` | Mark 1–8, 85 questions |
| `/new-testament/mark/mock-9-to-16-1` … `-3` | Mark 9–16, 85 questions |

Adding a book means a second entry on the landing page and a new slug prefix;
`src/lib/routes.js` is the only place that knows the URL shape.

---

## How the loading works

The content is about 780 KB — too much to hand to someone who has only opened the
landing page. None of it is in the entry bundle:

- **`src/data/chapters/ch-N.js`** — one module per chapter, fetched when a paper that
  needs it is opened. A chapter quiz pulls one file; a Mark 1–8 paper pulls eight.
- **`src/data/scripture/{web,kjv,hin}.js`** — one module per translation, fetched on the
  first answer reveal. Only the translation actually being read is ever downloaded.
- **`src/data/meta.js`** — chapter titles and question counts only, no question text.
  This is what the landing and index pages render from, and it is ~1 KB.
- Each screen is a `React.lazy` chunk of its own.

First load went from **250 KB gzipped to about 65 KB**. A chapter adds roughly 8 KB,
and the first revealed answer adds one translation, roughly 26 KB.

### Prerendering

`npm run build` renders all 28 routes to static HTML, so every URL is readable
without running JavaScript — which is what social link previews and most AI
search crawlers need, since they do not execute it. The client boots on top and
takes over from the first paint.

Quiz pages prerender their heading, chapter title and question count; the
questions themselves are fetched client-side, because a paper is reshuffled on
every attempt and baking one shuffle into the HTML would be wrong.

`scripts/check-dist.mjs` runs at the end of every build and fails it if a page
did not prerender, two pages share a title, a canonical does not match its path,
or `404.html` stops being an empty shell.

Mock papers are not stored. They are rebuilt from the chapter modules with a fixed
seed, so a given paper is always the same hundred questions without a hundred
questions being duplicated on disk. `npm run verify:data` proves the papers still
match the ones the original single-file build produced.

---

## The link preview image

`public/og.png` is committed. To change it, edit the SVG in
`scripts/gen-og-image.mjs` and run `npm run gen:og`; it caches the font it needs
into a gitignored folder, so the deploy never depends on the network.

The card is deliberately Latin-only. The renderer mangles Devanagari conjuncts
and drops spaces, so it reads "English and Hindi" rather than risk broken
हिन्दी on every shared link.

---

## Google Analytics

Set a GA4 measurement id and the site loads gtag and sends a `page_view` on every
route change, plus `quiz_start` and `quiz_complete` events. Leave it unset and the
whole thing is compiled out — nothing loads and nothing is sent, which is what
happens in local development by default.

- **Locally**: copy `.env.example` to `.env.local` and put your id in it.
- **On the deploy**: repository **Settings → Secrets and variables → Actions →
  Variables → New repository variable**, named `VITE_GA_ID`.

---

## Running it locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`.

```bash
npm test      # data parity, translation strings, and a render pass over all 26 URLs
npm run build # production build into dist/
```

---

## Deploy

Pushing to `main` builds and republishes through GitHub Actions. The first time only,
set **Settings → Pages → Build and deployment → Source → GitHub Actions**.

Because GitHub Pages has no server-side rewrite, the build also writes `dist/404.html`
as an empty copy of the shell. Prerendering means most deep links are served as real
files; 404.html catches anything else and lets the router decide.

Note that the two build-output plugins in `vite.config.js` are marked
`apply: "build"`. Without it they also fire when a dev server closes, and the
prerenderer — which starts a dev server — would overwrite `404.html` with an
already-prerendered page.

### DNS for bible-quiz.bhengra.co.in

Namecheap dashboard → **Domain List** → **Manage** next to `bhengra.co.in` →
**Advanced DNS**. One record:

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME Record | `bible-quiz` | `umlen-B.github.io.` | Automatic |

The trailing dot matters. `public/CNAME` already contains `bible-quiz.bhengra.co.in`,
and `base` in `vite.config.js` is `"/"`, which is what a custom domain needs.

Then **Settings → Pages → Custom domain** → `bible-quiz.bhengra.co.in` → **Save**.
Wait for the DNS check to pass, then tick **Enforce HTTPS**. The certificate can take
up to an hour; if the box is greyed out, DNS has not propagated yet.

---

## Troubleshooting

**Blank white page.** Almost always `base` in `vite.config.js`. A custom domain needs
`"/"`. A `username.github.io/repo-name/` URL needs `"/repo-name/"`.

**Deep links 404 but the home page works.** `dist/404.html` did not get written — check
the `spa-fallback-404` plugin in `vite.config.js` is still in the plugin list.

**"Domain does not resolve to the GitHub Pages server."** DNS has not propagated. Check
with `dig bible-quiz.bhengra.co.in +short` — you want to see `umlen-b.github.io` or the
GitHub IPs. Namecheap usually takes 30 minutes; it can take longer.

**Custom domain keeps unsetting itself.** `public/CNAME` and the GitHub Settings field
disagree. Make them identical.

**HTTPS unavailable.** Remove the custom domain in Settings, save, add it back. This
re-triggers certificate issuing.

---

## Editing the questions

`src/data/chapters/ch-N.js` is the source of truth — edit a question there and it is
picked up on the next build. Each entry is:

```js
{ q: "question", o: ["four", "options", "go", "here"], a: 2,   // index of the answer
  r: "Mark 1:1",            // passage shown after answering
  e: "one-line explanation",
  x: "2 Kings 1:8",         // optional cross-reference
  hi: { q, o, e } }         // Hindi translation
```

`scripts/` holds the one-off migration that split the original single-file build,
plus the checks that keep the split honest. `scripts/_data-source.mjs` is the frozen
original data, kept only so `npm run verify:data` can keep proving the mock papers
have not drifted.

---

## Credits

Scripture texts are in the public domain:

- **WEB** — World English Bible
- **KJV** — King James Version
- **हिन्दी** — Hindi Old Version
