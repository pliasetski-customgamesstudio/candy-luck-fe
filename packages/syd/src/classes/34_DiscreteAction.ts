import { ValueAction } from './144_ValueAction';

export class DiscreteAction<T> extends ValueAction<T> {
  private _start: T;

  public withValue(start: T): void {
    this._start = start;
  }

  public beginImpl(): void {
    this.dispatchValueChange(this._start);
  }

  public endImpl(): void {}

  public updateImpl(_dt: number): void {}
}
