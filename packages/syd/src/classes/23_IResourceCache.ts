import { ResourceDescriptionBase } from './19_ResourceDescriptionBase';
import { ResourcePackage } from './88_ResourcePackage';
import { ResourceBase } from './8_Resource';
import { ResourcePool } from './90_ResourcePool';
import { EventStream } from './22_EventStreamSubscription';

export const T_ResourceCache = Symbol('ResourceCache');

export interface IResourceCache {
  getResource<T extends ResourceBase>(resourceType: string, resourceId: string): T | null;
  loadPackage(url: string): Promise<ResourcePackage>;
  unloadPackage(pack: ResourcePackage): void;
}

export interface IConcreteResourceCache extends IResourceCache {
  loadPackageFromXML(xml: Element): Promise<ResourcePackage>;
  loadTextureResource(resourceType: string, description: ResourceDescriptionBase): Promise<void>;
  registerPool(resourceTypeId: string, pool: ResourcePool<ResourceBase>): void;
  unloadResource(resource: ResourceBase): void;
  contextLost(): void;
  contextReady(): Promise<void>;
  get enableMediaHack(): boolean;
  set enableMediaHack(value: boolean);
  beforeLoad: EventStream<string>;
}
