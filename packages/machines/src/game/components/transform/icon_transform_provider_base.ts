import { StringUtils } from '@cgs/shared';
import {
  Container,
  Action,
  FunctionAction,
  EmptyAction,
  SequenceSimpleAction,
  Vector2,
  ParamEvent,
  SceneObject,
} from '@cgs/syd';
import { IconTextHelper } from '../../common/utils/icon_text_helper';
import { UpdateEntityCacheAction } from '../../../reels_engine/actions/update_entity_cache_action';
import { Entity } from '../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';
import { IReelsStateProvider } from '../../../reels_engine/game_components_providers/i_reels_state_provider';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconEnumerator } from '../../../reels_engine/icon_enumerator';
import { LongStoppingIconEnumerator } from '../../../reels_engine/long_stopping_icons_enumerator';
import { MultiSceneReelsEngine } from '../../../reels_engine/multi_scene_reels_engine';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { UpdateEntityCacheMode } from '../../../reels_engine/systems/update_entity_cache_system';
import {
  T_RegularSpinsSoundModelComponent,
  T_ISlotGameEngineProvider,
  T_ResourcesComponent,
  T_IReelsConfigProvider,
  T_IReelsStateProvider,
  T_IconEnumeratorComponent,
} from '../../../type_definitions';
import { IconEnumeratorComponent } from '../icon_enumerator_component';
import { MultiSceneIconValueDescription } from '../icon_with_values/multi_scene_icon_value_description';
import { MultiSceneIconResourceProvider } from '../multi_scene_icon_resource_provider';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { ResourcesComponent } from '../resources_component';
import { AbstractIconResourceProvider } from '../abstract_icon_resource_provider';

export abstract class IconTransformProviderBase {
  private _reelsSoundModel: ReelsSoundModel;
  private _container: Container;
  private _gameResourceProvider: ResourcesComponent;
  private _iconResourceProvider: MultiSceneIconResourceProvider;
  private _reelEngine: MultiSceneReelsEngine;
  private _reelsStateProvider: IReelsStateProvider;
  private _iconEnumerator: IconEnumerator;

  get reelsSoundModel(): ReelsSoundModel {
    return this._reelsSoundModel;
  }
  get reelEngine(): MultiSceneReelsEngine {
    return this._reelEngine;
  }

  constructor(container: Container) {
    this._container = container;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._reelEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as MultiSceneReelsEngine;
    this._gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._iconResourceProvider = this._container.forceResolve<AbstractIconResourceProvider>(
      T_IReelsConfigProvider
    ) as MultiSceneIconResourceProvider;
    this._reelsStateProvider = container.forceResolve<IReelsStateProvider>(T_IReelsStateProvider);
    this._iconEnumerator =
      container.forceResolve<IconEnumeratorComponent>(T_IconEnumeratorComponent).iconsEnumerator;
  }

