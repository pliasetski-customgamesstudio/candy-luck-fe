import { Duration } from './duration';
import { StringUtils } from './string_utils';

export class TimeUtils {
  static formatWithDays(timeToEnd: Duration): string {
    return timeToEnd.inDays > 1
      ? StringUtils.durationToStringWithDays(timeToEnd)
      : StringUtils.durationToString(timeToEnd);
  }

  static formatTimerTextAdvanced(timeToEnd: Duration): string {
    let timerText = '';

    let days = timeToEnd.inDays;
    const hours = timeToEnd.inHours - days * 24;
    const minutes = timeToEnd.inMinutes - days * 24 * 60 - hours * 60;
    const seconds = timeToEnd.inSeconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

    if (days > 7) {
      const weeks = Math.floor(timeToEnd.inDays / 7);
      days = timeToEnd.inDays % 7;
      timerText = `${weeks}W:${days.toString().padStart(2, '0')}D`;
    } else if (days >= 1) {
      timerText = `${days.toString().padStart(2, '0')}D:${hours.toString().padStart(2, '0')}H`;
    } else if (days === 0 && hours < 24 && hours >= 1) {
      timerText = `${hours.toString().padStart(2, '0')}H:${minutes.toString().padStart(2, '0')}M`;
    } else {
      timerText = `${minutes.toString().padStart(2, '0')}M:${seconds.toString().padStart(2, '0')}S`;
    }

    return timerText;
  }

  static formatTimerTextAdvanced2(timeToEnd: Duration): string {
    let timerText = '';

    const days = timeToEnd.inDays;
    const hours = timeToEnd.inHours - days * 24;
    const minutes = timeToEnd.inMinutes - days * 24 * 60 - hours * 60;
    const seconds = timeToEnd.inSeconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

    if (days > 7) {
      const weeks = Math.floor(timeToEnd.inDays / 7);
      timerText = `${weeks} Weeks`;
    } else if (days >= 1) {
      timerText = days === 1 ? `${days.toString()} Day` : `${days.toString()} Days`;
    } else if (days === 0 && hours < 24 && hours >= 1) {
      timerText = `${hours.toString().padStart(2, '0')}H:${minutes.toString().padStart(2, '0')}M`;
    } else {
      timerText = `${minutes.toString().padStart(2, '0')}M:${seconds.toString().padStart(2, '0')}S`;
    }

    return timerText;
  }

  static formatTimerTextAdvanced3(timeToEnd: Duration): string {
    let timerText = '';

    const days = timeToEnd.inDays;
    const hours = timeToEnd.inHours - days * 24;
    const minutes = timeToEnd.inMinutes - days * 24 * 60 - hours * 60;
    const seconds = timeToEnd.inSeconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

    if (days >= 7) {
      const weeks = Math.floor(timeToEnd.inDays / 7);
      timerText = `${weeks.toString().padStart(2, '0')}W:${(days % 7)
        .toString()
        .padStart(2, '0')}D`;
    } else if (days >= 1) {
      timerText = `${days.toString().padStart(2, '0')}D:${hours.toString().padStart(2, '0')}H`;
    } else if (days === 0 && hours < 24 && hours >= 1) {
      timerText = `${hours.toString().padStart(2, '0')}H:${minutes.toString().padStart(2, '0')}M`;
    } else {
      timerText = `${minutes.toString().padStart(2, '0')}M:${seconds.toString().padStart(2, '0')}S`;
    }

    return timerText;
  }

  static formatTimerTextAdvanced4(timeToEnd: Duration): string {
    let timerText = '';
    const minutes = timeToEnd.inMinutes - timeToEnd.inHours * 60;
    const seconds = timeToEnd.inSeconds - timeToEnd.inMinutes * 60;

    if (timeToEnd.inHours >= 1) {
      timerText = `${timeToEnd.inHours.toString().padStart(2, '0')}H:${minutes
        .toString()
        .padStart(2, '0')}M`;
    } else {
      timerText = `${timeToEnd.inMinutes.toString().padStart(2, '0')}M:${seconds
        .toString()
        .padStart(2, '0')}S`;
    }

    return timerText;
  }

