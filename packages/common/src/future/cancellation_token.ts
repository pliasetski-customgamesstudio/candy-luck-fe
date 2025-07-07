import { EventDispatcher, EventStream, IStreamSubscription } from '@cgs/syd';
import { OperationCancelledError } from './operation_cancelled_error';

export class CancellationToken {
  static readonly none: CancellationToken = new CancellationToken();
  private readonly _linkedToken: CancellationToken | null;
  private _isCancelled: boolean = false;
  private _cancelDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  private get _cancelEvent(): EventStream<void> {
    return this._cancelDispatcher.eventStream;
  }

  constructor(linkedToken: CancellationToken | null = null) {
    this._linkedToken = linkedToken;
  }

  get isCancellationRequested(): boolean {
    return this._isCancelled || !!this._linkedToken?.isCancellationRequested;
  }

  throwIfCancellationRequested(): void {
    if (this.isCancellationRequested) {
      throw new OperationCancelledError();
    }
  }

  cancel(): void {
    this._isCancelled = true;
    this._cancelEvent.dispatchEvent();
  }

  register(action: () => void): IStreamSubscription {
    return this._cancelEvent.listen(() => {
      action();
    });
  }
}
