// import { IClientProperties } from "@cgs/common";
// import { ISettingsManager, ISettingsSection } from "@cgs/common";
// import { Cookies } from "@cgs/shared";
// import { ModelReflection } from "@cgs/common";
// import { ListUtil } from "@cgs/common";
//
// class LoadingScreenManager implements ILoadingScreenManager {
//   private static readonly LoadingScreensStore: string = "LoadingScreens";
//   private static readonly PreloadedCustomScreensSection: string = "PreloadedCustomScreens";
//   private static readonly ScreensKey: string = "Screens";
//
//   private _clientProperties: IClientProperties;
//   private _resourceLoader: ILoadingScreenResourceLoader;
//   private _settingsManager: ISettingsManager;
//   private _customLoadingScreensSection: ISettingsSection;
//   private _downloadTaskCreator: IDownloadTaskCreator;
//
//   constructor(clientProperties: IClientProperties, resourceLoader: ILoadingScreenResourceLoader, settingsManager: ISettingsManager, downloadTaskCreator: IDownloadTaskCreator) {
//     this._clientProperties = clientProperties;
//     this._resourceLoader = resourceLoader;
//     this._settingsManager = settingsManager;
//     this._downloadTaskCreator = downloadTaskCreator;
//
//     const store = this._settingsManager.getSettingsStore(LoadingScreenManager.LoadingScreensStore);
//     this._customLoadingScreensSection = SettingsExtensions.getOrAddSection(store, LoadingScreenManager.PreloadedCustomScreensSection);
//     this._resourceLoader.screenLoaded.subscribe((e) => this.onScreenLoaded(e));
//   }
//
//   public async updateLoadingScreens(): Promise<void> {
//   }
//
//   public async updateBackgroundUrl(): Promise<void> {
//     Cookies.set("backgroundScreen", "");
//     return;
//   }
//
//   public clearLoadingScreens(): void {
//     const existingScreensString = this._customLoadingScreensSection.keyExists(LoadingScreenManager.ScreensKey)
//       ? this._customLoadingScreensSection.get(LoadingScreenManager.ScreensKey)
//       : "";
//
//     if (!existingScreensString.isEmpty) {
//       const existingScreens = ModelReflection.fromJsonList(LoadingScreenConfig, existingScreensString);
//       for (const screen of existingScreens) {
//         this._resourceLoader.deleteResource(screen);
//       }
//
//       this._customLoadingScreensSection.set(LoadingScreenManager.ScreensKey, "");
//     }
//   }
//
//   private onScreenLoaded(loadingScreenConfig: LoadingScreenConfig): void {
//     const existingScreensString = SettingsExtensions.getSafe(this._customLoadingScreensSection, LoadingScreenManager.ScreensKey, "");
//     const existingScreens = ModelReflection.fromJsonList(LoadingScreenConfig, existingScreensString);
//
//     loadingScreenConfig.sceneName = this._resourceLoader.getSceneName(loadingScreenConfig);
//
//     if (ListUtil.all(existingScreens, (s) => {
//       return s.startDate !== loadingScreenConfig.startDate || s.endDate !== loadingScreenConfig.endDate || s.sceneUrl !== loadingScreenConfig.sceneUrl;
//     })) {
//       existingScreens.push(loadingScreenConfig);
//     }
//
//     if (!existingScreens.isEmpty) {
//       this._customLoadingScreensSection.set(LoadingScreenManager.ScreensKey, ModelReflection.toJsonList(existingScreens));
//     } else {
//       SettingsExtensions.deleteKeyIfExist(this._customLoadingScreensSection, LoadingScreenManager.ScreensKey);
//     }
//   }
// }
