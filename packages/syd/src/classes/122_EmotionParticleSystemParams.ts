import { Vector2 } from './15_Vector2';
import { Color4 } from './10_Color4';

export class EmotionParticleSystemParams {
  public static readonly Default = new EmotionParticleSystemParams();

  duration: number = -1.0;

  maxCount: number;

  emitterPosition: Vector2 = Vector2.Zero;

  positionVariance: Vector2 = Vector2.Zero;

  angle: number = 0.0;
  angleVariance: number = 0.0;

  lifeTime: number = 0.0;
  lifeTimeVariance: number = 0.0;

  emissionRate: number = 0.0;

  gravity: Vector2 = Vector2.Zero;

  startRotate: number = 0.0;
  startRotateVariance: number = 0.0;

  endRotate: number = 0.0;
  endRotateVariance: number = 0.0;

  speed: number = 0.0;
  speedVariance: number = 0.0;

  tangentialAccel: number = 0.0;
  tangentialAccelVariance: number = 0.0;

  radialAccel: number = 0.0;
  radialAccelVariance: number = 0.0;

  startSize: Vector2 = Vector2.Zero;
  startSizeVariance: Vector2 = Vector2.Zero;

  endSize: Vector2 = Vector2.Zero;
  endSizeVariance: Vector2 = Vector2.Zero;

  startColor: Color4 = Color4.Transparent;
  startColorVariance: Color4 = Color4.Transparent;

  endColor: Color4 = Color4.Transparent;
  endColorVariance: Color4 = Color4.Transparent;

  startFrame: number = 0.0;
  startFrameVariance: number = 0.0;

  frameSpeed: number = 0.0;
  frameSpeedVariance: number = 0.0;

  sceneAlpha: number = 1;
}
