import { Vector2 } from './15_Vector2';

export interface IScrollBar {
  show(): void;

  updateSize(viewPortSize: Vector2, contentSize: Vector2): void;

  updatePosition(contentPosition: Vector2): void;

  hide(): void;

  size: Vector2;
}
