import { NumberFormatter } from '@cgs/common';
import { StringUtils, NodeUtils } from '@cgs/shared';
import { Container, SceneObject, TextSceneObject } from '@cgs/syd';
import { EntitiesEngine } from '../../../../reels_engine/entities_engine/entities_engine';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { IconValuesSystems } from '../../../../reels_engine/game_components/icon_values_systems';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../../../reels_engine/reels_engine';
import {
  T_MultiSceneIconWithValuesProvider,
  T_ISlotGameEngineProvider,
} from '../../../../type_definitions';
import { MultiSceneIconValueDescription } from '../multi_scene_icon_value_description';
import { MultiSceneIconValueDescriptionWithText } from '../multi_scene_icon_value_description_with_text';
import { MultiSceneIconWithValuesProvider } from '../multi_scene_icon_with_values_provider';

export class MultiSceneIconValuesSystems extends IconValuesSystems {
  private _iconPriceComponent: MultiSceneIconWithValuesProvider | null;

  constructor(private _container: Container) {
    super();
    this._iconPriceComponent = null;
  }

  get iconPriceComponent(): MultiSceneIconWithValuesProvider {
    if (!this._iconPriceComponent) {
      this._iconPriceComponent = this._container.forceResolve<MultiSceneIconWithValuesProvider>(
        T_MultiSceneIconWithValuesProvider
      );
    }
    return this._iconPriceComponent;
  }

  get engine(): EntitiesEngine {
    if (!this._engine) {
      const reelsEngine = this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ).gameEngine as ReelsEngine;
      this._engine = reelsEngine.entityEngine;
    }
    return this._engine;
  }

  private _engine: EntitiesEngine | null;

  renderIconValue(entity: Entity): void {
    if (entity.hasComponent(this.engine.getComponentIndex(ComponentNames.IconValue))) {
      const valueDescription = entity.get<MultiSceneIconValueDescription>(
        this.engine.getComponentIndex(ComponentNames.IconValue)
      );
      if (valueDescription) {
        if (entity.hasComponent(this.engine.getComponentIndex(ComponentNames.IconNode))) {
          const node = entity.get<SceneObject>(
            this.engine.getComponentIndex(ComponentNames.IconNode)
          );
          const texts = node
            .findAllById(valueDescription.valueTextNodeId)
            .map((node) => node as TextSceneObject);
          if (
            entity.hasComponent(this.engine.getComponentIndex(ComponentNames.NeedUpdate)) &&
            entity.get(this.engine.getComponentIndex(ComponentNames.NeedUpdate))
          ) {
            entity.addComponent(ComponentNames.NeedUpdate, false);

            if (texts && texts.some((x) => x)) {
              let newText = NumberFormatter.formatLongCoins1K(valueDescription.numberValue);

              if (valueDescription instanceof MultiSceneIconValueDescriptionWithText) {
                const valueDescriptionWithText =
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

  placementIconValue(entity: Entity): void {
    const relocatedFlagIndex = this.engine.getComponentIndex(ComponentNames.RelocatedFlag);
    const reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    const posInReelIndex = this.engine.getComponentIndex(ComponentNames.PositionInReel);
    const speedFlagIndex = this.engine.getComponentIndex(ComponentNames.Speed);
    const drawableIdIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    const relocated = entity.get<number>(relocatedFlagIndex);
    if (relocated === 0) return;
    const reel = entity.get<number>(reelIndex);
    if (entity.hasComponent(posInReelIndex)) {
      const posInReel = entity.get<number>(posInReelIndex);

      const valueDescription = this.iconPriceComponent.getValueDescription(reel, posInReel);
      if (valueDescription) {
        entity.addComponent(ComponentNames.IconValue, valueDescription);
        entity.addComponent(ComponentNames.NeedUpdate, true);
      } else {
        if (
          entity.hasComponent(speedFlagIndex) &&
          entity.hasComponent(this.engine.getComponentIndex(ComponentNames.IconNode))
        ) {
          const drawId = entity.get<number>(drawableIdIndex);
          const valueDescriptionFake = this.iconPriceComponent.getFakeValueDescription(
            reel,
            -1,
            drawId
          );
          if (valueDescriptionFake) {
            entity.addComponent(ComponentNames.IconValue, valueDescriptionFake);
            entity.addComponent(ComponentNames.NeedUpdate, true);
          }
        }
      }
    } else {
      if (
        entity.hasComponent(speedFlagIndex) &&
        entity.hasComponent(this.engine.getComponentIndex(ComponentNames.IconNode))
      ) {
        const drawId = entity.get<number>(drawableIdIndex);
        const valueDescription = this.iconPriceComponent.getFakeValueDescription(reel, -1, drawId);
        if (valueDescription) {
          entity.addComponent(ComponentNames.IconValue, valueDescription);
          entity.addComponent(ComponentNames.NeedUpdate, true);
        }
      }
    }
  }
}
