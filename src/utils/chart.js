/** Round up to a clean tick-friendly ceiling */
export function niceMax(val, factor = 1.25) {
  if (!val || val <= 0) return 10;
  const raw = val * factor;
  const exp = Math.floor(Math.log10(raw));
  const unit = Math.pow(10, exp - 1);
  return Math.ceil(raw / unit) * unit;
}
