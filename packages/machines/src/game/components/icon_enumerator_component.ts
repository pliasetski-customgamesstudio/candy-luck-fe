import { Container } from '@cgs/syd';
import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { SlotParams } from '../../reels_engine/slot_params';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { InitialReelsComponent } from './reel_net_api/initial_reels_component';
import {
  T_IGameParams,
  T_IGameConfigProvider,
  T_InitialReelsComponent,
} from '../../type_definitions';

export class IconEnumeratorComponent {
  iconsEnumerator: IconEnumerator;
  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const slotParams: SlotParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    const gameConfigComponent = container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider);
    const initialReelsComponent =
      container.forceResolve<InitialReelsComponent>(T_InitialReelsComponent);
    this.iconsEnumerator = new IconEnumerator(slotParams.reelsCount, slotParams.linesCount);
  }
}
