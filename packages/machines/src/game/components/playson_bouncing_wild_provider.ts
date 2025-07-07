import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import {
  T_IconModelComponent,
  T_IconsSoundModelComponent,
  T_ISlotGameEngineProvider,
} from '../../type_definitions';
import { T_IGameStateMachineProvider } from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IconModelComponent } from './icon_model_component';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import { RemoveComponentsSystem } from '../../reels_engine/systems/remove_components_system';
import { BounceWildSystem } from '../../reels_engine/systems/bounce_wild_system';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';
import { IIconModel } from '../../reels_engine/i_icon_model';
import { Entity } from '../../reels_engine/entities_engine/entity';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';

export class PlaysonBouncingWildProvider {
  private _drawableAnimationIndexes: number[];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _iconModel: IIconModel;
  private _iconsSoundModel: IconsSoundModel;
  private _reelsEngine: ReelsEngine;
  private _iconAnimationHelper: any;

  private _startMarker: string;
  private _bouncingMarker: string;
  private _multipliedMarker: string;

  constructor(
    container: Container,
    startMarker: string,
    bouncingMarker: string,
    multipliedMarker: string,
    drawableAnimationIndexes: number[]
  ) {
    console.log('load ' + this.constructor.name);
    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;

    this._createSystems(bouncingMarker);

    this._gameStateMachine.stop.addLazyAnimationToBegin(() =>
      this.WildStopAction(this._gameStateMachine.curResponse)
    );
    this._gameStateMachine.stopping.addLazyAnimationToBegin(() =>
      this.WildAction(this._gameStateMachine.curResponse, true)
    );
    this._gameStateMachine.freeSpinsRecovery.addLazyAnimationToBegin(() =>
      this.WildAction(this._gameStateMachine.curResponse, false)
    );
    this._gameStateMachine.beginFreeSpins.addLazyAnimationToBegin(() =>
      this.WildBeginFreeSpinsAction(this._gameStateMachine.curResponse)
    );

    this._gameStateMachine.endFreeSpins.leaved.listen((_) => {
      this._reelsEngine.RemoveEntitiesByFilter([this._bouncingMarker]);
    });
  }

  private _createSystems(marker: string) {
    const frozenWildSystem = new RemoveComponentsSystem(this._reelsEngine.entityEngine, marker, [
      ComponentNames.AccelerationInterpolate,
      ComponentNames.BrakingCalculationInfo,
    ]);
    frozenWildSystem.register();

    const bounceWildSystem = new BounceWildSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig
    );
    bounceWildSystem.updateOrder = 850;
    bounceWildSystem.register();

