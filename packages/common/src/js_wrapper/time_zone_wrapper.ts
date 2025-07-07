export function timeZoneGmt(): string {
  const d = new Date();
  const n = d.getTimezoneOffset();
  const minutes = Math.abs(n);
  return 'GMT' + (n < 0 ? '+' : '-') + ~~(minutes / 60);
}
