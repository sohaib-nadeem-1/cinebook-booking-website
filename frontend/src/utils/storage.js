/** Safe web-storage wrappers. Only the service layer should touch these. */
const NS = 'cinebook:v1:';
const make = (getStorage) => ({
  get(key, fallback = null) {
    try { const raw = getStorage().getItem(NS + key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) { try { getStorage().setItem(NS + key, JSON.stringify(value)); return true; } catch { return false; } },
  remove(key) { try { getStorage().removeItem(NS + key); } catch { /* ignore */ } },
});
export const store = {
  ...make(() => localStorage),
  reset() { try { Object.keys(localStorage).filter((k) => k.startsWith(NS)).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ } },
};
/** Per-tab storage, used when "Remember me" is unchecked. */
export const sstore = make(() => sessionStorage);
