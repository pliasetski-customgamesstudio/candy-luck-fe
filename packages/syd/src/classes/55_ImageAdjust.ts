import { Color4 } from './10_Color4';

export class ImageAdjust {
  static readonly Default: ImageAdjust = new ImageAdjust();

  static Combine(a: ImageAdjust, b: ImageAdjust): ImageAdjust {
    const result: ImageAdjust = new ImageAdjust();

    result.brightness = a.brightness + b.brightness;
    result.contrast = a.contrast * b.contrast;
    result.saturation = a.saturation * b.saturation;
    result.hue = a.hue + b.hue;
    result.colorOffset = a.colorOffset.add(b.colorOffset);

    return result;
  }

  static Compare(a: ImageAdjust, b: ImageAdjust): boolean {
    return (
      a.brightness === b.brightness &&
      a.contrast === b.contrast &&
      a.saturation === b.saturation &&
      a.hue === b.hue &&
      a.colorOffset === b.colorOffset
    );
  }

  brightness: number = 0.0;
  contrast: number = 1.0;
  saturation: number = 1.0;
  hue: number = 0.0;

  colorOffset: Color4 = Color4.Black;

  copy(to: ImageAdjust): void {
    to.brightness = this.brightness;
    to.contrast = this.contrast;
    to.saturation = this.saturation;
    to.hue = this.hue;
    to.colorOffset = this.colorOffset.clone();
  }
}
