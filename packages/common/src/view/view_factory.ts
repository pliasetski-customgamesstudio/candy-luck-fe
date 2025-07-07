import { IViewFactory } from './i_view_factory';
import { IocContainer } from '@cgs/shared';
import { IViewConfiguration } from './i_view_configuration';
import { IResourceCache, SceneBuilder, SceneObject, SceneResource } from '@cgs/syd';
import { ViewInfo } from './view_info';
import { Logger } from '@cgs/shared';

export class ViewFactory implements IViewFactory {
  private _container: IocContainer;
  private _viewConfiguration: IViewConfiguration;
  private _resourceCache: IResourceCache;
  private _sceneBuilder: SceneBuilder;
  private _resourceIdSubstitutions: Map<string, string> = new Map<string, string>();

  constructor(
    container: IocContainer,
    viewConfiguration: IViewConfiguration,
    resourceCache: IResourceCache,
    sceneBuilder: SceneBuilder
  ) {
    this._container = container;
    this._viewConfiguration = viewConfiguration;
    this._resourceCache = resourceCache;
    this._sceneBuilder = sceneBuilder;
  }

  public addResourceIdSubstitutions(substitutions: Map<string, string>): void {
    substitutions.forEach((value, key) => {
      this._resourceIdSubstitutions.set(key, value);
    });
  }

  public removeResourceIdSubstitutions(substitutions: string[]): void {
    substitutions.forEach((obj) => {
      this._resourceIdSubstitutions.delete(obj);
    });
  }

  public createView(viewType: symbol, sceneHint: string | null = null): SceneObject {
    const viewInfo = this._viewConfiguration.getViewInfo(viewType);

    if (viewInfo) {
      const sceneRoot = this.createRootScene(viewInfo, viewType, sceneHint);
      const view = this._container.resolve(viewType, [sceneRoot]) as SceneObject;
      return view;
    }

    return this._container.resolve(viewType)!;
  }

  public getViewInfo(viewType: symbol): ViewInfo {
    return this._viewConfiguration.getViewInfo(viewType);
  }

  public createRootSceneByViewType(viewType: symbol, sceneHint: string | null = null): SceneObject {
    return this.createRootScene(this.getViewInfo(viewType), viewType, sceneHint);
  }

  public createRootScene(
    viewInfo: ViewInfo,
    viewType: symbol,
    sceneHint: string | null = null
  ): SceneObject {
    if (sceneHint) {
      const newInfo = new ViewInfo(viewInfo.PackagePath, viewInfo.ResourceId);
      const splittedId = newInfo.ResourceId.split('/');
      splittedId.splice(splittedId.length - 1, 1);
      splittedId.push(sceneHint + '.object');
      newInfo.ResourceId = splittedId.join('/');
      viewInfo = newInfo;
    }

    this._resourceIdSubstitutions.forEach((v, k) => {
      viewInfo.ResourceId = viewInfo.ResourceId.replace(k, v);
    });

    const sceneResource = this._resourceCache.getResource<SceneResource>(
      SceneResource.TypeId,
      viewInfo.ResourceId
    );
    if (!sceneResource) {
      Logger.Error(`[ViewFactory] can't resolve scene resource ${viewInfo.ResourceId}`);
    }
    return this._sceneBuilder.build(this._resourceCache, sceneResource!.data!)!;
  }

  public resourceFound(viewType: symbol): boolean {
    const viewInfo = this._viewConfiguration.getViewInfo(viewType);
    this._resourceIdSubstitutions.forEach((v, k) => {
      viewInfo.ResourceId = viewInfo.ResourceId.replace(k, v);
    });

    const sceneResource = this._resourceCache.getResource(
      SceneResource.TypeId,
      viewInfo.ResourceId
    );

    const sceneResourceFound = !!sceneResource;
    Logger.Info(
      `viewInfo.ResourceId = ${viewInfo.ResourceId} sceneResourceFound = ${sceneResourceFound}`
    );

    return sceneResourceFound;
  }

  public async loadPackage(path: string): Promise<void> {
    await this._resourceCache.loadPackage(path);
  }
}
