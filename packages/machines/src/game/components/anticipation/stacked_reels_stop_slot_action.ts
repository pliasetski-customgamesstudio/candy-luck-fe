import { BuildAction, StringUtils } from '@cgs/shared';
import { SlotSession } from '../../common/slot_session';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { IconEnumerator } from '../../../reels_engine/icon_enumerator';
import { SlotParams } from '../../../reels_engine/slot_params';
import {
  ReelsEngineGameConfig,
  StackedReelsStopSlotActionConfig,
} from '../../../reels_engine/game_config/game_config';
import { ISpinResponse, Line, ReelWinPosition } from '@cgs/common';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import {
  Action,
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelSimpleAction,
  Random,
  SceneObject,
  SequenceSimpleAction,
  Vector2,
} from '@cgs/syd';
import { ISlotSessionProvider } from '../interfaces/i_slot_session_provider';
import {
  T_IconEnumeratorComponent,
  T_IGameConfigProvider,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_ISlotSessionProvider,
  T_StackedReelsStopSlotActionConfig,
} from '../../../type_definitions';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconEnumeratorComponent } from '../icon_enumerator_component';
import { IGameParams } from '../../../reels_engine/interfaces/i_game_params';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { AbstractSpinConfig } from '../../../reels_engine/game_config/abstract_spin_config';
import { AbstractAnticipationConfig } from '../../../reels_engine/game_config/abstract_anticipation_config';
import { ConditionAction } from '../win_lines/complex_win_line_actions/condition_action';
import { StopSoundAction } from '../../../reels_engine/actions/stop_sound_action';
import { PlaySoundAction } from '../../../reels_engine/actions/play_sound_action';

export class StackedReelsStopSlotAction extends BuildAction {
  private _slotSession: SlotSession;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsEngine: ReelsEngine;
  private _iconEnumerator: IconEnumerator;
  private _gameParams: SlotParams;
  private _gameConfig: ReelsEngineGameConfig;
  private _spinConfig: AbstractSpinConfig;
  private _winTapes: number[][];
  private _winLines: Line[];
  private _winPositions: ReelWinPosition[];
  private _spinStopDelay: number;
  private _reelSounds: ReelsSoundModel;
  private _container: Container;
  private _stopReelsSoundImmediately: boolean;
  private _anticipationConfig: AbstractAnticipationConfig;
  private readonly _useSounds: boolean;

  private _random: Random = new Random();
  private _stackedFeatureSceneObject: SceneObject;
  private _selectFeatureIconSceneObjects: SceneObject[];
  private _setIconsSceneObject: SceneObject | null;
  private _straightStatePattern: string;
  private _backStatePattern: string;
  private _featureSound: string;
  private _slowDownReelsSound: string;
  private _setIconSound: string;
  private _accelerationTimeDivisor: number;

  private _showStacksHitRate: number = 0.65;
  private _accelerateIfWinImpossible: number = 0.2;
  private _setUpDistribution: number = 0.6;

  constructor(
    container: Container,
    winTapes: number[][],
    winLines: Line[],
    winPositions: ReelWinPosition[],
    stackedFeatureSceneObject: SceneObject,
    selectFeatureIconSceneObjects: SceneObject[],
    setIconsSceneObject: SceneObject | null,
    straightStatePattern: string,
    backStatePattern: string,
    featureSound: string,
    slowDownReelsSound: string,
    setIconSound: string,
    spinStopDelay: number,
    reelSounds: ReelsSoundModel,
    stopReelsSoundImmediately: boolean,
    useSounds: boolean,
    accelerationTimeDivisor: number = 20.0
  ) {
    super();

    this._winTapes = winTapes;
    this._winLines = winLines;
    this._winPositions = winPositions;
    this._stackedFeatureSceneObject = stackedFeatureSceneObject;
    this._selectFeatureIconSceneObjects = selectFeatureIconSceneObjects;
    this._setIconsSceneObject = setIconsSceneObject;
    this._straightStatePattern = straightStatePattern;
    this._backStatePattern = backStatePattern;
    this._featureSound = featureSound;
    this._slowDownReelsSound = slowDownReelsSound;
    this._setIconSound = setIconSound;
    this._spinStopDelay = spinStopDelay;
    this._reelSounds = reelSounds;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    this._accelerationTimeDivisor = accelerationTimeDivisor;

    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._iconEnumerator =
      container.forceResolve<IconEnumeratorComponent>(T_IconEnumeratorComponent).iconsEnumerator;
    this._gameParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    this._gameConfig = container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider)
      .gameConfig as ReelsEngineGameConfig;
    this._spinConfig = this._gameConfig.regularSpinConfig;
    this._anticipationConfig =
      container.forceResolve<IGameConfigProvider>(
        T_IGameConfigProvider
      ).gameConfig.anticipationConfig;

