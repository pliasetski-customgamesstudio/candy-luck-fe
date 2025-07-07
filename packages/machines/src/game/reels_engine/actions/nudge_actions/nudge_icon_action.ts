import {
  Action,
  Container,
  EmptyAction,
  FunctionAction,
  ParallelSimpleAction,
  SequenceSimpleAction,
  Vector2,
} from '@cgs/syd';
import { BuildAction, LazyAction } from '@cgs/shared';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { ReelsEngine } from '../../../../reels_engine/reels_engine';
import { IReelsConfig } from '../../../../reels_engine/i_reels_config';
import { IReelsStateProvider } from '../../../../reels_engine/game_components_providers/i_reels_state_provider';
import { PositionInterpolateSystem } from '../../../../reels_engine/systems/position_interpolate_system';
import { INudgeApi, NudgeDirection, NudgeGroup } from './i_nudge_api';
import { IconAnimationHelper } from '../../../../reels_engine/utils/icon_animation_helper';
import { IconEnumerator } from '../../../../reels_engine/icon_enumerator';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IReelsConfigProvider } from '../../../components/interfaces/i_reels_config_provider';
import {
  T_IconEnumeratorComponent,
  T_IGameStateMachineProvider,
  T_IReelsConfigProvider,
  T_IReelsStateProvider,
  T_ISlotGameEngineProvider,
} from '../../../../type_definitions';
import { IconEnumeratorComponent } from '../../../components/icon_enumerator_component';
import { ConditionAction } from '../../../components/win_lines/complex_win_line_actions/condition_action';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { LongStoppingIconEnumerator } from '../../../../reels_engine/long_stopping_icons_enumerator';
import { LongIconEnumerator } from '../../../../reels_engine/long_icon_enumerator';

export class NudgeIconAction extends BuildAction {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelEngine: ReelsEngine;
  private _container: Container;
  private _reelsConfig: IReelsConfig;
  private _reelsStateProvider: IReelsStateProvider;
  private readonly _positionInterpolateSystem: PositionInterpolateSystem;
  private readonly _nudgeApi: INudgeApi;
  private _iconAnimationHelper: IconAnimationHelper;
  private _iconsEnumerator: IconEnumerator;

  constructor(
    container: Container,
    positionInterpolateSystem: PositionInterpolateSystem,
    nudgeApi: INudgeApi,
    duration: number
  ) {
    super();
    this._container = container;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._reelsConfig =
      container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    this._reelsStateProvider = container.forceResolve<IReelsStateProvider>(T_IReelsStateProvider);
    this._iconAnimationHelper = this._reelEngine.iconAnimationHelper;
    this._iconsEnumerator =
      container.forceResolve<IconEnumeratorComponent>(T_IconEnumeratorComponent).iconsEnumerator;
    this._positionInterpolateSystem = positionInterpolateSystem;
    this._nudgeApi = nudgeApi;
    this.withDuration(duration);
  }

