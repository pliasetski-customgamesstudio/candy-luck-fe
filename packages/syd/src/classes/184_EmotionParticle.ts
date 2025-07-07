import { Vector2 } from './15_Vector2';
import { Color4 } from './10_Color4';

export class EmotionParticle {
  emitPosition: Vector2 = Vector2.undefined();
  position: Vector2 = Vector2.undefined();
  direction: Vector2 = Vector2.undefined();
  rotate: number;
  deltaRotate: number;
  color: Color4 = Color4.undefined();
  deltaColor: Color4 = Color4.undefined();
  radialAccel: number;
  tangentialAccel: number;
  size: Vector2 = Vector2.undefined();
  deltaSize: Vector2 = Vector2.undefined();
  lifeTime: number;
  frame: number;
  frameSpeed: number;
}
