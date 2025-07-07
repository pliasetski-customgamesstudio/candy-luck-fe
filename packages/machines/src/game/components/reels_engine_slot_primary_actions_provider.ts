import { Container, Action } from '@cgs/syd';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { T_ISlotGameEngineProvider } from '../../type_definitions';
import { ConditionAction } from './win_lines/complex_win_line_actions/condition_action';
import { SlotPrimaryActionsProvider } from './win_lines/slot_primary_actions_provider';

export class ReelsEngineSlotPrimaryActionsProvider extends SlotPrimaryActionsProvider {
  private _reelsEngine: ReelsEngine;

  constructor(container: Container) {
    super(container);
    this._reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
  }

  getImmediatelyStopSlotAction(): Action {
    return new ConditionAction(() => this._reelsEngine.isSlotStopped);
  }
}
