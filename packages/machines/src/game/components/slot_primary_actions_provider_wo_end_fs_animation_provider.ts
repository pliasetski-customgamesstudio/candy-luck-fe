import { Container } from '@cgs/syd';
import { SlotPrimaryAnimationProvider } from './slot_primary_animation_provider';

export class SlotPrimaryAnimationWOEndFSAnimationProvider extends SlotPrimaryAnimationProvider {
  constructor(container: Container) {
    super(container);
  }

  attachPrimaryAnimationsToStateMachine(): void {
    this.gameStateMachine.accelerate.setLazyAnimation(() => this.buildStartSlotAction());
    this.gameStateMachine.stopping.setLazyAnimation(() => this.buildStopSlotAction());
    this.gameStateMachine.immediatelyStop.setLazyAnimation(
      () => this.buildImmediatelyStopSlotAction()
    );

    this.gameStateMachine.regularSpins.setLazyAnimation(() => this.buildWinLinesAction());

    this.gameStateMachine.shortWinLines.setLazyAnimation(() => this.buildShortWinLinesAction());

    this.gameStateMachine.respin.setLazyAnimation(() => this.buildRespinWinLinesAction());

    this.gameStateMachine.beginFreeSpins.setLazyAnimation(
      () => this.buildSpecialWinLinesAction()
    );
    this.gameStateMachine.beginBonus.setLazyAnimation(() => this.buildSpecialWinLinesAction());
    this.gameStateMachine.beginScatter.setLazyAnimation(() => this.buildSpecialWinLinesAction());
  }
}