  createExpandIcon(
    pos: number,
    wildId: number,
    {
      transformBaseState = 'transform_',
      defaultExpandedState = 'default',
      soundName = 'expand',
      iconText = null,
      useIconFromPool = true,
      resultAnimatedIcon = false,
    }
  ): Action {
    const iconAction: Action[] = [];
    const iconNodeIndex = this.reelEngine.entityEngine.getComponentIndex(ComponentNames.IconNode);

    const reelIndex = this.reelEngine.getReelByPosition(pos);
    const lineIndex = this.reelEngine.getLineByPosition(pos);

    const resultViewReels = this._reelsStateProvider.reelsState.viewReels;

    const width = 1;
    const expandId = wildId;
    const stoppedEnumerator = this._iconEnumerator as LongStoppingIconEnumerator;

    for (let i = 0; i < this._reelsStateProvider.reelsState.viewReels[reelIndex].length; i++) {
      this._reelsStateProvider.reelsState.viewReels[reelIndex][i] = expandId + i;
    }

    const entity = this.reelEngine.getReelStopedEntities(reelIndex, lineIndex).find((_) => true)!;
    const entityTop = this.reelEngine.getReelStopedEntities(reelIndex, 0).find((_) => true)!;

    iconAction.push(
      new FunctionAction(() => {
        const sound = soundName;
        this._reelsSoundModel.getSoundByName(sound)?.stop();
        this._reelsSoundModel.getSoundByName(sound)?.play();
        this.reelEngine.startAnimation(entity, transformBaseState + lineIndex.toString());
      })
    );
    iconAction.push(
      new EmptyAction().withDuration(
        Math.max(
          this.reelEngine.iconAnimationHelper.getEntityAnimDuration(
            entity,
            transformBaseState + lineIndex.toString()
          ),
          0.0
        )
      )
    );
    if (useIconFromPool) {
      iconAction.push(
        new FunctionAction(() => {
          this.processEntitiesWithIconFromPool(
            wildId,
            entityTop,
            defaultExpandedState,
            iconText,
            resultAnimatedIcon
          );
        })
      );
    } else {
      iconAction.push(
        new FunctionAction(() => {
          entityTop.addComponent(ComponentNames.DrawableIndex, wildId);
        })
      );
      iconAction.push(
        new FunctionAction(() => {
          this.processEntities(entityTop, defaultExpandedState, iconText);
        })
      );
    }

    iconAction.push(
      new FunctionAction(() => {
        if (resultAnimatedIcon) {
          entityTop.addComponent(ComponentNames.DrawAnimation, new EmptyAction().withDuration(0.0));
        }

        this.reelEngine.stopAnimation(entity, transformBaseState + lineIndex.toString());
        const sound = soundName;
        this.reelsSoundModel.getSoundByName(sound)?.stop();
        const drawIdIndex = this.reelEngine.entityEngine.getComponentIndex(
          ComponentNames.DrawableIndex
        );
        for (let i = 1; i < this.reelEngine.ReelConfig.lineCount; i++) {
          const newEntity = this.reelEngine.getStopedEntities(reelIndex, i).find((_) => true);
          if (newEntity) {
            newEntity.set(drawIdIndex, expandId + i);
          }
        }

        for (let i = 0; i < resultViewReels[reelIndex].length; i++) {
          resultViewReels[reelIndex][i] = expandId + i;
        }
        this.reelEngine.iconsEnumerator.setWinTapes(reelIndex, resultViewReels[reelIndex]);
      })
    );
    iconAction.push(
      new FunctionAction(() => {
        if (stoppedEnumerator) {
          stoppedEnumerator.cleareMapedIcons(reelIndex);
        }
      })
    );
    iconAction.push(
      new UpdateEntityCacheAction(
        this._container,
        entityTop,
        UpdateEntityCacheMode.Replace,
        UpdateEntityCacheMode.Replace
      )
    );
    iconAction.push(
      new UpdateEntityCacheAction(
        this._container,
        entity,
        UpdateEntityCacheMode.Replace,
        UpdateEntityCacheMode.Replace
      )
    );
    iconAction.push(
      new FunctionAction(() => {
        this.reelEngine.entityCacheHolder.replaceEntities(reelIndex, lineIndex, [entity]);
        this.reelEngine.entityCacheHolder.replaceEntities(reelIndex, lineIndex, [entityTop]);
      })
    );

    return new SequenceSimpleAction(iconAction);
  }

