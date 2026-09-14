// Persisted in the browser. Wrapped because some embedded previews block storage.
export function readPref(key, allowed, fallback) {
  try {
    const v = window.localStorage.getItem(key);
    return allowed.indexOf(v) > -1 ? v : fallback;
  } catch (e) {
    return fallback;
  }
}
export function writePref(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    /* storage unavailable; preference lasts for this session only */
  }
}
