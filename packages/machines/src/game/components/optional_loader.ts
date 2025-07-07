import { EventDispatcher, EventStream, IDisposable, ResourcePackage } from '@cgs/syd';
import { SceneCommon } from '@cgs/common';
import { ApplicationGameConfig } from '@cgs/shared';

export class OptionalLoader implements IDisposable {
  private _sceneCommon: SceneCommon;
  get sceneCommon(): SceneCommon {
    return this._sceneCommon;
  }

  isLoaded: boolean = false;
  protected _loaded: EventDispatcher<boolean> = new EventDispatcher<boolean>();
  get loadedDispatcher(): EventDispatcher<boolean> {
    return this._loaded;
  }
  get loaded(): EventStream<boolean> {
    return this._loaded.eventStream;
  }

  constructor(sceneCommon: SceneCommon) {
    this._sceneCommon = sceneCommon;
  }

  load(): Promise<void> {
    this.isLoaded = true;
    return Promise.resolve();
  }

  dispose(): void {}
}

export class AdditionalLoader extends OptionalLoader {
  private _resourcePackage: ResourcePackage;

  async load(): Promise<void> {
    const resourceCache = this.sceneCommon.resourceCache;

    const future = resourceCache.loadPackage(
      `games/${ApplicationGameConfig.gameId}/additional.zip`
    );

    future.then((p) => {
      this.isLoaded = true;
      this._loaded.dispatchEvent(true);
      this._resourcePackage = p;
    });
    await future;
  }

  dispose(): void {
    super.dispose();
    this.sceneCommon.resourceCache.unloadPackage(this._resourcePackage);
  }
}

export class CustomLoader extends OptionalLoader {
  private _resourcePackages: ResourcePackage[] = [];
  private _packagesNames: string[];

  constructor(sceneCommon: SceneCommon, packagesNames: string[]) {
    super(sceneCommon);
    this._packagesNames = packagesNames;
  }

  async load(): Promise<void> {
    const resourceCache = this.sceneCommon.resourceCache;
    const game = `games/${ApplicationGameConfig.gameId}`;
    const futures: Promise<ResourcePackage>[] = [];
    for (const pname of this._packagesNames) {
      const future = resourceCache.loadPackage(`${game}/${pname}.zip`);

      future.then((p) => {
        this.isLoaded = true;
        this._loaded.dispatchEvent(true);
        this._resourcePackages.push(p);
      });
      futures.push(future);
    }

    await Promise.all(futures);
  }

  dispose(): void {
    super.dispose();
    for (const resourcePackage of this._resourcePackages) {
      this.sceneCommon.resourceCache.unloadPackage(resourcePackage);
    }
  }
}
