import {
  Action,
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelSimpleAction,
  SceneObject,
  SequenceSimpleAction,
  Tuple,
  Vector2,
} from '@cgs/syd';
import { ISpinResponse } from '@cgs/common';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameStateMachineProvider,
  T_IMigratingWildConfigProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
} from '../../type_definitions';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { GameComponentProvider } from './game_component_provider';
import { ComponentIndex } from '../../reels_engine/entities_engine/component_index';
import { SceneCommon } from '@cgs/common';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { Entity } from '../../reels_engine/entities_engine/entity';
import { SoundInstance } from '../../reels_engine/sound_instance';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { ResourcesComponent } from './resources_component';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { RemoveComponentsSystem } from '../../reels_engine/systems/remove_components_system';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import { ListUtil } from '@cgs/shared';

export interface IMigratingWildConfigProvider {
  getWildsCount(): number;
  getWildsAppearLine(): number;
}

export class MigratingWildConfigProvider implements IMigratingWildConfigProvider {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsEngine: ReelsEngine;
  private _regularSpinWildsCount: number;
  private _freeSpinsWildsCount: Map<string, number>;

  constructor(
    container: Container,
    regularSpinWildsCount: number,
    freeSpinsWildsCount: Map<string, number>
  ) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._regularSpinWildsCount = regularSpinWildsCount;
    this._freeSpinsWildsCount = freeSpinsWildsCount;
  }

  getWildsCount(): number {
    if (
      !this._gameStateMachine.curResponse.freeSpinsInfo ||
      this._gameStateMachine.curResponse.freeSpinsInfo.event ==
        FreeSpinsInfoConstants.FreeSpinsFinished
    ) {
      return this._regularSpinWildsCount;
    }

    const freeSpinsName = this._gameStateMachine.curResponse.freeSpinsInfo.name;
    return this._freeSpinsWildsCount.has(freeSpinsName)
      ? this._freeSpinsWildsCount.get(freeSpinsName)!
      : 0;
  }

  getWildsAppearLine(): number {
    return this._reelsEngine.ReelConfig.lineCount;
  }
}

export class MigratingWildAnimationProvider extends GameComponentProvider {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsEngine: ReelsEngine;
  private _reelComponentIndex: ComponentIndex;
  private _lineComponentIndex: ComponentIndex;
  private _animIconsHolder: SceneObject;
  private _sceneCommon: SceneCommon;
  private _migratingWildConfigProvider: IMigratingWildConfigProvider;
  private _reelsSoundModel: ReelsSoundModel;
  private _sceneCache: SceneObject[] = [];

  private _scenePositionCache: Map<number, Map<number, SceneObject>> = new Map<
    number,
    Map<number, SceneObject>
  >();
  private _entityPositionCache: Map<number, Entity> = new Map<number, Entity>();
  private _stateDurations: Map<string, number> = new Map<string, number>();

  private static readonly _addedEntityMarker = 'addedEntity';
  private static readonly _removeEntityMarker = 'removeEntity';

