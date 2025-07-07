import { ApplicationGameConfig, ApplicationUserConfig, Lazy, Logger } from '@cgs/shared';
import {
  ResourceCache,
  ResourcePackage,
  StopWatch,
  ResourceDescriptionBase,
  IConcreteResourceCache,
} from '@cgs/syd';
import { IClientProperties } from '../services/interfaces/i_client_properties';
import { ILocalizationInfoProvider } from '../services/localization_info_provider';
import { ICoordinateSystemInfoProvider } from '../services/coordinate_system_info_provider';
import { BrowserHelper } from '../utils/browser_helper';

export const T_CustomGamesResourceCache = Symbol('CustomGamesResourceCache');

export class CustomGamesResourceCache extends ResourceCache {
  private _resourceSubstitutions: Map<string, string> = new Map<string, string>();

  public addResourceSubstitutions(substitutions: Map<string, string>): void {
    substitutions.forEach((value, key) => {
      this._resourceSubstitutions.set(key, value);
    });
  }

  public removeResourceSubstitutions(substitutions: string[]): void {
    substitutions.forEach((obj) => {
      this._resourceSubstitutions.delete(obj);
    });
  }

  private _resourceMapping: Map<string, string> = new Map<string, string>();
  private _isMapAvailable: boolean = false;
  private _loadMapRetryCount: number = 3;

  private readonly _resourceCache: IConcreteResourceCache;
  private readonly _uri_prefix: string = 'assets';
  // private readonly _authorizationHolder: IAuthorizationHolder;
  private readonly _clientProperties: Lazy<IClientProperties>;
  // private _eventsCache: BaseClientEvent[] = [];
  private _mapJsonUrl: string = 'assets/en.med.';
  private _locale: string = ApplicationUserConfig.language;
  private _resolution: string = 'med';

  constructor(
    // authorizationHolder: IAuthorizationHolder,
    clientProperties: Lazy<IClientProperties>,
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
    localizationInfoProvider: ILocalizationInfoProvider,
    resourceCache: IConcreteResourceCache
  ) {
    super();
    // this._authorizationHolder = authorizationHolder;
    this._clientProperties = clientProperties;
    this._resourceCache = resourceCache;

    this._resolution = coordinateSystemInfoProvider.heightSize;
    this._locale = localizationInfoProvider.currentLocale;

    this._mapJsonUrl =
      ApplicationGameConfig.versionCode === 'DEFAULT_VERSION'
        ? `assets/${this._locale}.${this._resolution}.map.json`
        : `assets/${this._locale}.${this._resolution}.${ApplicationGameConfig.versionCode}.map.json`;

    Logger.Info('MapJson URL: ' + this._mapJsonUrl);
  }

  private _mediaHackEnabled: boolean | null = null;

  private mediaHackEnabled(): boolean {
    // if (!this._authorizationHolder.authId) {
    //   return false;
    // }
    if (this._mediaHackEnabled === null) {
      const bi = BrowserHelper.parseUserAgent();
      const browser = bi.get('browser') as string;
      const res =
        (browser.includes('Chrome 58') ||
          browser.includes('Chrome 59') ||
          browser.includes('Chrome 6') ||
          browser.includes('Opera 45') ||
          browser.includes('Opera 46') ||
          browser.includes('Opera 47')) &&
        this._clientProperties.call().get('syd.chromeMediaHack.enabled', false);
      Logger.Info('>>> chromMediaHackEnabled: ' + res);
      this._mediaHackEnabled = res;
    }
    return this._mediaHackEnabled ?? false;
  }

  public async init(): Promise<void> {
    try {
      const response = await fetch(this._mapJsonUrl);
      Logger.Info(response);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.text();
      this._resourceMapping = JSON.parse(data);
      this._isMapAvailable = true;
    } catch (e) {
      Logger.Error("Couldn't load map.json with prefix " + this._mapJsonUrl);
    }
  }

  private _loadedPackages: Map<string, ResourcePackageEntry> = new Map<
    string,
    ResourcePackageEntry
  >();

  public async loadPackage(path: string): Promise<ResourcePackage> {
    Logger.Info('Loading package: ' + path);

    // Get already existing resourcePackage entry, or create and store the new one.
    let packageEntry: ResourcePackageEntry | null = null;
    if (this._loadedPackages.has(path)) {
      packageEntry = this._loadedPackages.get(path) as ResourcePackageEntry;
    } else {
      packageEntry = new ResourcePackageEntry(path);
      this._loadedPackages.set(path, packageEntry);
    }

    // If package is loaded, return it and increase ref counter
    if (packageEntry.resourcePackage) {
      packageEntry.refCounter++;
      // Logger.Info("Loading package: " + path + "; returning cached package");
      return packageEntry.resourcePackage;
    }

    // If package is loading, await loading result and increase ref counter.
    // In case of exception, it will be passed to the calling method and counter will not be increased
    if (packageEntry.loadingFuture) {
      const resourcePackage = await packageEntry.loadingFuture;
      packageEntry.refCounter++;
      // Logger.Info("Loading package: " + path + "; waited for end of previous load operation and returned cached package");
      return resourcePackage;
    }

    // If package isn't loaded or loading, start inner loading method and save it for possible another clients.
    // On successful loading save resourcePath in ResourcePackage for search during unloading.
    // Also on success, increment refCounter and reset loadingFuture to null.
    // In case of exception, remove packageEntry from cache
    packageEntry.loadingFuture = this._loadPackageInner(path);
    try {
      const resourcePackage = await packageEntry.loadingFuture;
      packageEntry.resourcePackage = resourcePackage;
      packageEntry.loadingFuture = Promise.resolve();
      packageEntry.refCounter++;
      resourcePackage.resourcePath = path;

      // Logger.Info("Loading package: " + path + "; returning newly loaded package");

      return resourcePackage;
    } catch (e) {
      this._loadedPackages.delete(path);
      throw e;
    }
  }

