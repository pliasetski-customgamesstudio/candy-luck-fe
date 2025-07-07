import { ISpinResponse } from '@cgs/common';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from './base_game_state';

export class SuspendState<TResponse extends ISpinResponse> extends BaseGameState<TResponse> {
  private _isInterrupted: boolean;

  constructor(responseHolder: ResponseHolder<TResponse>, id: string) {
    super(responseHolder, id);
  }

  get isFinished(): boolean {
    return super.isFinished && this._isInterrupted;
  }

  onEnterImpl(): void {
    this._isInterrupted = false;
    super.onEnterImpl();
  }

  onLeaveImpl(): void {
    this._isInterrupted = true;
    super.onLeaveImpl();
  }

  interrupt(): void {
    this._isInterrupted = true;
    super.interrupt();
  }
}
