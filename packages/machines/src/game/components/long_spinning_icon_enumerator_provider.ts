import { Container } from '@cgs/syd';
import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import {
  T_IGameConfigProvider,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_InitialReelsComponent,
} from '../../type_definitions';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { InitialReelsComponent } from './reel_net_api/initial_reels_component';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { SlotParams } from '../../reels_engine/slot_params';
import { LongSpinningIconEnumerator } from '../../reels_engine/long_spinning_icon_enumerator';

export class LongSpinningIconEnumeratorProvider {
  iconsEnumerator: IconEnumerator;
  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const slotParams = container.forceResolve<SlotParams>(T_IGameParams);
    const gameConfigComponent: IGameConfigProvider =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider);
    const initialReelsComponent: InitialReelsComponent =
      container.forceResolve<InitialReelsComponent>(T_InitialReelsComponent);
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this.iconsEnumerator = new LongSpinningIconEnumerator(
      slotParams.reelsCount,
      slotParams.linesCount,
      slotParams.longIcons,
      gameStateMachine
    );
  }
}
