import { ISpinResponse, FutureCancelledError } from '@cgs/common';
import { Log } from '@cgs/syd';
import { ResponseProvider } from '../../reel_net_api/response_provider';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from './base_game_state';

export class MakeRequest<TResponse extends ISpinResponse> extends BaseGameState<TResponse> {
  private _responseProvider: ResponseProvider<TResponse>;

  constructor(
    responseHolder: ResponseHolder<TResponse>,
    responseProvider: ResponseProvider<TResponse>,
    id: string
  ) {
    super(responseHolder, id);
    this._responseProvider = responseProvider;
  }

  get isFinished(): boolean {
    return super.isFinished;
  }

  onEnterImpl(): void {
    super.onEnterImpl();
    this._responseProvider
      .doRequest(!!this.responseHolder.curResponse.freeSpinsInfo)
      .then((r) => this.onResponse(r))
      .catch((e) => {
        if (e instanceof FutureCancelledError) {
          Log.Warning(e.toString());
          return;
        }
        throw e;
      });
  }

  onLeaveImpl(): void {
    super.onLeaveImpl();
  }

  onResponse(response: TResponse): void {
    this.responseHolder.preResponse = this.responseHolder.curResponse;
    this.responseHolder.curServerResponse = response;
  }
}
