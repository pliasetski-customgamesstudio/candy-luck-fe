import { Func1, Func0, VoidFunc1, VoidFunc0 } from '../func/func_imp';
import { Completer, IStreamSubscription } from '@cgs/syd';

export class FutureUtils {
  static taskFromEvent(subscription: Func1<Func0<any>, IStreamSubscription>): Promise<void> {
    const completer = new Completer<void>();

    let stream: IStreamSubscription | null = null;
    const result: Func0<any> = () => {
      stream?.cancel();
      completer.complete();
    };

    stream = subscription(result);

    return completer.promise;
  }

  static unwrapCallback<T>(func: VoidFunc1<VoidFunc1<T>>): Promise<T> {
    const completer = new Completer<T>();

    const callback = (result: T) => {
      completer.complete(result);
    };

    func(callback);

    return completer.promise;
  }

  static unwrapVoidCallback(func: VoidFunc1<VoidFunc0>): Promise<void> {
    const completer = new Completer<void>();

    const callback = () => {
      completer.complete();
    };

    func(callback);

    return completer.promise;
  }

  static trySetResult(completer: Completer<void>): void {
    if (completer && !completer.isCompleted) {
      completer.complete();
    }
  }

  static trySetResultWithArg<T>(completer: Completer<T>, result: T): void {
    if (completer && !completer.isCompleted) {
      completer.complete(result);
    }
  }
}
