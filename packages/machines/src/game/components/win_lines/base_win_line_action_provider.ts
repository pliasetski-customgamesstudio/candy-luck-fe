import { IWinLineActionProvider } from './i_win_line_action_provider';
import { WinMovieSceneProvider } from '../win_movie_scene_provider';
import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  ParamEvent,
  SceneObject,
  SequenceAction,
} from '@cgs/syd';
import { ISlotGameEngine } from '../../../reels_engine/i_slot_game_engine';
import { SlotSession } from '../../common/slot_session';
import { IconsSoundModel } from '../../../reels_engine/icons_sound_model';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { BaseSlotSoundController } from '../../common/base_slot_sound_controller';
import {
  T_BaseSlotSoundController,
  T_GameTimeAccelerationProvider,
  T_IconsSoundModelComponent,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_ISlotSessionProvider,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
  T_WinMovieSceneProvider,
} from '../../../type_definitions';
import { ResourcesComponent } from '../resources_component';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ISlotSessionProvider } from '../interfaces/i_slot_session_provider';
import { IconsSoundModelComponent } from '../icons_sound_model_component';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { Line } from '@cgs/common';
import { GameTimeAccelerationProvider } from '../game_time_acceleration_provider';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';

export class BaseWinLineActionProvider implements IWinLineActionProvider {
  private _winMovieSceneProvider: WinMovieSceneProvider | null;
  private _rootScene: SceneObject;
  private _gameEngine: ISlotGameEngine;
  private _slotSession: SlotSession;
  private _animStates: SceneObject;
  get animStates(): SceneObject {
    return this._animStates;
  }
  private _iconsSoundModel: IconsSoundModel;
  private _reelSoundModel: ReelsSoundModel;
  private _slotSoundController: BaseSlotSoundController;
  private _iconsSoundPriority: Map<number, number> | null;
  private _substituteIconSound: Map<number, number> | null;
  private _playIconSoundsWithStateMachine: boolean;
  private _pauseBackSoundOnWinLines: boolean;
  private _pauseBackSoundIconsIdsList: number[] | null;

  public winLineAnimationAction: IntervalAction | null;
  public winLineStopAnimationAction: IntervalAction | null;
  public winLineRegularSoundAction: IntervalAction | null;
  public winLineWildSoundAction: IntervalAction | null;
  public winLineStopSoundAction: IntervalAction | null;
  public winMovieSceneAction: IntervalAction | null;
  public stopWinMovieSceneAction: IntervalAction | null;

  public winLineSoundPriority: number;
  public animationDuration: number;
  public soundId: number;
  public container: Container;

  constructor(
    container: Container,
    iconsSoundPriority: Map<number, number> | null,
    substituteIconSound: Map<number, number> | null,
    playIconSoundsWithStateMachine: boolean,
    pauseBackSoundOnWinLines: boolean,
    pauseBackSoundIconsIdsList: number[] | null
  ) {
    this.container = container;
    this._iconsSoundPriority = iconsSoundPriority;
    this._substituteIconSound = substituteIconSound;
    this._playIconSoundsWithStateMachine = playIconSoundsWithStateMachine;
    this._pauseBackSoundOnWinLines = pauseBackSoundOnWinLines;
    this._pauseBackSoundIconsIdsList = pauseBackSoundIconsIdsList;

    this._winMovieSceneProvider =
      this.container.resolve<WinMovieSceneProvider>(T_WinMovieSceneProvider);
    this._rootScene = this.container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
    this._gameEngine =
      this.container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
    this._slotSession =
      this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._iconsSoundModel = this.container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this._reelSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._slotSoundController =
      this.container.forceResolve<BaseSlotSoundController>(T_BaseSlotSoundController);
    this._animStates = this._rootScene.findById('statesAnim')!;
  }

  public createActions(winLine: Line, animName: string = 'anim'): void {
    this.winLineAnimationAction = null;
    this.winLineStopAnimationAction = null;
    this.winLineRegularSoundAction = null;
    this.winLineWildSoundAction = null;
    this.winLineStopSoundAction = null;
    this.winMovieSceneAction = null;
    this.stopWinMovieSceneAction = null;

    this.createAnimationActions(winLine, animName);
    this.createSoundActions(winLine);
    this.createWinMovieActions(winLine.winName, animName);
  }

  public createWinMovieActions(winName: string, animName: string = 'anim'): void {
    if (this._winMovieSceneProvider && winName && winName.length > 0) {
      const winMovieScene = this._winMovieSceneProvider.getWinMovieScene(winName);

      if (winMovieScene) {
        const rootNode = winMovieScene.findById('root');
        if (rootNode) {
          const animDuration = (
            rootNode.stateMachine!.findById(animName)?.enterAction as IntervalAction
          ).duration;

          this.winMovieSceneAction = new SequenceAction([
            new FunctionAction(() => this._rootScene.addChild(winMovieScene)),
            new FunctionAction(() => rootNode.initialize()),
            new FunctionAction(() =>
              rootNode.stateMachine!.dispatchEvent(new ParamEvent(animName))
            ),
            new FunctionAction(() => this.pauseBackgroundSound([])),
            new EmptyAction().withDuration(animDuration),
          ]);

          this.stopWinMovieSceneAction = new SequenceAction([
            new FunctionAction(() =>
              rootNode.stateMachine!.dispatchEvent(new ParamEvent('default'))
            ),
            new FunctionAction(() => this.playBackgroundSound()),
            new FunctionAction(() => rootNode.deinitialize()),
            new FunctionAction(() => this._rootScene.removeChild(winMovieScene)),
          ]);
        }
      }
    }
  }

