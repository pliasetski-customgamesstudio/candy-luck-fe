import { ICrashReporter } from './i_crash_reporter';

export class EmptyCrashReporter implements ICrashReporter {
  reportCrash(_message: string, _stackTrace: any): void {
    // Do nothing
  }
}
