import { Entity } from '../entities_engine/entity';

export class CachedEntity {
  entity: Entity;
  layer: number;

  constructor(entity: Entity, layer: number) {
    this.entity = entity;
    this.layer = layer;
  }
}
