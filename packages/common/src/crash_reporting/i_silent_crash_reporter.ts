export const T_ISilentCrashReporter = Symbol('ISilentCrashReporter');
export interface ISilentCrashReporter {
  reportCrash(message: string, stackTrace: Error): void;
}
