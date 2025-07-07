import { SceneCommon } from '@cgs/common';
import { LazyAction } from '@cgs/shared';
import {
  Container,
  Action,
  ParallelSimpleAction,
  FunctionAction,
  InterpolateCopyAction,
  lerp,
  EmptyAction,
  ProgressBar,
} from '@cgs/syd';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { ProgressiveBonusActionsProvider } from './progressive_bonus_actions_provider';
import { StagedFreeSpinsCollectConfig } from '../../../reels_engine/game_config/game_config';
import { T_IGameConfigProvider } from '../../../type_definitions';

export class StagedProgressiveBonusActionsProvider extends ProgressiveBonusActionsProvider {
  private _collectFreeSpinConfig: StagedFreeSpinsCollectConfig;
  public get collectFreeSpinConfig(): StagedFreeSpinsCollectConfig {
    return this._collectFreeSpinConfig;
  }
  private static readonly _incrementDuration: number = 0.5;
  private _stagesLength: number[] = [1, 6, 16, 21, 51];
  public get stagesLength(): number[] {
    return this._stagesLength;
  }
  private _stageStartValues: number[] = [];
  private _stageStartCollectCount: number[] = [];
  private _stageSteps: number[] = [];
  private _stageFinishValues: number[] = [0.08, 0.3, 0.45, 0.7, 1.0];
  private _currentStage: number = 0;
  private _currentValue: number = 0.0;
  public get currentValue(): number {
    return this._currentValue;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    defaultStagesLength: number[],
    defaultStageFinishValues: number[],
    movingSceneName: string,
    progressiveSceneName: string,
    progressiveHolderId: string,
    destinationHolderName: string,
    moveAnimDuration: number = 0.5,
    playIconSound: boolean = true
  ) {
    super(
      container,
      sceneCommon,
      movingSceneName,
      progressiveSceneName,
      0,
      progressiveHolderId,
      destinationHolderName,
      { moveAnimDuration, playIconSound }
    );

    this._collectFreeSpinConfig = container
      .forceResolve<IGameConfigProvider>(T_IGameConfigProvider)
      .gameConfig.getSlotFeatureConfig(
        StagedFreeSpinsCollectConfig
      ) as StagedFreeSpinsCollectConfig;

    if (this._collectFreeSpinConfig) {
      this._stagesLength = this._collectFreeSpinConfig.stageLength!;
      this._stageFinishValues = this._collectFreeSpinConfig.stageEndValues!;
    } else {
      this._stagesLength = defaultStagesLength;
      this._stageFinishValues = defaultStageFinishValues;
    }

    this.stepsCount = this._stagesLength.reduce((a, b) => Math.max(a, b));

    for (let i = 0; i < this._stagesLength.length; i++) {
      this._stageStartValues.push(i > 0 ? this._stageFinishValues[i - 1] : 0.0);
      this._stageStartCollectCount.push(i > 0 ? this._stagesLength[i - 1] : 0);
    }

    for (let i = 0; i < this._stagesLength.length; i++) {
      const endStageValue = i < this._stagesLength.length - 1 ? this._stageStartValues[i + 1] : 1.0;
      const previousStageLength = i > 0 ? this._stagesLength[i - 1] : 0;

      this._stageSteps.push(
        (endStageValue - this._stageStartValues[i]) / (this._stagesLength[i] - previousStageLength)
      );
    }
  }

  public ProgressiveSceneAction(symbolId: number, _symbolWin: number): Action {
    const stepsPerSymbol =
      this.progressiveBonusDependencyProvider.symbolProgressiveStepsCount.get(symbolId)!;
    if (this.currentStep < this.stepsCount) {
      this.currentStep += stepsPerSymbol;
    }

    const prevValue = this._currentValue;

    this.calculateCurrentStage();
    this.calculateCurrentValue();

    return this.getProgressInterpolateAction(
      prevValue,
      this._currentValue,
      StagedProgressiveBonusActionsProvider._incrementDuration
    );
  }

  public ProgressiveRecovery(
    step: number,
    _currentWin: number,
    _resetWhenCollectingComplete: boolean
  ): void {
    this.currentStep = 0;
    this.currentStep = step + 1;
    this.calculateCurrentStage();
    this.calculateCurrentValue();

    this.setProgress(this._currentValue);
  }

  public ResetAction(): Action {
    this.currentStep = 0;
    this._currentStage = 0;
    this._currentValue = 0.0;
    return new LazyAction(
      () =>
        new ParallelSimpleAction([
          new FunctionAction(() => {
            this._currentStage = 0;
            this._currentValue = 0.0;
          }),
          this.getProgressInterpolateAction(
            this._currentValue,
            0.0,
            StagedProgressiveBonusActionsProvider._incrementDuration
          ),
        ])
    );
  }

  public Reset(): void {
    this.currentStep = 0;
    this._currentStage = 0;
    this._currentValue = 0.0;
    this.setProgress(0.0);
  }

  private getProgressInterpolateAction(
    currentValue: number,
    goalValue: number,
    duration: number
  ): Action {
    const interpolateAction = new LazyAction(() => {
      const result = new InterpolateCopyAction<number>()
        .withInterpolateFunction(lerp)
        .withDuration(duration)
        .withValues(currentValue, goalValue);
      result.valueChange.listen((v: number) => {
        this.setProgress(v);
      });
      return result;
    });

    return new ParallelSimpleAction([interpolateAction, new EmptyAction().withDuration(duration)]);
  }

  private setProgress(value: number): void {
    const progress = this.progressiveScene.findAllByType(ProgressBar)[0] as ProgressBar;
    progress.progress = value;
  }

  private calculateCurrentStage(): void {
    this._currentStage = this._stagesLength.indexOf(
      this._stagesLength.filter((length) => length >= this.currentStep).length > 0
        ? this._stagesLength
            .filter((length) => length >= this.currentStep)
            .reduce((a, b) => Math.min(a, b))
        : this._stagesLength.reduce((a, b) => Math.max(a, b))
    );
  }

  private calculateCurrentValue(): void {
    this._currentValue =
      this._stageStartValues[this._currentStage] +
      (this.currentStep - this._stageStartCollectCount[this._currentStage]) *
        this._stageSteps[this._currentStage];
  }
}
