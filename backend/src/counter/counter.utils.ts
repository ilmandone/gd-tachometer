export const DEFAULT_LIMIT: number = 200;

export function getDateString(timeZone?: string): string {
  try {
    // 'en-CA' produces YYYY-MM-DD which is stable and locale-independent for our use
    if (timeZone) {
      return new Date().toLocaleDateString('en-CA', {
        timeZone,
      } satisfies Intl.DateTimeFormatOptions);
    }
    return new Date().toLocaleDateString('en-CA');
  } catch (e) {
    // Error if timeZone is invalid or not supported
    throw new Error(`Invalid time zone: ${timeZone}`, { cause: e });
  }
}
