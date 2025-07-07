import { EpicWinPopupController } from '../../../../common/slot/controllers/epic_win_popup_controller';
import { ISpinResponse } from '@cgs/common';
import { Action, EmptyAction, SequenceSimpleAction } from '@cgs/syd';
import { AwaitableAction } from '../../../../../reels_engine/actions/awaitable_action';

export class CandyLuckEpicWinPopupController extends EpicWinPopupController {
  popupAction(response: ISpinResponse): Action {
    if (!this.isBigWin(response)) {
      return new EmptyAction();
    }

    const totalWin =
      this.gameStateMachine.curResponse.freeSpinsInfo?.event === 'finished'
        ? this.gameStateMachine.curResponse.freeSpinsInfo.totalWin
        : this.gameStateMachine.curResponse.totalWin;

    return new SequenceSimpleAction([
      this.view.showWinAction(this.bigWinName, totalWin),
      new AwaitableAction(this.view.show()),
    ]);
  }
}
