import { Color4 } from './10_Color4';
import { Rect } from './112_Rect';
import { RenderDevice } from './244_RenderDevice';
import { SpriteBatch } from './248_SpriteBatch';
import { SceneObject } from './288_SceneObject';
import { TextureSource } from './40_TextureSource';
import { Texture } from './41_Texture';
import { Matrix3 } from './57_Matrix3';
import { IStreamSubscription } from './22_EventStreamSubscription';
import { SceneObjectType } from './SceneObjectType';

export class RenderTargetSceneObject extends SceneObject implements TextureSource {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.RenderTarget;
  }

  private _renderDevice: RenderDevice;
  private _renderTarget: Texture | null = null;
  private _deviceLost: IStreamSubscription | null = null;
  private _deviceReady: IStreamSubscription | null = null;
  public width: number;
  public height: number;
  public coordinateSystem: Rect;

  constructor(renderDevice: RenderDevice) {
    super();
    this._renderDevice = renderDevice;
  }

  get texture(): Texture | null {
    return this._renderTarget;
  }

  get worldTransform(): Matrix3 {
    return Matrix3.Identity;
  }

  initializeImpl(): void {
    if (this.width !== undefined && this.height !== undefined) {
      throw new Error('RenderTargetSceneObject: width and height must be set');
    }

    this._renderTarget = this._renderDevice.createRenderTarget(this.width, this.height);
    this._deviceLost = this._renderDevice.lost.listen(() => this._onDeviceLost());
    this._deviceReady = this._renderDevice.ready.listen(() => this._onDeviceReady());
  }

  deinitializeImpl(): void {
    if (this._renderTarget) {
      this._renderTarget.dispose();
      this._renderTarget = null;
      this._deviceLost?.cancel();
      this._deviceLost = null;
      this._deviceReady?.cancel();
      this._deviceReady = null;
    }
  }

  draw(spriteBatch: SpriteBatch): void {
    if (!this.coordinateSystem) {
      throw new Error('RenderTargetSceneObject: coordinateSystem must be set');
    }
    const cs = spriteBatch.getCoordinateSystem();
    spriteBatch.setRenderTarget(this._renderTarget!);
    spriteBatch.setCoordinateSystem(this.coordinateSystem);
    spriteBatch.begin();
    spriteBatch.clear(Color4.Transparent);
    const world = this.worldTransform;
    const hasColor = this.color;
    if (this.blend) {
      spriteBatch.pushState(this.blend.data);
    }
    if (hasColor) {
      spriteBatch.pushState(this.color);
    }
    if (this.imageAdjustInner) {
      spriteBatch.pushState(this.imageAdjustInner);
    }
    if (this.mask) {
      Matrix3.Multiply(this.mask.localTransform, world, this.mask.worldTransform);
      spriteBatch.pushState(this.mask);
    }
    if (this.effect) {
      spriteBatch.pushState(this.effect);
    }
    super.draw(spriteBatch);
    if (this.effect) {
      spriteBatch.popState(this.effect);
    }
    if (this.mask) {
      spriteBatch.popState(this.mask);
    }
    if (this.imageAdjustInner) {
      spriteBatch.popState(this.imageAdjustInner);
    }
    if (this.blend) {
      spriteBatch.popState(this.blend.data);
    }
    if (hasColor) {
      spriteBatch.popState(this.color);
    }
    spriteBatch.end();
    spriteBatch.setRenderTarget(null);
    spriteBatch.setCoordinateSystem(cs);
  }

  private _onDeviceLost(): void {
    this._renderTarget?.dispose();
    this._renderTarget = null;
  }

  private _onDeviceReady(): void {
    this._renderTarget = this._renderDevice.createRenderTarget(this.width, this.height);
  }
}
