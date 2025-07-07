import { ResourcePool } from './90_ResourcePool';
import { BitmapFontResource } from './126_BitmapFontResource';
import { BitmapFont } from './280_BitmapFont';
import { TextureResource } from './174_TextureResource';
import { IMediaContainer } from './1_IMediaContainer';
import { Glyph } from './95_Glyph';
import { Rect } from './112_Rect';
import { Vector2 } from './15_Vector2';
import { Log } from './81_Log';
import { IResourceCache } from './23_IResourceCache';

export class BitmapFontResourcePool extends ResourcePool<BitmapFontResource> {
  private _resourceCache: IResourceCache;

  constructor(resourceCache: IResourceCache) {
    super();
    this._resourceCache = resourceCache;
  }

  createResource(resoruceId: string): BitmapFontResource {
    return new BitmapFontResource(resoruceId);
  }

  public get requiresMediaContainer(): boolean {
    return false;
  }

  async loadResourceData(
    resource: BitmapFontResource,
    xml: HTMLElement,
    _: IMediaContainer | null
  ): Promise<void> {
    const root = xml.children[0];

    let texture: TextureResource | null = null;
    let glyphs: Map<number, Glyph> | null = null;
    let kernings: Map<number, number> | null = null;
    let baseOffset: number | null = null;
    let lineHeight: number | null = null;

    for (let i = 0; i < root.children.length; ++i) {
      const node = root.children[i];
      const name = node.nodeName;
      if (name === 'chars') {
        glyphs = this._loadGlyphs(node);
      } else if (name === 'kernigns') {
        kernings = this._loadKernings(node);
      } else if (name === 'pages') {
        const page = node.children[0];
        const file = page.getAttribute('file')!;
        texture = this._resourceCache.getResource(TextureResource.TypeId, file);
      } else if (name === 'common') {
        baseOffset = parseInt(node.getAttribute('base')!);
        lineHeight = parseInt(node.getAttribute('lineHeight')!);
      }
    }

    if (
      !texture ||
      !glyphs ||
      baseOffset === null ||
      isNaN(baseOffset) ||
      lineHeight === null ||
      isNaN(lineHeight)
    ) {
      Log.Error('BitmapFontResourcePool Error loading font ' + resource.id);
    } else {
      resource.construct(new BitmapFont(texture, glyphs, kernings, baseOffset, lineHeight));
    }
  }

  private _loadGlyphs(xml: Element): Map<number, Glyph> {
    const result = new Map<number, Glyph>();

    const cnt = xml.children.length;
    for (let i = 0; i < cnt; ++i) {
      const glyph = xml.children[i];

      const id = parseInt(glyph.getAttribute('id')!);

      let src: Rect;
      if (Object.prototype.hasOwnProperty.call(glyph.attributes, 'x')) {
        src = Rect.fromSize(
          new Vector2(parseFloat(glyph.getAttribute('x')!), parseFloat(glyph.getAttribute('y')!)),
          new Vector2(
            parseFloat(glyph.getAttribute('width')!),
            parseFloat(glyph.getAttribute('height')!)
          )
        );
      } else {
        src = Rect.Empty;
      }

      const offset = new Vector2(
        parseFloat(glyph.getAttribute('xoffset')!),
        parseFloat(glyph.getAttribute('yoffset')!)
      );
      const advance = parseFloat(glyph.getAttribute('xadvance')!);

      result.set(id, new Glyph(src, offset, advance));
    }

    return result;
  }

  private _loadKernings(xml: Element): Map<number, number> {
    const result = new Map<number, number>();

    const cnt = xml.children.length;
    for (let i = 0; i < cnt; ++i) {
      const kerning = xml.children[i];

      const first = parseInt(kerning.getAttribute('first')!);
      const second = parseInt(kerning.getAttribute('second')!);

      const amount = parseInt(kerning.getAttribute('amount')!);

      result.set(BitmapFont.pack2int32(first, second), amount);
    }

    return result;
  }
}
