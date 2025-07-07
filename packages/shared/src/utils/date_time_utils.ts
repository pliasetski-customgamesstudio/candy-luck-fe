export class DateTimeUtils {
  static parseUtc(formattedString: string): Date {
    const re =
      /^([+-]?\d{4,6})-?(\d\d)-?(\d\d)(?:[ T](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d{1,6}))?)?)?( ?[zZ]| ?([-+])(\d\d)(?::?(\d\d))?)?)?$/;
    const match = formattedString.match(re);

    if (match) {
      const parseIntOrZero = (matched: string | null): number => {
        if (!matched) return 0;
        return parseInt(matched, 10);
      };

      const years = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);
      const hour = parseIntOrZero(match[4]);
      const minute = parseIntOrZero(match[5]);
      const second = parseIntOrZero(match[6]);

      return new Date(Date.UTC(years, month - 1, day, hour, minute, second));
    } else {
      throw new Error(`Invalid date format: ${formattedString}`);
    }
  }

  static getDate(source: Date): Date {
    return new Date(source.getFullYear(), source.getMonth(), source.getDate());
  }

  static toTimestamp(date: Date): number {
    const startDateTime = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
    return date.getTime() - startDateTime.getTime();
  }

  static fromTimeStamp(timeStamp: number): Date {
    const startDateTime = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
    return new Date(startDateTime.getTime() + timeStamp);
  }

  static formatDateTimeHHmm(dateTime: Date): string {
    return `${String(dateTime.getUTCHours()).padStart(2, '0')}:${String(
      dateTime.getUTCMinutes()
    ).padStart(2, '0')}`;
  }

  static formatDateTimeDDmmyyyy(dateTime: Date): string {
    return `${String(dateTime.getUTCDate()).padStart(2, '0')}/${String(
      dateTime.getUTCMonth() + 1
    ).padStart(2, '0')}/${dateTime.getUTCFullYear()}`;
  }
}
