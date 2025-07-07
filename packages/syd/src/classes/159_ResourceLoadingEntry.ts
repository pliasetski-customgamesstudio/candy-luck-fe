import { ResourceBase } from './8_Resource';
import { ResourcePool } from './90_ResourcePool';

export class ResourceLoadingEntry {
  resource: ResourceBase;
  pool: ResourcePool<ResourceBase>;
  description: HTMLElement;

  constructor(resource: ResourceBase, pool: ResourcePool<ResourceBase>, description: HTMLElement) {
    this.resource = resource;
    this.pool = pool;
    this.description = description;
  }
}
