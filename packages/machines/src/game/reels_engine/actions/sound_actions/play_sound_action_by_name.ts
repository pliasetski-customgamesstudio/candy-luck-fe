import { BuildAction } from '@cgs/shared';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { Action, Container, FunctionAction } from '@cgs/syd';
import { RegularSpinsSoundModelComponent } from '../../../components/regular_spins_sound_model_component';
import { T_RegularSpinsSoundModelComponent } from '../../../../type_definitions';

export class PlaySoundActionByName extends BuildAction {
  private readonly _reelSoundModel: ReelsSoundModel;
  private readonly _soundName: string;

  constructor(container: Container, soundName: string) {
    super();
    this._soundName = soundName;
    this._reelSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
  }

  buildAction(): Action {
    return new FunctionAction(() => {
      if (this._soundName) {
        this._reelSoundModel.getSoundByName(this._soundName)?.play();
      }
    });
  }
}
