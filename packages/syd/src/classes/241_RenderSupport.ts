import { ShaderResource } from './212_ShaderResource';
import { Shader } from './252_Shader';
import { BlendResource } from './154_BlendResource';
import { BlendState } from './63_BlendState';
import { IShader } from './228_IShader';
import { Effect } from './89_Effect';
import { EmptyShader } from './230_EmptyShader';
import { IResourceCache } from './23_IResourceCache';

export class RenderSupport {
  private _resourceCache: IResourceCache;
  private _default: ShaderResource;

  private _cachedId: number = -1;
  private _cached: Shader | null = null;

  private _alpha: BlendResource | null = null;
  private _oneInverseSourceAlpha: BlendResource | null = null;

  private _shaders: Map<number, Shader> = new Map<number, Shader>();

  get alphaBlend(): BlendState {
    if (!this._alpha) {
      this._alpha = this._resourceCache.getResource(
        BlendResource.TypeId,
        'SourceAlpha_InverseSourceAlpha'
      );
    }
    return this._alpha!.data!;
  }

  get oneInverseSourceAlpha(): BlendState {
    if (!this._oneInverseSourceAlpha) {
      this._oneInverseSourceAlpha = this._resourceCache.getResource(
        BlendResource.TypeId,
        'One_InverseSourceAlpha'
      );
    }
    return this._oneInverseSourceAlpha!.data!;
  }

  constructor(resourceCache: IResourceCache, shaderResourceId: string) {
    this._resourceCache = resourceCache;
    this._default = this._resourceCache.getResource<ShaderResource>(
      ShaderResource.TypeId,
      shaderResourceId
    )!;
  }

  resolve(effectId: number): IShader {
    if (this._cachedId === effectId) {
      return this._cached!;
    }

    this._cachedId = effectId;
    this._cached = this._shaders.get(effectId) ?? null;

    if (this._cached) {
      return this._cached;
    }

    const defines: string[] = [];

    if ((effectId & Effect.Texture0) !== 0) {
      defines.push('#define TEXTURING');
    }

    if ((effectId & Effect.Color) !== 0) {
      defines.push('#define COLORING');
      defines.push('#define MODULATE');
    }

    if ((effectId & Effect.ColorAdjust) !== 0) {
      defines.push('#define COLOR_ADJUST');
    }

    if ((effectId & Effect.ColorOffset) !== 0) {
      defines.push('#define COLOROFFSET');
    }

    if ((effectId & Effect.Mask1) !== 0) {
      defines.push('#define MASK1');
    }

    if ((effectId & Effect.Mask2) !== 0) {
      defines.push('#define MASK2');
    }

    if ((effectId & Effect.PremultAlpha) !== 0) {
      defines.push('#define PREMULTALPHA');
    }

    if ((effectId & Effect.Video) !== 0) {
      defines.push('#define VIDEO');
    }

    if ((effectId & Effect.Transform) !== 0) {
      defines.push('#define TRANSFORM');
    }

    try {
      const program = this._default.compile(defines)!;

      this._cached = new Shader(program);
      this._shaders.set(effectId, this._cached);
    } catch (e) {
      return new EmptyShader();
    }

    return this._cached;
  }

  contextLost(): void {
    this._shaders.forEach((s, _) => {
      s.dispose();
    });
    this._shaders.clear();
  }

  contextReady(): void {}
}
