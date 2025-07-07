import { RenderDevice } from './244_RenderDevice';
import { RenderContext } from './278_RenderContext';

export class VideoSystem {
  private readonly _device: RenderDevice;
  private readonly _context: RenderContext | null = null;

  constructor(device: RenderDevice, context: RenderContext | null) {
    this._device = device;
    this._context = context;
  }

  get isWebGL(): boolean {
    return this._context !== null;
  }

  get renderDevice(): RenderDevice {
    return this._device;
  }

  get renderContext(): RenderContext | null {
    return this._context;
  }
}
