/*
import { ICrashReporter } from './i_crash_reporter';

export class DeobfuscatingCrashWrapper implements ICrashReporter {
  private _crashReporter: ICrashReporter;
  private _version: string;
  private _stackTraceDeobfuscator: StackTraceDeobfuscator;
  private _initCompleter: Completer<void>;
  private static sourceMapUrl: string = 'main.dart.js.map';

  constructor(crashReporter: ICrashReporter, version: string) {
    this._crashReporter = crashReporter;
    this._version = version;
    this._stackTraceDeobfuscator = new StackTraceDeobfuscator();
  }

  private async _init(): Promise<void> {
    await this._stackTraceDeobfuscator.init(
      DeobfuscatingCrashWrapper.sourceMapUrl + '?v=' + this._version
    );
  }

  public reportCrash(message: string, stackTrace: StackTrace): void {
    this._reportCrashInner(message, stackTrace);
  }

  private async _reportCrashInner(message: string, stackTrace: StackTrace): Promise<void> {
    if (!this._initCompleter) {
      this._initCompleter = new Completer<void>();
      await this._init();
      this._initCompleter.complete();
    } else if (!this._initCompleter.isCompleted) {
      await this._initCompleter.future;
    }
    let resultStackTrace: StackTrace = stackTrace;
    if (stackTrace && this._stackTraceDeobfuscator.successfullyInitialized) {
      resultStackTrace = this._stackTraceDeobfuscator.convert(stackTrace);
    }
    this._crashReporter.reportCrash(message, resultStackTrace);
  }
}
*/
