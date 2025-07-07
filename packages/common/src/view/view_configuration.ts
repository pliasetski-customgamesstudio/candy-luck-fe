import { IocContainer } from '@cgs/shared';
import { IViewConfiguration } from './i_view_configuration';
import { ViewInfo } from './view_info';
import { Logger } from '@cgs/shared';
import { PathUtils } from '@cgs/shared';

export class ViewConfiguration implements IViewConfiguration {
  private _lifetimeScope: IocContainer;
  private _viewInfos: Map<symbol, ViewInfo> = new Map<symbol, ViewInfo>();

  constructor(lifetimeScope: IocContainer) {
    this._lifetimeScope = lifetimeScope;
    //populateViewInfo(_lifetimeScope);
  }

  public populateViewInfo(_lifetimeScope: IocContainer): void {
    // for (let provider of lifetimeScope.resolveAll<IViewInfoProvider>(T_IViewInfoProvider)) {
    //   provider.getViewInfos().forEach((pair) => this.addViewInfo(pair.item1, pair.item2));
    // }
  }

  public getViewInfo(viewType: symbol): ViewInfo {
    const info = this._viewInfos.get(viewType) as ViewInfo;
    // if (!info) {
    //   this._viewInfos.forEach((k, v) => {
    //     if (ReflectionUtils.isSubclass(k, viewType)) {
    //       info = v;
    //     }
    //   });
    // }
    return info;
  }

  public addViewInfo(viewType: symbol, viewInfo: ViewInfo): void {
    Logger.Info(
      `ViewConfigurationBase| Adding ViewInfo for ${String(viewType)}:  PackagePath = ${
        viewInfo.PackagePath
      }; ResourceId = ${viewInfo.ResourceId}`
    );
    this._viewInfos.set(viewType, viewInfo);
  }

  public getTypeBySceneName(sceneName: string): symbol {
    let result: symbol = Symbol();
    this._viewInfos.forEach((v, k) => {
      if (v.ResourceId.includes(sceneName)) {
        result = k;
      }
    });
    return result;
  }

  public getViewsInPackage(packagePath: string): ViewInfo[] {
    const packageFileName = PathUtils.getFileName(packagePath);

    return Array.from(this._viewInfos.values()).filter((v) =>
      PathUtils.getFileName(v.PackagePath).endsWith(packageFileName)
    );
  }
}
