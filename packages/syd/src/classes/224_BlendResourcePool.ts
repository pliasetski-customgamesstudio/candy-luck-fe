import { ResourcePool } from './90_ResourcePool';
import { BlendResource } from './154_BlendResource';
import { RenderDevice } from './244_RenderDevice';
import { BlendState } from './63_BlendState';
import { Blend } from './68_Blend';
import { Log } from './81_Log';
import { IMediaContainer } from './1_IMediaContainer';

export class BlendResourcePool extends ResourcePool<BlendResource> {
  private _renderDevice: RenderDevice;

  constructor(renderDevice: RenderDevice) {
    super();
    this._renderDevice = renderDevice;
  }

  public get requiresMediaContainer(): boolean {
    return false;
  }

  async loadResourceData(
    resource: BlendResource,
    xml: Element,
    _: IMediaContainer | null
  ): Promise<void> {
    const src = xml.getAttribute('src');
    const dst = xml.getAttribute('dst');

    let result: BlendState | null;

    if (src && dst) {
      const s = this.parseBlend(src);
      const d = this.parseBlend(dst);

      result = this._renderDevice.createBlend(true, s, d);
    } else {
      result = this._renderDevice.createBlend(false, Blend.Zero, Blend.Zero);
    }

    if (result) {
      resource.construct(result);
    }
  }

  createResource(resoruceId: string): BlendResource {
    return new BlendResource(resoruceId);
  }

  parseBlend(string: string): Blend {
    switch (string) {
      case 'zero':
        return Blend.Zero;
      case 'one':
        return Blend.One;
      case 'invSrcAlpha':
        return Blend.InvSrcAlpha;
      case 'invSrcColor':
        return Blend.InvSrcColor;
      case 'srcAlpha':
        return Blend.SrcAlpha;
    }

    Log.Error(`[BlendResourcePool] can't parse blend from '${string}'`);

    return Blend.One;
  }
}
