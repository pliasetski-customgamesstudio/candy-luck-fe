import { SceneObject, Button } from '@cgs/syd';
import { BonusRecoveryPopupController } from '../controllers/bonus_recovery_popup_controller';
import { BaseSlotPopupView, SlotPopups } from './base_popup_view';

export class BonusRecoveryPopupView extends BaseSlotPopupView<BonusRecoveryPopupController> {
  constructor(
    _root: SceneObject,
    private _popupView: SceneObject
  ) {
    super(_root, _popupView, null, SlotPopups.BonusRecovery);
    const closeButton = _popupView.findById('CloseBtn') as Button;
    closeButton.clicked.listen(() => this.onCloseClicked());
    const acceptButton = _popupView.findById('PlayBtn') as Button;
    acceptButton.clicked.listen(() => this.onAcceptClicked());
  }

  private onCloseClicked(): void {
    this.controller.cancel();
  }

  private onAcceptClicked(): void {
    this.controller.accept();
  }
}
