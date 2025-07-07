import { SceneObject } from './288_SceneObject';
import { Texture } from './41_Texture';
import { RenderDevice } from './244_RenderDevice';
import { BlendState } from './63_BlendState';
import { BlendResource } from './154_BlendResource';
import { Blend } from './68_Blend';
import { SpriteBatch } from './248_SpriteBatch';
import { Matrix3 } from './57_Matrix3';
import { Vector2 } from './15_Vector2';
import { Rect } from './112_Rect';

export class ExternalSceneObject extends SceneObject {
  private canvas: HTMLCanvasElement;
  private texture: Texture;
  private renderDevice: RenderDevice;

  constructor(
    canvas: HTMLCanvasElement,
    renderDevice: RenderDevice,
    blendState: BlendState | null = null
  ) {
    super();
    this.canvas = canvas;
    this.renderDevice = renderDevice;
    this.texture = renderDevice.createTextureFromCanvas(canvas)!;

    // Configure blend state for proper transparency
    this.blend = new BlendResource('premultipliedAlpha');

    if (!blendState) {
      this.blend.construct(
        new BlendState(
          true,
          Blend.One, // Source blend factor
          Blend.InvSrcAlpha // Destination blend factor
        )
      );
    } else {
      this.blend.construct(blendState);
    }
  }

  updateImpl(_: number): void {
    this.renderDevice.updateTextureFromCanvas(this.texture, this.canvas);
  }

  withSourceBlend(blend: Blend): ExternalSceneObject {
    this.blend.construct(new BlendState(this.blend.data!.enabled, blend, this.blend.data!.dst));
    return this;
  }

  withDestinationBlend(blend: Blend): ExternalSceneObject {
    this.blend.construct(new BlendState(this.blend.data!.enabled, this.blend.data!.src, blend));
    return this;
  }

  drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    const rect = new Rect(Vector2.Zero, new Vector2(this.texture.width, this.texture.height));
    spriteBatch.drawRect(this.texture, rect, rect, transform);
  }
}