  createHoverTransformationIcon(
    pos: number,
    wildId: number,
    {
      text = null,
      defaultTransfromedState = 'transform',
      underIconAnimationState = '',
      soundName = null,
      animatedUnderTransform = true,
      animatedResultIcon = true,
    }
  ): Action {
    const iconActions: Action[] = [];
    const originalEntity = this.reelEngine
      .getStopedEntities(
        this.reelEngine.getReelByPosition(pos),
        this.reelEngine.getLineByPosition(pos)
      )
      ?.find((_) => true)!; // ;|| null;
    if (soundName) {
      iconActions.push(
        new FunctionAction(() => {
          const sound = soundName;
          this.reelsSoundModel.getSoundByName(sound)?.stop();
          this.reelsSoundModel.getSoundByName(sound)?.play();
        })
      );
    }

    const reel = this.reelEngine.getReelByPosition(pos);
    const line = this.reelEngine.getLineByPosition(pos);

    let entity = this.reelEngine.CreateSingleEntity(
      reel,
      line,
      wildId,
      this._iconResourceProvider,
      ['FrozenSymbol']
    );
    const offset = this.reelEngine.internalConfig.reelsOffset[reel];
    entity.addComponent(
      ComponentNames.Position,
      new Vector2(
        this.reelEngine.ReelConfig.symbolSize.x * reel + offset.x,
        this.reelEngine.ReelConfig.symbolSize.y * line + offset.y
      )
    );
    entity.addComponent(ComponentNames.Visible, false);

    iconActions.push(
      new FunctionAction(() => {
        entity.register();
        this.processEntitiesWithIconFromPool(
          wildId,
          entity,
          defaultTransfromedState,
          text,
          animatedUnderTransform
        );
        entity.addComponent(ComponentNames.Visible, true);
        if (!StringUtils.isNullOrWhiteSpace(underIconAnimationState)) {
          this.reelEngine.startAnimation(originalEntity, underIconAnimationState);
        }
      })
    );
    iconActions.push(
      new EmptyAction().withDuration(
        Math.max(
          this.reelEngine.iconAnimationHelper.getEntityAnimDuration(
            entity,
            defaultTransfromedState
          ),
          0.0
        )
      )
    );
    iconActions.push(
      new FunctionAction(() => {
        if (!StringUtils.isNullOrWhiteSpace(underIconAnimationState)) {
          this.reelEngine.stopAnimation(originalEntity, 'default');
        }
        this.processEntitiesWithIconFromPool(
          wildId,
          originalEntity,
          'default',
          text,
          animatedResultIcon
        );
        if (animatedUnderTransform) {
          this.reelEngine.stopAnimation(entity, defaultTransfromedState);
        }
        entity.addComponent(ComponentNames.Visible, false);
        if (soundName) {
          this.reelsSoundModel.getSoundByName(soundName)?.stop();
        }
      })
    );
    iconActions.push(
      new UpdateEntityCacheAction(
        this._container,
        originalEntity,
        UpdateEntityCacheMode.Replace,
        UpdateEntityCacheMode.Replace
      )
    );
    iconActions.push(
      new FunctionAction(() => {
        const icon = entity.get(
          this.reelEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
        ) as SceneObject;
        if (icon) {
          icon.stateMachine?.restart();
          this._iconResourceProvider.returnIcon(icon);
        }
        entity.unregister();
        // entity = null;
      })
    );

    return new SequenceSimpleAction(iconActions);
  }

  transformOneIconToAnother(
    pos: number,
    wildId: number,
    {
      text = null,
      soundName = 'transform',
      firstTransformAnim = 'transform',
      destinationTransformAnim = 'show',
      defaultTransfromedState = 'hidden',
      useIconFromPool = true,
    }
  ): Action {
    const entity =
      this.reelEngine
        .getStopedEntities(
          this.reelEngine.getReelByPosition(pos),
          this.reelEngine.getLineByPosition(pos)
        )
        .find((_) => true) || null;
    if (!entity) {
      return new EmptyAction().withDuration(0.0);
    }
    const iconNodeIndex = this.reelEngine.entityEngine.getComponentIndex(ComponentNames.IconNode);

    const iconActions: Action[] = [];

    iconActions.push(
      new FunctionAction(() => {
        const sound = soundName;
        if (sound) {
          this.reelsSoundModel.getSoundByName(sound)?.stop();
          this.reelsSoundModel.getSoundByName(sound)?.play();
        }
      })
    );

    if (firstTransformAnim) {
      iconActions.push(
        new FunctionAction(() => {
          this.reelEngine.startAnimation(entity, firstTransformAnim);
        })
      );
      iconActions.push(
        new EmptyAction().withDuration(
          Math.max(
            this.reelEngine.iconAnimationHelper.getEntityAnimDuration(entity, firstTransformAnim),
            0.0
          )
        )
      );
      iconActions.push(
        new FunctionAction(() => {
          this.reelEngine.stopAnimation(entity, firstTransformAnim);
        })
      );
    }

    if (useIconFromPool) {
      iconActions.push(
        new FunctionAction(() => {
          this.processEntitiesWithIconFromPool(wildId, entity, defaultTransfromedState, text);
        })
      );
    } else {
      iconActions.push(
        new FunctionAction(() => {
          entity.addComponent(ComponentNames.DrawableIndex, wildId);
        })
      );
      iconActions.push(
        new FunctionAction(() => {
          this.processEntities(entity, defaultTransfromedState, text);
        })
      );
    }

    iconActions.push(
      new UpdateEntityCacheAction(
        this._container,
        entity,
        UpdateEntityCacheMode.Replace,
        UpdateEntityCacheMode.Replace
      )
    );
    if (destinationTransformAnim) {
      iconActions.push(
        new FunctionAction(() => {
          this.reelEngine.startAnimation(entity, destinationTransformAnim);
          const newEntityNode = entity.get(iconNodeIndex) as SceneObject;
          if (text) {
            IconTextHelper.updateTextOnIcon(newEntityNode, text);
          }
        })
      );
      iconActions.push(
        new EmptyAction().withDuration(
          Math.max(
            this.reelEngine.iconAnimationHelper.getEntityAnimDuration(
              entity,
              destinationTransformAnim
            ),
            0.0
          )
        )
      );
      iconActions.push(
        new FunctionAction(() => {
          this.reelEngine.stopAnimation(entity, destinationTransformAnim);

          const sound = soundName;
          this.reelsSoundModel.getSoundByName(sound)?.stop();
        })
      );
      iconActions.push(
        new UpdateEntityCacheAction(
          this._container,
          entity,
          UpdateEntityCacheMode.Replace,
          UpdateEntityCacheMode.Replace
        )
      );
    } else {
      iconActions.push(
        new FunctionAction(() => {
          const sound = soundName;
          if (sound) {
            this.reelsSoundModel.getSoundByName(sound)?.stop();
          }
        })
      );
    }

    return new SequenceSimpleAction(iconActions);
  }

