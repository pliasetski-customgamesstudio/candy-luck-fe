import { ShaderProgram } from './103_ShaderProgram';
import { GraphicsResourceUsage } from './29_GraphicsResourceUsage';
import { Texture } from './41_Texture';
import { IndexBuffer } from './61_IndexBuffer';
import { BlendState } from './63_BlendState';
import { Blend } from './68_Blend';
import { VertexBuffer } from './75_VertexBuffer';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';

export abstract class RenderDevice {
  private _contextLost: EventDispatcher<RenderDevice> = new EventDispatcher<RenderDevice>();
  private _contextReady: EventDispatcher<RenderDevice> = new EventDispatcher<RenderDevice>();

  get lost(): EventStream<RenderDevice> {
    return this._contextLost.eventStream;
  }

  get ready(): EventStream<RenderDevice> {
    return this._contextReady.eventStream;
  }

  createVertexBuffer(_size: number, _usage: GraphicsResourceUsage): VertexBuffer | null {
    // TODO: Implement createVertexBuffer
    return null;
  }

  createIndexBuffer(_count: number, _usage: GraphicsResourceUsage): IndexBuffer | null {
    // TODO: Implement createIndexBuffer
    return null;
  }

  createTextureFromVideo(_video: HTMLVideoElement): Texture | null {
    // TODO: Implement createTextureFromVideo
    return null;
  }

  createTextureFromCanvas(_canvas: HTMLCanvasElement): Texture | null {
    // TODO: Implement createTextureFromCanvas
    return null;
  }

  createTextureFromImage(_image: HTMLImageElement): Texture | null {
    // TODO: Implement createTextureFromImage
    return null;
  }

  createRenderTarget(_width: number, _height: number): Texture | null {
    // TODO: Implement createRenderTarget
    return null;
  }

  updateTextureFromCanvas(_texture: Texture | null, _canvas: HTMLCanvasElement): void {
    // TODO: Implement updateTextureFromCanvas
  }

  updateTextureFromVideo(_texture: Texture | null, _video: HTMLVideoElement): void {
    // TODO: Implement updateTextureFromVideo
  }

  createShaderProgram(
    _vsSource: string,
    _fsSource: string,
    _defines: string[]
  ): ShaderProgram | null {
    // TODO: Implement createShaderProgram
    return null;
  }

  createBlend(_enabled: boolean, _src: Blend, _dst: Blend): BlendState | null {
    // TODO: Implement createBlend
    return null;
  }

  fireContextLost(): void {
    this._contextLost.dispatchEvent(this);
  }

  fireContextReady(): void {
    this._contextReady.dispatchEvent(this);
  }
}
