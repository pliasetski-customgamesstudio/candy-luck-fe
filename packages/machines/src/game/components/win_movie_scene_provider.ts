import { SceneCommon } from '@cgs/common';
import { SceneObject } from '@cgs/syd';

export class WinMovieSceneProvider {
  private _sceneCommon: SceneCommon;
  private _winMovies: Map<string, string>;
  private _winMovieScenes: Map<string, SceneObject> = new Map<string, SceneObject>();

  constructor(sceneCommon: SceneCommon, winMovies: Map<string, string>) {
    this._sceneCommon = sceneCommon;
    this._winMovies = winMovies;
  }

  getWinMovieScene(winName: string): SceneObject | null {
    if (this._winMovieScenes.has(winName)) {
      return this._winMovieScenes.get(winName) ?? null;
    }

    if (this._winMovies.has(winName)) {
      const winMovie = this._winMovies.get(winName) as string;
      const winScene = this._sceneCommon.sceneFactory.build(winMovie);

      if (winScene) {
        const winNames: string[] = [];

        this._winMovies.forEach((key, value) => {
          if (value === this._winMovies.get(winName)) {
            winNames.push(key);
          }
        });

        for (const name of winNames) {
          this._winMovieScenes.set(name, winScene);
        }

        winScene.z = 1000;
        return winScene;
      }
    }

    return null;
  }

  unload(): void {
    this._winMovieScenes.forEach((scene, name) => {
      scene.active = false;
    });

    new Promise<void>(() => {
      this._winMovieScenes.forEach((scene, name) => {
        scene.deinitialize();
      });
    });
  }
}
