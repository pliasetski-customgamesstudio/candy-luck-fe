import { ResourcePool } from './90_ResourcePool';
import { TtfFontResource } from './120_TtfFontResource';
import { RenderDevice } from './244_RenderDevice';
import { TtfFontUtils } from './137_TtfFontUtils';
import { TtfFont } from './273_TtfFont';
import { IMediaContainer } from './1_IMediaContainer';

export class TtfFontResourcePool extends ResourcePool<TtfFontResource> {
  private _renderDevice: RenderDevice;
  private _fontUtils: TtfFontUtils;

  constructor(renderDevice: RenderDevice) {
    super();
    this._renderDevice = renderDevice;
    this._fontUtils = new TtfFontUtils();
  }

  createResource(resourceId: string): TtfFontResource {
    return new TtfFontResource(resourceId);
  }

  public get requiresMediaContainer(): boolean {
    return false;
  }

  async loadResourceData(
    resource: TtfFontResource,
    xml: Element,
    _: IMediaContainer | null
  ): Promise<void> {
    this._fontUtils.registerFontFromXml(xml); // create css for this font

    await new Promise((resolve) => setTimeout(resolve, 50));

    resource.construct(new TtfFont(this._renderDevice));
  }

  getResource(resourceId: string): TtfFontResource {
    let result = this.resources.get(resourceId);
    if (!result) {
      result = new TtfFontResource(resourceId);
      result.construct(new TtfFont(this._renderDevice));

      this.resources.set(resourceId, result);

      this._fontUtils.registerFontFromPath(resourceId); // create css for this font
    }
    return result;
  }
}
