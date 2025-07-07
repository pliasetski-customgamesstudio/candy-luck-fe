import { ISpinResponse, SceneCommon } from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import {
  SceneObject,
  Container,
  Action,
  SequenceSimpleAction,
  ParallelSimpleAction,
  EmptyAction,
  FunctionAction,
} from '@cgs/syd';
import { PlaySoundAction } from '../../reels_engine/actions/play_sound_action';
import { StopSoundAction } from '../../reels_engine/actions/stop_sound_action';
import { ComponentIndex } from '../../reels_engine/entities_engine/component_index';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_ResourcesComponent,
  T_GameTimeAccelerationProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { GameTimeAccelerationProvider } from './game_time_acceleration_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { ResourcesComponent } from './resources_component';
import { AnticipationConfiguration } from './wild_reel_provider';
import { RegularSpinsSoundModel } from '../../reels_engine/reels_sound_model';

export class WildReelSwitchBehavior {
  static readonly doNotRepeat: string = 'doNotRepeat';
  static readonly repeat: string = 'repeat';
}

export class StairsWildAnticipationConfiguration extends AnticipationConfiguration {
  toPaceholderAnimationStatePattern: string;
  idleStatePattern: string;
  removeStatePattern: string;
  switchBehavior: string;
  showRemoveAnimation: boolean;
  addGoOutAnimationToLastReel: boolean;
  scenePoolSize: number;

  constructor(
    scenePattern: string,
    placeholderPattern: string,
    toPaceholderAnimationStatePattern: string,
    idleStatePattern: string,
    removeStatePattern: string,
    switchBehavior: string,
    showRemoveAnimation: boolean,
    addGoOutAnimationToLastReel: boolean,
    scenePoolSize: number,
    animationToLeft?: string,
    animationToRight?: string
  ) {
    super(scenePattern, placeholderPattern, animationToLeft, animationToRight);
    this.toPaceholderAnimationStatePattern = toPaceholderAnimationStatePattern;
    this.idleStatePattern = idleStatePattern;
    this.removeStatePattern = removeStatePattern;
    this.switchBehavior = switchBehavior;
    this.showRemoveAnimation = showRemoveAnimation;
    this.addGoOutAnimationToLastReel = addGoOutAnimationToLastReel;
    this.scenePoolSize = scenePoolSize;
  }

  getPlaceholderAnimation(placeholderId: number): string {
    return StringUtils.format(this.toPaceholderAnimationStatePattern, [placeholderId.toString()]);
  }
}

export class StairsWildProvider {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsEngine: ReelsEngine;
  private _sceneCommon: SceneCommon;
  private _gameResourceProvider: ResourcesComponent;
  private _fastSpinsController: GameTimeAccelerationProvider;
  private _reelsSoundModel: RegularSpinsSoundModel;
  private _drawableIndex: ComponentIndex;
  private _anticipationConfigs: StairsWildAnticipationConfiguration[];
  private _marker: string;
  private _freeSpinMarker: string;
  private _soundName: string;
  private _useAnimationOnEndFreeSpins: boolean;
  private _substituteOnEndFreeSpinswildIconId: number;
  private _featureReelIndex: number[] | null;
  private _previousStepIndexes: number[] = [];
  private _recovered: boolean = false;

  private _sceneCache: Map<StairsWildAnticipationConfiguration, SceneObject[]> = new Map<
    StairsWildAnticipationConfiguration,
    SceneObject[]
  >();
  private _addedSceneObjectMap: Map<StairsWildAnticipationConfiguration, Map<number, SceneObject>> =
    new Map<StairsWildAnticipationConfiguration, Map<number, SceneObject>>();

  get featureReelIndex(): number[] {
    return this._featureReelIndex || [];
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    marker: string,
    freeSpinMarker: string,
    soundName: string,
    anticipationConfigs: StairsWildAnticipationConfiguration[] | null = null,
    useAnimationOnEndFreeSpins: boolean = true,
    substituteOnEndFreeSpinsWildIconId: number = 2
  ) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._fastSpinsController = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._drawableIndex = this._reelsEngine.entityEngine.getComponentIndex(
      ComponentNames.DrawableIndex
    );
    this._anticipationConfigs = anticipationConfigs!;
    this._useAnimationOnEndFreeSpins = useAnimationOnEndFreeSpins;
    this._substituteOnEndFreeSpinswildIconId = substituteOnEndFreeSpinsWildIconId;

    this._gameStateMachine.beginFreeSpins.leaved.listen(() => {
      if (
        this._gameStateMachine.curResponse.freeSpinsInfo &&
        this._gameStateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup!.marker ==
          freeSpinMarker
      ) {
        this.createWildScenes();
      }
    });
    this._gameStateMachine.init.entering.listen(() => this.recovery());

