import { ResourcePoolImpl } from './147_ResourcePoolImpl';
import { SpriteResource } from './121_SpriteResource';
import { SpriteData } from './162_SpriteData';
import { SpriteFrame } from './151_SpriteFrame';
import { parseRect, parseSize, parseVector2 } from './globalFunctions';
import { Vector2 } from './15_Vector2';
import { Rect } from './112_Rect';
import { NinePatchFrame } from './180_NinePatchFrame';
import { TextureResource } from './174_TextureResource';
import { Log } from './81_Log';
import { IResourceCache } from './23_IResourceCache';

export class SpriteResourcePool extends ResourcePoolImpl<SpriteResource, SpriteData> {
  private _resourceCache: IResourceCache;

  constructor(resourceCache: IResourceCache) {
    super();
    this._resourceCache = resourceCache;
  }

  createResource(resoruceId: string): SpriteResource {
    return new SpriteResource(resoruceId);
  }

  loadData(data: string): SpriteData {
    const json = JSON.parse(data);

    const resource = json['resource'];
    const meta = resource['meta'];

    const framesJson = resource['frames'];
    const frames: SpriteFrame[] = new Array<SpriteFrame>(framesJson.length);

    for (let i = 0; i < framesJson.length; ++i) {
      const frameJson = framesJson[i];
      const frame = parseRect(frameJson['frame'], Rect.Empty);
      const offset = parseVector2(frameJson['spriteSourceSize'], Vector2.Zero);
      const size = parseSize(frameJson['sourceSize'], Vector2.Zero);

      frames[i] = Object.prototype.hasOwnProperty.call(frameJson, 'ninePatch')
        ? new NinePatchFrame(frame, offset, size, parseRect(frameJson['ninePatch'], Rect.Empty))
        : new SpriteFrame(frame, offset, size);
    }

    const textureResource = meta['image'];
    const texture = this._resourceCache.getResource<TextureResource>(
      TextureResource.TypeId,
      textureResource
    )!;
    if (!texture) {
      Log.Error(`[SpriteResourcePool] can't resolve texture: ${textureResource}`);
    }

    return new SpriteData(texture, frames);
  }
}
