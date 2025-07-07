import { FrameUpdateScene } from './172_FrameUpdateScene';
import { SceneObject } from './288_SceneObject';
import { Action } from './84_Action';
import { IStreamSubscription } from './22_EventStreamSubscription';

export class ActionActivator {
  private _updater: FrameUpdateScene;
  private _host: SceneObject;
  private _action: Action | null = null;
  private _started: boolean = false;
  private _firstUpdate: boolean = false;
  private _updateSub: IStreamSubscription;

  public pause: boolean = false;

  constructor(host: SceneObject) {
    this._host = host;
    this._action = null;
  }

  public static withAction(host: SceneObject, action: Action) {
    const res = new ActionActivator(host);
    res._action = action;
    return res;
  }

  public get action(): Action | null {
    return this._action;
  }

  public set action(value: Action | null) {
    this.stop();
    this._action = value;
  }

  public start() {
    if (!this._started && this._action) {
      this._updater = new FrameUpdateScene();
      this._host.addChild(this._updater);
      this._action.begin();
      this._updateSub = this._updater.framePulsate.listen((frameTime) => this._onUpdate(frameTime));
    }
    this._firstUpdate = true;
    this._started = true;
  }

  public get started(): boolean {
    return this._started;
  }

  public stop() {
    if (this._started) {
      this._updateSub.cancel();
      this._host.removeChild(this._updater);
      this._started = false;
    }
  }

  public end() {
    if (this._action) {
      this._action.end();
    }
    this.stop();
  }

  private _onUpdate(frameTime?: number) {
    if (this._started && !this.pause) {
      let elapsedTime: number = 0.0;
      if (this._firstUpdate) {
        this._firstUpdate = false;
      } else {
        elapsedTime = frameTime!;
      }
      this._action!.update(elapsedTime);
      if (this._action!.isDone) {
        this.stop();
      }
    }
  }
}