  static formatTimerTextAdvanced5(timeToEnd: Duration): string {
    let timerText = '';

    const days = timeToEnd.inDays;
    const hours = timeToEnd.inHours - days * 24;
    const minutes = timeToEnd.inMinutes - days * 24 * 60 - hours * 60;
    const seconds = timeToEnd.inSeconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

    if (days >= 1) {
      timerText =
        timeToEnd.inHours === 24 && minutes === 0 ? '1 Day' : `${(days + 1).toString()} Days`;
    } else if (days === 0 && hours < 24 && hours >= 1) {
      timerText = `${hours.toString().padStart(2, '0')}H:${minutes.toString().padStart(2, '0')}M`;
    } else if (minutes >= 1) {
      timerText = `${minutes.toString().padStart(2, '0')} Min`;
    } else {
      timerText = `${seconds.toString().padStart(2, '0')} Sec`;
    }

    return timerText;
  }

  static formatTimerHHmm(timeToEnd: Duration): string {
    const minutes = timeToEnd.inMinutes - timeToEnd.inHours * 60;
    return `${timeToEnd.inHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }

  static formatTimerTextOneType(timeToEnd: Duration): string {
    const days = timeToEnd.inDays;
    const hours = timeToEnd.inHours - days * 24;
    const minutes = timeToEnd.inMinutes - days * 24 * 60 - hours * 60;

    let timerText = '';
    if (days > 7) {
      const weeks = Math.floor(timeToEnd.inDays / 7);

      if (weeks > 1) {
        timerText = `${weeks.toString().padStart(2, '0')} WEEKS`;
      } else {
        timerText = `${weeks.toString().padStart(2, '0')} WEEK`;
      }
    } else if (days >= 1) {
      timerText = days === 1 ? `${days.toString()} DAY` : `${days.toString()} DAYS`;
    } else if (days === 0 && hours < 24 && hours >= 1) {
      if (minutes > 15) {
        timerText = `${hours.toString()}.5 HOURS`;
      } else {
        timerText = hours === 1 ? `${hours.toString()} HOUR` : `${hours.toString()} HOURS`;
      }
    } else {
      timerText = `${minutes.toString().padStart(2, '0')} MIN`;
    }

    return timerText;
  }

  static totalMilliseconds(duration: Duration): number {
    return duration.inMicroseconds / Duration.microsecondsPerMillisecond;
  }

  static totalSeconds(duration: Duration): number {
    return duration.inMicroseconds / Duration.microsecondsPerSecond;
  }

  static totalMinutes(duration: Duration): number {
    return duration.inMicroseconds / Duration.microsecondsPerMinute;
  }

  static totalHours(duration: Duration): number {
    return duration.inMicroseconds / Duration.microsecondsPerHour;
  }

  static totalDays(duration: Duration): number {
    return duration.inMicroseconds / Duration.microsecondsPerDay;
  }

  static milliseconds(duration: Duration): number {
    return duration.inMilliseconds - duration.inSeconds * Duration.millisecondsPerSecond;
  }

  static seconds(duration: Duration): number {
    return duration.inSeconds - duration.inMinutes * Duration.secondsPerMinute;
  }

  static minutes(duration: Duration): number {
    return duration.inMinutes - duration.inHours * Duration.minutesPerHour;
  }

  static hours(duration: Duration): number {
    return duration.inHours - duration.inDays * Duration.hoursPerDay;
  }

  static days(duration: Duration): number {
    return duration.inDays;
  }

  static formatFeatureTimer(time: Duration): string {
    if (TimeUtils.totalMilliseconds(time) < 0) return '00m 00s';

    if (TimeUtils.totalHours(time) >= 48.0) {
      const days = Math.floor(TimeUtils.totalDays(time));
      const hours = TimeUtils.hours(time);
      return `${days}d ${hours.toString().padStart(2, '0')}h`;
    } else if (TimeUtils.totalHours(time) < 48.0 && TimeUtils.totalHours(time) >= 1.0) {
      const hours = Math.floor(TimeUtils.totalHours(time));
      return `${hours.toString().padStart(2, '0')}h ${TimeUtils.minutes(time)
        .toString()
        .padStart(2, '0')}m`;
    } else if (TimeUtils.totalHours(time) < 1.0) {
      return `${TimeUtils.minutes(time).toString().padStart(2, '0')}m ${TimeUtils.seconds(time)
        .toString()
        .padStart(2, '0')}s`;
    }

    return '';
  }
}
