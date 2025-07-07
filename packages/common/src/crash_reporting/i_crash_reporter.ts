export interface ICrashReporter {
  reportCrash(message: string, stackTrace: any): void;
}
