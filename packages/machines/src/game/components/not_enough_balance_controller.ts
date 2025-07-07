import { BaseSlotPopupController } from '../common/slot/controllers/base_popup_controller';
import { NotEnoughBalanceView } from './not_enough_balance_view';
import { Container } from '@cgs/syd';
import { BaseSlotPopupView } from '../common/slot/views/base_popup_view';

export class NotEnoughBalanceController extends BaseSlotPopupController<NotEnoughBalanceView> {
  private _eventInitiator: string;

  constructor(container: Container, popupView: NotEnoughBalanceView) {
    super(container, popupView, false);
  }

  onPopupClosed(): void {
    this.gameStateMachineNotifier.notifier.NotifyListenersExited('popup');
    this.slotPopupCoordinator.onPopupHidden(
      (this.view as BaseSlotPopupView<NotEnoughBalanceController>).popupId
    );
    this.navigationStack.unregister(this);
  }

  onPopupShowing(): void {
    this.gameStateMachineNotifier.notifier.NotifyListenersEntered('popup');
    this.slotPopupCoordinator.onPopupShown(
      (this.view as BaseSlotPopupView<NotEnoughBalanceController>).popupId
    );
    this.navigationStack.register(this);
  }

  onAnimCompleted(): void {
    this.view.hide();
  }

  show(): void {
    this.view.show();
    this.view.showPopup();
  }
}
