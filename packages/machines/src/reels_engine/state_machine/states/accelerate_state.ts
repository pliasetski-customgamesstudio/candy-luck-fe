import { ISpinResponse, FutureCancelledError } from '@cgs/common';
import { Log } from '@cgs/syd';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from './base_game_state';
import { ResponseProvider } from '../../reel_net_api/response_provider';
import { FreeSpinsInfoConstants } from '../free_spins_info_constants';

export class AccelerateState<TResponse extends ISpinResponse> extends BaseGameState<TResponse> {
  skipNetworkRequest: boolean = false;

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
    if (this.skipNetworkRequest === true) return;
    let isFreeSpins = !!this.responseHolder.curResponse.freeSpinsInfo;
    if (isFreeSpins) {
      isFreeSpins =
        this.responseHolder.curResponse.freeSpinsInfo?.event !=
        FreeSpinsInfoConstants.FreeSpinsFinished;
    }
    this._responseProvider
      .doRequest(isFreeSpins)
      .then((s) => this.onResponse(s))
      .catch((e) => {
        if (e instanceof FutureCancelledError) {
          Log.Warning(e.toString());
          return;
        }
        throw e;
      });
  }

  onLeaveImpl(): void {
    this.skipNetworkRequest = false;
    super.onLeaveImpl();
  }

  onResponse(response: TResponse): void {
    this.responseHolder.preResponse = this.responseHolder.curResponse;
    this.responseHolder.curServerResponse = response;
  }
}
