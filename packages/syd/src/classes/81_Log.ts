import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';

export class Log {
  private static _outputDispatcher: EventDispatcher<string> = new EventDispatcher<string>();

  public static get OutputStream(): EventStream<string> {
    return Log._outputDispatcher.eventStream;
  }

  public static PrintEnabled: boolean = true;

  public static Error(message: string): void {
    if (Log.PrintEnabled) {
      console.error(message);
    }
    Log._outputDispatcher.dispatchEvent(message);
  }

  public static Warning(message: string): void {
    if (Log.PrintEnabled) {
      console.warn(message);
    }
    Log._outputDispatcher.dispatchEvent(message);
  }

  public static Debug(message: string): void {
    if (Log.PrintEnabled) {
      console.debug(message);
    }
    Log._outputDispatcher.dispatchEvent(message);
  }

  public static Trace(message: string): void {
    if (Log.PrintEnabled) {
      console.info(message);
    }
    Log._outputDispatcher.dispatchEvent(message);
  }

  public static Write(message: string): void {
    if (Log.PrintEnabled) {
      console.log(message);
    }
    Log._outputDispatcher.dispatchEvent(message);
  }
}
