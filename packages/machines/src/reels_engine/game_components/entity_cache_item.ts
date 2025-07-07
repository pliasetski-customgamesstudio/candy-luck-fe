import { CachedEntity } from './cached_entity';
import { Entity } from '../entities_engine/entity';

export enum CacheItemType {
  High,
  Low,
  Wild,
}

export class EntityCacheItem {
  activeAnimatedEntities: CachedEntity[];
  activeSoundEntities: CachedEntity[];

  get topLayerAnimationEntities(): Entity[] {
    const layer = Math.max(...this.activeAnimatedEntities.map((e) => e.layer));
    return this.activeAnimatedEntities.filter((e) => e.layer === layer).map((e) => e.entity);
  }

  get topLayerSoundEntities(): Entity[] {
    const layer = Math.max(...this.activeSoundEntities.map((e) => e.layer));
    return this.activeSoundEntities.filter((e) => e.layer === layer).map((e) => e.entity);
  }

  type: CacheItemType;

  constructor() {
    this.activeAnimatedEntities = [];
    this.activeSoundEntities = [];
  }

  removeEntities(entities: Entity[]): void {
    for (const entity of entities) {
      let entitiesToRemove = this.activeAnimatedEntities.filter((ce) => ce.entity === entity);
      for (const etr of entitiesToRemove) {
        this.activeAnimatedEntities.splice(this.activeAnimatedEntities.indexOf(etr), 1);
      }

      entitiesToRemove = this.activeSoundEntities.filter((ce) => ce.entity === entity);
      for (const etr of entitiesToRemove) {
        this.activeSoundEntities.splice(this.activeSoundEntities.indexOf(etr), 1);
      }
    }
  }

  addSoundEntities(asForeground: boolean, entities: Entity[]): void {
    let layer =
      this.activeSoundEntities.length > 0
        ? Math.max(...this.activeSoundEntities.map((e) => e.layer))
        : 0;

    if (this.activeSoundEntities.length > 0 && asForeground) {
      layer++;
    }

    for (const entity of entities) {
      if (!this.activeSoundEntities.map((ce) => ce.entity).includes(entity)) {
        this.activeSoundEntities.push(new CachedEntity(entity, layer));
      } else {
        const activeSoundEntity = this.activeSoundEntities.find((ce) => ce.entity === entity);
        if (activeSoundEntity) {
          activeSoundEntity.layer = layer;
        }
      }
    }
  }

  addAnimationEntities(asForeground: boolean, entities: Entity[]): void {
    let layer =
      this.activeAnimatedEntities.length > 0
        ? Math.max(...this.activeAnimatedEntities.map((e) => e.layer))
        : 0;

    if (this.activeAnimatedEntities.length > 0 && asForeground) {
      layer++;
    }

    for (const entity of entities) {
      if (!this.activeAnimatedEntities.map((ce) => ce.entity).includes(entity)) {
        this.activeAnimatedEntities.push(new CachedEntity(entity, layer));
      } else {
        const activeAnimatedEntity = this.activeAnimatedEntities.find((ce) => ce.entity === entity);
        if (activeAnimatedEntity) {
          activeAnimatedEntity.layer = layer;
        }
      }
    }
  }

  clear(): void {
    this.activeAnimatedEntities = [];
    this.activeSoundEntities = [];
  }
}
