import {
  CompositeResourceCache,
  IResourceCache,
  ResourceCache,
  SceneBuilder,
  SceneObject,
  SceneResource,
} from '@cgs/syd';

export const T_SceneFactory = Symbol('SceneFactory');
export class SceneFactory {
  private static readonly _Aspects: string[] = ['Web', '16x9', /*"4x3",*/ '3x2', ''];

  private readonly _sceneBuilder: SceneBuilder;
  private readonly _resourceCache: ResourceCache;
  private readonly _common: IResourceCache;

  constructor(sceneBuilder: SceneBuilder, resourceCache: ResourceCache) {
    this._sceneBuilder = sceneBuilder;
    this._resourceCache = resourceCache;
    this._common = new CompositeResourceCache(resourceCache, ['common']);
  }

  get sceneBuilder(): SceneBuilder {
    return this._sceneBuilder;
  }

  build(resourceId: string, packages?: string[]): SceneObject | null {
    let sceneResource: SceneResource | null = null;
    for (let i = 0; i < SceneFactory._Aspects.length; ++i) {
      sceneResource = this._resourceCache.getResource(
        SceneResource.TypeId,
        resourceId + SceneFactory._Aspects[i] + '.object'
      );
      if (sceneResource) {
        break;
      }
    }

    if (!sceneResource) {
      return null;
    }

    const resourceCache = packages
      ? new CompositeResourceCache(this._common, packages)
      : this._common;
    return this._sceneBuilder.build(resourceCache, sceneResource.data!);
  }
}
