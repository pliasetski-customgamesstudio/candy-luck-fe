import { Container } from 'inversify';
import { SlotPrimaryActionsProvider, Action, ConditionAction } from 'machines';
import { ISlotGameEngineProvider, IReelsEngineProvider } from 'machines/src/reels_engine_library';

class ReelsSlotModulePrimaryActionsProvider extends SlotPrimaryActionsProvider {
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
