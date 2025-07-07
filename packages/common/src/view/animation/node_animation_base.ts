import { IAnimation } from './i_animation';
import { Action, ActionActivator, SceneObject } from '@cgs/syd';

export abstract class NodeAnimationBase implements IAnimation {
  private readonly _parent: SceneObject;
  get Parent(): SceneObject {
    return this._parent;
  }
  private _activator: ActionActivator;

  abstract createAction(): Action;
  abstract prepareTree(): void;
  abstract restoreTree(): void;

  constructor(parent: SceneObject) {
    this._parent = parent;
  }

  async play(): Promise<void> {
    this.prepareTree();
    await this.playInternal();
    this.restoreTree();
  }

  private async playInternal(): Promise<void> {
    const action: Action = this.createAction();
    this._activator = ActionActivator.withAction(this._parent, action);

    const waitTask = new Promise<void>((resolve) => {
      action.done.listen(() => resolve());
    });

    this._activator.start();

    await waitTask;

    this._activator.stop();
  }
}
