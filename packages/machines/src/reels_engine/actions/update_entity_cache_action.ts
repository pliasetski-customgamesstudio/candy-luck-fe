import { BuildAction } from '@cgs/shared';
import { Container, IntervalAction, FunctionAction, ParallelAction } from '@cgs/syd';
import { ComponentIndex } from '../entities_engine/component_index';
import { Entity } from '../entities_engine/entity';
import { ComponentNames } from '../entity_components/component_names';
import { EntityCacheHolder } from '../game_components/entity_cache_holder';
import { ISlotGameEngineProvider } from '../game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../reels_engine';
import { UpdateEntityCacheMode } from '../systems/update_entity_cache_system';
import { T_ISlotGameEngineProvider } from '../../type_definitions';

export class UpdateEntityCacheAction extends BuildAction {
  private _entityCacheHolder: EntityCacheHolder;
  private _reelIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;

  private _entity: Entity;
  private _updateAnimationEntityCacheMode: UpdateEntityCacheMode;
  private _updateSoundEntityCacheMode: UpdateEntityCacheMode;

  constructor(
    container: Container,
    entity: Entity,
    updateAnimationEntityCacheMode: UpdateEntityCacheMode,
    updateSoundEntityCacheMode: UpdateEntityCacheMode
  ) {
    super();
    const reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._entityCacheHolder = reelsEngine.entityCacheHolder;
    this._reelIndex = reelsEngine.entityEngine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = reelsEngine.entityEngine.getComponentIndex(ComponentNames.LineIndex);
  }

  buildAction(): IntervalAction {
    const reel = this._entity.get<number>(this._reelIndex);
    const line = this._entity.get<number>(this._lineIndex);

    const actions: IntervalAction[] = [];
    switch (this._updateAnimationEntityCacheMode) {
      case UpdateEntityCacheMode.AddAsEquitable:
        actions.push(
          new FunctionAction(() =>
            this._entityCacheHolder.addAnimationEntities(reel, line, false, [this._entity])
          )
        );
        break;
      case UpdateEntityCacheMode.AddAsForeground:
        actions.push(
          new FunctionAction(() =>
            this._entityCacheHolder.addAnimationEntities(reel, line, true, [this._entity])
          )
        );
        break;
      case UpdateEntityCacheMode.Replace:
        actions.push(
          new FunctionAction(() =>
            this._entityCacheHolder.replaceAnimationEntities(reel, line, [this._entity])
          )
        );
        break;
      case UpdateEntityCacheMode.Skip:
      default:
    }

    switch (this._updateSoundEntityCacheMode) {
      case UpdateEntityCacheMode.AddAsEquitable:
        actions.push(
          new FunctionAction(() =>
            this._entityCacheHolder.addSoundEntities(reel, line, false, [this._entity])
          )
        );
        break;
      case UpdateEntityCacheMode.AddAsForeground:
        actions.push(
          new FunctionAction(() =>
            this._entityCacheHolder.addSoundEntities(reel, line, true, [this._entity])
          )
        );
        break;
      case UpdateEntityCacheMode.Replace:
        actions.push(
          new FunctionAction(() =>
            this._entityCacheHolder.replaceSoundEntities(reel, line, [this._entity])
          )
        );
        break;
      case UpdateEntityCacheMode.Skip:
      default:
    }

    return new ParallelAction(actions);
  }
}
