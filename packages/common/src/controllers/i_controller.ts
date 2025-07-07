import { SceneObject } from '@cgs/syd';
import { IClientProperties } from '../services/interfaces/i_client_properties';
import { IControllerFactory } from './i_controller_factory';

export interface IController {
  isInitialized: boolean;
  isStarted: boolean;
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  afterHide(): Promise<void>;

  composite?: ICompositeController;
}

export abstract class ICompositeControllerChild {
  abstract parent: ICompositeController;
}

export interface IControllerView<TView extends SceneObject> extends IController {
  view: TView;
}

export class CompositeChildRegistration {
  private _baseChildType: symbol;
  get baseChildType(): symbol {
    return this._baseChildType;
  }
  set baseChildType(value: symbol) {
    this._baseChildType = value;
  }

  private _childType: symbol;
  get childType(): symbol {
    return this._childType;
  }
  set childType(value: symbol) {
    this._childType = value;
  }

  private _leftSideChildType: symbol | null;
  get leftSideChildType(): symbol | null {
    return this._leftSideChildType;
  }

  private _rightSideChildType: symbol | null;
  get rightSideChildType(): symbol | null {
    return this._rightSideChildType;
  }

  private _viewType: symbol;
  get viewType(): symbol {
    return this._viewType;
  }
  set viewType(value: symbol) {
    this._viewType = value;
  }

  private _leftSideViewType: symbol | null;
  get leftSideViewType(): symbol | null {
    return this._leftSideViewType;
  }

  private _rightSideViewType: symbol | null;
  get rightSideViewType(): symbol | null {
    return this._rightSideViewType;
  }

  private _useParentView: boolean;
  get useParentView(): boolean {
    return this._useParentView;
  }

  constructor(
    childType: symbol,
    viewType: symbol,
    useParentView: boolean = false,
    leftSideChildType: symbol | null = null,
    leftSideViewType: symbol | null = null,
    rightSideChildType: symbol | null = null,
    rightSideViewType: symbol | null = null
  ) {
    this._childType = childType;
    this._viewType = viewType;
    this._useParentView = useParentView;
    this._leftSideChildType = leftSideChildType;
    this._leftSideViewType = leftSideViewType;
    this._rightSideChildType = rightSideChildType;
    this._rightSideViewType = rightSideViewType;
  }
}

export interface ICompositeController {
  childRegistrations: CompositeChildRegistration[];
  initChildren(clientProperties: IClientProperties): void;
  checkNewChildren(clientProperties: IClientProperties): Promise<void>;
  getChild(controller: symbol): IControllerView<SceneObject> | null;
  controllerFactory: IControllerFactory;
  getChildren(): IController[];
}
