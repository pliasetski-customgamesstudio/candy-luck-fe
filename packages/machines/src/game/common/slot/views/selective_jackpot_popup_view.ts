import { InternalJackpotsSpecGroup } from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import { Container, SceneObject } from '@cgs/syd';
import { JackPotPopupView } from './jackpot_popup_view';

export class SelectiveJackpotPopupView extends JackPotPopupView {
  private static readonly selectJackpotStateFormat: string = 'jackpot{0}';

  constructor(
    container: Container,
    root: SceneObject,
    popup: SceneObject,
    textAnimDuration: number,
    incrementDuration: number,
    closeWithButton: boolean
  ) {
    super(container, root, popup, textAnimDuration, incrementDuration, closeWithButton);
  }

  protected subscribeToSceneAnimationEvents(): void {
    const jackpotGroup: InternalJackpotsSpecGroup = this.gameStateMachine.curResponse
      .additionalData as InternalJackpotsSpecGroup;
    if (jackpotGroup) {
      for (let i = 0; i < jackpotGroup.jackPotValues.length; i++) {
        const stateName: string = StringUtils.format(
          SelectiveJackpotPopupView.selectJackpotStateFormat,
          [i.toString()]
        );
        const animState = this.view.stateMachine
          ? this.view.stateMachine.findById(stateName)
          : null;
        if (animState) {
          animState.enterAction.done.listen(() => this.controller.onAnimCompleted());
        }
      }
    }
  }
}
