import { Rect } from './112_Rect';
import { Index } from './28_Index';

export class VisualIndex {
  index: Index;
  visualRect: Rect;

  constructor(index: Index, visualRect: Rect) {
    this.index = index;
    this.visualRect = visualRect;
  }
}
