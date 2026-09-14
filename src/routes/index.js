// The route table as data, so it can be consumed two ways: App.jsx wraps each
// entry in React.lazy for the browser, and the prerenderer awaits the same
// loaders to get real components (renderToString would only ever render the
// Suspense fallback for a lazy one).
import { BOOK_BASE, paths } from "../lib/routes.js";

export const ROUTES = [
  { path: paths.home, load: () => import("./Landing.jsx") },
  { path: BOOK_BASE, load: () => import("./Book.jsx") },
  { path: `${BOOK_BASE}/:slug`, load: () => import("./Quiz.jsx") },
];
