import { Entity } from '../entities_engine/entity';
import { EntityCacheItem } from './entity_cache_item';
import { CachedEntity } from './cached_entity';

export class EntityCacheHolder {
  entityCache: Map<number, Map<number, EntityCacheItem>>;

  constructor(reelsCount: number) {
    this.entityCache = new Map<number, Map<number, EntityCacheItem>>();
    for (let i = 0; i < reelsCount; i++) {
      this.entityCache.set(i, new Map<number, EntityCacheItem>());
    }
  }

  addEntities(reel: number, line: number, asForeground: boolean, entities: Entity[]) {
    this.addAnimationEntities(reel, line, asForeground, entities);
    this.addSoundEntities(reel, line, asForeground, entities);
  }

  replaceEntities(reel: number, line: number, entities: Entity[]) {
    this.initializePositionIfNeeded(reel, line);
    this.replaceAnimationEntities(reel, line, entities);
    this.replaceSoundEntities(reel, line, entities);
  }

  addAnimationEntities(reel: number, line: number, asForeground: boolean, entities: Entity[]) {
    this.initializePositionIfNeeded(reel, line);
    this.entityCache.get(reel)?.get(line)?.addAnimationEntities(asForeground, entities);
  }

  replaceAnimationEntities(reel: number, line: number, entities: Entity[]) {
    this.initializePositionIfNeeded(reel, line);

    // this.entityCache.get(reel)?.get(line)?.activeAnimatedEntities.clear();
    var oldEntities = this.entityCache.get(reel)?.get(line)?.activeAnimatedEntities;
    oldEntities?.splice(0, oldEntities.length);

    this.entityCache.get(reel)?.get(line)?.addAnimationEntities(false, entities);
  }

  addSoundEntities(reel: number, line: number, asForeground: boolean, entities: Entity[]) {
    this.initializePositionIfNeeded(reel, line);
    this.entityCache.get(reel)?.get(line)?.addSoundEntities(asForeground, entities);
  }

  replaceSoundEntities(reel: number, line: number, entities: Entity[]) {
    this.initializePositionIfNeeded(reel, line);
    const activeEntiites = this.entityCache.get(reel)?.get(line)
      ?.activeSoundEntities as CachedEntity[];
    activeEntiites.length = 0;
    this.entityCache.get(reel)?.get(line)?.addSoundEntities(false, entities);
  }

  getAnimationEntities(reel: number, line: number, topLayerOnly: boolean): Entity[] {
    if (this.hasPosition(reel, line)) {
      return topLayerOnly
        ? Array.from(this.entityCache.get(reel)?.get(line)?.topLayerAnimationEntities ?? [])
        : Array.from(this.entityCache.get(reel)?.get(line)?.activeAnimatedEntities ?? []).map(
            (e) => e.entity
          );
    } else {
      return [];
    }
  }

  getSoundEntities(reel: number, line: number, topLayerOnly: boolean): Entity[] {
    if (this.hasPosition(reel, line)) {
      return topLayerOnly
        ? Array.from(this.entityCache.get(reel)?.get(line)?.topLayerSoundEntities as Entity[])
        : Array.from(
            this.entityCache.get(reel)?.get(line)?.activeSoundEntities as CachedEntity[]
          ).map((e) => e.entity);
    } else {
      return [];
    }
  }

  removeEntity(reel: number, line: number, entity: Entity) {
    if (this.hasPosition(reel, line)) {
      this.entityCache.get(reel)?.get(line)?.removeEntities([entity]);
    }
  }

  clearReel(reel: number) {
    if (this.hasReel(reel)) {
      this.entityCache.get(reel)?.clear();
    }
  }

  clearPosition(reel: number, line: number) {
    if (this.hasPosition(reel, line)) {
      this.entityCache.get(reel)?.get(line)?.clear();
    }
  }

  initializePositionIfNeeded(reel: number, line: number) {
    if (!this.hasReel(reel)) {
      return;
    }

    if (!this.entityCache.get(reel)) {
      this.entityCache.set(reel, new Map<number, EntityCacheItem>());
    }

    if (!this.entityCache.get(reel)?.has(line)) {
      this.entityCache.get(reel)?.set(line, new EntityCacheItem());
    }
  }

  hasReel(reel: number): boolean {
    return this.entityCache.size > reel;
  }

  hasPosition(reel: number, line: number): boolean {
    const result = this.hasReel(reel) && this.entityCache.get(reel)?.has(line);
    //prevent null or undefined
    return !!result;
  }
}
