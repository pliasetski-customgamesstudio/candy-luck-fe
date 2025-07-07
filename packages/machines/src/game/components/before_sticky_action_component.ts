import { Container, IntervalAction, FunctionAction, ParallelAction } from '@cgs/syd';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import { T_ISlotGameEngineProvider } from '../../type_definitions';

export class BeforeStickyActionComponent {
  private _iconAnimationHelper: IconAnimationHelper;

  constructor(container: Container) {
    const reelEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._iconAnimationHelper = reelEngine.iconAnimationHelper;
  }

  public getAction(positions: number[], symbolGroupId: number, marker: string): IntervalAction {
    const result: IntervalAction[] = [];

    for (const iconPosition of positions) {
      const iconActions: IntervalAction[] = [];
      iconActions.push(
        new FunctionAction(() => this._iconAnimationHelper.startAnimOnIcon(iconPosition, 'show'))
      );
      iconActions.push(
        new FunctionAction(() => this._iconAnimationHelper.getMaxAnimDuration(iconPosition, 'show'))
      );
      result.push(new ParallelAction(iconActions));
    }

    return new ParallelAction(result);
  }
}