  private processEntitiesWithIconFromPool(
    wildId: number,
    entity: Entity,
    defaultState = 'hidden',
    text = null,
    resultAnimatedIcon = false
  ): void {
    if (
      entity.hasComponent(this.reelEngine.entityEngine.getComponentIndex(ComponentNames.IconNode))
    ) {
      const iconNode = entity.get(
        this.reelEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
      ) as SceneObject;
      if (iconNode && iconNode.findById('icon_txt')) {
        IconTextHelper.updateTextOnIcon(iconNode, '');
      }
      this._iconResourceProvider.returnIcon(
        entity.get(this.reelEngine.entityEngine.getComponentIndex(ComponentNames.IconNode))
      );
    }
    const icon =
      this._iconResourceProvider.getIconNodes('icon_' + wildId.toString())!.find((_) => true) ||
      null;
    if (icon) {
      if (text) {
        IconTextHelper.updateTextOnIcon(icon, text);
        const reel = entity.get(
          this.reelEngine.entityEngine.getComponentIndex(ComponentNames.ReelIndex)
        ) as number;
        const line = entity.get(
          this.reelEngine.entityEngine.getComponentIndex(ComponentNames.LineIndex)
        ) as number;
        const pos = this.reelEngine.getPosition(reel, line);

        const desc = new MultiSceneIconValueDescription('icon_txt', parseFloat(text), pos, null);
        entity.addComponent(ComponentNames.NeedUpdate, true);
        entity.addComponent(ComponentNames.IconValue, desc);
      }
      entity.addComponent(ComponentNames.IconNode, icon);
      entity.addComponent(ComponentNames.DrawableIndex, wildId);
      if (resultAnimatedIcon == true) {
        this.reelEngine.startAnimation(entity, defaultState);
      } else {
        icon.stateMachine?.sendEvent(new ParamEvent<String>(defaultState));
      }
    }
  }

  private processEntities(
    entity: Entity,
    defaultState = 'hidden',
    text = null,
    resultAnimatedIcon = false
  ): void {
    const icon = entity.get(
      this.reelEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
    ) as SceneObject;
    if (icon) {
      if (!resultAnimatedIcon) {
        icon.stateMachine?.sendEvent(new ParamEvent<String>(defaultState));
      }
      if (text) {
        IconTextHelper.updateTextOnIcon(icon, text);

        const reel = entity.get(
          this.reelEngine.entityEngine.getComponentIndex(ComponentNames.ReelIndex)
        ) as number;
        const line = entity.get(
          this.reelEngine.entityEngine.getComponentIndex(ComponentNames.LineIndex)
        ) as number;
        const pos = this.reelEngine.getPosition(reel, line);

        const desc = new MultiSceneIconValueDescription('icon_txt', parseFloat(text), pos, null);
        entity.addComponent(ComponentNames.IconValue, desc);
      }
    }
    if (resultAnimatedIcon) {
      this.reelEngine.startAnimation(entity, defaultState);
    }
  }
}
