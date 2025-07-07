import { SceneObject } from './288_SceneObject';
import { Texture } from './41_Texture';
import { RenderDevice } from './244_RenderDevice';
import { BlendState } from './63_BlendState';
import { BlendResource } from './154_BlendResource';
import { Blend } from './68_Blend';
import { Matrix3 } from './57_Matrix3';
import { Vector2 } from './15_Vector2';
import { Rect } from './112_Rect';
import { SpriteBatch } from './248_SpriteBatch';

export class ExternalCanvasSceneObject extends SceneObject {
  private canvas: HTMLCanvasElement;
  private texture: Texture;
  private renderDevice: RenderDevice;

  constructor(canvas: HTMLCanvasElement, renderDevice: RenderDevice) {
    super();
    this.canvas = canvas;
    this.renderDevice = renderDevice;
    this.texture = renderDevice.createTextureFromCanvas(canvas)!;
    this.blend = new BlendResource('srcAlpha');
    this.blend.construct(new BlendState(true, Blend.SrcAlpha, Blend.InvSrcAlpha));
  }

  updateTexture(): void {
    this.renderDevice.updateTextureFromCanvas(this.texture, this.canvas);
  }

  withSourceBlend(blend: Blend): ExternalCanvasSceneObject {
    this.blend.construct(new BlendState(this.blend.data!.enabled, blend, this.blend.data!.dst));
    return this;
  }

  withDestinationBlend(blend: Blend): ExternalCanvasSceneObject {
    this.blend.construct(new BlendState(this.blend.data!.enabled, this.blend.data!.src, blend));
    return this;
  }

  drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    const rect = new Rect(Vector2.Zero, new Vector2(this.texture.width, this.texture.height));
    spriteBatch.drawRect(this.texture, rect, rect, transform);
  }
}
