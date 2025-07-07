import { LazyAction } from '@cgs/shared';
import { Container, IntervalAction, EmptyAction } from '@cgs/syd';
import { AwaitableAction } from '../../../../reels_engine/actions/awaitable_action';
import { BigWinPopupView } from '../views/big_win_popup_view';
import { BaseSlotPopupController } from './base_popup_controller';
import { ISpinResponse } from '@cgs/common';

export class BigWinPopupController extends BaseSlotPopupController<BigWinPopupView> {
  constructor(container: Container, popupView: BigWinPopupView, stopBackgroundSound: boolean) {
    super(container, popupView, stopBackgroundSound);
    this.gameStateMachineNotifier.gameStateMachine.stop.appendLazyAnimation(
      () =>
        new LazyAction(() =>
          this.popupAction(this.gameStateMachineNotifier.gameStateMachine.curResponse)
        )
    );
  }

  onPopupShown(): void {
    this.view.setWin(this.gameStateMachineNotifier.gameStateMachine.curResponse.bigWinName);
  }

  onAnimCompeled(): void {
    this.view.hide();
  }

  popupAction(response: ISpinResponse): IntervalAction {
    if (response.bigWinName && response.bigWinName.length > 0) {
      return new AwaitableAction(this.view.show());
    }
    return new EmptyAction();
  }
}
