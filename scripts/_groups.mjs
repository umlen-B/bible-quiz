const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
export const GROUPS = [
  { key: "g1", slug: "mock-full",    chapters: range(1, 16), size: 100, seed: 20260913, papers: 3 },
  { key: "g2", slug: "mock-1-to-8",  chapters: range(1, 8),  size: 85,  seed: 771103,   papers: 3 },
  { key: "g3", slug: "mock-9-to-16", chapters: range(9, 16), size: 85,  seed: 445209,   papers: 3 },
];
