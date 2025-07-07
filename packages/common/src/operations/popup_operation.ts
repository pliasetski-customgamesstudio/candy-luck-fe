import { IController, IControllerView } from '../controllers/i_controller';
import { IBackHandler } from '../view/navigation_stack';
import { AsyncOperationWithResultBase } from './operation_with_result_base';
import {
  CgsEvent,
  CGSKeyboardEvent,
  IDisposable,
  IResourceCache,
  IStreamSubscription,
  ResourcePackage,
  SceneObject,
  Tuple,
  Vector2,
} from '@cgs/syd';
import { IControllerFactory } from '../controllers/i_controller_factory';
import { IOperationContext } from './i_operation_context';
import { IAnimationFactory } from '../view/animation/i_animation_factory';
import { DisposeAction } from '../controllers/operation_controller_base';
import { Logger } from '@cgs/shared';
import { NoAnimationAnimationFactory } from '../view/animation/no_animation_animation_factory';
import { ScaleInfo } from '../scale_calculator/scale_info';
import { LangEx } from '@cgs/shared';

export abstract class PopupOperation<
    TController extends IControllerView<TView>,
    TView extends SceneObject,
    TResult,
  >
  extends AsyncOperationWithResultBase<TResult>
  implements IBackHandler
{
  private _eventReceivedSub: IStreamSubscription | null = null;
  private _interrupted: boolean = false;
  private _controllerFactory: IControllerFactory;
  private _scaleChangedSub: IStreamSubscription | null = null;
  private _viewType: symbol;
  private _controllerType: symbol;
  private _controller: IController;
  private _view: TView;

  constructor(
    controllerType: symbol,
    viewType: symbol,
    context: IOperationContext,
    controllerFactory: IControllerFactory
  ) {
    super(context);
    this._viewType = viewType;
    this._controllerType = controllerType;
    this._controllerFactory = controllerFactory;
  }

  get manualSpinner(): boolean {
    return false;
  }

  get manualFogging(): boolean {
    return false;
  }

  get manualScaling(): boolean {
    return false;
  }

  get interrupted(): boolean {
    return this._interrupted;
  }

  set interrupted(val: boolean) {
    this._interrupted = val;
  }

  withReplacedAnimationFactory(animationFactory: IAnimationFactory): IDisposable {
    const defaultAnimationFactory = this.context.viewContext.animationFactory;
    this.context.viewContext.animationFactory = animationFactory;
    return new DisposeAction(
      () => (this.context.viewContext.animationFactory = defaultAnimationFactory)
    );
  }

  get manualAnimation(): boolean {
    return false;
  }

  get ignorePopupOffset(): boolean {
    return false;
  }

  get controllerFactory(): IControllerFactory {
    return this._controllerFactory;
  }

  get controller(): IController {
    return this._controller;
  }

  set controller(value: IController) {
    this._controller = value;
  }

  get view(): TView {
    return this._view;
  }

  set view(value: TView) {
    this._view = value;
  }

  async finishExecution(): Promise<void> {
    const type = this.controller.constructor.name;
    Logger.Info(`Type: ${type}`);
    if (this.controller) {
      await this.controller.stop();
      await LangEx.usingAsync(
        this.withReplacedAnimationFactory(
          this.manualAnimation
            ? new NoAnimationAnimationFactory()
            : this.context.viewContext.animationFactory
        ),
        async () => {
          await this.context.viewContext.hide(this.view, true);
        }
      );
      await this.controller.afterHide();
      this.stopScaling();
      this._eventReceivedSub?.cancel();
    }
  }

  async internalExecute(): Promise<void> {
    this.initControllerAndView();
    this.onCreated();

    this.view.initialize();
    await this.controller.initialize();
    this.onInitialized();

    if (this.interrupted) return;

    this.startScaling();
    await LangEx.usingAsync(
      this.withReplacedAnimationFactory(
        this.manualAnimation
          ? new NoAnimationAnimationFactory()
          : this.context.viewContext.animationFactory
      ),
      async (d) => {
        await this.context.viewContext.show(this.view, this.manualSpinner, this.manualFogging);
      }
    );
    this.onShown();

    await this.controller.start();
    this.onStarted();
  }

  private initControllerAndView(): void {
    const controller = this._controllerFactory.create(this._controllerType, this._viewType, [
      this,
    ]) as TController;
    const view = controller.view;
    this._eventReceivedSub = view.eventReceived.listen((event) => this.onKeyboardEvent(event));

    this._controller = controller;
    this._view = view;
  }

  private startScaling(useGamesScaler: boolean = false): void {
    if (this.manualScaling) {
      return;
    }
    if (useGamesScaler) {
      // _scaleChangedSub = context.scaleManager.gamesScaler.addScaleChangedListener((info) => {
      //   this.onScale(info);
      // });
    } else {
      // _scaleChangedSub = context.scaleManager.lobbyScaler.addScaleChangedListener((info) => {
      //   this.onScale(info);
      // });
    }
  }

  private onScale(info: ScaleInfo): void {
    this.view.scale = info.scale.clone();
    this.view.position = info.position
      .clone()
      .add(this.ignorePopupOffset ? Vector2.Zero : this.popupOffset.multiply(info.scale));
  }

  private get popupOffset(): Vector2 {
    return this.context.scaleManager.popupsOffset;
  }

  private stopScaling(): void {
    this._scaleChangedSub?.cancel();
    this._scaleChangedSub = null;
  }

  protected onCreated(): void {}

  protected onInitialized(): void {}

  protected onShown(): void {}

  protected onStarted(): void {}

  handleBackKey(): boolean {
    return true;
  }

  private onKeyboardEvent(e: CgsEvent): void {
    if (e instanceof CGSKeyboardEvent) {
      e.accept();
    }
  }
}

export abstract class PackagePopupOperation<
  TController extends IControllerView<TView>,
  TView extends SceneObject,
  TResult,
> extends PopupOperation<TController, TView, TResult> {
  private _resourceCache: IResourceCache;
  private _packages: Tuple<ResourcePackage, string>[] = [];
  private _path: string;
  private _resourcePaths: string[];

  constructor(
    controllerType: symbol,
    viewType: symbol,
    context: IOperationContext,
    controllerFactory: IControllerFactory,
    resourceCache: IResourceCache,
    path: string | null = null
  ) {
    super(controllerType, viewType, context, controllerFactory);
    this._resourceCache = resourceCache;
    if (path) {
      this._resourcePaths = [path];
    }
  }

  get resourcePaths(): string[] {
    return this._resourcePaths;
  }

  async internalExecute(): Promise<void> {
    for (const path of this.resourcePaths) {
      const pkg = await this._resourceCache.loadPackage(path);
      this._packages.push(new Tuple<ResourcePackage, string>(pkg, path));
    }
    return super.internalExecute();
  }

  async finishExecution(): Promise<void> {
    await super.finishExecution();

    for (const packageWithPath of this._packages) {
      Logger.Info(`>>>>>>>>>>>>> Unload package ${packageWithPath.item2}`);
      this._resourceCache.unloadPackage(packageWithPath.item1);
    }
  }
}
