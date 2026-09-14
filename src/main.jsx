import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// createRoot, not hydrateRoot, even though the HTML is prerendered. The
// prerender runs with the default theme and language; a visitor who chose the
// light theme or Hindi has different markup in localStorage, and hydration
// would report a mismatch and fall back to a client render anyway. The inline
// script in index.html paints the stored background so the swap is not visible.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