    this.initProbabilityParameters();
  }

  private initProbabilityParameters(): void {
    const config = this._gameConfig.getSlotFeatureConfig(
      T_StackedReelsStopSlotActionConfig
    ) as StackedReelsStopSlotActionConfig;
    if (config) {
      this._showStacksHitRate =
        typeof config.showStacksHitRate === 'number'
          ? config.showStacksHitRate
          : this._showStacksHitRate;
      this._accelerateIfWinImpossible =
        typeof config.accelerateIfWinImpossible === 'number'
          ? config.accelerateIfWinImpossible
          : this._accelerateIfWinImpossible;
      this._setUpDistribution =
        typeof config.setUpDistribution === 'number'
          ? config.setUpDistribution
          : this._setUpDistribution;
    }
  }

  public beginImpl(): void {
    this._reelsEngine.slotsStoped.first.then((s) => this.onSlotStopped(s));
    super.beginImpl();
  }

  public buildAction(): Action {
    const iconId =
      this._winTapes[0][0] > 100 ? Math.floor(this._winTapes[0][0] / 100) : this._winTapes[0][0];

    const isStartReelStacked = this.checkStackedIconsOnReel(0, iconId);
    const straightWayReplacedReels: number[] = [];
    const backWayReplacedReels: number[] = [];
    function* range(n: number) {
      for (let i = 0; i < n; i++) {
        yield i;
      }
    }
    let notStackedReels = Array.from(range(this._reelsEngine.ReelConfig.reelCount));

    const stopActions: Action[] = [];

    const totalStackedReels = isStartReelStacked
      ? this.getStackedReels(
          iconId,
          Array.from(range(this._reelsEngine.ReelConfig.reelCount)).filter((_, i) => i !== 0)
        ).filter(() => this._random.nextDouble() < this._showStacksHitRate)
      : [];

    let featureActionStarted = false;

    if (
      isStartReelStacked &&
      this._stackedFeatureSceneObject &&
      this._stackedFeatureSceneObject.stateMachine &&
      totalStackedReels.length > 0
    ) {
      const stackedReels = totalStackedReels.map((r) => r);
      this.distributeStackedReels(stackedReels, straightWayReplacedReels, backWayReplacedReels);
      notStackedReels = notStackedReels.filter((r) => !stackedReels.includes(r) && r !== 0);
      const featureSound = this._reelSounds.getSoundByName(this._featureSound);
      featureActionStarted = true;

      const straightActions: Action[] = [
        this.buildStopReelAction(0),
        new ConditionAction(() => this._reelsEngine.isReelStopped(0)),
        new StopSoundAction(featureSound),
        PlaySoundAction.withSound(featureSound),
        this.buildSwitchFeatureIconAction(iconId),
      ];

      for (let reel = 1; reel < this._reelsEngine.ReelConfig.reelCount; reel++) {
        const reelActions: Action[] = [];

        const reelCopy = reel;
        reelActions.push(
          new ParallelSimpleAction([
            new FunctionAction(
              () =>
                this._stackedFeatureSceneObject.stateMachine!.switchToState(
                  this.getFeatureStraightStateName(reelCopy)
                ),
              false
            ),
            new EmptyAction().withDuration(this.getFeatureStraightStepDuration(reel)),
          ])
        );

        if (straightWayReplacedReels.includes(reel)) {
          reelActions.push(
            new ParallelSimpleAction([this.buildStopReelAction(reel), this.buildSetIconsAction()])
          );
        }

        straightActions.push(new SequenceSimpleAction(reelActions));
      }

      const backActions: Action[] = [];
      for (let reel = this._reelsEngine.ReelConfig.reelCount - 2; reel >= 0; reel--) {
        const reelActions: Action[] = [];

        const reelCopy = reel;
        reelActions.push(
          new ParallelSimpleAction([
            new FunctionAction(
              () =>
                this._stackedFeatureSceneObject.stateMachine!.switchToState(
                  this.getFeatureBackStateName(reelCopy)
                ),
              false
            ),
            new EmptyAction().withDuration(this.getFeatureBackStepDuration(reel)),
          ])
        );

        if (backWayReplacedReels.includes(reel)) {
          reelActions.push(
            new ParallelSimpleAction([this.buildStopReelAction(reel), this.buildSetIconsAction()])
          );
        }

        backActions.push(new SequenceSimpleAction(reelActions));
      }
      backActions.push(
        new FunctionAction(() =>
          this._stackedFeatureSceneObject.stateMachine!.switchToState('default')
        )
      );

      stopActions.push(new SequenceSimpleAction(straightActions));
      stopActions.push(new SequenceSimpleAction(backActions));
      stopActions.push(new StopSoundAction(featureSound));
    }

    const stopNotStackedReelActions: Action[] = [];
    const slowDownSound = this._reelSounds.getSoundByName(this._slowDownReelsSound);
    let slowDownSoundAdded = false;
    for (const reel of notStackedReels) {
      const reelActions: Action[] = [];
      if (
        featureActionStarted &&
        this.isWinPossible(reel, iconId) &&
        totalStackedReels.length > 0 &&
        (this._gameStateMachine.curResponse.totalWin > 0 ||
          this._random.nextDouble() < this._accelerateIfWinImpossible)
      ) {
        const reelCopy = reel;
        const anticipationIconId = this._winTapes[reelCopy]
          .map((i) => (i > 100 ? Math.floor(i / 100) : i))
          .includes(iconId)
          ? iconId
          : this._slotSession.machineInfo.symbols.find(
              (s) => s.type === 'wild' || s.type === 'alternativeWild'
            )!.id;

        const longIcon =
          this._gameParams.longIcons &&
          this._gameParams.longIcons.filter((d) => d.iconIndex === anticipationIconId).length > 0
            ? this._gameParams.longIcons.find((d) => d.iconIndex === anticipationIconId)
            : null;

        const iconLength = longIcon ? longIcon.iconIndex : 1;

        reelActions.push(
          new SequenceSimpleAction([
            new FunctionAction(() => {
              if (!slowDownSoundAdded) {
                slowDownSound.stop();
                slowDownSound.play();
                slowDownSoundAdded = true;
              }

              this._iconEnumerator.setFeatureReel(
                Array.from({ length: iconLength }).map((_, i) =>
                  iconLength > 1 ? anticipationIconId * 100 + i : anticipationIconId + i
                )
              );
              this._iconEnumerator.setCurrentFeatureReelIndexes([reelCopy]);
            }, false),
            this.accelerateAction(reel),
            new EmptyAction().withDuration(this._anticipationConfig.continueDurationAnticipating),
          ])
        );
      }

      reelActions.push(
        new SequenceSimpleAction([
          this.buildStopReelAction(reel),
          new EmptyAction().withDuration(this._spinStopDelay),
          new FunctionAction(() => this._iconEnumerator.setCurrentFeatureReelIndexes([])),
        ])
      );

      stopNotStackedReelActions.push(new SequenceSimpleAction(reelActions));
    }

    if (stopNotStackedReelActions.length > 0) {
      stopActions.push(new SequenceSimpleAction(stopNotStackedReelActions));
    }

    stopActions.push(new ConditionAction(() => this._reelsEngine.isSlotStopped));

    if (slowDownSoundAdded) {
      stopActions.push(new StopSoundAction(slowDownSound));
    }

    return new SequenceSimpleAction(stopActions);
  }

  private buildSwitchFeatureIconAction(stackedIconId: number): Action {
    return new FunctionAction(() => {
      for (const selectFeatureIconSceneObject of this._selectFeatureIconSceneObjects) {
        if (selectFeatureIconSceneObject && selectFeatureIconSceneObject.stateMachine) {
          selectFeatureIconSceneObject.stateMachine.switchToState('default');
          selectFeatureIconSceneObject.stateMachine.switchToState(
            StringUtils.format('icon_{0}', [stackedIconId.toString()])
          );
        }
      }
    });
  }

  private accelerateAction(reel: number): Action {
    return new FunctionAction(
      () =>
        this._reelsEngine.accelerateReel(
          reel,
          new Vector2(0.0, this._spinConfig.spinSpeed * this._spinConfig.directions[reel]),
          new Vector2(
            0.0,
            this._anticipationConfig.slowDownAnticipatedSpinSpeed *
              this._spinConfig.directions[reel]
          ),
          this._anticipationConfig.continueDurationAnticipating / this._accelerationTimeDivisor
        ),
      false
    );
  }

  private isWinPossible(reel: number, stackedIcon: number): boolean {
    const winIconIds = this._slotSession.machineInfo.symbols
      .filter((s) => s.type === 'wild' || s.type === 'alternativeWild')
      .map((s) => s.id);

    winIconIds.push(stackedIcon);

    for (let i = 0; i < reel; i++) {
      if (
        this._winTapes[i]
          .map((id) => (id > 100 ? Math.floor(id / 100) : id))
          .filter((i) => winIconIds.includes(i)).length === 0
      ) {
        return false;
      }
    }

    return true;
  }

  private distributeStackedReels(
    stackedReels: number[],
    straightWayReplacedReels: number[],
    backWayReplacedReels: number[]
  ): void {
    const lastReel = this._reelsEngine.ReelConfig.reelCount - 1;

    for (const reel of stackedReels) {
      const rnd = this._random.nextDouble();

      if (rnd < this._setUpDistribution || reel === lastReel) {
        straightWayReplacedReels.push(reel);
      }
      this._setUpDistribution = 1 - this._setUpDistribution;
    }

    backWayReplacedReels.push(...stackedReels.filter((r) => !straightWayReplacedReels.includes(r)));
  }

  private getStackedReels(iconId: number, reels: number[]): number[] {
    return reels.filter((r) => this.checkStackedIconsOnReel(r, iconId));
  }

  private checkStackedIconsOnReel(reel: number, stackedIconId: number): boolean {
    for (let i = 1; i < this._winTapes[reel].length; i++) {
      const upIconId =
        this._winTapes[reel][i - 1] > 100
          ? Math.floor(this._winTapes[reel][i - 1] / 100)
          : this._winTapes[reel][i - 1];
      if (upIconId !== stackedIconId) {
        return false;
      }

      const iconId =
        this._winTapes[reel][i] > 100
          ? Math.floor(this._winTapes[reel][i] / 100)
          : this._winTapes[reel][i];
      if (iconId !== upIconId) {
        return false;
      }
    }

    return true;
  }

  private buildSetIconsAction(): Action {
    if (!this._setIconsSceneObject || !this._setIconsSceneObject.stateMachine) {
      return new EmptyAction();
    }

    const setIconSound = this._reelSounds.getSoundByName(this._setIconSound);
    const setState = this._setIconsSceneObject.stateMachine.findById('anim');
    return setState
      ? new SequenceSimpleAction([
          new FunctionAction(() => {
            this._setIconsSceneObject!.stateMachine!.switchToState('empty');
            setIconSound.stop();
            setIconSound.play();
          }, false),
          setState.enterAction,
        ])
      : new EmptyAction();
  }

  private getFeatureStraightStateName(reel: number): string {
    return StringUtils.format(this._straightStatePattern, [reel.toString()]);
  }

  private getFeatureBackStateName(reel: number): string {
    return StringUtils.format(this._backStatePattern, [reel.toString()]);
  }

  private getFeatureStraightStepDuration(reel: number): number {
    if (!this._stackedFeatureSceneObject || !this._stackedFeatureSceneObject.stateMachine) {
      return 0.0;
    }

    const state = this._stackedFeatureSceneObject.stateMachine.findById(
      this.getFeatureStraightStateName(reel)
    );
    return state ? (state.enterAction as IntervalAction).duration : 0.0;
  }

  private getFeatureBackStepDuration(reel: number): number {
    if (!this._stackedFeatureSceneObject || !this._stackedFeatureSceneObject.stateMachine) {
      return 0.0;
    }

    const state = this._stackedFeatureSceneObject.stateMachine.findById(
      this.getFeatureBackStateName(reel)
    );
    return state ? (state.enterAction as IntervalAction).duration : 0.0;
  }

  private buildStopReelAction(reel: number): IntervalAction {
    return new FunctionAction(() => this._reelsEngine.stop(reel, this._winTapes[reel]));
  }

  private onSlotStopped = (_param: any): void => {
    if (this._useSounds) {
      if (
        this._stopReelsSoundImmediately ||
        this._winLines.length > 0 ||
        (this._winPositions && this._winPositions.length > 0)
      ) {
        this._reelSounds.startSpinSound.GoToState('stop_sound');
      } else {
        this._reelSounds.startSpinSound.GoToState('fade_out');
      }
    }
  };
}
