import { SceneFactory } from '@cgs/common';
import { SceneObject } from '@cgs/syd';
import { GameComponentProvider } from './game_component_provider';

export class SceneCache extends GameComponentProvider {
  private _sceneFactory: SceneFactory;
  private _sceneCache: Map<string, SceneObject[]> = new Map<string, SceneObject[]>();

  constructor(sceneFactory: SceneFactory) {
    super();
    this._sceneFactory = sceneFactory;
  }

  getScene(path: string): SceneObject {
    if (!this._sceneCache.has(path)) {
      this._sceneCache.set(path, []);
    }

    if (this._sceneCache.get(path)!.length > 0) {
      const scene = this._sceneCache.get(path)![0];
      this._sceneCache.get(path)!.splice(0, 1);
      return scene;
    }

    return this.buildScene(path);
  }

  putScene(path: string, scene: SceneObject): void {
    if (scene.parent) {
      scene.parent.removeChild(scene);
    }

    if (!this._sceneCache.has(path)) {
      this._sceneCache.set(path, []);
    }

    this._sceneCache.get(path)!.push(scene);
  }

  generateScene(path: string): void {
    if (!this._sceneCache.has(path)) {
      this._sceneCache.set(path, []);
    }

    this.putScene(path, this.buildScene(path));
  }

  buildScene(path: string): SceneObject {
    const scene = this._sceneFactory.build(path);
    if (scene) {
      scene.initialize();
    }
    return scene!;
  }

  deinitialize(): void {
    super.deinitialize();
    const sceneCacheArray = Array.from(this._sceneCache.values());
    sceneCacheArray.forEach((scenes) => {
      for (const scene of scenes) {
        scene.deinitialize();
      }
    });
  }
}
