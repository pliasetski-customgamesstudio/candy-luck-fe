import { Platform } from './282_Platform';
import { SceneBuilder } from './292_SceneBuilder';
import { SoundFactory } from './207_SoundFactory';
import { Rect } from './112_Rect';
import { SceneObjectFactory } from './262_SceneObjectFactory';
import { IConcreteResourceCache } from './23_IResourceCache';

export abstract class Application {
  platform: Platform;
  resourceCache: IConcreteResourceCache;
  private _fps: number = 60;
  private _sceneBuilder: SceneBuilder;
  private _soundManager: SoundFactory;

  constructor(platform: Platform, resourceCache: IConcreteResourceCache, coordinateSystem: Rect) {
    this.platform = platform;
    this.resourceCache = resourceCache;
    this._soundManager = new SoundFactory(platform.audioSystem.audioDevice);

    const sceneObjectFactory = new SceneObjectFactory(
      this._soundManager,
      platform.videoSystem.renderDevice,
      platform.view.canvas,
      platform
    );

    this._sceneBuilder = new SceneBuilder(sceneObjectFactory, coordinateSystem);
  }

  updateFps(fps: number): void {
    this._fps = fps;
  }

  get fps(): number {
    return this._fps;
  }

  get sceneBuilder(): SceneBuilder {
    return this._sceneBuilder;
  }

  get soundManager(): SoundFactory {
    return this._soundManager;
  }

  abstract load(): Promise<void>;

  abstract onLoaded(): void;

  abstract update(dt: number): void;

  abstract draw(): void;

  abstract activate(active: boolean): void;

  abstract contextLost(): void;

  abstract contextReady(): Promise<void>;

  handleContextNotRestored(): void {
    window.location.assign(window.location.href);
  }
}
