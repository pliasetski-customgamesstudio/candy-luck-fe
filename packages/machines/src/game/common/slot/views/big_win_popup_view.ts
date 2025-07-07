import { SceneObject } from '@cgs/syd';
import { BigWinPopupController } from '../controllers/big_win_popup_controller';
import { BaseSlotPopupView, SlotPopups } from './base_popup_view';

export class BigWinPopupView extends BaseSlotPopupView<BigWinPopupController> {
  constructor(root: SceneObject, popup: SceneObject) {
    super(root, popup, null, SlotPopups.EpicWin);
    const popupNode = this.view.findById('popup')!;
    popupNode.stateMachine!.findById('bigwin')!.enterAction.done.listen(() => {
      this.controller.onAnimCompeled();
    });
  }

  postEvent(name: string): void {
    this.view.stateMachine!.switchToState(name);
  }

  setWin(winName: string): void {
    const popupNode = this.view.findById('popup')!;
    popupNode.stateMachine!.switchToState('empty');
    switch (winName) {
      case 'Big Win':
        popupNode.stateMachine!.switchToState('bigwin');
        break;
      case 'Mega Win':
        popupNode.stateMachine!.switchToState('bigwin');
        break;
      case 'Epic Win':
        popupNode.stateMachine!.switchToState('bigwin');
        break;
      default:
        popupNode.stateMachine!.switchToState('bigwin');
        break;
    }
  }
}
