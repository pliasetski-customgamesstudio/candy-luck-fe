import { SceneResource } from './100_SceneResource';
import { JSONResourcePool } from './110_JSONResourcePool';
import { ShaderSourceResourcePool } from './116_ShaderSourceResourcePool';
import { Preloader } from './118_Preloader';
import { TtfFontResource } from './120_TtfFontResource';
import { SpriteResource } from './121_SpriteResource';
import { BitmapFontResource } from './126_BitmapFontResource';
import { BlendResource } from './154_BlendResource';
import { SceneResourcePool } from './164_SceneResourcePool';
import { DebugConsole } from './173_DebugConsole';
import { TextureResource } from './174_TextureResource';
import { VideoResourcePoolCanvas } from './176_VideoResourcePoolCanvas';
import { ResizeHandler } from './202_ResizeHandler';
import { VideoResourcePoolWebGL } from './203_VideoResourcePoolWebGL';
import { ShaderResource } from './212_ShaderResource';
import { TtfFontResourcePool } from './219_TtfFontResourcePool';
import { BlendResourcePool } from './224_BlendResourcePool';
import { ShaderResourcePool } from './229_ShaderResourcePool';
import { AudioResourcePool } from './236_AudioResourcePool';
import { TextureResourcePool } from './240_TextureResourcePool';
import { Application } from './258_Application';
import { BitmapFontResourcePool } from './268_BitmapFontResourcePool';
import { SpriteResourcePool } from './269_SpriteResourcePool';
import { ApplicationFactory } from './270_application_factory';
import { Platform } from './282_Platform';
import { StopWatch } from './32_StopWatch';
import { JSONResource } from './39_JSONResource';
import { ShaderSourceResource } from './74_ShaderSourceResource';
import { VideoResource } from './92_VideoResource';
import { PlatformSettings } from './93_PlatformSettings';
import { DebugUtils } from './96_DebugUtils';
import { Timer } from './Timer';
import { EventStreamProvider } from './192_EventStreamProvider';
import common_new from '../../assets/common_new.zip';
import { IConcreteResourceCache } from './23_IResourceCache';
import { ZipResourceCache } from './279_ZipResourceCache';

export class Main {
  static readonly ContextNotRestoredTimeout = 3;

  private readonly _window: Window;
  private readonly _fpsInterval = 1000.0 / 60.0; // limits fps to 50

  private _application: Application;
  private _platform: Platform;
  private _preloader: Preloader | null = null;
  private static _resizer: ResizeHandler;
  private static get resizer(): ResizeHandler {
    return Main._resizer;
  }

  private _time: number | null = null;

  private _framesCount = 0;
  private _fps = 0;
  private _fpsTime = 0.0;

  private _totalUpdate = 0.0;
  private _averageUpdate = 0;

  private _totalDraw = 0.0;
  private _averageDraw = 0;

  private _animationFrame: number;

  private _contextRestoreTimer: Timer | null = null;

  private readonly _stopWatch = new StopWatch();

  static Run(
    window: Window,
    canvas: HTMLCanvasElement,
    appFactory: ApplicationFactory,
    settings?: PlatformSettings
  ): void {
    if (!settings) {
      settings = new PlatformSettings();
    }

    const queryString = window.location.search.replace('?', '');
    settings.forceCanvasRendering =
      settings.forceCanvasRendering || queryString.includes('debug_canvas_mode');

    DebugConsole.Initialize(canvas);
    DebugUtils.Initialize();

    new Main(window, canvas, new ZipResourceCache(), appFactory, settings);
  }

