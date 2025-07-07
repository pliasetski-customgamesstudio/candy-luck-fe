import { Container } from '@cgs/syd';
import { StoppingIconEnumerator } from './stopping_icon_enumerator';
import { SlotParams } from '../../reels_engine/slot_params';
import { T_IGameParams } from '../../type_definitions';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';

export class StoppingIconsEnumeratorProvider {
  iconsEnumerator: StoppingIconEnumerator;

  constructor(container: Container, iconIds: number[], replaceId: number = 6) {
    console.log('load ' + this.constructor.name);
    const slotParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    this.iconsEnumerator = new StoppingIconEnumerator(
      slotParams.reelsCount,
      slotParams.linesCount,
      iconIds,
      replaceId
    );
  }
}
