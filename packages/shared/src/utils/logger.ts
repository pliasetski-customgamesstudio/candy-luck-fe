import { Log } from '@cgs/syd';
import { BitsHelper } from './bits_helper';

export class Logger {
  private static _mask: number;
  private static _level: number;
  private static description: string;
  private static _enabled: boolean;
  private static _isPrint = true;
  private static version = '1.0';
  private static readonly MaxBufferSize = 200000;
  private static readonly BufferCount = 10;
  private static _buffers: Array<string> = [];

  public static Initialize(): void {
    Logger._mask = 0;
    Logger._level = 0;
    Logger._enabled = true;
    Logger.Level = LogLevel.Syd;

    Log.PrintEnabled = false;
    Log.OutputStream.listen((message?: string) => {
      if (BitsHelper.HasBits(Logger._mask, LogLevel.Syd)) {
        Logger._log(LogLevel.Syd, message);
      }
    });

    //Add js function to get log
    (window as any).getHistory = () => {
      return Logger.GetHistory();
    };
  }

  public static set mask(value: number) {
    Logger._mask = value;
  }

  public static set Enabled(value: boolean) {
    Logger._enabled = value;
  }

  public static get Enabled(): boolean {
    return Logger._enabled;
  }

  public static set isPrint(value: boolean) {
    Logger._isPrint = value;
  }

  public static get debugEnabled(): boolean {
    return Logger._enabled && Logger._level <= LogLevel.Debug;
  }

  public static Debug(message: any): void {
    if (BitsHelper.HasBits(Logger._mask, LogLevel.Debug)) {
      Logger._log(LogLevel.Debug, message);
    }
  }

  public static Info(message: any): void {
    if (BitsHelper.HasBits(Logger._mask, LogLevel.Info)) {
      Logger._log(LogLevel.Info, message);
    }
  }

  public static Warn(message: any): void {
    if (BitsHelper.HasBits(Logger._mask, LogLevel.Warn)) {
      Logger._log(LogLevel.Warn, message);
    }
  }

  public static Error(message: any): void {
    if (BitsHelper.HasBits(Logger._mask, LogLevel.Error)) {
      Logger._log(LogLevel.Error, message);
    }
  }

  public static Fatal(message: any): void {
    if (BitsHelper.HasBits(Logger._mask, LogLevel.Fatal)) {
      Logger._log(LogLevel.Fatal, message);
    }
  }

  private static _log(level: number, message: any): void {
    if (!Logger._enabled) {
      return;
    }

    const output: string = `${new Date()}|${LogLevel.GetName(level)}|${message}`;

    if (Logger._isPrint) {
      console.log(output);
    }

    if (Logger._buffers.length === 0) {
      Logger._buffers.push('');
    }

    if (
      Logger._buffers[Logger._buffers.length - 1].length + output.length >=
      Logger.MaxBufferSize
    ) {
      if (Logger._buffers.length >= Logger.BufferCount) {
        Logger._buffers.shift();
      }
      Logger._buffers.push('');
    }

    Logger._buffers[Logger._buffers.length - 1] = `${output}\n`;
  }

  public static GetHistory(): string {
    return Logger._buffers.join('');
  }

  public static set Level(value: number) {
    if ((value & LogLevel.All) === 0) {
      throw new Error('Invalid log level');
    }

    Logger._level = value;

    if (BitsHelper.CountOnes(value) > 1) {
      Logger._mask = value;
      return;
    }

    Logger._mask = LogLevel.All;
    while (value > LogLevel.Syd) {
      value >>= 1;
      Logger._mask = BitsHelper.ClearBits(Logger._mask, value);
    }
  }

  public static get Level(): number {
    return Logger._level;
  }

  public static GetLevelName(): string {
    if (BitsHelper.CountOnes(Logger._level) > 1) {
      const list: string[] = [];
      let i = LogLevel.Debug;
      while (i < LogLevel.All) {
        if ((Logger._level & i) > 0) {
          list.push(LogLevel.GetName(i));
        }
        i <<= 1;
      }
      return list.join('|');
    }
    return LogLevel.GetName(Logger._level);
  }
}

export class LogLevel {
  /// A special level that can be used to turn off syd logging.
  public static readonly Syd = 1 << 0;

  /// A message level providing tracing information.
  /// Debug messages should be messages that are additional output used
  /// to ease the debugging of an application.
  public static readonly Debug = 1 << 1;

  /// A message level for informational messages.
  /// Notification messages should be messages that highlight interesting
  /// informations about what happens in the the application.
  public static readonly Info = 1 << 2;

  /// A message level indicating a potential problem.
  /// Warnings are designated to be used in case code got executed that
  /// is not desirable for performance, memory or clarity reasons but didn't
  /// result in any error.
  public static readonly Warn = 1 << 3;

  /// A message level indicating a serious failure.
  /// The Error level is designated to be used in case an error occurred
  /// and the error could be dodged. It should contain hints about why
  /// that error occurs and if there is a common case where this error occurs.
  public static readonly Error = 1 << 4;

  /// Logs a message to notify about an error that broke the application and
  /// couldn't be fixed automatically
  /// The Fatal level is designated to be used in case an error occurred
  /// that couldn't be stopped. A fatal error usually results in a inconsistent
  /// or inperceivable application state.
  public static readonly Fatal = 1 << 5;

  /// A bitfield of all log levels.
  public static readonly All =
    LogLevel.Syd | LogLevel.Debug | LogLevel.Info | LogLevel.Warn | LogLevel.Error | LogLevel.Fatal;

  /// Returns the human-readable name of a log level.
  public static GetName(level: number): string {
    let levelName: string;
    switch (level) {
      case 0x01:
        levelName = 'CGS';
        break;
      case 0x02:
        levelName = 'DEBUG';
        break;
      case 0x04:
        levelName = 'INFO';
        break;
      case 0x08:
        levelName = 'WARN';
        break;
      case 0x10:
        levelName = 'ERROR';
        break;
      case 0x20:
        levelName = 'FATAL';
        break;
      default:
        levelName = '?';
    }
    return levelName;
  }
}
