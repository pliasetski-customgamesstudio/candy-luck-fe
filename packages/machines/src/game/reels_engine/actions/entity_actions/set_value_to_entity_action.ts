import { BuildAction } from '@cgs/shared';
import { ReelsEngine } from '../../../../reels_engine/reels_engine';
import { MultiSceneIconResourceProvider } from '../../../components/multi_scene_icon_resource_provider';
import { ComponentIndex } from '../../../../reels_engine/entities_engine/component_index';
import { Entity } from '../../../../reels_engine/entities_engine/entity';
import { Action, Container, FunctionAction } from '@cgs/syd';
import {
  T_AbstractIconResourceProvider,
  T_ISlotGameEngineProvider,
} from '../../../../type_definitions';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { MultiSceneIconValueDescription } from '../../../components/icon_with_values/multi_scene_icon_value_description';

export class SetValueToEntityAction extends BuildAction {
  private readonly _reelsEngine: ReelsEngine;
  private readonly _iconResourceProvider: MultiSceneIconResourceProvider;

  private readonly _iconNodeIndex: ComponentIndex;
  private readonly _reelIndex: ComponentIndex;
  private readonly _lineIndex: ComponentIndex;

  private readonly _value: number;
  private readonly _entity: Entity;
  private readonly _iconState: string;

  constructor(container: Container, entity: Entity, value: number, iconState: string = '') {
    super();
    this._entity = entity;
    this._value = value;
    this._iconState = iconState;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._iconNodeIndex = this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.IconNode);
    this._reelIndex = this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.LineIndex);
    this._iconResourceProvider = container.forceResolve<MultiSceneIconResourceProvider>(
      T_AbstractIconResourceProvider
    );
  }

  public buildAction(): Action {
    return new FunctionAction(() => {
      const reel = this._entity.get<number>(this._reelIndex);
      const line = this._entity.get<number>(this._lineIndex);
      const pos = this._reelsEngine.getPosition(reel, line);
      const desc = new MultiSceneIconValueDescription(
        'icon_txt',
        this._value,
        pos,
        this._iconState
      );
      this._entity.addComponent(ComponentNames.IconValue, desc);
      this._entity.addComponent(ComponentNames.NeedUpdate, true);
    });
  }
}
