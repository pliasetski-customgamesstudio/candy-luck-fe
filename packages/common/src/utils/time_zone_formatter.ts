export class TimeZoneFormatter {
  static getFormattedTimeZone(): string {
    const utcOffset = new Date().getTimezoneOffset();
    let zone = '';
    if (Math.abs(utcOffset) < 1) {
      return 'GMT';
    }
    const offsetHours = Math.abs(Math.floor(utcOffset / 60));
    const offsetMinutes = Math.abs(utcOffset % 60);
    const offsetStr = `${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;
    if (utcOffset > 0) {
      zone = 'GMT+' + offsetStr;
    } else if (utcOffset < 0) {
      zone = 'GMT-' + offsetStr;
    }
    return zone;
  }
}
