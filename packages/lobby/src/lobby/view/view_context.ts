import { IViewContext } from '@cgs/common';
import {
  AbstractMouseEvent,
  CgsEvent,
  IDisposable,
  IStreamSubscription,
  ResourceCache,
  SceneBuilder,
  SceneObject,
} from '@cgs/syd';
import { SpinnerView } from './spinner_view';
import { FoggingNode } from '@cgs/common';
import { IViewFactory } from '@cgs/common';
import { EmptyPreloader, ISplashManager } from '@cgs/common';
import { ICoordinateSystemInfoProvider } from '@cgs/common';
import { ScaleManager } from '@cgs/common';
import { IAnimationFactory } from '@cgs/common';
import { NodeUtils } from '@cgs/shared';
import { AsyncDisposable, IAsyncDisposable } from '@cgs/common';
import { NonDisposableAnimationFactory } from '@cgs/common';
import { IAnimation } from '@cgs/common';
import { DisposeAction } from '@cgs/common';

export const T_ViewContext = Symbol('ViewContext');
export class ViewContext implements IViewContext {
  private _resourceCache: ResourceCache;
  private _root: SceneObject;
  private _spinnerNode: SpinnerView;
  private _sceneBuilder: SceneBuilder;
  private _foggingNode: FoggingNode;
  private SpinnerDrawOrder: number;
  private _spinningSection: number = 0;
  private _darknessFactor: number = 0.8;
  private _scaleManager: ScaleManager;
  private _viewFactory: IViewFactory;
  private _blockTouchSubscription: IStreamSubscription | null;
  private _rootTouchSubscription: IStreamSubscription | null;
  private _splashManager: ISplashManager | null;
  private _blockingTouchHandler: (e: AbstractMouseEvent) => void;
  private _coordinateSystemInfoProvider: ICoordinateSystemInfoProvider;
  private _scalerSub: IStreamSubscription;

  constructor(
    root: SceneObject,
    showSpinner: boolean,
    resourceCache: ResourceCache,
    sceneBuilder: SceneBuilder,
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
    _scaleManager: ScaleManager,
    _viewFactory: IViewFactory
  ) {
    this._root = root;
    this._resourceCache = resourceCache;
    this._sceneBuilder = sceneBuilder;
    this.SpinnerDrawOrder = root.z + 1000 - 1;
    this.initSpinner(showSpinner);
    this._coordinateSystemInfoProvider = coordinateSystemInfoProvider;
    this._foggingNode = new FoggingNode(
      this._resourceCache,
      coordinateSystemInfoProvider,
      this._darknessFactor
    );
    this._foggingNode.initialize();
    this._foggingNode.id = 'FoggingNode';

    this._root.touchable = true;
    this._foggingNode.visible = false;
    this._rootTouchSubscription = this._root.eventReceived.listen((e) => {
      e?.accept();
    });
    this._root.addChild(this._foggingNode);
  }

  animationFactory: IAnimationFactory;

  private initSpinner(_showSpinner: boolean): void {}

  dispose(): void {
    this._scalerSub?.cancel();
    this._rootTouchSubscription?.cancel();
    this._rootTouchSubscription = null;
    this._blockTouchSubscription?.cancel();
    this._blockTouchSubscription = null;
    const childs = this._root.childs.slice();
    NodeUtils.traverseAll(this._root, (disp) => {
      disp.dispose();
    });
    this._root.removeAllChilds();

    for (const child of childs) {
      child.deinitialize();
    }
  }

  hideSpinner(): void {
    // this._spinnerNode.visible = false;
    // this._spinnerNode.hidden = true;
  }

  get root(): SceneObject {
    return this._root;
  }

  async hide(view: SceneObject, _manualSpinner: boolean = false): Promise<void> {
    const hideAnimation = this.animationFactory.createHideAnimation(this._root, view);
    await this.startAnimation(hideAnimation);

    return Promise.resolve();
  }

  async temporaryHide(view: SceneObject): Promise<IAsyncDisposable> {
    const defaultAnimationFactory = this.animationFactory;
    const nonDisposableAnimationFactory = new NonDisposableAnimationFactory(
      this._coordinateSystemInfoProvider
    );

    this.animationFactory = nonDisposableAnimationFactory;

    // Save touchable nodes. All touch is disabled when hiding, so we need to correctly restore it later
    const touchableNodes: SceneObject[] = [];

    NodeUtils.traverseAll(view, (node) => {
      if (node.touchable) {
        touchableNodes.push(node);
      }
    });

    await this.hide(view, true);

    return new AsyncDisposable(async () => {
      // view.position = Vector2.Zero;
      this.animationFactory = defaultAnimationFactory;

      // restore IsTouchable
      NodeUtils.traverseAll(view, (node) => {
        if (touchableNodes.includes(node)) {
          node.touchable = true;
        }
      });

      await this.show(view);
    });
  }

  async show(
    view: SceneObject,
    manualSpinner: boolean = false,
    manualFogging: boolean = false
  ): Promise<void> {
    if (!manualFogging) {
      this.showFogging();
    }
    if (!manualSpinner) {
      this.hideSpinner();
    }

    view.z = this.getMaxDrawOrder();

    const showAnimation = this.animationFactory.createShowAnimation(this._root, view);
    await this.startAnimation(showAnimation);

    return Promise.resolve();
  }

  replaceBlockingTouchHandler(handler: (e: CgsEvent) => void): void {
    this._rootTouchSubscription?.cancel();
    this._rootTouchSubscription = null;

    this._rootTouchSubscription = this._root.eventReceived.listen((e) => {
      if (e) handler(e);
    });
  }

  private getMaxDrawOrder(): number {
    const simpleChildren = this._root.childs /*.filter((child) => child != this._spinnerNode)*/
      .slice();

    return simpleChildren.length > 0 ? simpleChildren.reduce((v, o) => Math.max(v, o.z), 0) : 0;
  }

  async showSpinner(): Promise<void> {
    // this._spinnerNode.visible = true;;
    // this._spinnerNode.hidden = false;
  }

  async startAnimation(animation: IAnimation): Promise<void> {
    await animation.play();
  }

  spinningSection(): IDisposable {
    this._spinningSection++;
    this.showSpinner();
    return new DisposeAction(() => {
      const decrement = --this._spinningSection;
      if (decrement === 0) {
        this.hideSpinner();
      }
    });
  }

  hideFogging(): void {
    this._foggingNode.visible = false;
  }

  showFogging(): void {
    this._foggingNode.visible = true;
  }

  set splashManager(value: ISplashManager) {
    this._splashManager = value;
  }

  get splashManager(): ISplashManager {
    if (!this._splashManager) {
      this._splashManager = new EmptyPreloader();
    }

    return this._splashManager;
  }
}