  public getUrl(path: string): string {
    return this._uri_prefix + '/' + this._locale + '/' + this._resolution + '/' + path;
  }

  private async _loadPackageInner(path: string): Promise<ResourcePackage | void> {
    const url = this.getUrl(path);

    // if (!this._isMapAvailable && this._loadMapRetryCount > 0) {
    //   await this.init();
    //   this._loadMapRetryCount--;
    // }

    if (this.packageHasAlreadyLoaded(path)) {
      return Promise.resolve();
    }

    let wadUrl = url;
    // let wadUrl = this._replacer.changeWad(url);
    // this._resourceSubstitutions.forEach((v, k) => {
    //   wadUrl = wadUrl.replace(k, v);
    // });

    const sw = new StopWatch();
    sw.start();

    if (this._resourceMapping.has(wadUrl)) {
      wadUrl = this._resourceMapping.get(wadUrl) as string;
    }

    try {
      this._resourceCache.enableMediaHack = this.mediaHackEnabled();
      const res = await this._resourceCache.loadPackage(wadUrl);
      sw.stop();
      // const event = new FluentClientEvent("webloading", wadUrl).withEventValue(sw.elapsedMilliseconds.toString());
      // this._trackEvent(event);
      return res;
    } catch (e) {
      sw.stop();
      Logger.Error('Error loading ' + wadUrl + ': ' + e);
      // const event = new FluentClientEvent("webloading", wadUrl)
      //   .withEventValue(sw.elapsedMilliseconds.toString())
      //   .withSubfeature("failed")
      //   .withAdditionalParams(e.toString());
      // this._trackEvent(event);
      throw e;
    }
  }

  private packageHasAlreadyLoaded(path: string): boolean {
    const splittedStr = path.split('/');
    const fileName = splittedStr[splittedStr.length - 1].replace('.xml', '');

    return Array.from(this._resourceSubstitutions.values()).some((v) => v.includes(fileName));
  }

  // private _trackEvent(event: BaseClientEvent): void {
  //   if (!this._authorizationHolder.authId) {
  //     this._eventsCache.push(event);
  //     return;
  //   }
  //   if (this._eventsCache !== null) {
  //     for (const ev of this._eventsCache) {}
  //     this._eventsCache = null;
  //   }
  // }

  public async loadPackageByUrl(url: string): Promise<ResourcePackage> {
    return this._resourceCache.loadPackage(url);
  }

  private _mapping(path: string): string {
    const m = this._resourceMapping.get(path) as string;
    return m ? m : path;
  }

  // public async loadPackageFromXML(xml: Element): Promise<ResourcePackage> {
  //   return this._resourceCache.loadPackageFromXML(xml);
  // }

  public unloadPackage(pkg: ResourcePackage): void {
    if (this._loadedPackages.has(pkg.resourcePath)) {
      const packageEntry = this._loadedPackages.get(pkg.resourcePath) as ResourcePackageEntry;
      // Logger.Info("Request to unload package: " + package.resourcePath + "; refCounter == " + packageEntry.refCounter.toString());
      packageEntry.refCounter--;
      if (packageEntry.refCounter <= 0) {
        this._loadedPackages.delete(pkg.resourcePath);
        this._resourceCache.unloadPackage(pkg);
      }
    } else {
      this._resourceCache.unloadPackage(pkg);
    }
  }

  public getResource(resourceType: string, resourceId: string): any {
    return this._resourceCache.getResource(resourceType, resourceId);
  }

  // public registerPool(resourceTypeId: string, pool: ResourcePool<ResourceBase>): void {
  //   this._resourceCache.registerPool(resourceTypeId, pool);
  // }

  public loadTextureResource(
    resourceType: string,
    description: ResourceDescriptionBase
  ): Promise<any> {
    return this._resourceCache.loadTextureResource(resourceType, description);
  }

  public contextLost(): void {
    this._resourceCache.contextLost();
  }

  public contextReady(): Promise<void> {
    return this._resourceCache.contextReady();
  }
}

class ResourcePackageEntry {
  private _resourcePath: string;
  private _resourcePackage: ResourcePackage;
  private _refCounter: number = 0;
  private _loadingFuture: Promise<any> | null = null;

  constructor(resourcePath: string) {
    this._resourcePath = resourcePath;
    this._loadingFuture = null;
  }

  public get resourcePath(): string {
    return this._resourcePath;
  }

  public get resourcePackage(): ResourcePackage {
    return this._resourcePackage;
  }
  public set resourcePackage(value: ResourcePackage) {
    this._resourcePackage = value;
  }

  public get refCounter(): number {
    return this._refCounter;
  }
  public set refCounter(value: number) {
    this._refCounter = value;
  }

  public get loadingFuture(): Promise<any> | null {
    return this._loadingFuture;
  }
  public set loadingFuture(value: Promise<any>) {
    this._loadingFuture = value;
  }
}
