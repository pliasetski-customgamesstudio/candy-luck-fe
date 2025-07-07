import { IResourceCache } from './23_IResourceCache';
import { ResourcePackage } from './88_ResourcePackage';

export class CompositeResourceCache implements IResourceCache {
  private readonly _cache: IResourceCache;
  private readonly _childs: string[];

  constructor(cache: IResourceCache, childs: string[]) {
    this._cache = cache;
    this._childs = childs;
  }
  loadPackage(url: string): Promise<ResourcePackage> {
    return this._cache.loadPackage(url);
  }
  unloadPackage(pack: ResourcePackage): void {
    return this._cache.unloadPackage(pack);
  }

  getResource(resourceType: string, resourceId: string): any {
    let result = this._cache.getResource(resourceType, resourceId);
    if (result) {
      return result;
    }

    for (let i = 0; i < this._childs.length; ++i) {
      const child = this._childs[i];
      result = this._cache.getResource(resourceType, `${child}/${resourceId}`);
      if (result) {
        return result;
      }
    }

    return null;
  }
}
