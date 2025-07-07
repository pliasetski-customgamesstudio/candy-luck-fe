import { SceneFactory } from './scene_factory';
import { IResourceCache, ResourceBase, ResourceCache, ResourcePackage, ResourcePool } from '@cgs/syd';

export class SceneCommon {
  public sceneFactory: SceneFactory;
  public resourceCache: IResourceCache;

  constructor(sceneFactory: SceneFactory, resourceCache: IResourceCache) {
    this.sceneFactory = sceneFactory;
    this.resourceCache = resourceCache;
  }
}

class ResourceCacheLoadingResult {
  isReady: boolean = false;
  package: ResourcePackage;
  future: Promise<any>;
}

export class ResourceCacheProxy extends ResourceCache {
  private _instance: IResourceCache;
  private _ready: { [url: string]: ResourceCacheLoadingResult } = {};

  constructor(instance: IResourceCache) {
    super();
    this._instance = instance;
  }

  loadPackage(url: string): Promise<ResourcePackage> {
    if (this._ready[url]) {
      return this._ready[url].future;
    } else {
      this._ready[url] = new ResourceCacheLoadingResult();

      const _startTime: number = Date.now();

      this._ready[url].future = this._instance
        .loadPackage(url)
        .then((resource: ResourcePackage) => {
          this._ready[url].package = resource;
          this._ready[url].isReady = true;

          // event logger
          // var event = new EventLoadingTime()..package(url, new DateTime.now().millisecondsSinceEpoch - startTime);
          // GlobalGameService.EventLogger.add(event);
        })
        .catch((error: any) => {
          // event logger
          const _message: string = `${error}`;
          // var event = new EventLoadingTime()..packageFailed(url, new DateTime.now().millisecondsSinceEpoch - startTime, new EventProblem(message));
          // GlobalGameService.EventLogger.add(event);
        });
      return this._ready[url].future;
    }
  }

  unloadPackage(pkg: ResourcePackage): void {
    const resKey: string = Object.keys(this._ready).find((key: string) => {
      return this._ready[key].package === pkg;
    }) as string;

    if (resKey) {
      delete this._ready[resKey];
    }
    this._instance.unloadPackage(pkg);
  }

  isReady(url: string): boolean {
    return !!url && this._ready[url]?.isReady === true;
  }

  // loadPackageFromXML(xml: Element): Promise<ResourcePackage> {
  //   return this._instance.loadPackageFromXML(xml);
  // }

  getResource(resourceType: string, resourceId: string): any {
    return this._instance.getResource(resourceType, resourceId);
  }

  // registerPool(resourceTypeId: string, pool: ResourcePool<ResourceBase>): void {
  //   this._instance.registerPool(resourceTypeId, pool);
  // }
}