    this._gameStateMachine.stopping.addParallelLazyAnimation(() => this.changeWildReelAction());
    this._gameStateMachine.accelerate.addLazyAnimationToBegin(() =>
      this.replaceIconsWithWildSceneAction()
    );

    this._gameStateMachine.endFreeSpinsPopup.leaved.listen(() => {
      if (this.getCurrentFeatureReelIndex().length > 0) {
        this._featureReelIndex = null;
        this._previousStepIndexes = [];
        this.removeAllScenes();
        this._sceneCache.forEach((scenes) => scenes!.forEach((scene) => scene.deinitialize()));
        this._sceneCache.forEach((scenes) => (scenes.length = 0));
      }
    });

    this._gameStateMachine.immediatelyStop.entered.listen(() => this.stopAllAnimations());
    this._gameStateMachine.stop.leaved.listen(() => this.hideWildScenes());

    for (const config of anticipationConfigs!) {
      this._addedSceneObjectMap.set(config, new Map<number, SceneObject>());
      this._sceneCache.set(config, new Array<SceneObject>());
    }
  }

  private changeWildReelAction(): Action {
    const reelIndexesForProcess = this.getCurrentFeatureReelIndex();

    if (reelIndexesForProcess.length > 0) {
      const removeSceneActions: Action[] = [];
      const addSceneActions: Action[] = [];

      if (this._previousStepIndexes.length > 0) {
        for (const config of this._anticipationConfigs) {
          removeSceneActions.push(
            config.showRemoveAnimation
              ? this.getRemoveAnimationAction(config, reelIndexesForProcess)
              : this.getRemoveSceneAction(config, reelIndexesForProcess)
          );
        }
      }

      for (const config of this._anticipationConfigs) {
        addSceneActions.push(this.getSwitchWildReelAction(config, reelIndexesForProcess));
      }
      this._previousStepIndexes = reelIndexesForProcess;

      const sound = this._reelsSoundModel.getSoundByName(this._soundName);
      const soundActions = new SequenceSimpleAction([
        new StopSoundAction(sound),
        PlaySoundAction.withSound(sound),
      ]);

      return new ParallelSimpleAction([
        new ParallelSimpleAction(removeSceneActions),
        new ParallelSimpleAction(addSceneActions),
        soundActions,
      ]);
    }

    return new EmptyAction();
  }

  private getRemoveAnimationAction(
    configuration: StairsWildAnticipationConfiguration,
    reelIndexesForProcess: number[]
  ): Action {
    const removedIndexes = this._previousStepIndexes.filter(
      (reel) => !reelIndexesForProcess.includes(reel)
    );
    if (removedIndexes.length == 0) {
      return new EmptyAction();
    }

    const sceneActions: Action[] = [];
    for (const reel of removedIndexes) {
      let scene: SceneObject | null | undefined;
      if (this._addedSceneObjectMap.get(configuration)!.has(reel)) {
        scene = this._addedSceneObjectMap.get(configuration)!.get(reel);
      }

      if (scene) {
        const state = scene.stateMachine!.findById(
          StringUtils.format(configuration.removeStatePattern, [reel.toString()])
        )!;
        state.enterAction = new SequenceSimpleAction([
          state.enterAction,
          new FunctionAction(() => {
            this._addedSceneObjectMap.get(configuration)!.delete(reel);
            if (scene!.parent) {
              scene!.parent.removeChild(scene!);
            }

            this.putWildScene(configuration, scene!);
          }),
        ]);

        sceneActions.push(state.enterAction);
      }
    }

    return new ParallelSimpleAction(sceneActions);
  }

  private getRemoveSceneAction(
    configuration: StairsWildAnticipationConfiguration,
    reelIndexesForProcess: number[]
  ): Action {
    const removedIndexes = this._previousStepIndexes.filter(
      (reel) => !reelIndexesForProcess.includes(reel)
    );
    if (removedIndexes.length == 0) {
      return new EmptyAction();
    }

    const sceneActions: Action[] = [];
    for (const reel of removedIndexes) {
      let scene: SceneObject | null | undefined;
      if (this._addedSceneObjectMap.get(configuration)!.has(reel)) {
        scene = this._addedSceneObjectMap.get(configuration)!.get(reel);
      }

      if (scene) {
        sceneActions.push(
          new FunctionAction(() => {
            this._addedSceneObjectMap.get(configuration)!.delete(reel);
            if (scene!.parent) {
              scene!.parent.removeChild(scene!);
            }

            this.putWildScene(configuration, scene!);
          })
        );
      }
    }

    return new ParallelSimpleAction(sceneActions);
  }

  private getSwitchWildReelAction(
    configuration: StairsWildAnticipationConfiguration,
    currentReelIndexes: number[]
  ): Action {
    const actions: Action[] = [];
    const indexesToAnimate =
      configuration.switchBehavior == WildReelSwitchBehavior.doNotRepeat
        ? currentReelIndexes.filter((reel) => !this._previousStepIndexes.includes(reel))
        : currentReelIndexes;

    for (const reel of indexesToAnimate) {
      actions.push(
        new FunctionAction(() => {
          let oldScene: SceneObject | null | undefined;
          if (this._addedSceneObjectMap.get(configuration)!.has(reel)) {
            oldScene = this._addedSceneObjectMap.get(configuration)!.get(reel);
          }
          const scene = oldScene ? oldScene : this.getWildScene(configuration);
          const placeholderId = StringUtils.format(configuration.placeholderPattern, [reel]);
          const placeholder = this._gameResourceProvider.slot.findById(placeholderId);

          if (scene && placeholder) {
            this._addedSceneObjectMap.get(configuration)!.set(reel, scene);
            if (scene.parent) {
              scene.parent.removeChild(scene);
            }

            placeholder.addChild(scene);
            scene.stateMachine!.switchToState(
              StringUtils.format(configuration.idleStatePattern, [reel - 1])
            );
            if (this._fastSpinsController && this._fastSpinsController.isFastSpinsActive) {
              scene.stateMachine!.switchToState(
                StringUtils.format(configuration.idleStatePattern, [reel])
              );
            } else {
              scene.stateMachine!.switchToState(configuration.getPlaceholderAnimation(reel));
            }
          }
        })
      );
    }

    if (
      configuration.addGoOutAnimationToLastReel &&
      this._previousStepIndexes.includes(this._reelsEngine.ReelConfig.reelCount - 1)
    ) {
      actions.push(
        new FunctionAction(() => {
          let oldScene: SceneObject | null | undefined;
          if (
            this._addedSceneObjectMap
              .get(configuration)!
              .has(this._reelsEngine.ReelConfig.reelCount)
          ) {
            oldScene = this._addedSceneObjectMap
              .get(configuration)!
              .get(this._reelsEngine.ReelConfig.reelCount);
          }
          const scene = oldScene ? oldScene : this.getWildScene(configuration);
          const placeholderId = StringUtils.format(configuration.placeholderPattern, [
            (this._reelsEngine.ReelConfig.reelCount - 1).toString(),
          ]);
          const placeholder = this._gameResourceProvider.slot.findById(placeholderId);

          if (scene && placeholder) {
            this._addedSceneObjectMap
              .get(configuration)!
              .set(this._reelsEngine.ReelConfig.reelCount, scene);
            if (scene.parent) {
              scene.parent.removeChild(scene);
            }

            placeholder.addChild(scene);
            scene.stateMachine!.switchToState(
              StringUtils.format(configuration.idleStatePattern, [
                this._reelsEngine.ReelConfig.reelCount - 1,
              ])
            );
            if (this._fastSpinsController && this._fastSpinsController.isFastSpinsActive) {
              scene.stateMachine!.switchToState(
                StringUtils.format(configuration.idleStatePattern, [
                  this._reelsEngine.ReelConfig.reelCount,
                ])
              );
            } else {
              scene.stateMachine!.switchToState(
                configuration.getPlaceholderAnimation(this._reelsEngine.ReelConfig.reelCount)
              );
            }
          }
        })
      );
    }

    return new ParallelSimpleAction(actions);
  }

  private stopAllAnimations(): void {
    this._addedSceneObjectMap.forEach((nodes, config) =>
      nodes.forEach((node, reel) => {
        const state = StringUtils.format(config.idleStatePattern, [reel]);
        node.stateMachine!.switchToState(state);
      })
    );
  }

  private hideWildScenes(): void {
    this._addedSceneObjectMap.forEach((nodes) =>
      nodes.forEach((node) => {
        node.visible = false;
        node.active = false;
      })
    );
  }

  private removeAllScenes(): void {
    for (const configuration of this._anticipationConfigs) {
      this._addedSceneObjectMap.get(configuration)!.forEach((node) => {
        if (node.parent) {
          node.parent.removeChild(node);
          this.putWildScene(configuration, node);
        }
      });
      this._addedSceneObjectMap.get(configuration)!.clear();
    }

    if (this._useAnimationOnEndFreeSpins) {
      for (const configuration of this._anticipationConfigs) {
        const stateName = configuration.showRemoveAnimation
          ? StringUtils.format(configuration.removeStatePattern, [
              (this._reelsEngine.ReelConfig.reelCount - 1).toString(),
            ])
          : configuration.addGoOutAnimationToLastReel
            ? configuration.getPlaceholderAnimation(this._reelsEngine.ReelConfig.reelCount)
            : null;

        if (stateName) {
          const reel = this._reelsEngine.ReelConfig.reelCount - 1;
          const placeholderId = StringUtils.format(configuration.placeholderPattern, [
            reel.toString(),
          ]);
          const placeholder = this._gameResourceProvider.slot.findById(placeholderId)!;
          const scene = this.getWildScene(configuration);

          if (scene && placeholder) {
            const state = scene.stateMachine!.findById(stateName);
            if (state) {
              placeholder.addChild(scene);
              state.enterAction = new SequenceSimpleAction([
                state.enterAction,
                new FunctionAction(() => {
                  placeholder.removeChild(scene);
                }),
              ]);

              state.enterAction.done.listen(() => new Promise(() => scene.deinitialize()));

              scene.stateMachine!.switchToState(stateName);

              for (let line = 0; line < this._reelsEngine.ReelConfig.lineCount; line++) {
                const entities = this._reelsEngine.getStopedEntities(
                  this._reelsEngine.ReelConfig.reelCount - 1,
                  line
                );
                entities.forEach((e) =>
                  e.set(this._drawableIndex, this._substituteOnEndFreeSpinswildIconId)
                );
              }
            } else {
              if (scene.parent) {
                scene.parent.removeChild(scene);
              }
              scene.deinitialize();
            }
          }
        }
      }
    }
  }

  private replaceIconsWithWildSceneAction(): Action {
    return new FunctionAction(() =>
      this._addedSceneObjectMap.forEach((nodes) =>
        nodes.forEach((node) => {
          node.active = true;
          node.visible = true;
        })
      )
    );
  }

  private getCurrentFeatureReelIndex(): number[] {
    const symbol = this._gameStateMachine.curResponse.specialSymbolGroups
      ? this._gameStateMachine.curResponse.specialSymbolGroups.find((p) => p.type == this._marker)
      : null;

    const positions = symbol ? symbol.positions : null;
    const result: number[] = [];

    if (positions) {
      for (const position of positions) {
        const reel = this._reelsEngine.getReelByPosition(position);
        if (!result.includes(reel)) {
          result.push(reel);
        }
      }
    }

    return result;
  }

  private recovery(): void {
    if (!this._recovered) {
      const currentFeatureReelIndexes = this.getCurrentFeatureReelIndex();
      if (currentFeatureReelIndexes.length > 0) {
        this.createWildScenes();
      }

      for (const reel of currentFeatureReelIndexes) {
        for (const config of this._anticipationConfigs) {
          const placeholderId = StringUtils.format(config.placeholderPattern, [reel.toString()]);
          const placeholder = this._gameResourceProvider.slot.findById(placeholderId);
          const scene = this.getWildScene(config);

          if (placeholder && scene) {
            this._addedSceneObjectMap.get(config)!.set(reel, scene);
            placeholder.addChild(scene);
            scene.stateMachine!.switchToState(
              StringUtils.format(config.idleStatePattern, [reel.toString()])
            );
          }
        }
      }

      this._previousStepIndexes = currentFeatureReelIndexes;
      this._recovered = true;
    }
  }

  private createWildScenes(): void {
    const reelEndexes = this.getCurrentFeatureReelIndex();
    if (reelEndexes.length == 0) {
      return;
    }

    this._sceneCache.forEach((scenes, config) => {
      const scenesNeeded = config.scenePoolSize;

      const additionalScenesCount = scenesNeeded - scenes.length;
      for (let i = 0; i < additionalScenesCount; i++) {
        const scene = this.buildWildScene(config);
        scene.initialize();
        scenes.push(scene);
      }
    });
  }

  private getWildScene(configuration: StairsWildAnticipationConfiguration): SceneObject {
    const scenes = this._sceneCache.get(configuration)!;
    if (scenes.length > 0) {
      const scene = scenes[0];
      scenes.splice(0, 1);
      return scene;
    }

    return this.buildWildScene(configuration);
  }

  private putWildScene(
    configuration: StairsWildAnticipationConfiguration,
    scene: SceneObject
  ): void {
    const scenes = this._sceneCache.get(configuration)!;
    scene.stateMachine!.switchToState('default');
    scenes.push(scene);
  }

  private buildWildScene(configuration: StairsWildAnticipationConfiguration): SceneObject {
    const sceneName = configuration.scenePattern;
    const scene = this._sceneCommon.sceneFactory.build(sceneName);
    if (scene) {
      scene.initialize();
      scene.active = scene.visible = true;
      scene.z = 99999;
    }

    return scene!;
  }

  deinitialize(): void {
    this._sceneCache.forEach((scenes) => scenes.forEach((scene) => scene.deinitialize));
    this._sceneCache.clear();
  }
}
