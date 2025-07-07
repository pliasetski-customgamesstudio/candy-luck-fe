import { ShaderProgram } from './103_ShaderProgram';
import { ImageAdjustParams } from './129_ImageAdjustParams';
import { MaskParams } from './210_MaskParams';
import { Matrix3 } from './57_Matrix3';
import { IDisposable } from './5_Disposable';
import { Matrix4 } from './64_Matrix4';

export interface IShader extends IDisposable {
  program: ShaderProgram | null;

  setProjection(value: Matrix4): void;

  setImageAdjust(imageAdjust: ImageAdjustParams): void;

  setMask(index: number, params: MaskParams): void;

  setTransform(params: Matrix3): void;
}
