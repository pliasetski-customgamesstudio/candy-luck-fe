import { EpicWinPopupView } from '../../../../common/slot/views/epic_win_popup_view';
import { EpicWinStep, EpicWinStepName } from '../../../epic_win/epic_win_step';
import {
  Action,
  Compatibility,
  debounce,
  easeInOut,
  EmptyAction,
  FunctionAction,
  InterpolateInplaceAction,
  IntervalAction,
  ParallelSimpleAction,
  SequenceAction,
  SequenceSimpleAction,
  Vector2,
} from '@cgs/syd';

const stepCountMap: Record<EpicWinStepName, number> = {
  [EpicWinStepName.BigWin]: 0,
  [EpicWinStepName.MegaWin]: 1,
  [EpicWinStepName.EpicWin]: 2,
  [EpicWinStepName.MaxWin]: 3,
};

const RESIZE_DELAY = 100;

export class CandyLuckEpicWinPopupView extends EpicWinPopupView {
  constructor(...args: ConstructorParameters<typeof EpicWinPopupView>) {
    super(...args);

    const coinsParticlesScene = this._popupNode.findAllById('coinsParticles');

    const resize = () => {
      const state = Compatibility.isPortrait ? 'vertical' : 'horizontal';
      coinsParticlesScene.forEach((coinsParticleScene) =>
        coinsParticleScene.stateMachine?.switchToState(state)
      );
    };
    const onResize = debounce(() => resize(), RESIZE_DELAY);

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('fullscreenchange', onResize);
    document.addEventListener('mozfullscreenchange', onResize);
    document.addEventListener('msfullscreenchange', onResize);
    document.addEventListener('webkitfullscreenchange', onResize);

    resize();
  }

  protected addActions(
    step: EpicWinStep,
    winName: EpicWinStepName,
    allActions: Action[],
    totalWin: number
  ): void {
    const actions: Action[] = [];

    if (step.priority === 1) {
      actions.push(new FunctionAction(() => this.startTextAnimation()));
    }

    const stepCount = stepCountMap[winName];
    if (step.priority <= this._configuration.steps.find((s) => s.winName == winName)!.priority) {
      const incrementFirstWinAction = this.interpolateTextAction(
        0.000001,
        Math.min(
          totalWin,
          this._slotSession.totalBet * this._configuration.steps[0].finishesWithTotalBetCount
        )
      );
      // const scaleFirstWinAction = this.scaleTextSceneAction(5, 1, 1.05);

      this._winActionsOneByOne.push(
        new ParallelSimpleAction([
          incrementFirstWinAction,
          // scaleFirstWinAction,
          new SequenceSimpleAction([
            new FunctionAction(() => {
              this._popupNode.stateMachine!.switchToState('step_0');
            }),
            new EmptyAction().withDuration(this._configuration.steps[0].animationDuration + 0.2),
            new FunctionAction(() => {
              this._currentStep++;
            }),
          ]),
        ])
      );
      for (let i = 0; i < stepCount; i++) {
        const endValue =
          i == stepCount - 1
            ? totalWin
            : Math.min(
                totalWin,
                this._slotSession.totalBet *
                  this._configuration.steps[i + 1].finishesWithTotalBetCount
              );

        const incrementWinAction = this.interpolateTextAction(
          this._slotSession.totalBet * this._configuration.steps[i + 1].startFromTotalBetCount,
          endValue
        );
        // const scaleWinAction = this.scaleTextSceneAction(5, 1 + 0.05 * (i + 1), 1 + 0.05 * (i + 2));

        this._winActionsOneByOne.push(
          new ParallelSimpleAction([
            new FunctionAction(() => {
              this._popupNode.stateMachine!.switchToState('next');
            }),
            incrementWinAction,
            // scaleWinAction,
            new SequenceSimpleAction([
              new EmptyAction().withDuration(
                this._configuration.steps[i + 1].animationDuration + 0.2
              ),
              new FunctionAction(() => {
                this._currentStep++;
              }),
            ]),
          ])
        );
      }
      this._allwinAction = new SequenceSimpleAction(this._winActionsOneByOne);
      actions.push(this._allwinAction);
      actions.push(
        new ParallelSimpleAction([
          new FunctionAction(() => {
            if (this._currentStep === 1) {
              this._popupNode.stateMachine!.switchToState('static');
            } else {
              this._popupNode.stateMachine!.switchToState(`step_${this._currentStep - 1}_static`);
            }
          }),
        ])
      );
      actions.push(
        new FunctionAction(() => this._soundNode?.stateMachine?.switchToState('big_win_loop_stop'))
      );
      actions.push(
        new FunctionAction(() => this._soundNode?.stateMachine?.switchToState('big_win_end_start'))
      );
      actions.push(new EmptyAction().withDuration(1.5));
      actions.push(
        new ParallelSimpleAction([
          new FunctionAction(() => {
            this._popupNode.stateMachine!.switchToState('hide');
          }),
        ])
      );
      actions.push(
        new FunctionAction(() => this._soundNode?.stateMachine?.switchToState('big_win_end_stop'))
      );

      const showAction = this._popupNode.stateMachine?.findById('step_0')
        ?.enterAction as IntervalAction;
      const showActionDuration = showAction?.duration || 0;

      allActions.push(
        new ParallelSimpleAction([
          new SequenceAction([
            new EmptyAction().withDuration(showActionDuration),
            new FunctionAction(() =>
              this._soundNode?.stateMachine?.switchToState('big_win_loop_start')
            ),
          ]),
          new SequenceSimpleAction(actions),
        ])
      );
    }
  }

  private scaleTextSceneAction(
    duration: number,
    fromScale: number,
    toScale: number
  ): IntervalAction {
    const interpolateAction = new InterpolateInplaceAction<Vector2>((v) => v.clone())
      .withInterpolateFunction(Vector2.lerpInplace)
      .withValues(new Vector2(fromScale, fromScale), new Vector2(toScale, toScale))
      .withTimeFunction(easeInOut)
      .withDuration(duration);

    interpolateAction.valueChange.listen((scale) => {
      this._textScenes.forEach((textScene) => (textScene.scale = scale));
    });

    return interpolateAction;
  }
}
