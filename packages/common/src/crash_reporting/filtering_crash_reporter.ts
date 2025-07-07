import { ICrashReporter } from './i_crash_reporter';

export class FilteringCrashReporter implements ICrashReporter {
  private static readonly MillisecondsThreshold: number = 10000;
  private readonly _crashReporter: ICrashReporter;
  private readonly _sentReportsHashes: Map<number, number> = new Map<number, number>();

  constructor(crashReporter: ICrashReporter) {
    this._crashReporter = crashReporter;
  }

  reportCrash(message: string, stackTrace: any): void {
    const msg: string = message || 'null';
    const st: string = stackTrace?.toString() || 'null';
    const hash: number = this.getHashCode(msg + st);

    if (this._sentReportsHashes.has(hash)) {
      const milliseconds: number = this._sentReportsHashes.get(hash)!;
      const millisecondsNow: number = new Date().getTime();
      if (millisecondsNow - milliseconds > FilteringCrashReporter.MillisecondsThreshold) {
        this._crashReporter.reportCrash(message, stackTrace);
      }
      this._sentReportsHashes.set(hash, millisecondsNow);
    } else {
      this._crashReporter.reportCrash(message, stackTrace);
      this._sentReportsHashes.set(hash, new Date().getTime());
    }
  }

  protected getHashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    return hash;
  }
}
