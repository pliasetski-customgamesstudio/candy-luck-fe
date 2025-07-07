import { IFramePulse } from './20_IFramePulse';
import { SceneObject } from './288_SceneObject';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';
import { SceneObjectType } from './SceneObjectType';

export class FrameUpdateScene extends SceneObject implements IFramePulse {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Node;
  }

  private _updatedDispatcher: EventDispatcher<number> = new EventDispatcher();

  public get framePulsate(): EventStream<number> {
    return this._updatedDispatcher.eventStream;
  }

  public update(dt: number): void {
    if (this.active) {
      this._updatedDispatcher.dispatchEvent(dt);
    }
  }
}
