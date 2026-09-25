// Every time the app and alerts show is US Eastern (New York: EST in winter, EDT in summer), labelled "ET".
const TZ = 'America/New_York';

/** "Sep 25, 8:00 AM ET" */
export const etText = (s: number) =>
  new Date(s * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: TZ }) + ' ET';

/** "2026-09-25 08:00" in Eastern time (for CSV). */
export function etIso(s: number) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ })
      .formatToParts(new Date(s * 1000))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

/** Date only, e.g. "Sep 29". */
export const etDay = (s: number) => new Date(s * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: TZ });

/** Chart axis labels in Eastern time: a date at day starts, otherwise the hour. */
export function etTick(s: number) {
  const d = new Date(s * 1000);
  const hm = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
  return hm === '12:00 AM' ? etDay(s) : hm.replace(':00', '');
}