  private _marker: string;
  private _featureSceneName: string;
  private _moveUpStateName: string;
  private _moveDownStateName: string;
  private _moveRightStateName: string;
  private _moveLeftStateName: string;
  private _iconId: number;
  private _movingSound: SoundInstance;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    marker: string,
    featureSceneName: string,
    moveUpStateName: string,
    moveDownStateName: string,
    moveRightStateName: string,
    moveLeftStateName: string,
    iconId: number = 2,
    soundName: string = 'migrating_wild'
  ) {
    super();
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._reelComponentIndex = this._reelsEngine.entityEngine.getComponentIndex(
      ComponentNames.ReelIndex
    );
    this._lineComponentIndex = this._reelsEngine.entityEngine.getComponentIndex(
      ComponentNames.LineIndex
    );
    this._animIconsHolder = container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .slot.findById('anim_icons_holder')!;
    this._migratingWildConfigProvider = container.forceResolve(T_IMigratingWildConfigProvider);
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._movingSound = this._reelsSoundModel.getSoundByName(soundName);

    this._gameStateMachine.stopping.addParallelLazyAnimation(() => this.buildAnimationAction());

    this._gameStateMachine.init.entered.listen(() => this.configureFeatureToTheNextSpin());
    this._gameStateMachine.stop.leaved.listen(() => {
      this.clearWildScenes();
      this.configureFeatureToTheNextSpin();
    });
    this._gameStateMachine.scatter.leaved.listen(() => this.configureFeatureToTheNextSpin());
    this._gameStateMachine.endFreeSpinsPopup.entered.listen(() =>
      this.configureFeatureToTheNextSpin()
    );

    this.createSystems();
    this.initAnimationDurations();
  }

  private configureFeatureToTheNextSpin(): void {
    this.createWildScenes();

    const wildsCount = this._migratingWildConfigProvider.getWildsCount();
    const wildEntities: Entity[] = [];
    this._entityPositionCache.forEach((value) => wildEntities.push(value));

    if (wildsCount > wildEntities.length) {
      const div = wildsCount - wildEntities.length;
      const wildsAppearLine = this._migratingWildConfigProvider.getWildsAppearLine();
      for (let i = 0; i < div; i++) {
        const reel = i;
        const entity = this._reelsEngine.CreateEntity(reel, wildsAppearLine, this._iconId, [
          MigratingWildAnimationProvider._addedEntityMarker,
        ]);
        const offset = this._reelsEngine.internalConfig.reelsOffset[reel];
        entity.addComponent(
          ComponentNames.Position,
          new Vector2(
            this._reelsEngine.ReelConfig.symbolSize.x * reel + offset.x,
            this._reelsEngine.ReelConfig.symbolSize.y * wildsAppearLine + offset.y
          )
        );
        entity.register();
        this.addWilEntityToCache(
          this._reelsEngine.iconAnimationHelper.getPosition(reel, wildsAppearLine),
          entity
        );
      }
    }

    if (wildsCount < wildEntities.length) {
      wildEntities.sort(
        (e1, e2) =>
          e1.get<number>(this._lineComponentIndex) - e2.get<number>(this._lineComponentIndex)
      );
      const div = wildEntities.length - wildsCount;
      for (let i = 0; i < div; i++) {
        const reel = wildEntities[i].get<number>(this._reelComponentIndex);
        const line = wildEntities[i].get<number>(this._lineComponentIndex);
        const position = this._reelsEngine.iconAnimationHelper.getPosition(reel, line);
        wildEntities[i].removeComponent(MigratingWildAnimationProvider._addedEntityMarker);
        wildEntities[i].addComponent(MigratingWildAnimationProvider._removeEntityMarker, true);
        this._entityPositionCache.delete(position);
      }
    }
  }

  private createWildScenes(): void {
    const wildsCount = this._migratingWildConfigProvider.getWildsCount() * 2;
    const additionalScenesCount = wildsCount - this._sceneCache.length;
    for (let i = 0; i < additionalScenesCount; i++) {
      const scene = this.buildWildScene();
      scene.initialize();
      this._sceneCache.push(scene);
    }
  }

  private initAnimationDurations(): void {
    const scene = this.buildWildScene();
    if (scene && scene.stateMachine) {
      const upState = scene.stateMachine.findById(this._moveUpStateName);
      if (upState) {
        this._stateDurations.set(
          this._moveUpStateName,
          (upState.enterAction as IntervalAction).duration
        );
      }

      const downState = scene.stateMachine.findById(this._moveDownStateName);
      if (downState) {
        this._stateDurations.set(
          this._moveDownStateName,
          (downState.enterAction as IntervalAction).duration
        );
      }

      const rightState = scene.stateMachine.findById(this._moveRightStateName);
      if (rightState) {
        this._stateDurations.set(
          this._moveRightStateName,
          (rightState.enterAction as IntervalAction).duration
        );
      }

      const leftState = scene.stateMachine.findById(this._moveLeftStateName);
      if (leftState) {
        this._stateDurations.set(
          this._moveLeftStateName,
          (leftState.enterAction as IntervalAction).duration
        );
      }

      this.putWildScene(scene);
    }
  }

  private createSystems(): void {
    const frozenWildSystem = new RemoveComponentsSystem(
      this._reelsEngine.entityEngine,
      MigratingWildAnimationProvider._addedEntityMarker,
      [ComponentNames.AccelerationInterpolate, ComponentNames.BrakingCalculationInfo]
    );
    frozenWildSystem.register();

    const updateEntitySystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [
        this._reelsEngine.entityEngine.getComponentIndex(
          MigratingWildAnimationProvider._addedEntityMarker
        ),
      ],
      UpdateEntityCacheMode.Replace,
      UpdateEntityCacheMode.Replace
    ).withInitialize();
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();

    const entityRemovalSystem = new EntityRemovalSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig,
      MigratingWildAnimationProvider._removeEntityMarker
    );
    entityRemovalSystem.updateOrder = 601;
    entityRemovalSystem.register();
  }

  private buildAnimationAction(): Action {
    if (!this._gameStateMachine.curResponse.specialSymbolGroups) {
      return new EmptyAction();
    }

    const symbols = this._gameStateMachine.curResponse.specialSymbolGroups.filter(
      (s) => s.type == this._marker
    );
    const actions: Action[] = [];

    const symbolPositions = ListUtil.distinct(symbols.flatMap((symbol) => symbol.positions!));
    if (symbolPositions.length > 0) {
      const previousPositions = this.getPreviousPositions();
      const routes = this.calculateRoutes(symbolPositions, previousPositions);
      let maxRoutLength = 0;
      let maxLengthRoute = 0;
      routes.forEach((value, key) => {
        if (maxRoutLength < value.length) {
          maxRoutLength = value.length;
          maxLengthRoute = key;
        }
      });

      routes.forEach((steps, routeKey) => {
        const routeActions: Action[] = [];
        const routeKeyCopy = routeKey;
        const stepsCopy = steps;

        steps.forEach((step) => {
          const index = steps.indexOf(step);
          const stepCopy = step;
          let scene: SceneObject;
          const position = this._reelsEngine.iconAnimationHelper.getDrawablePosition(
            stepCopy.item1
          );

          routeActions.push(
            new SequenceSimpleAction([
              new FunctionAction(() => {
                scene = this.getWildScene();
                scene.position = position;
                scene.active = scene.visible = true;
                this._animIconsHolder.addChild(scene);
                if (index == 0) {
                  this.removeWildEntity(stepCopy.item1);
                } else {
                  this.removeWildScene(stepsCopy[index - 1].item1, routeKeyCopy);
                }

                this.addWildSceneToCache(stepCopy.item1, routeKeyCopy, scene);
                scene.stateMachine!.switchToState(stepCopy.item2);
              }),
              new FunctionAction(() => {
                if (routeKeyCopy == maxLengthRoute) {
                  this._movingSound.play();
                }
              }, false),
              new EmptyAction().withDuration(this._stateDurations.get(stepCopy.item2)!),
              new FunctionAction(() => {
                if (routeKeyCopy == maxLengthRoute) {
                  this._movingSound.stop();
                }
              }),
            ])
          );
        });

        const finalReel = this._reelsEngine.iconAnimationHelper.getReelIndex(routeKeyCopy);
        const finalLine = this._reelsEngine.iconAnimationHelper.getLineIndex(routeKeyCopy);

        routeActions.push(
          new FunctionAction(() => {
            if (!this._entityPositionCache.has(routeKeyCopy)) {
              const entity = this._reelsEngine.CreateEntity(finalReel, finalLine, 2, [
                MigratingWildAnimationProvider._addedEntityMarker,
              ]);
              entity.addComponent(
                ComponentNames.Position,
                this._reelsEngine.iconAnimationHelper.getDrawablePosition(routeKeyCopy)
              );
              entity.register();
              this._entityPositionCache.set(routeKeyCopy, entity);

              if (stepsCopy.length > 0) {
                this.removeWildScene(stepsCopy[stepsCopy.length - 1].item1, routeKeyCopy);
              }
            } else {
              let i = 0;
            }
          })
        );
        actions.push(new SequenceSimpleAction(routeActions));
      });
    }

    return actions.length > 0 ? new ParallelSimpleAction(actions) : new EmptyAction();
  }

  private addWildSceneToCache(position: number, routeKey: number, scene: SceneObject): void {
    if (!this._scenePositionCache.has(position)) {
      this._scenePositionCache.set(position, new Map<number, SceneObject>());
    }

    this._scenePositionCache.get(position)!.set(routeKey, scene);
  }

  private addWilEntityToCache(position: number, entity: Entity): void {
    this._entityPositionCache.set(position, entity);
  }

  private removeWildEntity(position: number): void {
    const entity = this._entityPositionCache.has(position)
      ? this._entityPositionCache.get(position)
      : null;

    if (entity) {
      this._entityPositionCache.delete(position);
      entity.unregister();
    }
  }

  private removeWildScene(position: number, routeKey: number): void {
    const scenes = this._scenePositionCache.has(position)
      ? this._scenePositionCache.get(position)
      : null;

    const scene = scenes && scenes.has(routeKey) ? scenes.get(routeKey) : null;

    if (scene) {
      scenes!.delete(routeKey);
      if (scenes!.size == 0) {
        this._scenePositionCache.delete(position);
      }

      this._animIconsHolder.removeChild(scene);
      scene.active = scene.visible = false;
      this.putWildScene(scene);
    }
  }

  private clearWildScenes(): void {
    this._scenePositionCache.forEach((scenes) =>
      scenes.forEach((scene) => {
        this._animIconsHolder.removeChild(scene);
        scene.active = scene.visible = false;
        this.putWildScene(scene);
      })
    );

    this._scenePositionCache.clear();
  }

  private calculateRoutes(
    positions: number[],
    previousPositions: number[]
  ): Map<number, Tuple<number, string>[]> {
    previousPositions.sort(this.comparePositions);
    positions.sort(this.comparePositions);
    const startPositions = ListUtil.distinct(previousPositions);
    const destinationPositions = ListUtil.distinct(positions);

    const routes = new Map<number, Tuple<number, string>[]>();
    const routePoints = destinationPositions.map(
      (dp) =>
        new Tuple<number, number>(
          dp,
          startPositions.length > destinationPositions.indexOf(dp)
            ? startPositions[destinationPositions.indexOf(dp)]
            : -1
        )
    );

    for (const routePoint of routePoints) {
      const index = routePoints.indexOf(routePoint);
      const neighborPoints: Tuple<number, number>[] = [];
      if (index > 0) {
        neighborPoints.push(routePoints[index - 1]);
      }

      if (index < routePoints.length - 1) {
        neighborPoints.push(routePoints[index + 1]);
      }

      const startPosition = routePoint.item2;
      const destinationPosition = routePoint.item1;

      if (startPosition >= 0) {
        const startReel = this._reelsEngine.iconAnimationHelper.getReelIndex(startPosition);
        const startLine = this._reelsEngine.iconAnimationHelper.getLineIndex(startPosition);
        const destinationReel =
          this._reelsEngine.iconAnimationHelper.getReelIndex(destinationPosition);
        const destinationLine =
          this._reelsEngine.iconAnimationHelper.getLineIndex(destinationPosition);

        let currentReel = startReel;
        let currentLine = startLine;

        const haveLineNeighbors =
          neighborPoints.filter(
            (p) =>
              this._reelsEngine.iconAnimationHelper.getLineIndex(p.item2) == startLine ||
              this._reelsEngine.iconAnimationHelper.getLineIndex(p.item2) == destinationLine ||
              this._reelsEngine.iconAnimationHelper.getLineIndex(p.item1) == startLine ||
              this._reelsEngine.iconAnimationHelper.getLineIndex(p.item1) == destinationLine
          ).length > 0;

        routes.set(destinationPosition, []);

        const tryChangeReel = () => {
          while (currentReel < destinationReel) {
            routes
              .get(destinationPosition)!
              .push(
                new Tuple<number, string>(
                  this._reelsEngine.iconAnimationHelper.getPosition(currentReel, currentLine),
                  this._moveRightStateName
                )
              );
            currentReel++;
          }

          while (currentReel > destinationReel) {
            routes
              .get(destinationPosition)!
              .push(
                new Tuple<number, string>(
                  this._reelsEngine.iconAnimationHelper.getPosition(currentReel, currentLine),
                  this._moveLeftStateName
                )
              );
            currentReel--;
          }
        };

        const tryChangeLine = () => {
          while (currentLine > destinationLine) {
            routes
              .get(destinationPosition)!
              .push(
                new Tuple<number, string>(
                  this._reelsEngine.iconAnimationHelper.getPosition(currentReel, currentLine),
                  this._moveUpStateName
                )
              );
            currentLine--;
          }

          while (currentLine < destinationLine) {
            routes
              .get(destinationPosition)!
              .push(
                new Tuple<number, string>(
                  this._reelsEngine.iconAnimationHelper.getPosition(currentReel, currentLine),
                  this._moveDownStateName
                )
              );
            currentLine++;
          }
        };

        if (haveLineNeighbors || startLine > this._reelsEngine.ReelConfig.lineCount - 1) {
          tryChangeLine();
          tryChangeReel();
        } else {
          tryChangeReel();
          tryChangeLine();
        }
      }
    }
    return routes;
  }

  private comparePositions(position1: number, position2: number): number {
    const reel1 = this._reelsEngine.iconAnimationHelper.getReelIndex(position1);
    const line1 = this._reelsEngine.iconAnimationHelper.getLineIndex(position1);
    const reel2 = this._reelsEngine.iconAnimationHelper.getReelIndex(position2);
    const line2 = this._reelsEngine.iconAnimationHelper.getLineIndex(position2);

    if (reel1 > reel2 || (reel1 == reel2 && line1 < line2)) {
      return -1;
    }

    if (reel1 == reel2 && line1 == line2) {
      return 0;
    }

    return 1;
  }

  private getPreviousPositions(): number[] {
    const positions: number[] = [];
    this._entityPositionCache.forEach((value, key) => positions.push(key));
    return positions;
  }

  private getWildScene(): SceneObject {
    if (this._sceneCache.length > 0) {
      const scene = this._sceneCache[0];
      this._sceneCache.splice(0, 1);
      return scene;
    }

    return this.buildWildScene();
  }

  private putWildScene(scene: SceneObject): void {
    scene.stateMachine!.switchToState('default');
    this._sceneCache.push(scene);
  }

  private buildWildScene(): SceneObject {
    const scene = this._sceneCommon.sceneFactory.build(this._featureSceneName);
    if (scene) {
      scene.initialize();
      scene.active = scene.visible = true;
      scene.z = 99999;
    }

    return scene!;
  }

  public deinitialize(): void {
    super.deinitialize();
    this.clearWildScenes();
    this._sceneCache.forEach((s) => s.deinitialize());
    this._sceneCache = [];
  }
}
