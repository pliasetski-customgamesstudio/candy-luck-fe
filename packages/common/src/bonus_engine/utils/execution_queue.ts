import { Func1, Queue } from '@cgs/shared';
import { CancellationToken } from '../../future/cancellation_token';
import { Log } from '@cgs/syd';

export class ExecutionQueue<T> {
  private _processingCount: number = 0;
  private readonly _func: Func1<T, Promise<void>>;
  private readonly _argumentsQueue: Queue<T> = new Queue<T>();
  private readonly _cancellationToken: CancellationToken;

  constructor(func: Func1<T, Promise<void>>, cancellationToken: CancellationToken) {
    this._func = func;
    this._cancellationToken = cancellationToken;
  }

  public async add(arg: T, force: boolean = false): Promise<void> {
    if (force && !this._cancellationToken.isCancellationRequested) {
      try {
        this._processingCount++;
        await this._process(arg);
        this._processingCount--;
      } catch (error) {
        Log.Trace('ExecutionQueue cancelled');
      }
    } else {
      this._argumentsQueue.enqueue(arg);
    }
    this.tryProcess();
  }

  public clear(): void {
    this._argumentsQueue.clear();
  }

  private async tryProcess(): Promise<void> {
    if (this._processingCount < 0) {
      throw new Error('Processing count is empty');
    }

    if (
      !this._argumentsQueue.isEmpty() &&
      this._processingCount <= 0 &&
      !this._cancellationToken.isCancellationRequested
    ) {
      this._processingCount++;
      do {
        try {
          const f = this._argumentsQueue.dequeue();
          await this._process(f!);
        } catch (error) {
          Log.Trace('ExecutionQueue cancelled');
        }
      } while (!this._argumentsQueue.isEmpty() && !this._cancellationToken.isCancellationRequested);

      this._onComplete();
    }
  }

  private _process(arg: T): Promise<void> {
    return this._func(arg)!;
  }

  private _onComplete(): void {
    this._processingCount--;
  }
}