  public buildAction(): Action {
    if (!this._reelsStateProvider.reelsState) {
      return new EmptyAction().withDurationMs(0);
    }

    const _specialSymbolGroups = this._reelsStateProvider.reelsState.specialSymbolGroups;
    const resultViewReels = this._reelsStateProvider.reelsState.viewReels;
    const actions: Action[] = [];
    if (this._nudgeApi.isNugdeRequied) {
      const nudgeGroups = this._nudgeApi.getNudgeGroups();
      for (const nudgeGroup of nudgeGroups) {
        const reelIndex = nudgeGroup.nudgeReel;
        const drawIndex = this.getDrawId(reelIndex, nudgeGroup.nudgeDirection);

        for (let i = 0; i < this._reelsStateProvider.reelsState.viewReels[reelIndex].length; i++) {
          this._reelsStateProvider.reelsState.viewReels[reelIndex][i] = drawIndex + i;
        }

        const symbolActions: Action[] = [];

        const closureSymbol = nudgeGroup;

        symbolActions.push(
          new FunctionAction(() =>
            this._reelEngine.iconsEnumerator.setWinTapes(reelIndex, resultViewReels[reelIndex])
          )
        );
        symbolActions.push(
          new FunctionAction(() =>
            this._reelEngine.moveReel(
              reelIndex,
              this.calculateDestinationPosition(closureSymbol),
              this.duration
            )
          )
        );
        symbolActions.push(new EmptyAction().withDuration(this.duration));
        symbolActions.push(
          new LazyAction(
            () => new ConditionAction(() => !this._positionInterpolateSystem.isActive())
          )
        );
        symbolActions.push(
          new LazyAction(() => {
            const startPosition = this.getWildDestination(
              closureSymbol.nudgeDirection,
              closureSymbol.nudgeCount
            );
            const updateEntities: Entity[] = [];
            for (let i = startPosition; i < startPosition + this._reelsConfig.lineCount; i++) {
              const list = this._reelEngine.getReelStopedEntities(reelIndex, i);
              updateEntities.push(list[0]);
            }
            for (let i = 0; i < this._reelsConfig.lineCount; i++) {
              const entityToUpdate = updateEntities[i];
              entityToUpdate.set(
                this._reelEngine.entityEngine.getComponentIndex(ComponentNames.LineIndex),
                i
              );
              this.updateEntityCacheFromReelLine(reelIndex, i, entityToUpdate);
            }

            if (this._iconsEnumerator instanceof LongStoppingIconEnumerator) {
              const stoppedEnumerator = this._iconsEnumerator as LongStoppingIconEnumerator;
              stoppedEnumerator.cleareMapedIcons(reelIndex);
            }
            if (this._iconsEnumerator instanceof LongIconEnumerator) {
              const longIconEnumerator = this._iconsEnumerator as LongIconEnumerator;
              longIconEnumerator.cleareMapedIcons(reelIndex);
            }

            return new EmptyAction();
          })
        );

        actions.push(new SequenceSimpleAction(symbolActions));
      }
    }
    return new ParallelSimpleAction(actions);
  }

  private updateEntityCacheFromReelLine(reel: number, line: number, entity: Entity): void {
    this._reelEngine.entityCacheHolder.replaceEntities(reel, line, [entity]);
    this._reelEngine.entityCacheHolder.replaceAnimationEntities(reel, line, [entity]);
    this._reelEngine.entityCacheHolder.replaceSoundEntities(reel, line, [entity]);
  }

  private updateEntityCache(reel: number, entity: Entity): void {
    for (let line = 0; line < this._reelsConfig.lineCount; line++) {
      this._reelEngine.entityCacheHolder.replaceEntities(reel, line, [entity]);
    }
  }

  private getWildDestination(nudgeDirection: NudgeDirection, moveCount: number): number {
    switch (nudgeDirection) {
      case NudgeDirection.Up:
        return moveCount;
      case NudgeDirection.Down:
        return -moveCount;
      default:
        throw new Error('Directions other than Up and Down are not supported');
    }
  }

  private getWildStartPos(
    reel: number,
    nudgeDirection: NudgeDirection,
    _moveCount: number
  ): number {
    switch (nudgeDirection) {
      case NudgeDirection.Up:
        return this._reelEngine.getPosition(reel, this._reelEngine.ReelConfig.lineCount - 1);
      case NudgeDirection.Down:
        return this._reelEngine.getPosition(reel, 0);
      default:
        return 0;
    }
  }

  private getDrawId(reel: number, nudgeDirection: NudgeDirection): number {
    const viewReels = this._reelsStateProvider.reelsState.viewReels;
    const originalDraw =
      nudgeDirection === NudgeDirection.Down
        ? viewReels[reel][0]
        : viewReels[reel][viewReels.length - 1];
    return Math.floor(originalDraw / 100) * 100;
  }

  private calculateDestinationPosition(nudgeGroup: NudgeGroup): Vector2 {
    const _reelIndex = nudgeGroup.nudgeReel;
    const count = nudgeGroup.nudgeCount;
    const reelDirection = nudgeGroup.nudgeDirection === NudgeDirection.Up ? -1 : 1;
    return new Vector2(0.0, reelDirection * count * this._reelEngine.ReelConfig.symbolSize.y);
  }
}
