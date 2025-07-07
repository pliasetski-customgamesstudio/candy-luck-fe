import { Container, IntervalAction } from '@cgs/syd';
import { SpinActionComponent } from './spin_action_component';
import { IconDescr } from '../../reels_engine/long_icon_enumerator';
import { SlotParams } from '../../reels_engine/slot_params';
import { T_IGameParams } from '../../type_definitions';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { SpinMode } from './i_start_slot_action_provider';
import { WideIconsSpinAction } from '../../reels_engine/actions/wide_icons_spin_action';
import { RespinAction } from '../../reels_engine/actions/respin_action';

export class WideIconsSpinActionProvider extends SpinActionComponent {
  private _longIcons: IconDescr[];

  constructor(container: Container, useSounds: boolean = true) {
    super(container, useSounds);
    this._longIcons = (container.forceResolve<IGameParams>(T_IGameParams) as SlotParams).longIcons;
  }

  getStartSlotAction(spinMode: SpinMode): IntervalAction {
    switch (spinMode) {
      case SpinMode.Spin:
        return new WideIconsSpinAction(
          this.reelsEngine,
          this.gameStateMachine,
          this.gameConfig.regularSpinConfig,
          this.gameConfig.freeSpinConfig,
          this.regularSpinSoundModel,
          this.useSounds,
          this._longIcons
        );
      case SpinMode.ReSpin:
        return new RespinAction(
          this.container,
          this.reelsEngine,
          this.gameStateMachine,
          this.gameConfig.regularSpinConfig,
          this.gameConfig.freeSpinConfig,
          this.regularSpinSoundModel,
          this.useSounds
        );
      default:
        return new WideIconsSpinAction(
          this.reelsEngine,
          this.gameStateMachine,
          this.gameConfig.regularSpinConfig,
          this.gameConfig.freeSpinConfig,
          this.regularSpinSoundModel,
          this.useSounds,
          this._longIcons
        );
    }
  }
}
