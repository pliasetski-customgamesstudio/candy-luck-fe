import { ReelsEngineSlotPrimaryActionsProvider } from '../reels_engine_slot_primary_actions_provider';
import { AfterShortWinLinesActionProvider } from '../after_short_win_lines_action_provider';
import { Container, IntervalAction, SequenceAction } from '@cgs/syd';
import { T_AfterShortWinLinesActionProvider } from '../../../type_definitions';

export class SlotPrimaryActionsProviderWithCustomShortWinlines extends ReelsEngineSlotPrimaryActionsProvider {
  private _afterShortWinLinesActionProvider: AfterShortWinLinesActionProvider;

  constructor(container: Container) {
    super(container);
    this._afterShortWinLinesActionProvider = container.forceResolve<AfterShortWinLinesActionProvider>(
      T_AfterShortWinLinesActionProvider
    );
  }

  getSpecialWinLinesAction(): IntervalAction {
    const action = this._afterShortWinLinesActionProvider?.afterShortWinLinesAction;
    if (!action) {
      return super.getSpecialWinLinesAction();
    }
    return new SequenceAction([super.getSpecialWinLinesAction(), action]);
  }

  getWinLinesAction(): IntervalAction {
    const action = this._afterShortWinLinesActionProvider?.afterShortWinLinesAction;
    if (!action) {
      return super.getWinLinesAction();
    }
    return new SequenceAction([super.getWinLinesAction(), action]);
  }
}
