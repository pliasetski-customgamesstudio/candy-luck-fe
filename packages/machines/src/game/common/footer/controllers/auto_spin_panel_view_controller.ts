import { Container } from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
import { BaseListener } from '../listeners/base_listener';
import { AutoSpinPanelView } from '../views/auto_spin_panel_view';
import { T_AutoSpinPanelViewListener } from '../../../../type_definitions';

export class AutoSpinPanelViewController extends BaseSlotController<AutoSpinPanelView> {
  stateMachineListener: AutoSpinPanelViewListener;
  get isPanelVisible(): boolean {
    return this.view.isPanelVisible;
  }

  constructor(container: Container, view: AutoSpinPanelView) {
    super(container, view);
    const spinViewListener = container.forceResolve<AutoSpinPanelViewListener>(
      T_AutoSpinPanelViewListener
    );
    spinViewListener.viewController = this;
    this.stateMachineListener = spinViewListener;
  }

  hidePanel(): void {
    this.view.hidePanel();
  }

  showPanel(): void {
    this.view.showPanel();
  }

  setUnlimitedSpins(): void {
    this.view.setUnlimitedSpins();
  }
}

export class AutoSpinPanelViewListener extends BaseListener<AutoSpinPanelViewController> {
  viewController: AutoSpinPanelViewController;

  constructor(container: Container) {
    super(container);
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        this.viewController.hidePanel();
        break;
    }
  }
}
