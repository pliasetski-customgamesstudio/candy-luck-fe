import { IShader } from './228_IShader';
import { ShaderProgram } from './103_ShaderProgram';
import { Matrix4 } from './64_Matrix4';
import { ImageAdjustParams } from './129_ImageAdjustParams';
import { MaskParams } from './210_MaskParams';
import { Matrix3 } from './57_Matrix3';

export class EmptyShader implements IShader {
  program: ShaderProgram | null = null;

  constructor() {
    this.program = null;
  }

  dispose(): void {}

  setProjection(_value: Matrix4): void {}

  setImageAdjust(_imageAdjust: ImageAdjustParams): void {}

  setMask(_index: number, _params: MaskParams): void {}

  setTransform(_params: Matrix3): void {}
}
