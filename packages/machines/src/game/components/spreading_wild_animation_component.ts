import { SceneCommon, ISpinResponse } from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import {
  Vector2,
  Action,
  FunctionAction,
  ParallelSimpleAction,
  EmptyAction,
  SequenceSimpleAction,
  SceneObject,
  Container,
} from '@cgs/syd';
import { AbstractSystem } from '../../reels_engine/entities_engine/abstract_system';
import { Entity } from '../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';
import { UiSoundModel } from '../../reels_engine/ui_sound_model';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import {
  T_IGameStateMachineProvider,
  T_ResourcesComponent,
  T_RegularSpinsSoundModelComponent,
  T_IconModelComponent,
  T_ISlotGameEngineProvider,
  T_UiSoundModelComponent,
} from '../../type_definitions';
import { IconModel } from './icon_model';
import { IconModelComponent } from './icon_model_component';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { ResourcesComponent } from './resources_component';
import { UiSoundModelComponent } from './ui_sound_model_component';

export class SpreadingWildAnimationComponent {
  private _reelsEngine: ReelsEngine;
  private _animIconsHolderPosition: Vector2;
  private _resourcesComponent: ResourcesComponent;
  private _reelsSoundModel: ReelsSoundModel;
  private _movingSceneName: string;
  private _spreadingIconAnimName: string;
  private _spreadingDelay: number;
  private _sceneCommon: SceneCommon;
  private _uiSoundModel: UiSoundModel | null;
  private _iconAnimationHelper: IconAnimationHelper;
  private _iconModel: IconModel;
  private _symbolMap: Map<number, number>;
  private _soundName: string;
  private _updateAnimEntityCacheMode: UpdateEntityCacheMode;
  private _updateSoundEntityCacheMode: UpdateEntityCacheMode;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    symbolMap: Map<number, number>,
    updateAnimEntityCacheMode: UpdateEntityCacheMode,
    updateSoundEntityCacheMode: UpdateEntityCacheMode,
    movingSceneName: string,
    spreadingIconAnimName: string,
    soundName: string,
    marker: string,
    spreadingDelay: number = 0.0
  ) {
    console.log('load ' + this.constructor.name);
    const gameStateMachine: GameStateMachine<ISpinResponse> =
      container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ).gameStateMachine;
    const uiSoundModelComponent = container.resolve<UiSoundModelComponent>(T_UiSoundModelComponent);
    this._uiSoundModel = uiSoundModelComponent ? uiSoundModelComponent.uiSoundModel : null;
    this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    const animIconsHolder = this._resourcesComponent.slot.findById('anim_icons_holder')!;
    this._animIconsHolderPosition = new Vector2(
      animIconsHolder.worldTransform.tx,
      animIconsHolder.worldTransform.ty
    );
    this._resourcesComponent.root.inverseTransform.transformVectorInplace(
      this._animIconsHolderPosition
    );
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent)
      .iconModel as IconModel;
    this._reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;

    this._createSystems(marker, container);
    gameStateMachine.stop.appendLazyAnimation(() =>
      this.spreadingAction(gameStateMachine.curResponse, marker)
    );
  }

  private _createSystems(marker: string, container: any): void {
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

  private spreadingAction(response: ISpinResponse, marker: string): Action {
    const symbols = response.specialSymbolGroups;
    const filteredSymbols =
      symbols && symbols.length > 0 ? symbols.filter((p) => p.type === marker) : null;

    if (filteredSymbols) {
      const actions: Action[] = [];

      for (const symbol of filteredSymbols) {
        if (symbol && symbol.previousPositions && symbol.positions) {
          let symbolId = this._symbolMap.get(symbol.symbolId!) as number;
          if (typeof symbolId !== 'number') {
            symbolId = this._symbolMap.values().next().value!;
          }

          const suspendPosition = symbol.previousPositions[0];
          const reelIndex = suspendPosition % this._reelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(suspendPosition / this._reelsEngine.ReelConfig.reelCount);
          const positionIndex = this._reelsEngine.entityEngine.getComponentIndex(
            ComponentNames.Position
          );
          const spreadingEntity = this._reelsEngine.getStopedEntities(reelIndex, lineIndex)[0];
          const spreadingPosition = spreadingEntity.get(positionIndex) as Vector2;

          actions.push(
            this._iconAnimationHelper.getPositionAnimAction(symbol.previousPositions[0], 'show')
          );

          for (const position of symbol.positions) {
            const symbolActions: Action[] = [];
            const scene = this._buildMovingScene();

            const reelPlaceholder = position % this._reelsEngine.ReelConfig.reelCount;
            const linePlaceholder = Math.floor(position / this._reelsEngine.ReelConfig.reelCount);

            const animPosition = this._getAnimationScenePosition(
              lineIndex,
              reelIndex,
              linePlaceholder,
              reelPlaceholder
            );

            const animState = scene
              ? scene.stateMachine!.findById('anim_' + animPosition.toString())
              : null;

            if (scene) {
              symbolActions.push(
                new FunctionAction(() => {
                  scene.position = spreadingPosition.clone().add(this._animIconsHolderPosition);
                })
              );
              symbolActions.push(
                new FunctionAction(() => {
                  scene.visible = true;
                })
              );
              if (this._uiSoundModel) {
                symbolActions.push(
                  new FunctionAction(() => {
                    this._uiSoundModel!.featureSound.stop();
                  })
                );
                symbolActions.push(
                  new FunctionAction(() => {
                    this._uiSoundModel!.featureSound.play();
                  })
                );
              }
            }

            if (!StringUtils.isNullOrEmpty(this._spreadingIconAnimName)) {
              symbolActions.push(
                new ParallelSimpleAction([
                  new FunctionAction(() => {
                    this._iconAnimationHelper.startAnimOnEntity(
                      spreadingEntity,
                      this._spreadingIconAnimName
                    );
                  }),
                  new EmptyAction().withDuration(this._spreadingDelay),
                ])
              );
            }

            const placeholderEntity = this._iconAnimationHelper.getEntities(position)[0];
            const animPlaceholderAction = this._getAnimPlaceholderAction(
              placeholderEntity,
              reelPlaceholder,
              linePlaceholder,
              symbolId,
              marker
            );

            symbolActions.push(
              new ParallelSimpleAction([
                animState ? animState.enterAction : new EmptyAction().withDuration(0.0),
                animPlaceholderAction,
              ])
            );
            symbolActions.push(
              new FunctionAction(() => {
                placeholderEntity.set(
                  this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex),
                  symbolId
                );
              })
            );
            if (scene) {
              symbolActions.push(
                new FunctionAction(() => {
                  scene.visible = false;
                  this._resourcesComponent.slot.removeChild(scene);
                })
              );
            }

            actions.push(new SequenceSimpleAction(symbolActions));
          }
          const spreadingSound = this._reelsSoundModel.getSoundByName(this._soundName);
          actions.push(
            new FunctionAction(() => {
              spreadingSound.stop();
              spreadingSound.play();
              this._iconAnimationHelper.stopAnimOnEntity(
                spreadingEntity,
                this._spreadingIconAnimName
              );
            })
          );
        }
      }
      return new ParallelSimpleAction(actions);
    }
    return new EmptyAction();
  }

  private _buildMovingScene(): SceneObject | null {
    if (StringUtils.isNullOrEmpty(this._movingSceneName)) {
      return null;
    }

    const scene = this._sceneCommon.sceneFactory.build(this._movingSceneName)!;
    scene.z = 999;
    scene.visible = false;
    scene.initialize();
    this._resourcesComponent.slot.addChild(scene);
    return scene;
  }

  private _getAnimationScenePosition(
    lineWild: number,
    reelWild: number,
    linePlaceholder: number,
    reelPlaceholder: number
  ): number {
    const animPositions: { [key: string]: number } = {
      '1,-1': 1,
      '1,0': 2,
      '1,1': 3,
      '0,1': 4,
      '-1,1': 5,
      '-1,0': 6,
      '-1,-1': 7,
      '0,-1': 8,
    };

    return animPositions[`${reelPlaceholder - reelWild},${linePlaceholder - lineWild}`];
  }

  private _getAnimPlaceholderAction(
    placeholderEntity: Entity,
    reelPlaceholder: number,
    linePlaceholder: number,
    symbolId: number,
    marker: string
  ): Action {
    let animPlaceholderAction: Action = new EmptyAction().withDuration(0.0);

    const entityPosition = placeholderEntity.get(
      this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
    ) as Vector2;
    const enumerationIndex = placeholderEntity.get(
      this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.EnumerationIndex)
    ) as number;

    if (!this._reelsEngine.GetEntity(reelPlaceholder, linePlaceholder, symbolId, marker)) {
      const placeholderActions: Action[] = [];
      const entity = this._reelsEngine.CreateEntity(reelPlaceholder, linePlaceholder, symbolId, [
        marker,
      ]);
      entity.addComponent(ComponentNames.Position, new Vector2(entityPosition.x, entityPosition.y));
      entity.addComponent(ComponentNames.Visible, false);
      entity.addComponent(ComponentNames.EnumerationIndex, enumerationIndex);
      entity.addComponent(ComponentNames.ToRemoveIndex, true);

      entity.register();

      placeholderActions.push(
        new FunctionAction(() => {
          entity.addComponent(ComponentNames.Visible, true);
        })
      );
      placeholderActions.push(this._iconAnimationHelper.getEntityAnimAction(entity, 'show'));

      animPlaceholderAction = new SequenceSimpleAction(placeholderActions);
    }
    return animPlaceholderAction;
  }
}
