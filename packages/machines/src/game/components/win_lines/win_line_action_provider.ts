import { BaseWinLineActionProvider } from './base_win_line_action_provider';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { IconAnimationHelper } from '../../../reels_engine/utils/icon_animation_helper';
import { ComponentIndex } from '../../../reels_engine/entities_engine/component_index';
import { GameTimeAccelerationProvider } from '../game_time_acceleration_provider';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse, Line } from '@cgs/common';
import {
  BitmapTextSceneObject,
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
} from '@cgs/syd';
import {
  T_GameTimeAccelerationProvider,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_ResourcesComponent,
} from '../../../type_definitions';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';
import { ResourcesComponent } from '../resources_component';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { PlaySoundAction } from '../../../reels_engine/actions/play_sound_action';
import { Entity } from '../../../reels_engine/entities_engine/entity';

export class WinLineActionProvider extends BaseWinLineActionProvider {
  static processMultiplier(container: Container, value: number): void {
    const multiplierText = value > 1 ? 'x' + value.toString() : '';

    const multipliers = container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .getIcon('multiplier');
    if (multipliers?.length > 0) {
      for (const node of multipliers.filter((m) => m instanceof BitmapTextSceneObject)) {
        (node as BitmapTextSceneObject).text = multiplierText;
      }
    }
  }

  static PlayWinSound(reelsSoundModel: ReelsSoundModel, winLines: Line[]): IntervalAction {
    if (winLines.length) {
      return new EmptyAction().withDuration(0.0);
    }

    return new PlaySoundAction(() => reelsSoundModel.winSound);
  }

  private readonly _reelsEngine: ReelsEngine;
  private readonly _iconAnimationHelper: IconAnimationHelper;
  private readonly _substituteAnimatedIcons: Map<number, number> | null;
  private readonly _drawableIndex: ComponentIndex;
  private readonly _fastSpinsController: GameTimeAccelerationProvider;
  private readonly _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(
    container: Container,
    {
      iconsSoundPriority = null,
      substituteAnimatedIcons = null,
      substituteIconSound = null,
      playIconSoundsWithStateMachine = false,
      pauseBackSoundOnWinLines = false,
      pauseBackSoundIconsIdsList = null,
    }: {
      iconsSoundPriority?: Map<number, number> | null;
      substituteAnimatedIcons?: Map<number, number> | null;
      substituteIconSound?: Map<number, number> | null;
      playIconSoundsWithStateMachine?: boolean;
      pauseBackSoundOnWinLines?: boolean;
      pauseBackSoundIconsIdsList?: number[] | null;
    } = {
      iconsSoundPriority: null,
      substituteAnimatedIcons: null,
      substituteIconSound: null,
      playIconSoundsWithStateMachine: false,
      pauseBackSoundOnWinLines: false,
      pauseBackSoundIconsIdsList: null,
    }
  ) {
    super(
      container,
      iconsSoundPriority,
      substituteIconSound,
      playIconSoundsWithStateMachine,
      pauseBackSoundOnWinLines,
      pauseBackSoundIconsIdsList
    );
    this._fastSpinsController = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._drawableIndex = this._reelsEngine.entityEngine.getComponentIndex(
      ComponentNames.DrawableIndex
    );

    this._substituteAnimatedIcons = substituteAnimatedIcons;
  }

  get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  get iconAnimationHelper(): IconAnimationHelper {
    return this._iconAnimationHelper;
  }
  get substituteAnimatedIcons(): Map<number, number> | null {
    return this._substituteAnimatedIcons;
  }

  get drawableIndex(): ComponentIndex {
    return this._drawableIndex;
  }
  get fastSpinsController(): GameTimeAccelerationProvider {
    return this._fastSpinsController;
  }

  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  createAnimationActions(winLine: Line, animName = 'anim'): void {
    const res: IntervalAction[] = [];

    const allEntities: Entity[] = [];
    let maxIconDuration = 0.0;

    for (let i = 0; i < winLine.iconsIndexes.length; i++) {
      const position = winLine.iconsIndexes[i];
      const entities = this._iconAnimationHelper.getEntities(position);
      for (const entity of entities) {
        allEntities.push(entity);

        const startAction = new FunctionAction(() =>
          this._iconAnimationHelper.startAnimOnEntity(entity, animName)
        );
        const endAction = new FunctionAction(() =>
          this._iconAnimationHelper.stopAnimOnEntity(entity, animName)
        );

        let parallelActionStart: ParallelAction;
        let parallelActionEnd: ParallelAction;

        if (!this.animStates) {
          parallelActionStart = new ParallelAction([startAction]);
          parallelActionEnd = new ParallelAction([endAction]);
        } else {
          const animRenderAct = new FunctionAction(() =>
            this.animStates.stateMachine!.switchToState('icon_' + winLine.symbolId)
          );
          parallelActionStart = new ParallelAction([animRenderAct, startAction]);
          parallelActionEnd = new ParallelAction([
            endAction,
            new FunctionAction(() => this.animStates.stateMachine!.switchToState('default')),
          ]);
        }

        const duration =
          this._fastSpinsController.isFastSpinsActive &&
          (this._gameStateMachine.isAutoSpins || this._gameStateMachine.curResponse.isFreeSpins)
            ? 0.6
            : this._iconAnimationHelper.getEntityAnimDuration(entity, animName);
        maxIconDuration = duration > maxIconDuration ? duration : maxIconDuration;

        const startAnimOnLineAction = new SequenceAction([
          new ParallelAction([parallelActionStart, new EmptyAction().withDuration(duration)]),
          parallelActionEnd,
          new FunctionAction(() => entity.addComponent(ComponentNames.StickyIcon, true)),
        ]);

        res.push(startAnimOnLineAction);
      }
    }
    if (res.length === 0) {
      this.animationDuration = 0.0;
    } else {
      res.forEach((action) => {
        action.withDuration(maxIconDuration);
      });

      this.animationDuration = maxIconDuration;
    }

    this.winLineAnimationAction = new ParallelAction(res);

    this.winLineStopAnimationAction = new SequenceAction([
      new FunctionAction(() =>
        allEntities.forEach((e) => {
          const drawId = e.get(this._drawableIndex) as number;
          if (this._substituteAnimatedIcons && this._substituteAnimatedIcons.has(drawId)) {
            e.addComponent(
              ComponentNames.SubstituteIcon,
              this._substituteAnimatedIcons.get(drawId)
            );
          }
          e.removeComponent(ComponentNames.StickyIcon);
        })
      ),
      new FunctionAction(() => res.forEach((e) => e.end())),
    ]);
  }
}