    const updateEntitySystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(marker)],
      UpdateEntityCacheMode.Replace,
      UpdateEntityCacheMode.Replace
    ).withInitialize();
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();
  }

  private WildBeginFreeSpinsAction(response: ISpinResponse): IntervalAction {
    const actions: IntervalAction[] = [];
    actions.push(new EmptyAction());
    const symbols = response.specialSymbolGroups;

    const symbolGroups = symbols ? symbols.filter((p) => p.type == this._bouncingMarker) : null;

    if (symbolGroups) {
      for (const symbol of symbolGroups) {
        if (!symbol.previousPositions) {
          symbol.previousPositions = symbol.positions;
        }

        for (const index of this._drawableAnimationIndexes) {
          for (let i = 0; i < symbol.positions!.length; i++) {
            const drawableAnimationIndex = index;
            const pos = symbol.positions![i];
            const reelIndex = pos % this._reelsEngine.ReelConfig.reelCount;
            const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);

            const prevPos = symbol.previousPositions![i];

            if (prevPos == -1) {
              actions.push(
                new FunctionAction(() => {
                  const entity = this._reelsEngine.CreateEntity(
                    reelIndex,
                    lineIndex,
                    drawableAnimationIndex,
                    [this._bouncingMarker]
                  );
                  entity.register();
                })
              );
            }
          }
        }
      }
    }

    return new ParallelAction(actions);
  }

  private WildAction(response: ISpinResponse, animate: boolean): IntervalAction {
    const delay = new EmptyAction();
    const symbols = response.specialSymbolGroups;

    const symbolGroups = symbols ? symbols.filter((p) => p.type == this._bouncingMarker) : null;

    if (symbolGroups) {
      for (const symbol of symbolGroups) {
        if (!symbol.previousPositions) {
          symbol.previousPositions = symbol.positions;
        }

        for (const index of this._drawableAnimationIndexes) {
          for (let i = 0; i < symbol.positions!.length; i++) {
            const drawableAnimationIndex = index;
            const pos = symbol.positions![i];
            const reelIndex = pos % this._reelsEngine.ReelConfig.reelCount;
            const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);

            const prevPos = symbol.previousPositions![i];

            let entity: Entity | null = null;
            let prevReelIndex = null;
            let prevLineIndex = null;

            if (prevPos >= 0) {
              prevReelIndex = prevPos % this._reelsEngine.ReelConfig.reelCount;
              prevLineIndex = Math.floor(prevPos / this._reelsEngine.ReelConfig.reelCount);

              entity = this._reelsEngine.GetEntity(
                prevReelIndex,
                prevLineIndex,
                drawableAnimationIndex,
                this._bouncingMarker
              );
            }

            if (!entity && pos != -1 && prevPos != -1) {
              entity = this._reelsEngine.CreateEntity(
                prevReelIndex!,
                prevLineIndex!,
                drawableAnimationIndex,
                [this._bouncingMarker]
              );
              entity.register();
            }
            if (entity) {
              if (animate && prevPos != -1 && pos != -1) {
                this._iconsSoundModel.getIconSound(drawableAnimationIndex).GoToState('anim');
                this._reelsEngine.startAnimation(entity, 'right');
                delay.withDuration(3.0);
                delay.done.listen((_) => {
                  this._iconsSoundModel.getIconSound(drawableAnimationIndex).GoToState('default');
                  this._reelsEngine.stopAnimation(entity!, 'right');
                });
              }

              if (pos == -1) {
                entity.unregister();
              } else {
                if (prevPos != -1 && reelIndex != this._reelsEngine.ReelConfig.reelCount) {
                  entity.addComponent(ComponentNames.BouncingPosition, new Vector2(1.0, 0.0));
                }
              }
            }
          }
        }
      }
    }

    return delay;
  }

  private WildStopAction(response: ISpinResponse): IntervalAction {
    const actions: IntervalAction[] = [];
    actions.push(new EmptyAction());
    const symbols = response.specialSymbolGroups;

    const symbolWildGroups = symbols ? symbols.filter((p) => p.type == this._bouncingMarker) : null;

    const createActions: IntervalAction[] = [];

    if (symbolWildGroups) {
      for (const symbol of symbolWildGroups) {
        if (!symbol.previousPositions) {
          symbol.previousPositions = symbol.positions;
        }

        for (const index of this._drawableAnimationIndexes) {
          for (let i = 0; i < symbol.positions!.length; i++) {
            const drawableAnimationIndex = index;
            const pos = symbol.positions![i];
            const reelIndex = pos % this._reelsEngine.ReelConfig.reelCount;
            const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);

            const prevPos = symbol.previousPositions![i];

            if (
              prevPos == -1 &&
              response.freeSpinsInfo &&
              response.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted &&
              response.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsAdded
            ) {
              const entityPlaceholder = this._reelsEngine.getStopedEntities(
                reelIndex,
                lineIndex
              )[0];
              const drawId = entityPlaceholder.get<number>(
                this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
              );
              createActions.push(
                new SequenceAction([
                  new FunctionAction(() => {
                    this._reelsEngine.startAnimation(entityPlaceholder, 'anim');
                    this._iconsSoundModel.getIconSound(drawId).play();
                  }),
                  new EmptyAction().withDuration(
                    this._iconAnimationHelper.getEntityAnimDuration(entityPlaceholder, 'anim')
                  ),
                  new FunctionAction(() => {
                    this._reelsEngine.stopAnimation(entityPlaceholder, 'anim');
                    this._iconsSoundModel.getIconSound(drawId).stop();
                    const entity = this._reelsEngine.CreateEntity(
                      reelIndex,
                      lineIndex,
                      drawableAnimationIndex,
                      [this._bouncingMarker]
                    );
                    entity.register();
                  }),
                ])
              );
            }
          }
        }
      }
    }

    actions.push(new ParallelAction(createActions));

    const symbolDeleteGroups = symbols
      ? symbols.filter((p) => p.type == 'FeatureStopMarker')
      : null;

    const deleteActions: IntervalAction[] = [];
    if (symbolDeleteGroups) {
      const symbolDeletePositions = symbolDeleteGroups.flatMap((x) => x.positions!);
      for (const index of this._drawableAnimationIndexes) {
        for (const position of symbolDeletePositions) {
          const drawableAnimationIndex = index;
          const reelIndex = position % this._reelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(position / this._reelsEngine.ReelConfig.reelCount);
          const entityWild = this._reelsEngine.GetEntity(
            reelIndex,
            lineIndex,
            drawableAnimationIndex,
            this._bouncingMarker
          )!;
          const entityWildDrawId = entityWild.get<number>(
            this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
          );
          deleteActions.push(
            new SequenceAction([
              new FunctionAction(() => {
                this._reelsEngine.startAnimation(entityWild, 'fall');
                this._iconsSoundModel.getIconSound(entityWildDrawId).GoToState('fall');
              }),
              new EmptyAction().withDuration(
                this._iconAnimationHelper.getEntityAnimDuration(entityWild, 'fall')
              ),
              new FunctionAction(() => {
                entityWild.unregister();
                this._reelsEngine.stopAnimation(entityWild, 'fall');
                this._iconsSoundModel.getIconSound(entityWildDrawId).GoToState('default');
              }),
            ])
          );
        }
      }
    }

    actions.push(new ParallelAction(deleteActions));

    const symbolMultipliedGroups = symbols
      ? symbols.filter((p) => p.type == this._multipliedMarker)
      : null;

    if (symbolMultipliedGroups) {
      for (const symbol of symbolMultipliedGroups) {
        if (!symbol.previousPositions) {
          symbol.previousPositions = symbol.positions;
        }

        for (const drawableAnimationIndex of this._drawableAnimationIndexes) {
          for (let i = 0; i < symbol.positions!.length; i++) {
            const pos = symbol.positions![i];
            const reelIndex = pos % this._reelsEngine.ReelConfig.reelCount;
            const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);

            const prevPos = symbol.previousPositions![i];
            const prevReelIndex = prevPos % this._reelsEngine.ReelConfig.reelCount;
            const prevLineIndex = Math.floor(prevPos / this._reelsEngine.ReelConfig.reelCount);

            const entityWild = this._reelsEngine.GetEntity(
              prevReelIndex,
              prevLineIndex,
              drawableAnimationIndex,
              this._bouncingMarker
            );
            const entityPlaceholder = this._reelsEngine.getStopedEntities(reelIndex, lineIndex)[0];

            if (entityWild) {
              const entityWildDrawId = entityWild.get<number>(
                this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
              );
              const stateNumber = this._getMovingState(
                prevLineIndex,
                prevReelIndex,
                lineIndex,
                reelIndex
              );
              actions.push(
                new ParallelAction([
                  new FunctionAction(() => {
                    this._reelsEngine.startAnimation(entityWild, 'move_' + stateNumber.toString());
                    this._iconsSoundModel.getIconSound(entityWildDrawId).GoToState('move');
                  }),
                  new SequenceAction([
                    new EmptyAction().withDuration(
                      this._iconAnimationHelper.getEntityAnimDuration(
                        entityWild,
                        'move_' + stateNumber.toString()
                      ) / 2.0
                    ),
                    new FunctionAction(() => {
                      this._reelsEngine.startAnimation(entityPlaceholder, 'anim_1');
                    }),
                  ]),
                ])
              );
              actions.push(
                new EmptyAction().withDuration(
                  this._iconAnimationHelper.getEntityAnimDuration(
                    entityWild,
                    'move_' + stateNumber.toString()
                  )
                )
              );
              actions.push(
                new FunctionAction(() => {
                  this._reelsEngine.stopAnimation(entityWild, 'move_' + stateNumber.toString());
                  this._reelsEngine.stopAnimation(entityPlaceholder, 'anim_1');
                  this._iconsSoundModel.getIconSound(entityWildDrawId).GoToState('default');
                })
              );
            }
          }
        }
      }
    }

    return new SequenceAction(actions);
  }

  private _getMovingState(
    lineWild: number,
    reelWild: number,
    linePlaceholder: number,
    reelPlaceholder: number
  ): number {
    const animPositions = new Map<string, number>([
      ['1,-1', 1],
      ['1,0', 2],
      ['1,1', 3],
      ['0,1', 4],
      ['-1,1', 5],
      ['-1,0', 6],
      ['-1,-1', 7],
      ['0,-1', 0],
    ]);

    return animPositions.get(`${reelPlaceholder - reelWild},${linePlaceholder - lineWild}`)!;
  }
}
