import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import { Container } from '@cgs/syd';
import {
  T_IGameConfigProvider,
  T_IGameParams,
  T_InitialReelsComponent,
} from '../../type_definitions';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { InitialReelsComponent } from './reel_net_api/initial_reels_component';
import { LongIconEnumerator } from '../../reels_engine/long_icon_enumerator';
import { SlotParams } from '../../reels_engine/slot_params';

export class LongIconEnumeratorComponent {
  iconsEnumerator: IconEnumerator;
  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const slotParams: SlotParams = container.forceResolve<SlotParams>(T_IGameParams);
    const _gameConfigComponent: IGameConfigProvider = container.forceResolve(T_IGameConfigProvider);
    const _initialReelsComponent: InitialReelsComponent =
      container.forceResolve(T_InitialReelsComponent);
    this.iconsEnumerator = new LongIconEnumerator(
      slotParams.reelsCount,
      slotParams.linesCount,
      slotParams.longIcons
    );
  }
}
