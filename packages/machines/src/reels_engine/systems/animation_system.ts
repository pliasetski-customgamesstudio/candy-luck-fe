import { IntervalAction } from '@cgs/syd';
import { AbstractSystem } from '../entities_engine/abstract_system';
import { ListSet } from '../utils/list_set';
import { Entity } from '../entities_engine/entity';
import { ComponentIndex } from '../entities_engine/component_index';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentNames } from '../entity_components/component_names';

export class AnimationSystem extends AbstractSystem {
  private _processAnimationEntities: ListSet<Entity>;
  private _drawAnimationEntities: ListSet<Entity>;
  private _reelIndex: ComponentIndex;
  private _processAnimationIndex: ComponentIndex;
  private _drawAnimationIndex: ComponentIndex;
  private _keepLastAnimationFrameIndex: ComponentIndex;

  constructor(engine: EntitiesEngine) {
    super(engine);
    const filter = engine.getFilterByIndex(this.getIndexesForProcessAnimationFilter());
    this._processAnimationEntities = engine.getEntities(filter);
    const filter2 = engine.getFilterByIndex(this.getIndexesForDrawAnimationFilter());
    this._drawAnimationEntities = engine.getEntities(filter2);
  }

  private getIndexesForProcessAnimationFilter(): ComponentIndex[] {
    this._reelIndex = this.engine.getComponentIndex(ComponentNames.ReelIndex);
    this._processAnimationIndex = this.engine.getComponentIndex(ComponentNames.ProcessAnimation);
    return [this._processAnimationIndex];
  }

  private getIndexesForDrawAnimationFilter(): ComponentIndex[] {
    this._drawAnimationIndex = this.engine.getComponentIndex(ComponentNames.DrawAnimation);
    this._keepLastAnimationFrameIndex = this.engine.getComponentIndex(
      ComponentNames.KeepLastAnimationFrame
    );
    return [this._drawAnimationIndex];
  }

  public updateImpl(dt: number): void {
    const entities = this._processAnimationEntities.list;
    entities.forEach((entity) => this.processEntity(entity, dt));
  }

  private processEntity(entity: Entity, dt: number): void {
    const actions: ListSet<IntervalAction> = entity.get(this._processAnimationIndex);
    const actionsList = actions.list;
    actionsList.forEach((action) => {
      action.update(dt);
      if (action.isDone) {
        actions.remove(action);

        const drawAnimEntities = this._drawAnimationEntities.list;
        drawAnimEntities.forEach((e) => this.processDrawAnimEntity(e, actions.list.length));
      }
    });
  }

  private processDrawAnimEntity(entity: Entity, actionsCount: number): void {
    const keepLastFrame =
      entity.hasComponent(this._keepLastAnimationFrameIndex) &&
      entity.get(this._keepLastAnimationFrameIndex);
    if (actionsCount === 0 && !keepLastFrame) {
      entity.removeComponent(ComponentNames.DrawAnimation);
    }
  }
}
