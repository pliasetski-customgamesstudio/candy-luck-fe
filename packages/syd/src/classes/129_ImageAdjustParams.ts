import { Color4 } from './10_Color4';
import { ImageAdjust } from './55_ImageAdjust';
import { toRadians } from './globalFunctions';

export class ImageAdjustParams {
  public readonly matrix: Float32Array = new Float32Array(9);

  private _offset: number;
  private _colorOffset: Color4;

  public get offset(): number {
    return this._offset;
  }

  public get colorOffset(): Color4 {
    return this._colorOffset;
  }

  update(imageAdjust: ImageAdjust): void {
    const radians: number = toRadians(-imageAdjust.hue);
    const su: number = Math.cos(radians) * imageAdjust.saturation;
    const sw: number = Math.sin(radians) * imageAdjust.saturation;

    this.matrix[0] = 0.212960007741037 + 0.787039992258963 * su + 0.212947657193979 * sw;
    this.matrix[1] = 0.213039493400513 - 0.213039493400513 * su - 0.14297276916352 * sw;
    this.matrix[2] = 0.212855415619671 - 0.212855415619671 * su + 0.786920220534281 * sw;
    this.matrix[3] = 0.714896520889274 - 0.714896520889274 * su + 0.714954112622699 * sw;
    this.matrix[4] = 0.715012010040446 + 0.284987989959554 * su - 0.139998611749109 * sw;
    this.matrix[5] = 0.715179308553242 - 0.715179308553242 * su - 0.714881338837406 * sw;
    this.matrix[6] = 0.072187466027987 - 0.072187466027987 * su - 0.927889511153817 * sw;
    this.matrix[7] = 0.0719479421976 - 0.0719479421976 * su + 0.282971154844208 * sw;
    this.matrix[8] = 0.0719647030178927 + 0.928035296982108 * su - 0.0720389248223071 * sw;

    this.matrix[0] *= imageAdjust.contrast;
    this.matrix[1] *= imageAdjust.contrast;
    this.matrix[2] *= imageAdjust.contrast;
    this.matrix[3] *= imageAdjust.contrast;
    this.matrix[4] *= imageAdjust.contrast;
    this.matrix[5] *= imageAdjust.contrast;
    this.matrix[6] *= imageAdjust.contrast;
    this.matrix[7] *= imageAdjust.contrast;
    this.matrix[8] *= imageAdjust.contrast;

    this._offset =
      this._FlashMiddlePoint(imageAdjust.contrast) + imageAdjust.brightness * imageAdjust.contrast;
    this._colorOffset = imageAdjust.colorOffset;
  }

  private _FlashMiddlePoint(contrast: number): number {
    return 0.25 * (1.0 - contrast);
  }
}
