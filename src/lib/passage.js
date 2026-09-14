// Verse-reference parsing. The book array is passed in so the caller
// controls which translation module has been loaded.
export function parseRef(r) {
  const m = /^Mark (\d+):(.*)$/.exec(r);
  if (!m) return null;
  const nums = [];
  m[2].split(",").forEach((part) => {
    const p = part.trim();
    if (p.indexOf("-") > -1) {
      const b = p.split("-").map(Number);
      for (let i = b[0]; i <= b[1]; i++) nums.push(i);
    } else nums.push(Number(p));
  });
  return { ch: Number(m[1]), nums };
}

export function passage(refStr, book, wide) {
  const p = parseRef(refStr);
  if (!p) return null;
  const arr = book[p.ch - 1] || [];
  let list = p.nums.slice();
  let clipped = false;
  if (wide) {
    const lo = Math.max(1, Math.min.apply(null, p.nums) - 2);
    const hi = Math.min(arr.length, Math.max.apply(null, p.nums) + 2);
    list = [];
    for (let i = lo; i <= hi; i++) list.push(i);
  } else if (list.length > 4) {
    list = list.slice(0, 4);
    clipped = true;
  }
  return {
    clipped,
    cited: p.nums,
    verses: list.filter((n) => arr[n - 1]).map((n) => ({ n, text: arr[n - 1] })),
  };
}


export const TRLABEL = { web: "WEB", kjv: "KJV", hin: "हिन्दी" };
