import { IViewContextManager } from './i_view_context_manager';
import { Rect, SceneObject, Vector2 } from '@cgs/syd';
import { IocContainer } from '@cgs/shared';
import {
  ICoordinateSystemInfoProvider,
  T_ICoordinateSystemInfoProvider,
} from '../services/coordinate_system_info_provider';
import { IViewContext, T_IViewContext } from './i_view_context';
import { DefaultAnimationFactory } from './animation/default_animation_factory';

export class ViewContextManager implements IViewContextManager {
  private _rootNode: SceneObject;
  private _container: IocContainer;
  private _coordinateSystemProvider: ICoordinateSystemInfoProvider;

  constructor(rootNode: SceneObject, container: IocContainer) {
    this._rootNode = rootNode;
    this._container = container;
    this._coordinateSystemProvider = this._container.resolve(
      T_ICoordinateSystemInfoProvider
    ) as ICoordinateSystemInfoProvider;
  }

  createViewContext(showSpinner: boolean = true): Promise<IViewContext> {
    const maxViewContextDrawOrder: number = Number.MAX_SAFE_INTEGER - 1000;
    const maxDrawOrder: number = this._rootNode.childs.reduce(
      (cur: number, max: SceneObject) => (cur > max.z ? cur : max.z),
      0
    );

    if (maxDrawOrder + 1000 >= maxViewContextDrawOrder) {
      throw new Error('ViewContext limit exceeded');
    }

    const root: SceneObject = new SceneObject();
    root.z = maxDrawOrder + 1000;
    root.id = 'ViewContextNode';
    const cs = this._coordinateSystemProvider.coordinateSystem;
    root.touchArea = new Rect(cs.lt, new Vector2(cs.rb.x * 3, cs.rb.y * 3));
    root.bounds = new Rect(cs.lt, cs.rb);
    root.initialize();

    const viewContext: IViewContext = this._container.resolve(T_IViewContext, [
      root,
      showSpinner,
    ]) as IViewContext;
    viewContext.animationFactory = new DefaultAnimationFactory(this._coordinateSystemProvider);

    this._rootNode.addChild(root);

    return Promise.resolve(viewContext);
  }

  closeViewContext(viewContext: IViewContext): void {
    viewContext.dispose();
    this._rootNode.removeChild(viewContext.root);
  }
}
