// import { OverlayButton } from './253_OverlayButton';
import { SceneObject } from './288_SceneObject';
import { IntervalAction } from './50_IntervalAction';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';
import { SceneObjectType } from './SceneObjectType';

export class ProgressBar extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.ProgressBar;
  }
  private _action: IntervalAction | null = null;
  private _progress: number;
  private _progressChangedDispatcher: EventDispatcher<number> = new EventDispatcher<number>();

  get progressChanged(): EventStream<number> {
    return this._progressChangedDispatcher.eventStream;
  }

  public actionId: string;

  get progress(): number {
    return this._progress;
  }

  set progress(value: number) {
    this._action!.begin();
    this._action!.update(value * this._action!.duration);
    this._progress = value;
    this._progressChangedDispatcher.dispatchEvent(value);
  }

  initializeImpl(): void {
    this._action = this.getAnimation(this.actionId);
    this.progress = 0.0;
  }
}
