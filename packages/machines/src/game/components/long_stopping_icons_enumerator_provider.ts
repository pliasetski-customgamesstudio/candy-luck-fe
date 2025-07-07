import { Container } from '@cgs/syd';
import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import { SlotParams } from '../../reels_engine/slot_params';
import {
  T_IGameConfigProvider,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_InitialReelsComponent,
} from '../../type_definitions';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { InitialReelsComponent } from './reel_net_api/initial_reels_component';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { LongStoppingIconEnumerator } from '../../reels_engine/long_stopping_icons_enumerator';

export class LongStoppingIconEnumeratorProvider {
  iconsEnumerator: IconEnumerator;
  constructor(container: Container, iconIds: number[], replaceId: number = 6) {
    console.log('load ' + this.constructor.name);
    const slotParams = container.forceResolve<SlotParams>(T_IGameParams);
    const _gameConfigComponent: IGameConfigProvider =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider);
    const _initialReelsComponent: InitialReelsComponent =
      container.forceResolve<InitialReelsComponent>(T_InitialReelsComponent);
    const _gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this.iconsEnumerator = new LongStoppingIconEnumerator(
      slotParams.reelsCount,
      slotParams.linesCount,
      slotParams.longIcons,
      iconIds,
      replaceId
    );
  }
}
