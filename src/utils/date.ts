/**
 * Local-timezone YYYY-MM-DD.
 * Use this everywhere we store or read a "day" key — never `toISOString()`,
 * which produces UTC and silently misaligns near midnight.
 */
export function todayLocalIso(): string {
  return localIso(new Date());
}

export function localIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
