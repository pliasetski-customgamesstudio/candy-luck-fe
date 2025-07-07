import { Rect } from './112_Rect';
import { SpriteResource } from './121_SpriteResource';
import { EmotionParticleSystemParams } from './122_EmotionParticleSystemParams';
import { SpriteBatch } from './248_SpriteBatch';
import { EmotionParticleSystem } from './249_EmotionParticleSystem';
import { SceneObject } from './288_SceneObject';
import { Matrix3 } from './57_Matrix3';
import { SceneObjectType } from './SceneObjectType';
import { Vector2 } from './15_Vector2';

export class EmotionParticlesSceneObject extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Particles2;
  }

  private _spriteResource: SpriteResource;
  public particleSystemParams: EmotionParticleSystemParams;
  private _particleSystem: EmotionParticleSystem;

  constructor(spriteResource: SpriteResource) {
    super();
    this._spriteResource = spriteResource;
    this.particleSystemParams = new EmotionParticleSystemParams();
    this._particleSystem = new EmotionParticleSystem(this.particleSystemParams);
  }

  public reset(): void {
    this._particleSystem.stop();
    this._particleSystem.start();
  }

  public initializeImpl(): void {
    this._particleSystem.start();
  }

  public deinitializeImpl(): void {
    // this._particleSystem.debugPrint();
  }

  public updateImpl(dt: number): void {
    this.particleSystemParams.sceneAlpha = this.color ? this.color.a : 1;
    this._particleSystem.emit(dt, this.worldTransform);
    this._particleSystem.update(dt);
  }

  public drawImpl(spriteBatch: SpriteBatch, _transform: Matrix3): void {
    if (this._spriteResource && this._spriteResource.data?.texture) {
      // Don't pass scale since it's already handled in simulateParticle via TemplateApplication.scale
      this._particleSystem.draw(spriteBatch, new Vector2(1, 1), this._spriteResource.data);
    }
  }

  public activeChanged(active: boolean): void {
    if (active) {
      this.reset();
    }
  }

  public layoutImpl(_coordinateSystem: Rect): void {
    this._particleSystem.clear();
  }
}
