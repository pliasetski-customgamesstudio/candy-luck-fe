import { SpinResponseProvider } from '../../slot_response_provider';
import { IPostSpinUpdaterComponent } from './i_post_spin_updater_component';
import { IGameParams } from '../../../reels_engine/interfaces/i_game_params';
import { Container } from '@cgs/syd';
import { SpinResultResponse } from '@cgs/network';
import { ISpinResponse } from '@cgs/common';

export class SpinResponseWithUpdatersProvider extends SpinResponseProvider<ISpinResponse> {
  private _updaters: IPostSpinUpdaterComponent[];

  constructor(
    c: Container,
    slotParams: IGameParams,
    postSpinUpdaters: IPostSpinUpdaterComponent[]
  ) {
    super(c, slotParams);
    if (postSpinUpdaters) {
      this._updaters = postSpinUpdaters;
    }
  }

  toInternalResponse(spinResult: SpinResultResponse): ISpinResponse {
    const spinResponse = super.toInternalResponse(spinResult);

    if (!this._updaters) {
      return spinResponse;
    }

    for (const updater of this._updaters) {
      updater?.processResponse(spinResponse);
    }

    return spinResponse;
  }
}
