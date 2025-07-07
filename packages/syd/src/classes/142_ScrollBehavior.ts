import { EventDispatcher } from './78_EventDispatcher';
import { Vector2 } from './15_Vector2';
import { EventStream } from './22_EventStreamSubscription';

export abstract class ScrollBehavior {
  private _changePositionDispatcher: EventDispatcher<Vector2> = new EventDispatcher<Vector2>();

  public get changePosition(): EventStream<Vector2> {
    return this._changePositionDispatcher.eventStream;
  }

  private _scrollFinishedDispatcher: EventDispatcher<void> = new EventDispatcher<void>();

  public get scrollFinished(): EventStream<void> {
    return this._scrollFinishedDispatcher.eventStream;
  }

  public abstract cancel(): void;

  public abstract down(position: Vector2): void;

  public abstract move(position: Vector2, dx: number, dy: number, dt: number): void;

  public abstract up(position: Vector2, dx: number, dy: number, dt: number): void;

  public abstract wheel(position: Vector2, dx: number, dy: number, dt: number): void;

  public abstract setParams(scrollSize: Vector2, contentSize: Vector2): void;

  public abstract setOffset(offset: Vector2): void;

  protected onChangePosition(position: Vector2): void {
    this._changePositionDispatcher.dispatchEvent(position);
  }

  protected onScrollFinished(): void {
    this._scrollFinishedDispatcher.dispatchEvent();
  }
}
