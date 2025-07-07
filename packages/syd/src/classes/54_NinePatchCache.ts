import { Rect } from './112_Rect';

export class NinePatchCache {
  readonly src: Rect;
  readonly dst: Rect;

  constructor(src: Rect, dst: Rect) {
    this.src = src;
    this.dst = dst;
  }
}
