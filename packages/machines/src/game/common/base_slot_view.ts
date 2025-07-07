import { EventStream, SceneObject } from '@cgs/syd';
import { ISlotController } from './base_slot_controller';

export interface ISlotPopupView extends ISlotView {
  popupId: string | null;
  shown: EventStream<void>;
  closed: EventStream<void>;
  closing: EventStream<void>;
  showing: EventStream<void>;
  show(): void;
  hide(): void;
}

export interface ISlotView {
  initController(controller: ISlotController): void;
}

export abstract class BaseSlotView<T> implements ISlotView {
  protected _root: SceneObject;
  private _controller: T;

  protected constructor(root: SceneObject) {
    this._root = root;
  }

  get controller(): T {
    return this._controller;
  }

  set controller(value: T) {
    this._controller = value;
  }

  initController(cont: ISlotController): void {
    this._controller = cont as T;
  }

  get root(): SceneObject {
    return this._root;
  }

  set root(value: SceneObject) {
    this._root = value;
  }
}