  private constructor(
    window: Window,
    canvas: HTMLCanvasElement,
    _resourceCache: IConcreteResourceCache,
    appFactory: ApplicationFactory,
    settings: PlatformSettings
  ) {
    this._preloader = settings.preloader;
    this._window = window;

    const platform = new Platform(canvas, settings);
    this._platform = platform;

    // resizer
    const resizer = new ResizeHandler(platform.view, settings.resizeMode);
    resizer.top = settings.top;
    resizer.touchListener();
    Main._resizer = resizer;

    const renderDevice = platform.videoSystem.renderDevice;
    const audioDevice = platform.audioSystem.audioDevice;

    const resourceCache = _resourceCache;

    resourceCache.beforeLoad.listen(() => {
      resizer.resizeWithDelay();
    });

    if (platform.videoSystem.isWebGL) {
      resourceCache.registerPool(ShaderSourceResource.TypeId, new ShaderSourceResourcePool());
      resourceCache.registerPool(
        ShaderResource.TypeId,
        new ShaderResourcePool(resourceCache, renderDevice)
      );
      resourceCache.registerPool(
        VideoResource.TypeId,
        new VideoResourcePoolWebGL(platform, renderDevice)
      );
    } else {
      /*if (Compatibility.IsChrome) {
        resourceCache.registerPool(VideoResource.TypeId, new VideoResourcePoolCanvasWithAlpha());
      } else {
        resourceCache.registerPool(VideoResource.TypeId, new VideoResourcePoolCanvas(platform));
      }*/
      resourceCache.registerPool(VideoResource.TypeId, new VideoResourcePoolCanvas(platform));
    }

    resourceCache.registerPool(TextureResource.TypeId, new TextureResourcePool(renderDevice));

    resourceCache.registerPool(BlendResource.TypeId, new BlendResourcePool(renderDevice));

    resourceCache.registerPool(SpriteResource.TypeId, new SpriteResourcePool(resourceCache));
    resourceCache.registerPool(SceneResource.TypeId, new SceneResourcePool());

    resourceCache.registerPool(TtfFontResource.TypeId, new TtfFontResourcePool(renderDevice));
    resourceCache.registerPool(
      BitmapFontResource.TypeId,
      new BitmapFontResourcePool(resourceCache)
    );

    const audioResourcePool = new AudioResourcePool(audioDevice);
    resourceCache.registerPool(AudioResourcePool.Buffer, audioResourcePool);
    resourceCache.registerPool(AudioResourcePool.Stream, audioResourcePool);

    resourceCache.registerPool(JSONResource.TypeId, new JSONResourcePool());

    resourceCache.loadPackage(common_new).then(() => {
      this._application = appFactory(platform, resourceCache);
      this._application.load().then(() => {
        this._application.onLoaded();
        this._animationFrame = this._window.requestAnimationFrame(this._frame.bind(this));

        document.onvisibilitychange = this._onVisibilityChange.bind(this);

        EventStreamProvider.subscribeElementTyped<WebGLContextEvent>(
          canvas,
          'webglcontextlost',
          this._onContextLost,
          WebGLContextEvent
        );
        EventStreamProvider.subscribeElementTyped<WebGLContextEvent>(
          canvas,
          'webglcontextrestored',
          this._onContextReady,
          WebGLContextEvent
        );
      });
    });
  }

  private _frame(highResTime: number): void {
    if (this._animationFrame < 0) {
      return;
    }
    this._animationFrame = this._window.requestAnimationFrame(this._frame.bind(this));

    if (this._time === null) {
      this._time = highResTime;
    } else if (this._preloader) {
      // second frame
      this._preloader.hide();
      this._preloader = null;
    }
    if (this._time > highResTime) this._time = highResTime;

    const deltaTime = highResTime - this._time;

    if (deltaTime > 0.0) {
      if (this._fpsInterval > 0.0) {
        if (deltaTime > this._fpsInterval) {
          this._time = highResTime - (deltaTime % this._fpsInterval);
          const dt = deltaTime * 0.001;
          this._doFrame(dt);
        }
      } else {
        this._time = highResTime;
        const dt = deltaTime * 0.001;
        this._doFrame(dt);
      }
    }

    if (highResTime - this._fpsTime > 1000.0) {
      this._fps = this._framesCount;
      this._framesCount = 0;
      this._fpsTime = highResTime;

      if (this._fps > 0) {
        this._averageUpdate = Math.floor(this._totalUpdate / this._fps);
        this._averageDraw = Math.floor(this._totalDraw / this._fps);
      }

      this._totalUpdate = 0.0;
      this._totalDraw = 0.0;
    }

    this._application.updateFps(this._fps);
  }

  private _doFrame(dt: number): void {
    this._framesCount++;

    const app = this._application;

    this._platform.beginFrame();

    //if (DebugConsole.IsEnabled) {
    this._stopWatch.start();
    app.update(dt);
    this._stopWatch.stop();
    let t = this._stopWatch.elapsedMicroseconds;
    DebugConsole.Print(`update: ${t} [${this._averageUpdate}]`);
    this._totalUpdate += t;

    this._stopWatch.start();
    app.draw();
    this._stopWatch.stop();
    t = this._stopWatch.elapsedMicroseconds;
    this._totalDraw += t;
    DebugConsole.Print(`draw: ${t} [${this._averageDraw}]`);
    DebugConsole.Print(`fps: ${this._fps}`);
    /*} else {
      app.update(dt);
      app.draw();
    }*/

    DebugConsole.Draw();

    this._platform.endFrame();
  }

  private _onVisibilityChange(): void {
    this._application.activate(!document.hidden);
    this._time = null;
  }

  private _onContextLost(event?: WebGLContextEvent): void {
    event!.preventDefault();

    this._window.cancelAnimationFrame(this._animationFrame);
    this._animationFrame = -1;

    this._application.contextLost();
    this._platform.contextLost();

    this._contextRestoreTimer = new Timer(Main.ContextNotRestoredTimeout * 1000, () =>
      this._handleContextNotRestored()
    );
  }

  private _onContextReady(_event?: WebGLContextEvent): void {
    this._contextRestoreTimer?.cancel();
    this._contextRestoreTimer = null;

    this._platform.contextReady();
    const ready = this._application.contextReady();

    ready.then(() => {
      this._animationFrame = this._window.requestAnimationFrame(this._frame.bind(this));
    });
  }

  private _handleContextNotRestored(): void {
    this._application.handleContextNotRestored();
  }
}
