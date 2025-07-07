import { VideoSystem } from './106_VideoSystem';
import { InputSystem } from './124_InputSystem';
import { GlContextHelper } from './150_GlContextHelper';
import { AudioDeviceElement } from './233_AudioDeviceElement';
import { AudioDeviceWebAudioApi } from './242_AudioDeviceWebAudioApi';
import { RenderDeviceCanvas } from './247_RenderDeviceCanvas';
import { RenderDeviceWebGL } from './277_RenderDeviceWebGL';
import { RenderContext } from './278_RenderContext';
import { AudioSystem } from './59_AudioSystem';
import { View } from './86_View';
import { PlatformSettings } from './93_PlatformSettings';
import { RenderDevice } from './244_RenderDevice';
import { DebugUtils } from './96_DebugUtils';
import { Compatibility } from './16_Compatibility';
import { Log } from './81_Log';
import { Mouse } from './250_Mouse';
import { Keyboard } from './217_Keyboard';

export const T_Platform = Symbol('Platform');
export class Platform {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _view: View;
  private readonly _videoSystem: VideoSystem;
  private readonly _inputSystem: InputSystem;
  private readonly _audioSystem: AudioSystem;

  private _frame: number = 0;

  constructor(canvas: HTMLCanvasElement, settings: PlatformSettings) {
    this._canvas = canvas;
    this._view = new View(this._canvas);
    this._videoSystem = this._createVideoSystem(this._canvas, settings);
    this._inputSystem = this._createInputSystem(this._canvas, settings);
    this._audioSystem = this._createAudioSystem(settings);
  }

  public get view(): View {
    return this._view;
  }

  public get frame(): number {
    return this._frame;
  }

  public get videoSystem(): VideoSystem {
    return this._videoSystem;
  }

  public get inputSystem(): InputSystem {
    return this._inputSystem;
  }

  public get audioSystem(): AudioSystem {
    return this._audioSystem;
  }

  private _createVideoSystem(canvas: HTMLCanvasElement, settings: PlatformSettings): VideoSystem {
    let webgl: WebGLRenderingContext | null = null;

    if (!settings.forceCanvasRendering) {
      const options = {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: settings.antialiasing,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      };
      webgl = canvas.getContext('webgl', options) as WebGLRenderingContext;
      // fallback to experimental-webgl
      if (!webgl) {
        webgl = canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      }
    }

    let renderDevice: RenderDevice;
    let renderContext: RenderContext | null = null;

    if (webgl) {
      const contextHelper = new GlContextHelper(webgl);
      renderDevice = new RenderDeviceWebGL(webgl, contextHelper);
      renderContext = new RenderContext(webgl, contextHelper);

      const loseContext = webgl.getExtension('WEBGL_lose_context');
      const jsLoseContext = loseContext;

      // Log.Warning("Got loseContext $loseContext; ${loseContext.runtimeType}");
      if (loseContext) {
        DebugUtils.InitializeLoseContext(jsLoseContext);
      }
    } else {
      renderDevice = new RenderDeviceCanvas();
    }

    return new VideoSystem(renderDevice, renderContext);
  }

  private _createAudioSystem(_settings: PlatformSettings): AudioSystem {
    let audioContext: AudioContext | null = null;

    if (!Compatibility.IsIE) {
      try {
        audioContext = new AudioContext();
      } catch (e) {
        Log.Error('Cannot create audioContext : ' + (e?.toString() ?? 'unknown'));
      }
    }

    const device = audioContext
      ? new AudioDeviceWebAudioApi(audioContext)
      : new AudioDeviceElement();

    return new AudioSystem(device);
  }

  private _createInputSystem(canvas: HTMLCanvasElement, _settings: PlatformSettings): InputSystem {
    const touchScreen = new Mouse(canvas);
    const keyboard = new Keyboard(canvas);
    return new InputSystem(touchScreen, keyboard);
  }

  public beginFrame(): void {
    this._frame++;
  }

  public endFrame(): void {}

  public contextLost(): void {
    this.videoSystem.renderDevice.fireContextLost();
  }

  public contextReady(): void {
    this.videoSystem.renderDevice.fireContextReady();
  }
}
