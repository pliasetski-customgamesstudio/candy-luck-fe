import { ComponentIndex } from '../../../../reels_engine/entities_engine/component_index';
import { BaseSystem } from '../../../../reels_engine/systems/base_system';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { MultiSceneIconWithValuesProvider } from '../multi_scene_icon_with_values_provider';
import { MultiSceneIconResourceProvider } from '../../multi_scene_icon_resource_provider';
import { EntityCacheHolder } from '../../../../reels_engine/game_components/entity_cache_holder';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { MultiSceneIconValueDescription } from '../multi_scene_icon_value_description';
import { NumberFormatter } from '@cgs/common';
import { NodeUtils, StringUtils } from '@cgs/shared';
import { SceneObject, TextSceneObject } from '@cgs/syd';
import { MultiSceneIconValueDescriptionWithText } from '../multi_scene_icon_value_description_with_text';

export class MultiSceneIconWithValuesRenderSystem extends BaseSystem {
  private _reelIndex: ComponentIndex;
  get reelIndex(): ComponentIndex {
    return this._reelIndex;
  }
  private _posInReelIndex: ComponentIndex;
  get posInReelIndex(): ComponentIndex {
    return this._posInReelIndex;
  }
  private _drawableIdIndex: ComponentIndex;
  get drawableIdIndex(): ComponentIndex {
    return this._drawableIdIndex;
  }
  private _enumerationIndex: ComponentIndex;
  get enumerationIndex(): ComponentIndex {
    return this._enumerationIndex;
  }
  private _iconValueDescriptionIndex: ComponentIndex;
  get iconValueDescriptionIndex(): ComponentIndex {
    return this._iconValueDescriptionIndex;
  }
  private _relocatedFlagIndex: ComponentIndex;
  get relocatedFlagIndex(): ComponentIndex {
    return this._relocatedFlagIndex;
  }
  private _accelerationFlagIndex: ComponentIndex;
  get accelerationFlagIndex(): ComponentIndex {
    return this._accelerationFlagIndex;
  }
  private _speedFlagIndex: ComponentIndex;
  get speedFlagIndex(): ComponentIndex {
    return this._speedFlagIndex;
  }
  private _positionIndex: ComponentIndex;
  private _drawableIndex: ComponentIndex;
  private _positionInReelIndex: ComponentIndex;

  private _iconNodeIndex: ComponentIndex;
  private _iconResourceProvider: MultiSceneIconResourceProvider;

  private _iconPriceComponent: MultiSceneIconWithValuesProvider;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    iconPriceComponent: MultiSceneIconWithValuesProvider,
    iconResourceProvider: MultiSceneIconResourceProvider
  ) {
    super(engine, entityCacheHolder);
    this._iconPriceComponent = iconPriceComponent;
    this._iconResourceProvider = iconResourceProvider;
  }

  getIndexesForFilter(): ComponentIndex[] {
    this._iconNodeIndex = this.engine.getComponentIndex(ComponentNames.IconNode);
    this._positionIndex = this.engine.getComponentIndex(ComponentNames.Position);
    this._drawableIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._positionInReelIndex = this.engine.getComponentIndex(ComponentNames.PositionInReel);
    return [this._positionIndex, this._drawableIndex, this._reelIndex];
  }

  processEntity(entity: Entity): void {
    if (entity.hasComponent(this.engine.getComponentIndex(ComponentNames.IconValue))) {
      const valueDescription: MultiSceneIconValueDescription = entity.get(
        this.engine.getComponentIndex(ComponentNames.IconValue)
      );
      if (valueDescription) {
        if (entity.hasComponent(this.engine.getComponentIndex(ComponentNames.IconNode))) {
          const node = entity.get<SceneObject>(
            this.engine.getComponentIndex(ComponentNames.IconNode)
          );
          const texts = node.findAllById(valueDescription.valueTextNodeId) as TextSceneObject[];
          if (
            entity.hasComponent(this.engine.getComponentIndex(ComponentNames.NeedUpdate)) &&
            entity.get(this.engine.getComponentIndex(ComponentNames.NeedUpdate))
          ) {
            entity.addComponent(ComponentNames.NeedUpdate, false);

            if (texts && texts.some((x) => !!x)) {
              let newText = NumberFormatter.formatLongCoins1K(valueDescription.numberValue);

              if (valueDescription instanceof MultiSceneIconValueDescriptionWithText) {
                const valueDescriptionWithText: MultiSceneIconValueDescriptionWithText =
                  valueDescription as MultiSceneIconValueDescriptionWithText;
                if (valueDescriptionWithText.hasText) {
                  newText = valueDescriptionWithText.text;
                }
              }

              for (const text of texts) {
                text.text = newText;
              }
            }

            if (!StringUtils.isNullOrWhiteSpace(valueDescription.state)) {
              NodeUtils.sendEventIfNeeded(node, valueDescription.state!);
            }
          }
        }
      }
    }
  }
}
