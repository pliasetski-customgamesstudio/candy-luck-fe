import { ScrollDirection } from './275_AbstractScrollBarSceneObject';
import { Vector2 } from './15_Vector2';

export class FixedScrollBarSceneObject {
  private _factor: number;
  private _distance: number;
  private direction: ScrollDirection;
  private position: Vector2;
  private size: Vector2;

  constructor(direction: ScrollDirection) {
    this.direction = direction;
  }

  updatePosition(contentPosition: Vector2): void {
    const isHorizontal: boolean = this.direction === ScrollDirection.Horizontal;
    let orientedPosition: number = isHorizontal ? -contentPosition.x : -contentPosition.y;
    orientedPosition *= this._factor;
    orientedPosition = Math.min(Math.max(orientedPosition, 0.0), this._distance);
    this.position = isHorizontal
      ? new Vector2(orientedPosition, 0.0)
      : new Vector2(0.0, orientedPosition);
  }

  updateScrollBarParams(
    scrollSliderSize: Vector2,
    contentSize: Vector2,
    viewPortSize: Vector2
  ): void {
    const isHorizontal: boolean = this.direction === ScrollDirection.Horizontal;
    const orientedScrollSliderSize: number = isHorizontal ? scrollSliderSize.x : scrollSliderSize.y;
    const orientedContentSize: number = isHorizontal ? contentSize.x : contentSize.y;
    const orientedBarSize: number = isHorizontal ? this.size.x : this.size.y;
    const orientedViewPort: number = isHorizontal ? viewPortSize.x : viewPortSize.y;
    this._distance = orientedScrollSliderSize - orientedBarSize;
    this._factor = this._distance / (orientedContentSize - orientedViewPort);
  }
}
