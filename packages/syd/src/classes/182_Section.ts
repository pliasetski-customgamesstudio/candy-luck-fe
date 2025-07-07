import { SizeInfo } from './109_SizeInfo';

export class Section {
  private _elementsSizes: SizeInfo[] = [];
  private _count: number;
  private _defaultSize: number;
  public defaultResizeMode: ScrollResizeMode;

  constructor() {
    this._count = 0;
  }

  public clear(): void {
    this._count = 0;
  }

  public getResizeMode(element: number): ScrollResizeMode {
    let mode = ScrollResizeMode.Fixed;
    if (element >= 0 && element < this._count) {
      mode = this._elementsSizes[element].resizeMode;
    }
    return mode;
  }

  public setResizeMode(element: number, mode: ScrollResizeMode): void {
    if (element >= 0) {
      if (element >= this._count) {
        this.count = element + 1;
      }
      this._elementsSizes[element] = new SizeInfo(this._elementsSizes[element].size, mode);
    }
  }

  public get count(): number {
    return this._count;
  }

  public set count(value: number) {
    if (value >= 0) {
      this._count = value;
      if (this._count > this._elementsSizes.length) {
        const numToAdd = this._count - this._elementsSizes.length;
        for (let i = 0; i < numToAdd; i++) {
          this._elementsSizes.push(new SizeInfo(this._defaultSize, this.defaultResizeMode));
        }
      } else if (this._count < this._elementsSizes.length) {
        this._elementsSizes.splice(this._count, this._elementsSizes.length);
      }
    }
  }

  public reset(): void {
    for (let i = 0; i < this._count; i++) {
      this._elementsSizes[i] = new SizeInfo(this._defaultSize, this.defaultResizeMode);
    }
  }

  public insert(element: number, elementsCount: number): void {
    if (element >= 0 && element <= this._count) {
      for (let i = 0; i < elementsCount; i++) {
        const si = new SizeInfo(this._defaultSize, this.defaultResizeMode);
        this._elementsSizes.splice(element, 0, si);
        this._count++;
      }
    }
  }

  public remove(element: number, elementsCount: number): void {
    if (element >= 0 && element < this._count) {
      if (element + elementsCount > this._count) {
        elementsCount = this._count - element;
      }
      this._elementsSizes.splice(element, elementsCount);
      this._count -= elementsCount;
    }
  }

  public getSize(element: number): number {
    let s = 0;
    if (element >= 0 && element < this._count) {
      const info = this._elementsSizes[element];
      s = info.size;
    }
    return s;
  }

  public setSize(element: number, size: number): void {
    if (element >= 0) {
      if (element >= this._count) {
        this.count = element + 1;
      }
      this._elementsSizes[element] = new SizeInfo(size, this._elementsSizes[element].resizeMode);
    }
  }

  public get defaultSize(): number {
    return this._defaultSize;
  }

  public set defaultSize(value: number) {
    if (value > 0) {
      this._defaultSize = value;
    }
  }

  public element(offset: number): number {
    if (offset < 0 || this._count < 1) {
      return -1;
    }
    let sum = 0;
    for (let i = 0; i < this._count; i++) {
      const info = this._elementsSizes[i];
      const size = info.size;
      if (sum <= offset && sum + size >= offset) {
        return i;
      }
      sum += size;
    }
    return this._count;
  }

  public offset(element: number): number {
    let offset = -1;
    if (element >= 0 && element < this._count) {
      let sum = 0;
      for (let i = 0; i < element; i++) {
        const info = this._elementsSizes[i];
        sum += info.size;
      }
      offset = sum;
    }
    return offset;
  }

  public length(): number {
    let length = 0;
    for (let i = 0; i < this._count; i++) {
      const info = this._elementsSizes[i];
      length += info.size;
    }
    return length;
  }
}

export enum ScrollResizeMode {
  Fixed,
  Content,
}