  public createSoundActions(winLine: Line): void {
    const fastSpinsController = this.container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    const gameStateMachine = this.container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    if (
      fastSpinsController.isFastSpinsActive &&
      (gameStateMachine.isAutoSpins || gameStateMachine.curResponse.isFreeSpins) &&
      !this._iconsSoundModel.isFreeFallIconsSoundModel
    ) {
      return;
    }
    if (this._iconsSoundPriority) {
      this.createSoundActionsUsingCustomPriority(winLine);
    } else {
      this.winLineSoundPriority = -1;
      this.createSoundActionsUsingRegularPriority(winLine);
    }
  }

  public createSoundActionsUsingCustomPriority(winLine: Line): void {
    let highestPriority = -1;

    const drawIds: number[] = [];

    for (const position of winLine.iconsIndexes) {
      const iconIds = this._gameEngine.getSoundIconIds(position);
      if (iconIds && iconIds.length > 0) {
        let drawId = iconIds[0];

        if (drawId > 100) {
          drawId = drawId - (drawId % 100);
        }

        drawIds.push(drawId);

        const soundPriorityId = this._iconsSoundPriority?.get(drawId) as number;
        if (
          this._iconsSoundModel.hasSound(drawId) &&
          this._iconsSoundPriority?.has(drawId) &&
          (highestPriority < 0 || (highestPriority >= 0 && soundPriorityId < highestPriority))
        ) {
          highestPriority = this._iconsSoundPriority.get(drawId) as number;
        }
      }
    }

    const soundIconIds: number[] = [];

    this._iconsSoundPriority?.forEach((value, key) => {
      if (drawIds.includes(key) && value === highestPriority) {
        soundIconIds.push(key);
      }
    });

    this.winLineSoundPriority = highestPriority;
    this.winLineRegularSoundAction = null;
    this.winLineWildSoundAction = null;
    this.winLineStopSoundAction = null;

    if (soundIconIds.length > 0) {
      const playSoundActions = soundIconIds.map(
        (id) => new FunctionAction(() => this.playIconSound(id), false)
      );
      playSoundActions.push(new FunctionAction(() => this.pauseBackgroundSound(soundIconIds)));
      this.winLineRegularSoundAction = new ParallelAction(playSoundActions);

      const stopSoundActions = soundIconIds.map(
        (id) => new FunctionAction(() => this.stopIconSound(id), false)
      );
      stopSoundActions.push(new FunctionAction(() => this.playBackgroundSound()));
      this.winLineStopSoundAction = new ParallelAction(stopSoundActions);
    }
  }

  public substituteSoundId(sourceId: number): number {
    return this._substituteIconSound && this._substituteIconSound.has(sourceId)
      ? (this._substituteIconSound.get(sourceId) as number)
      : sourceId;
  }

  public createSoundActionsUsingRegularPriority(winLine: Line): void {
    const _wildSymbolIds = this._slotSession.machineInfo.symbols
      .filter((s) => s.type === 'wild' || s.type === 'alternativeWild')
      .map((s) => s.id);

    for (const position of winLine.iconsIndexes) {
      const iconIds = this._gameEngine.getSoundIconIds(position);

      if (iconIds && iconIds.length > 0) {
        const drawId = winLine.symbolId!;

        if (this._iconsSoundModel.hasSound(drawId)) {
          const soundAction = new SequenceAction([
            new FunctionAction(() => this.pauseBackgroundSound([drawId])),
            new FunctionAction(() => this.playIconSound(drawId), false),
          ]);
          this.winLineStopSoundAction = new SequenceAction([
            new FunctionAction(() => this.playBackgroundSound()),
            new FunctionAction(() => this.stopIconSound(drawId), false),
          ]);

          this.soundId = drawId;

          this.winLineRegularSoundAction = soundAction;
          break;
        } else {
          const soundAction = new SequenceAction([
            new FunctionAction(() => this.pauseBackgroundSound([drawId])),
            new FunctionAction(() => this._reelSoundModel.winSound.play(), false),
          ]);

          this.winLineStopSoundAction = new SequenceAction([
            new FunctionAction(() => this.playBackgroundSound()),
            new FunctionAction(() => this._reelSoundModel.winSound.stop(), false),
          ]);

          this.soundId = drawId;

          this.winLineRegularSoundAction = soundAction;
        }
      }
    }
  }

  public createAnimationActions(_winLine: Line, _animName: string = 'anim'): void {}

  public playIconSound(iconId: number): void {
    iconId = this.substituteSoundId(iconId);
    if (this._playIconSoundsWithStateMachine) {
      const soundNodes = this._iconsSoundModel.getIconSoundNodes(iconId);
      if (soundNodes && soundNodes.length > 0) {
        const node = soundNodes.find((n) => n.stateMachine && n.stateMachine.isActive('default'));

        if (node) {
          node.stateMachine!.switchToState('sound');
        }
      }
    } else {
      this._iconsSoundModel.getIconSound(iconId).stop();
      this._iconsSoundModel.getIconSound(iconId).play();
    }
  }

  public stopIconSound(iconId: number): void {
    if (!this._playIconSoundsWithStateMachine) {
      iconId = this.substituteSoundId(iconId);
      this._iconsSoundModel.getIconSound(iconId).stop();
    }
  }

  public pauseBackgroundSound(drawIds: number[]): void {
    if (
      this._pauseBackSoundOnWinLines &&
      this._slotSoundController &&
      (!this._pauseBackSoundIconsIdsList ||
        !drawIds ||
        this._pauseBackSoundIconsIdsList.some((x) => drawIds.includes(x)))
    ) {
      this._slotSoundController.pauseBackgroundSound();
    }
  }

  public playBackgroundSound(): void {
    if (this._pauseBackSoundOnWinLines && this._slotSoundController) {
      this._slotSoundController.playBackgroundSound();
    }
  }
}
