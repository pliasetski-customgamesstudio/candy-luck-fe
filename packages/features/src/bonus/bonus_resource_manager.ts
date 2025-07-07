import { IResourceManager, SceneFactory } from '@cgs/common';
import { SceneObject } from '@cgs/syd';

export class BonusResourceManager implements IResourceManager {
  private readonly _cache: Map<string, SceneObject> = new Map();
  private readonly _sceneFactory: SceneFactory;
  protected readonly _scenePrefix: string;

  constructor(sceneFactory: SceneFactory, scenePrefix: string = '') {
    this._sceneFactory = sceneFactory;
    this._scenePrefix = scenePrefix;
  }

  get ScenePrefix(): string {
    return this._scenePrefix;
  }

  clear(sourceFile: string): void {
    if (this._cache.has(sourceFile)) {
      const scene = this._cache.get(sourceFile);
      Promise.resolve().then(() => scene?.deinitialize());
      this._cache.delete(sourceFile);
    }
  }

  getScene(sourceFile: string, cache: boolean = true): SceneObject {
    if (cache && this._cache.has(sourceFile)) {
      return this._cache.get(sourceFile)!;
    }
    const scene = this._sceneFactory.build(this._scenePrefix + sourceFile)!;
    if (cache) {
      this._cache.set(sourceFile, scene);
    }
    scene.initialize();
    return scene;
  }

  dispose(): void {
    Promise.resolve().then(() => {
      for (const scene of this._cache.values()) {
        scene.deinitialize();
      }
    });
    this._cache.clear();
  }
}
