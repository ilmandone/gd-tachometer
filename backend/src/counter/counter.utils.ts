export const DEFAULT_LIMIT: number = 200;

export function getDateString(date?: Date): string {
  const d = date ?? new Date();
  const timeZone =
    process.env.COUNTER_TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    // 'en-CA' produces YYYY-MM-DD which is stable and locale-independent for our use
    return d.toLocaleDateString('en-CA', {
      timeZone,
    } satisfies Intl.DateTimeFormatOptions);
  } catch (e) {
    // Error if timeZone is invalid or not supported
    throw new Error(`Invalid time zone: ${timeZone}`, { cause: e });
  }
}
