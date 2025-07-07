// import { ResourceCache } from 'lobby';
// import { SceneBuilder } from 'lobby';
// import { IViewFactory } from 'lobby';
// import { ISettingsManager } from 'lobby';
// import { ISettingsSection } from 'lobby';
// import { ILoadingScreenResourceLoader } from 'lobby';
// import { SceneObject } from 'lobby';
// import { LoadingScreenConfig } from "@cgs/shared";
// import { ModelReflection } from "@cgs/common";
// import { AnimatedSplashView } from "@cgs/features";
//
// class SplashViewFactory {
//   private static readonly LoadingScreensStore: string = "LoadingScreens";
//   private static readonly PreloadedCustomScreensSection: string = "PreloadedCustomScreens";
//   private static readonly ScreensKey: string = "Screens";
//
//   private _resourceCache: ResourceCache;
//   private _sceneBuilder: SceneBuilder;
//   private _viewFactory: IViewFactory;
//   private _settingsManager: ISettingsManager;
//   private _customLoadingScreensSection: ISettingsSection;
//   private _loadingScreenResourceLoader: ILoadingScreenResourceLoader;
//
//   constructor(resourceCache: ResourceCache, sceneBuilder: SceneBuilder, viewFactory: IViewFactory, settingsManager: ISettingsManager, loadingScreenResourceLoader: ILoadingScreenResourceLoader) {
//     this._resourceCache = resourceCache;
//     this._sceneBuilder = sceneBuilder;
//     this._viewFactory = viewFactory;
//     this._settingsManager = settingsManager;
//     this._loadingScreenResourceLoader = loadingScreenResourceLoader;
//
//     const store = this._settingsManager.getSettingsStore(SplashViewFactory.LoadingScreensStore);
//     this._customLoadingScreensSection = SettingsExtensions.getOrAddSection(store, SplashViewFactory.PreloadedCustomScreensSection);
//   }
//
//   async createSplashView(): Promise<SceneObject> {
//     const screensConfigString = SettingsExtensions.getSafe(this._customLoadingScreensSection, SplashViewFactory.ScreensKey, "");
//     const screenConfigs = ModelReflection.fromJsonList(LoadingScreenConfig, screensConfigString);
//     if (screenConfigs.length !== 0) {
//       const customScreens = screenConfigs.filter(s => s.startDate.isBefore(new Date().toUTC()) && s.endDate.isAfter(new Date().toUTC()));
//       if (customScreens.length !== 0) {
//         const customScreen = customScreens[customScreens.length - 1];
//         await this._loadingScreenResourceLoader.loadResource(customScreen);
//         const sceneResource = this._resourceCache.getResource(syd.SceneResource.TypeId, customScreen.sceneName);
//         if (sceneResource !== null) {
//           try {
//             const scene = this._sceneBuilder.build(this._resourceCache, sceneResource.data);
//             return new AnimatedSplashView(scene);
//           } catch (e) {
//             // Scene is invalid
//           }
//         }
//       }
//     }
//
//     return this._viewFactory.createView(AnimatedSplashView);
//   }
// }
