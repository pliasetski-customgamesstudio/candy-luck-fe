import { Container } from 'inversify';
import { SlotPrimaryAnimationProvider } from 'machines';
import { ISlotPrimaryActionsProvider } from 'syd';
import { ISlotGameModule } from 'machines/src/reels_engine_library';

class ModularSlotPrimaryAnimationProvider extends SlotPrimaryAnimationProvider {
  private _primaryModuleActionsProvider: ISlotPrimaryActionsProvider[];
  get primaryModuleActionsProvider(): ISlotPrimaryActionsProvider[] {
    if (!this._primaryModuleActionsProvider) {
      this._primaryModuleActionsProvider = container
        .resolve<ISlotGameModule[]>(Array)
        .map((m) => m.getComponent(ISlotPrimaryActionsProvider));
    }
    return this._primaryModuleActionsProvider;
  }

  constructor(c: Container) {
    super(c);
  }

  buildStartSlotAction(): Action {
    const actions = this.primaryModuleActionsProvider.map((m) => m.getStartSlotAction());
    actions.push(primarySlotActionsProvider.getStartSlotAction());
    return new ParallelSimpleAction(actions);
  }

  buildStopSlotAction(): Action {
    const actions = this.primaryModuleActionsProvider.map((m) => m.getStopSlotAction());
    actions.push(primarySlotActionsProvider.getStopSlotAction());
    return new ParallelSimpleAction(actions);
  }

  buildImmediatelyStopSlotAction(): Action {
    const actions = this.primaryModuleActionsProvider.map((m) => m.getImmediatelyStopSlotAction());
    actions.push(primarySlotActionsProvider.getImmediatelyStopSlotAction());
    return new ParallelSimpleAction(actions);
  }

  buildWinLinesAction(): Action {
    const actions = this.primaryModuleActionsProvider.map((m) => m.getWinLinesAction());
    actions.push(primarySlotActionsProvider.getWinLinesAction());
    return new ParallelSimpleAction(actions);
  }

  buildShortWinLinesAction(): Action {
    const actions = this.primaryModuleActionsProvider.map((m) => m.getShortWinLinesAction());
    actions.push(primarySlotActionsProvider.getShortWinLinesAction());
    return new ParallelSimpleAction(actions);
  }

  buildRespinWinLinesAction(): Action {
    const actions = this.primaryModuleActionsProvider.map((m) => m.getRespinWinLinesAction());
    actions.push(primarySlotActionsProvider.getRespinWinLinesAction());
    return new ParallelSimpleAction(actions);
  }

  buildSpecialWinLinesAction(): Action {
    const actions = this.primaryModuleActionsProvider.map((m) => m.getSpecialWinLinesAction());
    actions.push(primarySlotActionsProvider.getSpecialWinLinesAction());
    return new ParallelSimpleAction(actions);
  }
}
