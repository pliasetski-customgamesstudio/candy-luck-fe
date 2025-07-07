import { IScaleEntry } from './i_scale_entry';
import { IStreamSubscription, VerticalAlignment } from '@cgs/syd';
import { Stretch } from './stretch';
import { VoidFunc1 } from '@cgs/shared';
import { ScaleInfo } from './scale_info';

export class Rectangle {
  left: number;
  top: number;
  width: number;
  height: number;

  constructor(left: number, top: number, width: number, height: number) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  get right(): number {
    return this.left + this.width;
  }

  get bottom(): number {
    return this.top + this.height;
  }

  contains(x: number, y: number): boolean {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  }

  intersects(other: Rectangle): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }

  boundingBox(other: Rectangle): Rectangle {
    const left = Math.max(this.left, other.left);
    const top = Math.max(this.top, other.top);
    const right = Math.min(this.right, other.right);
    const bottom = Math.min(this.bottom, other.bottom);

    const width = right - left;
    const height = bottom - top;

    if (width > 0 && height > 0) {
      return new Rectangle(left, top, width, height);
    } else {
      // Return an empty rectangle (width or height is non-positive)
      return new Rectangle(0, 0, 0, 0);
    }
  }

  intersection(other: Rectangle): Rectangle {
    const left = Math.max(this.left, other.left);
    const top = Math.max(this.top, other.top);
    const right = Math.min(this.right, other.right);
    const bottom = Math.min(this.bottom, other.bottom);

    const width = right - left;
    const height = bottom - top;

    if (width > 0 && height > 0) {
      return new Rectangle(left, top, width, height);
    } else {
      // Return an empty rectangle (width or height is non-positive)
      return new Rectangle(0, 0, 0, 0);
    }
  }
}

export type RectangleProvider = () => Rectangle;

export interface IScaleCalculator {
  initialize(
    scaleEntries: IScaleEntry[],
    dstRect: Rectangle,
    stretch?: Stretch,
    verticalAlignment?: VerticalAlignment
  ): Promise<void>;
  initializeDynamic(
    scaleEntries: IScaleEntry[],
    dstRectProvider: RectangleProvider,
    stretch?: Stretch,
    verticalAlignment?: VerticalAlignment
  ): Promise<void>;
  stop(): void;
  reset(): void;
  invalidate(): Promise<void>;
  addScaleChangedListener(listener: VoidFunc1<ScaleInfo>): IStreamSubscription;
}
