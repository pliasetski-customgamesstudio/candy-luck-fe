import { BlendState } from './63_BlendState';
import { RasterizerState } from './65_RasterizerState';
import { Color4 } from './10_Color4';
import { ImageAdjust } from './55_ImageAdjust';
import { Mask } from './211_Mask';
import { Matrix3 } from './57_Matrix3';
import { Vector2 } from './15_Vector2';

export class BatchStates {
  blends: BlendState[] = [];
  rasterizers: RasterizerState[] = [];
  colors: Color4[] = [];
  effects: number[] = [];
  imageAdjusts: ImageAdjust[] = [];
  masks: Mask[] = [];
  transforms: Matrix3[] = [];
  offsets: Vector2[] = [];

  blend: BlendState | null = null;
  rasterizer: RasterizerState | null = null;
  color: Color4 = Color4.White;
  effect: number = 0;
  imageAdjust: ImageAdjust | null = null;
  mask1: Mask | null = null;
  mask2: Mask | null = null;
}
