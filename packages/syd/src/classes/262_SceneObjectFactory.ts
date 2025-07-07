import { TtfFontResource } from './120_TtfFontResource';
import { SoundFactory } from './207_SoundFactory';
import { RenderDevice } from './244_RenderDevice';
import { Platform } from './282_Platform';
import { AudioResource } from './97_AudioResource';
import { SoundSceneObject } from './169_SoundSceneObject';
import { RenderTargetSceneObject } from './267_RenderTargetSceneObject';
import { TtfTextInputSceneObject } from './286_TtfTextInputSceneObject';
import { TtfTextSceneObject } from './265_TtfTextSceneObject';

export class SceneObjectFactory {
  private _soundFactory: SoundFactory;
  private _renderDevice: RenderDevice;
  private _canvas: HTMLCanvasElement;
  private _platform: Platform;

  constructor(
    soundFactory: SoundFactory,
    renderDevice: RenderDevice,
    canvas: HTMLCanvasElement,
    platform: Platform
  ) {
    this._soundFactory = soundFactory;
    this._renderDevice = renderDevice;
    this._canvas = canvas;
    this._platform = platform;
  }

  createSoundSceneObject(resource: AudioResource): SoundSceneObject {
    const sound = this._soundFactory.createSound(resource);
    return new SoundSceneObject(sound);
  }

  createRenderTargetSceneObject(): RenderTargetSceneObject {
    return new RenderTargetSceneObject(this._renderDevice);
  }

  createTtfTextInputSceneObject(resource: TtfFontResource): TtfTextInputSceneObject {
    return new TtfTextInputSceneObject(this._renderDevice, resource, this._platform);
  }

  createTtfTextSceneObject(resource: TtfFontResource): TtfTextSceneObject {
    return new TtfTextSceneObject(this._renderDevice, resource);
  }

  // TODO add later if required
  // createOverlayButton(): OverlayButton {
  //   return new OverlayButton(this._canvas);
  // }
}
