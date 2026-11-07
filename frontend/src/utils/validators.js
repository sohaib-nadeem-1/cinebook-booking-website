export const isEmail = (v = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v = '') => /^[+\d][\d\s().-]{6,19}$/.test(v.trim());
export const passwordChecks = (pw = '') => ({
  length: pw.length >= 8,
  symbol: /[\d\W_]/.test(pw),
  mixed: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
  long: pw.length >= 12,
});
/** 0–4 strength score used by the register meter. */
export const passwordStrength = (pw = '') => {
  if (!pw) return 0;
  const c = passwordChecks(pw);
  return [c.length, c.symbol, c.mixed, c.long].filter(Boolean).length;
};
export const STRENGTH_LABEL = ['Enter password', 'Weak', 'Fair', 'Good', 'Strong'];
