import { Compatibility, Matrix3, Platform, Rect, Vector2 } from '@cgs/syd';

export const T_ICoordinateSystemInfoProvider = Symbol('ICoordinateSystemInfoProvider');
export interface ICoordinateSystemInfoProvider {
  heightSize: string;
  coordinateSystem: Rect;
  displayResolution: Vector2;
  canvas: HTMLCanvasElement;
  transformToGlobalPosition(localPosition: Matrix3): Vector2;
}

export class CoordinateSystemInfoProvider implements ICoordinateSystemInfoProvider {
  private _canvas: HTMLCanvasElement;

  static RESOLUTION_LOW: string = 'low';
  static RESOLUTION_MOBILE: string = 'low';
  static RESOLUTION_MED: string = 'med';
  static RESOLUTION_HIGH: string = 'high';

  static isPortrait(): boolean {
    return window.innerWidth < window.innerHeight;
  }

  private static _coordinateSystemMap: Record<string, { w: number; h: number }> = {
    mobile: {
      w: 1657.0,
      h: 768.0,
    },
    low: {
      w: 1657.0,
      h: 768.0,
    },
  };

  constructor(platform: Platform) {
    this._canvas = platform.view.canvas;

    // IE 10 devicePixelRatio is null
    const pixelRatio = window.devicePixelRatio ?? 1;
    const height = window.screen.height * pixelRatio;
    const isMobileBrowser = Compatibility.IsMobileBrowser;
    this._resolutionKey =
      isMobileBrowser ||
      height <
        1440 /* && BrowserHelper.parseUserAgentAccurate().browser.toUpperCase().includes("IE")*/
        ? CoordinateSystemInfoProvider.RESOLUTION_LOW
        : CoordinateSystemInfoProvider.RESOLUTION_MED;
    if (!CoordinateSystemInfoProvider._coordinateSystemMap.hasOwnProperty(this._resolutionKey)) {
      this._resolutionKey = CoordinateSystemInfoProvider.RESOLUTION_LOW;
    }
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  transformToGlobalPosition(localPosition: Matrix3): Vector2 {
    const projection = this._calculateTransformationMatrix(this.coordinateSystem);
    const transformedGlobalPosition = projection.transformVector(
      new Vector2(localPosition.tx, localPosition.ty)
    );
    return transformedGlobalPosition;
  }

  private _calculateTransformationMatrix(coordinateSystem: Rect): Matrix3 {
    const projection = Matrix3.undefined();

    const scale = Matrix3.fromScale(
      this._canvas.width / coordinateSystem.width,
      this._canvas.height / coordinateSystem.height
    );
    const translate = Matrix3.fromTranslation(-coordinateSystem.lt.x, -coordinateSystem.lt.y);

    Matrix3.Multiply(translate, scale, projection);

    return projection;
  }

  get coordinateSystem(): Rect {
    return new Rect(
      new Vector2(0.0, 0.0),
      new Vector2(
        CoordinateSystemInfoProvider._coordinateSystemMap[this._resolutionKey].w,
        CoordinateSystemInfoProvider._coordinateSystemMap[this._resolutionKey].h
      )
    );
  }

  get displayResolution(): Vector2 {
    return new Vector2(this.coordinateSystem.width, this.coordinateSystem.height);
  }

  get heightSize(): string {
    return this._resolutionKey;
  }

  private _resolutionKey: string;
}
