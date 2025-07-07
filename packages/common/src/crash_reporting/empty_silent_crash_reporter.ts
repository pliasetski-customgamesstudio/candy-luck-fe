import { ISilentCrashReporter } from './i_silent_crash_reporter';

export class EmptySilentCrashReporter implements ISilentCrashReporter {
  reportCrash(_message: string, _stackTrace: any): void {}
}
