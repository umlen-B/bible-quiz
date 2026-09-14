// Generates public/og.png, the link-preview card.
//
// Run by hand (npm run gen:og) rather than at build time — the output is
// committed, so the deploy never depends on the network or on fonts being
// installed. Fonts are cached in scripts/.fonts/ and are gitignored.
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";

// Latin only, deliberately. resvg's Devanagari shaping mangles conjuncts and
// drops spaces, so the card says "Hindi" rather than risk broken हिन्दी on
// every shared link.
const FONTS = [
  ["Literata.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/literata/Literata%5Bopsz%2Cwght%5D.ttf"],
];

mkdirSync("scripts/.fonts", { recursive: true });
const fontFiles = [];
for (const [name, url] of FONTS) {
  const path = `scripts/.fonts/${name}`;
  if (!existsSync(path)) {
    process.stdout.write(`fetching ${name}… `);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} fetching ${name}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
    console.log("done");
  }
  fontFiles.push(path);
}

// Palette lifted from the site's dark theme so the card and the page agree.
const INK = "#020617";      // slate-950, the page background
const CARD = "#0F172A";     // slate-900
const AMBER = "#FCD34D";    // amber-300, the site accent
const TEXT = "#F1F5F9";
const MUTED = "#94A3B8";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}"/>
  <rect x="64" y="56" width="1072" height="518" rx="20" fill="${CARD}"/>
  <rect x="64" y="56" width="1072" height="4" rx="2" fill="${AMBER}"/>

  <text x="112" y="150" font-family="Literata" font-size="22" letter-spacing="5.5" fill="${AMBER}">BIBLE QUIZ</text>

  <text x="112" y="278" font-family="Literata" font-size="88" fill="${TEXT}">The Gospel of Mark</text>

  <text x="112" y="352" font-family="Literata" font-size="34" fill="${MUTED}">559 practice questions · English and Hindi</text>

  <line x1="112" y1="418" x2="1088" y2="418" stroke="#1E293B" stroke-width="1.5"/>

  <text x="112" y="470" font-family="Literata" font-size="27" fill="${TEXT}">16 chapters</text>
  <text x="352" y="470" font-family="Literata" font-size="27" fill="${TEXT}">9 mock papers</text>
  <text x="648" y="470" font-family="Literata" font-size="27" fill="${TEXT}">Passage with every answer</text>

  <text x="112" y="534" font-family="Literata" font-size="23" fill="${MUTED}">bible-quiz.bhengra.co.in</text>
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Literata" },
}).render().asPng();

writeFileSync("public/og.png", png);
console.log(`public/og.png — ${(png.length / 1024).toFixed(1)} KB, 1200x630`);
