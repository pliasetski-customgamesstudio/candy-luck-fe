import { IShader } from './228_IShader';
import { ShaderProgram } from './103_ShaderProgram';
import { Matrix4 } from './64_Matrix4';
import { VertexElementUsage } from './69_VertexElementUsage';
import { ImageAdjustParams } from './129_ImageAdjustParams';
import { MaskParams } from './210_MaskParams';
import { Matrix3 } from './57_Matrix3';

export class Shader implements IShader {
  program: ShaderProgram;

  static readonly DiffuseTextureUnit = 0;

  private _projection: Matrix4;

  private _uPMatrix: any;

  private _brLocation: any;
  private _mtxLocation: any;

  private _clrOffLocation: any;

  private _uTransform: any;

  private _uMaskMatrix: any[] = new Array(2);
  private _maskTextCoords: any[] = new Array(2);
  private _maskTextCoordsScale: any[] = new Array(2);

  constructor(program: ShaderProgram) {
    this.program = program;
    program.bindAttribute(VertexElementUsage.Position, 'av_Pos');
    program.bindAttribute(VertexElementUsage.TexCoord, 'av_TexCoord');
    program.bindAttribute(VertexElementUsage.Color, 'av_Color');

    this._resolveAttributes();
  }

  dispose(): void {
    this.program.dispose();
  }

  private _resolveAttributes(): void {
    this.program.link();

    this._uPMatrix = this.program.getUniformLocation('uv_Projection');

    // Color Adjust
    this._brLocation = this.program.getUniformLocation('br');
    this._mtxLocation = this.program.getUniformLocation('hue');

    this._clrOffLocation = this.program.getUniformLocation('clrOffset');

    this._uTransform = this.program.getUniformLocation('um_Transform');

    const diffuse = this.program.getUniformLocation('us_0');
    if (diffuse) {
      this.program.uniform1i(diffuse, Shader.DiffuseTextureUnit);
    }

    this._addMask(0);
    this._addMask(1);
  }

  private _addMask(index: number): void {
    const p = index + 1;
    this._uMaskMatrix[index] = this.program.getUniformLocation(`maskMatrix${p}`);

    const mask = this.program.getUniformLocation(`us_M${p}`);
    if (mask) {
      this.program.uniform1i(mask, p);
    }
    this._maskTextCoords[index] = this.program.getUniformLocation(`maskTexCoord${p}`);
    this._maskTextCoordsScale[index] = this.program.getUniformLocation(`maskTexCoordScale${p}`);
  }

  setProjection(value: Matrix4): void {
    if (this._projection !== value) {
      this.program.uniform4f(
        this._uPMatrix,
        value.data[0],
        value.data[5],
        value.data[12],
        value.data[13]
      );
      this._projection = value;
    }
  }

  setImageAdjust(imageAdjust: ImageAdjustParams): void {
    if (this._brLocation && this._mtxLocation) {
      this.program.uniformMatrix3fv(this._mtxLocation, imageAdjust.matrix);
      this.program.uniform3f(
        this._brLocation,
        imageAdjust.offset,
        imageAdjust.offset,
        imageAdjust.offset
      );
    }

    if (this._clrOffLocation) {
      this.program.uniform3f(
        this._clrOffLocation,
        imageAdjust.colorOffset.r,
        imageAdjust.colorOffset.g,
        imageAdjust.colorOffset.b
      );
    }
  }

  setMask(index: number, params: MaskParams): void {
    if (this._uMaskMatrix[index]) {
      this.program.uniformMatrix3fv(this._uMaskMatrix[index], params.matrix.toList());
      this.program.uniform2f(this._maskTextCoords[index], params.texCoords.x, params.texCoords.y);
      this.program.uniform2f(
        this._maskTextCoordsScale[index],
        params.texCoordsScale.x,
        params.texCoordsScale.y
      );
    }
  }

  setTransform(params: Matrix3): void {
    if (this._uTransform) {
      this.program.uniformMatrix3fv(this._uTransform, params.toList());
    }
  }
}
