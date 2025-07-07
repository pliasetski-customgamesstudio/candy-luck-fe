import { ShaderResource } from './212_ShaderResource';
import { RenderDevice } from './244_RenderDevice';
import { ShaderSource } from './44_ShaderSource';
import { ShaderSourceResource } from './74_ShaderSourceResource';
import { ResourcePool } from './90_ResourcePool';
import { IMediaContainer } from './1_IMediaContainer';
import { IResourceCache } from './23_IResourceCache';

export class ShaderResourcePool extends ResourcePool<ShaderResource> {
  private _resourceCache: IResourceCache;
  private _renderDevice: RenderDevice;

  constructor(resourceCache: IResourceCache, renderDevice: RenderDevice) {
    super();
    this._resourceCache = resourceCache;
    this._renderDevice = renderDevice;
  }

  public get requiresMediaContainer(): boolean {
    return false;
  }

  async loadResourceData(
    resource: ShaderResource,
    xml: Element,
    _: IMediaContainer | null
  ): Promise<void> {
    const vertexId = xml.getAttribute('vertex')!;
    const fragmentId = xml.getAttribute('fragment')!;

    const vs = this._resourceCache.getResource<ShaderSourceResource>(
      ShaderSourceResource.TypeId,
      vertexId
    )!;
    const fs = this._resourceCache.getResource<ShaderSourceResource>(
      ShaderSourceResource.TypeId,
      fragmentId
    )!;

    const shader = new ShaderSource(vs, fs);
    resource.construct(shader);
  }

  createResource(resourceId: string): ShaderResource {
    return new ShaderResource(this._renderDevice, resourceId);
  }
}

// This is hack for use more media players than Chrome provides (40 for mobile, 75 for web).
// hack fix for https://chromium-review.googlesource.com/c/chromium/src/+/2816118 change in 92*+ chrome
// https://bugs.chromium.org/p/chromium/issues/detail?id=1144736
