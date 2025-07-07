import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { IReelsConfig } from '../../reels_engine/i_reels_config';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import { IReelsStateProvider } from '../../reels_engine/game_components_providers/i_reels_state_provider';
import { PositionInterpolateSystem } from '../../reels_engine/systems/position_interpolate_system';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameStateMachineProvider,
  T_IReelsConfigProvider,
  T_IReelsStateProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { StopSoundAction } from '../../reels_engine/actions/stop_sound_action';
import { PlaySoundAction } from '../../reels_engine/actions/play_sound_action';
import { SpecialSymbolGroup } from '@cgs/common';
import { Entity } from '../../reels_engine/entities_engine/entity';

export class MovingWildAnimationProvider {
  private _reelsEngine: ReelsEngine;
  private _reelsConfig: IReelsConfig;
  private _reelsSoundModel: ReelsSoundModel;
  private _iconAnimationHelper: IconAnimationHelper;
  private _reelsStateProvider: IReelsStateProvider;
  private _marker: string;
  private _movingWildSoundName: string;
  private static readonly _moveAnimDuration: number = 0.5;

  private _positionInterpolateSystem: PositionInterpolateSystem;

  constructor(container: Container, marker: string, movingWildSoundName: string) {
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._reelsConfig =
      container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._reelsStateProvider = container.forceResolve(T_IReelsStateProvider);
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._marker = marker;
    this._movingWildSoundName = movingWildSoundName;

    gameStateMachine.stop.addLazyAnimationToBegin(() => this.buildMovingWildAction());

    this.createSystems();
  }

  private buildMovingWildAction(): IntervalAction {
    if (!this._reelsStateProvider.reelsState) {
      return new EmptyAction();
    }

    const actions: IntervalAction[] = [];
    actions.push(new EmptyAction().withDuration(0.0));
    const specialSymbolGroups = this._reelsStateProvider.reelsState.specialSymbolGroups;
    const resultViewReels = this._reelsStateProvider.reelsState.viewReels;

    const symbols = specialSymbolGroups
      ? specialSymbolGroups.filter((p) => p.type == this._marker).slice()
      : null;

    if (symbols) {
      for (const symbol of symbols) {
        if (this.positionShouldChange(symbol.positions!, symbol.previousPositions!)) {
          const pos = symbol.previousPositions![0];
          const reelIndex = this._iconAnimationHelper.getReelIndex(pos);
          const drawIndex = this._iconAnimationHelper.getDrawIndexes(pos)[0];

          for (
            let i = 0;
            i < this._reelsStateProvider.reelsState.viewReels[reelIndex].length;
            i++
          ) {
            this._reelsStateProvider.reelsState.viewReels[reelIndex][i] = drawIndex + i;
          }

          const symbolActions: IntervalAction[] = [];
          const soundActions: IntervalAction[] = [];

          const closureSymbol = symbol;
          symbolActions.push(
            new FunctionAction(() =>
              this._reelsEngine.iconsEnumerator.setWinTapes(reelIndex, resultViewReels[reelIndex])
            )
          );
          symbolActions.push(
            new FunctionAction(() =>
              this._reelsEngine.moveReel(
                reelIndex,
                this.calculateDestinationPosition(closureSymbol),
                MovingWildAnimationProvider._moveAnimDuration
              )
            )
          );
          symbolActions.push(
            new EmptyAction().withDuration(MovingWildAnimationProvider._moveAnimDuration)
          );
          symbolActions.push(
            new FunctionAction(() =>
              this.updateEntityCache(
                reelIndex,
                this._iconAnimationHelper.getEntities(closureSymbol.previousPositions![0])[0]
              )
            )
          );

          soundActions.push(
            new StopSoundAction(this._reelsSoundModel.getSoundByName(this._movingWildSoundName))
          );
          soundActions.push(
            PlaySoundAction.withSound(
              this._reelsSoundModel.getSoundByName(this._movingWildSoundName)
            )
          );

          actions.push(
            new ParallelAction([
              new SequenceAction(symbolActions),
              new SequenceAction(soundActions),
            ])
          );
        }
      }
    }

    return new ParallelAction(actions);
  }

  private createSystems(): void {
    this._positionInterpolateSystem = new PositionInterpolateSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      this._reelsEngine.internalConfig
    ).withInitialize() as PositionInterpolateSystem;
    this._positionInterpolateSystem.updateOrder = 501;

    this._positionInterpolateSystem.register();
  }

  private updateEntityCache(reel: number, entity: Entity): void {
    for (let line = 0; line < this._reelsConfig.lineCount; line++) {
      this._reelsEngine.entityCacheHolder.replaceEntities(reel, line, [entity]);
    }
  }

  private calculateDestinationPosition(symbolGroup: SpecialSymbolGroup): Vector2 {
    const count = symbolGroup.positions!.length - symbolGroup.previousPositions!.length;
    const prevPos = symbolGroup.previousPositions![0];
    const lineIndex = this._iconAnimationHelper.getLineIndex(prevPos);
    const reelDirection = lineIndex == 0 ? 1 : -1;

    return new Vector2(0.0, reelDirection * count * this._reelsConfig.symbolSize.y);
  }

  private positionShouldChange(positions: number[], previousPositions: number[]): boolean {
    if (positions.length == previousPositions.length) {
      for (let i = 0; i < positions.length; i++) {
        if (positions[i] != previousPositions[i]) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
}
