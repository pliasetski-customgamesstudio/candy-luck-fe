import { IDisposable } from './5_Disposable';

export abstract class Texture implements IDisposable {
  private readonly _width: number;
  private readonly _height: number;

  private readonly _invWidth: number;
  private readonly _invHeight: number;

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get invWidth(): number {
    return this._invWidth;
  }

  get invHeight(): number {
    return this._invHeight;
  }

  protected constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._invWidth = 1.0 / width;
    this._invHeight = 1.0 / height;
  }

  abstract dispose(): void;
}
