import { Duration } from './duration';

export class StringUtils {
  static format(format: string, params: any[]): string {
    for (let i = 0; i < params.length; i++) {
      const key = i.toString();
      format = format.split(`{${key}}`).join(params[i].toString());
    }
    return format;
  }

  /**
   * @deprecated use if (text) instead
   */
  static isNullOrEmpty(text: string | null): boolean {
    return !text;
  }

  /**
   * @deprecated use if (text) instead
   */
  static isNullOrWhiteSpace(text: string | null): boolean {
    return StringUtils.isNullOrEmpty(text);
  }

  static durationToStringWithoutHours(duration: Duration): string {
    const twoDigits = (n: number): string => {
      if (n >= 10) return `${n}`;
      return `0${n}`;
    };

    if (duration.inMicroseconds < 0) {
      return '00:00';
    }

    const twoDigitMinutes = twoDigits(duration.inMinutes % 60);
    const twoDigitSeconds = twoDigits(duration.inSeconds % 60);

    return `${twoDigitMinutes}:${twoDigitSeconds}`;
  }

  static durationToString(duration: Duration, normalizeHours: boolean = false): string {
    if (duration.inMicroseconds < 0) {
      return '00:00:00';
    }

    const twoDigits = (n: number): string => {
      if (n >= 10) return `${n}`;
      return `0${n}`;
    };

    const twoDigitHours = twoDigits(normalizeHours ? duration.inHours % 24 : duration.inHours);
    const twoDigitMinutes = twoDigits(duration.inMinutes % 60);
    const twoDigitSeconds = twoDigits(duration.inSeconds % 60);

    return `${twoDigitHours}:${twoDigitMinutes}:${twoDigitSeconds}`;
  }

  static durationToStringWithDays(duration: Duration): string {
    if (duration.inMicroseconds < 0) {
      return '00:00:00:00';
    }

    const twoDigits = (n: number): string => {
      if (n >= 10) return `${n}`;
      return `0${n}`;
    };

    const twoDigitDays = twoDigits(duration.inDays);
    const twoDigitHours = twoDigits(duration.inHours % 24);
    const twoDigitMinutes = twoDigits(duration.inMinutes % 60);
    const twoDigitSeconds = twoDigits(duration.inSeconds % 60);

    return `${twoDigitDays}:${twoDigitHours}:${twoDigitMinutes}:${twoDigitSeconds}`;
  }

  static isWellFormedUriString(uri: string): boolean {
    try {
      return new URL(uri).protocol !== 'about:';
    } catch {
      return false;
    }
  }
}
