import { ScrollResizeMode } from './182_Section';

export class SizeInfo {
  size: number;
  resizeMode: ScrollResizeMode;

  constructor(size: number, resizeMode: ScrollResizeMode) {
    this.size = size;
    this.resizeMode = resizeMode;
  }
}
