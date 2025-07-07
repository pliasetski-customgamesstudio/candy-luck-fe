import { ResourceLoadingEntry } from './159_ResourceLoadingEntry';
import { ResourcePackage } from './88_ResourcePackage';
import { ResourceBase } from './8_Resource';
import { IConcreteResourceCache } from './23_IResourceCache';
import { ResourcePool } from './90_ResourcePool';
import { ContainerPool } from './195_ContainerPool';
import { ResponseError } from './25_ResponseError';
import { AudioResourcePool } from './236_AudioResourcePool';
import { VideoResourcePool } from './254_VideoResourcePool';
import { ResourceDescriptionBase } from './19_ResourceDescriptionBase';
import { TextureResourcePool } from './240_TextureResourcePool';
import { TextureResourceDescription } from './139_TextureResourceDescription';
import { Log } from './81_Log';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';

export class ResourceCache implements IConcreteResourceCache {
  private _pools: Map<string, ResourcePool<ResourceBase>> = new Map<
    string,
    ResourcePool<ResourceBase>
  >();
  private containerPool: ContainerPool = new ContainerPool();

  private _enableMediaHack: boolean = false;
  get enableMediaHack(): boolean {
    return this._enableMediaHack;
  }

  set enableMediaHack(value: boolean) {
    this._enableMediaHack = value;
  }

  private _beforeLoadDispatcher: EventDispatcher<string> = new EventDispatcher();

  public get beforeLoad(): EventStream<string> {
    return this._beforeLoadDispatcher.eventStream;
  }

  protected dispatchBeforeLoad(url: string): void {
    this._beforeLoadDispatcher.dispatchEvent(url);
  }

  async loadPackage(url: string): Promise<ResourcePackage> {
    this.dispatchBeforeLoad(url);

    try {
      const data = await fetch(url);
      const xml = await data.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      if (xmlDoc.firstChild) {
        return await this._loadPackage(xmlDoc.firstChild as Element);
      } else {
        throw new ResponseError(url, data.status, data.statusText, data.text.toString());
      }
    } catch (error) {
      if (error instanceof Event && error.target instanceof XMLHttpRequest) {
        throw new ResponseError(
          url,
          error.target.status,
          error.target.statusText,
          error.target.responseText
        );
      }
      throw error;
    }
  }

  async loadPackageFromXML(xml: Element): Promise<ResourcePackage> {
    return this._loadPackage(xml);
  }

  protected async _loadPackage(xml: Element): Promise<ResourcePackage> {
    const loadingEntries: ResourceLoadingEntry[] = [];
    const resources: ResourceBase[] = [];

    for (let i = 0; i < xml.children.length; ++i) {
      const description = xml.children[i];

      const type = description.nodeName;

      const pool = this._pools.get(type);
      if (!pool) {
        console.error(`ResourceCache unknown resource type: ${type}. Ignoring.`);
        continue;
      }

      const id = description.getAttribute('id')!;
      const resource = pool.create(id);

      loadingEntries.push(new ResourceLoadingEntry(resource, pool, description as HTMLElement));
      resources.push(resource);
    }

    const loadingTasks: Promise<void>[] = [];
    for (let i = 0; i < loadingEntries.length; ++i) {
      const e = loadingEntries[i];

      let loadingTask: Promise<void>;

      if (e.pool.requiresMediaContainer) {
        const containerId = this.containerPool.getAvailableResourceContainerId();
        const container = await this.containerPool.getOrCreateContainer(containerId);
        loadingTask = e.pool.loadResourceData(e.resource, e.description, container);
      } else {
        loadingTask = e.pool.loadResourceData(e.resource, e.description, null);
      }

      if (loadingTask) {
        if (
          this.enableMediaHack &&
          (e.pool instanceof AudioResourcePool || e.pool instanceof VideoResourcePool)
        ) {
          await loadingTask;
        } else {
          loadingTasks.push(loadingTask);
        }
      }
    }

    await Promise.all(loadingTasks);
    return new ResourcePackage(resources);
  }

  async loadTextureResource(
    resourceType: string,
    description: ResourceDescriptionBase
  ): Promise<void> {
    const pool = this._pools.get(resourceType);
    if (pool instanceof TextureResourcePool && description instanceof TextureResourceDescription) {
      const resource = pool.create(description.id);
      await pool.loadResourceDataByDescription(resource, description);
    } else {
      Log.Error(
        `ResourceCache: calling loadTextureResource with wrong resource type; resource_id= ${description.id}`
      );
    }
  }

  unloadPackage(pack: ResourcePackage): void {
    const resources = pack.resources;
    for (let i = 0; i < resources.length; ++i) {
      this.unloadResource(resources[i]);
    }
    this.containerPool.cleanUnusedIFramesForMedia();
  }

  getResource<T extends ResourceBase>(resourceType: string, resourceId: string): T | null {
    const pool = this._pools.get(resourceType);
    if (!pool) {
      console.error(`ResourceCache unknown resourceType: ${resourceType}`);
      return null;
    }
    return (pool.getResource(resourceId) as T) || null;
  }

  registerPool(resourceTypeId: string, pool: ResourcePool<ResourceBase>): void {
    if (this._pools.has(resourceTypeId)) {
      throw new Error(
        `ResourceCache pool already registered for resourceTypeId: ${resourceTypeId}`
      );
    }
    this._pools.set(resourceTypeId, pool);
  }

  unloadResource(resource: ResourceBase): void {
    const pool = this._pools.get(resource.typeId);
    if (pool) {
      pool.unload(resource);
    }
  }

  contextLost(): void {
    this._pools.forEach((p, _p) => {
      p.contextLost();
    });
  }

  async contextReady(): Promise<void> {
    const list: Promise<void>[] = [];
    this._pools.forEach((p, _) => {
      const r = p.contextReady();
      if (r) {
        list.push(r);
      }
    });

    await Promise.all(list);
  }
}
