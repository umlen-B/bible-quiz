// One place that knows the URL shape, so the book can be re-homed later
// without hunting through components.
export const BOOK_BASE = "/new-testament/mark";

export const paths = {
  home: "/",
  book: BOOK_BASE,
  chapter: (n) => `${BOOK_BASE}/ch-${n}`,
  mock: (slug) => `${BOOK_BASE}/${slug}`,
  all: `${BOOK_BASE}/all`,
};
