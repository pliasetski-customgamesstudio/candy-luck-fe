import { ReelsEngine } from '../../reels_engine/reels_engine';
import {
  Container,
  EmptyAction,
  FunctionAction,
  InterpolateInplaceAction,
  IntervalAction,
  ParallelAction,
  SceneObject,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { ResourcesComponent } from './resources_component';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { SceneCommon, SpinResponse } from '@cgs/common';
import { UiSoundModel } from '../../reels_engine/ui_sound_model';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { IconModel } from './icon_model';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IconModelComponent,
  T_IconsSoundModelComponent,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
  T_UiSoundModelComponent,
} from '../../type_definitions';
import { UiSoundModelComponent } from './ui_sound_model_component';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { IconModelComponent } from './icon_model_component';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import { AbstractSystem } from '../../reels_engine/entities_engine/abstract_system';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { Entity } from '../../reels_engine/entities_engine/entity';
import { LazyAction } from '@cgs/shared';

export class InterpolateSpreadingWildAnimationProvider {
  private _reelsEngine: ReelsEngine;
  private _animIconHolder: SceneObject;
  private _resourcesComponent: ResourcesComponent;
  private _reelsSoundModel: ReelsSoundModel;
  private _movingSceneName: string;
  private _sceneCommon: SceneCommon;
  private _uiSoundModel: UiSoundModel;
  private _iconAnimationHelper: IconAnimationHelper;
  private _iconsSoundModel: IconsSoundModel;
  private _iconModel: IconModel;
  private _replaceSymbolId: number;
  private _soundName: string;
  private _updateAnimEntityCacheMode: UpdateEntityCacheMode;
  private _updateSoundEntityCacheMode: UpdateEntityCacheMode;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    replaceSymbolId: number,
    updateAnimEntityCacheMode: UpdateEntityCacheMode,
    updateSoundEntityCacheMode: UpdateEntityCacheMode,
    movingSceneName: string,
    soundName: string,
    marker: string
  ) {
    console.log('load ' + this.constructor.name);
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._uiSoundModel =
      container.forceResolve<UiSoundModelComponent>(T_UiSoundModelComponent).uiSoundModel;
    this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._animIconHolder = this._resourcesComponent.slot.findById('anim_icons_holder')!;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent)
      .iconModel as IconModel;
    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;

    this._createSystems(marker, container);

    gameStateMachine.stop.addLazyAnimationToBegin(() =>
      this.spreadingAction(gameStateMachine.curResponse, marker)
    );
  }

  private _createSystems(marker: string, _container: Container): void {
    const entityRemovalSystem = new EntityRemovalSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig,
      marker
    );
    entityRemovalSystem.updateOrder = 601;
    entityRemovalSystem.register();

    const system: AbstractSystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(marker)],
      this._updateAnimEntityCacheMode,
      this._updateSoundEntityCacheMode
    ).withInitialize();
    system.updateOrder = 600;
    system.register();
  }

  private spreadingAction(response: SpinResponse, marker: string): IntervalAction {
    const symbols = response.specialSymbolGroups;
    const filteredSymbols =
      symbols && symbols.length > 0 ? symbols.filter((p) => p.type === marker) : null;

    if (filteredSymbols) {
      const actions: IntervalAction[] = [];
      // const stopActions: IntervalAction[] = [];

      for (const symbol of filteredSymbols) {
        if (symbol && symbol.previousPositions && symbol.positions) {
          const suspendPosition = symbol.previousPositions[0];
          const reelIndex = suspendPosition % this._reelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(suspendPosition / this._reelsEngine.ReelConfig.reelCount);
          const positionIndex = this._reelsEngine.entityEngine.getComponentIndex(
            ComponentNames.Position
          );
          const entity = this._reelsEngine.getStopedEntities(reelIndex, lineIndex)[0];
          const pos = entity.get<Vector2>(positionIndex);

          actions.push(
            new ParallelAction([
              this._iconAnimationHelper.getPositionAnimAction(symbol.previousPositions[0], 'anim'),
              new SequenceAction([
                new FunctionAction(() =>
                  this._iconsSoundModel.getIconSound(symbol.symbolId!).play()
                ),
                new EmptyAction().withDuration(
                  this._iconAnimationHelper.getEntityAnimDuration(entity, 'anim')
                ),
                new FunctionAction(() =>
                  this._iconsSoundModel.getIconSound(symbol.symbolId!).stop()
                ),
              ]),
            ])
          );

          let i = 0;
          for (const position of symbol.positions) {
            const symbolActions: IntervalAction[] = [];
            const scene = this._buildMovingScene();

            const reelPlaceholder = position % this._reelsEngine.ReelConfig.reelCount;
            const linePlaceholder = Math.floor(position / this._reelsEngine.ReelConfig.reelCount);

            symbolActions.push(new EmptyAction().withDuration(1.0 + i * 0.03));
            symbolActions.push(
              new FunctionAction(() => (scene.position = pos.add(this._animIconHolder.position)))
            );
            symbolActions.push(new FunctionAction(() => (scene.visible = true)));
            symbolActions.push(new FunctionAction(() => this._uiSoundModel.featureSound.stop()));
            symbolActions.push(new FunctionAction(() => this._uiSoundModel.featureSound.play()));

            const placeholderEntity = this._iconAnimationHelper.getEntities(position)[0];
            const animPlaceholderAction = this._getAnimPlaceholderAction(
              placeholderEntity,
              reelPlaceholder,
              linePlaceholder,
              this._replaceSymbolId,
              marker
            );

            const featureMoveAction = new SequenceAction([
              new ParallelAction([
                this._featureMoveAction(
                  scene,
                  pos.add(this._animIconHolder.position),
                  placeholderEntity
                    .get<Vector2>(
                      this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
                    )
                    .add(this._animIconHolder.position),
                  0.35
                ),
                new FunctionAction(() => {
                  scene.stateMachine!.switchToState('default');
                  scene.stateMachine!.switchToState('anim');
                }),
              ]),
              new FunctionAction(() => {
                scene.visible = false;
                this._resourcesComponent.slot.removeChild(scene);
              }),
            ]);
            symbolActions.push(
              new ParallelAction([
                featureMoveAction,
                new SequenceAction([new EmptyAction().withDuration(0.4), animPlaceholderAction]),
              ])
            );

            actions.push(new SequenceAction(symbolActions));
            i++;
          }
        }

        const spreadingSound = this._reelsSoundModel.getSoundByName(this._soundName);
        actions.push(
          new FunctionAction(() => {
            spreadingSound.stop();
            spreadingSound.play();
          })
        );
      }
      return new ParallelAction(actions);
    }
    return new EmptyAction();
  }

  private _buildMovingScene(): SceneObject {
    const scene = this._sceneCommon.sceneFactory.build(this._movingSceneName)!;
    scene.z = 999;
    scene.visible = false;
    scene.initialize();
    this._resourcesComponent.slot.addChild(scene);
    return scene;
  }

  private _getAnimPlaceholderAction(
    placeholderEntity: Entity,
    reelPlaceholder: number,
    linePlaceholder: number,
    symbolId: number,
    marker: string
  ): IntervalAction {
    let animPlaceholderAction: IntervalAction = new EmptyAction().withDuration(0.0);

    if (!this._reelsEngine.GetEntity(reelPlaceholder, linePlaceholder, symbolId, marker)) {
      const placeholderActions: IntervalAction[] = [];

      placeholderActions.push(
        new FunctionAction(() =>
          placeholderEntity.set(
            this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex),
            this._replaceSymbolId
          )
        )
      );
      placeholderActions.push(
        new LazyAction(() =>
          this._iconAnimationHelper.getEntityAnimAction(placeholderEntity, 'anim')
        )
      );

      animPlaceholderAction = new SequenceAction(placeholderActions);
    }
    return animPlaceholderAction;
  }

  private _featureMoveAction(
    featureScene: SceneObject,
    startPosition: Vector2,
    endPosition: Vector2,
    duration: number
  ): IntervalAction {
    const moveToObject = new InterpolateInplaceAction<Vector2>((v) => v.clone())
      .withInterpolateFunction(Vector2.lerpInplace)
      .withValues(startPosition, endPosition)
      .withTimeFunction((time, _start, _dx) => time)
      .withDuration(duration);

    moveToObject.valueChange.listen((e) => {
      featureScene.position = e;
    });

    return moveToObject;
  }
}
