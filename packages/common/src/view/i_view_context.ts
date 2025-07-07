import { CgsEvent, IDisposable, SceneObject } from '@cgs/syd';
import { IAnimationFactory } from './animation/i_animation_factory';
import { IAnimation } from './animation/i_animation';
import { ISplashManager } from '../services/interfaces/i_splash_manager';
import { IAsyncDisposable } from '../services/interfaces/i_async_disposable';
import { VoidFunc1 } from '@cgs/shared';

export const T_IViewContext = Symbol('IViewContext');
export interface IViewContext extends IDisposable {
  root: SceneObject;
  show(view: SceneObject, manualSpinner?: boolean, manualFogging?: boolean): Promise<void>;
  hide(view: SceneObject, manualSpinner?: boolean): Promise<void>;
  animationFactory: IAnimationFactory;
  showSpinner(): void;
  hideSpinner(): void;
  showFogging(): void;
  hideFogging(): void;
  startAnimation(animation: IAnimation): Promise<void>;
  spinningSection(): IDisposable;
  splashManager: ISplashManager;
  replaceBlockingTouchHandler(handler: VoidFunc1<CgsEvent>): void;
  temporaryHide(view: SceneObject): Promise<IAsyncDisposable>;
}
