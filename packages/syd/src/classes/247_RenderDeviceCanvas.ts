import { ShaderProgram } from './103_ShaderProgram';
import { RenderDevice } from './244_RenderDevice';
import { GraphicsResourceUsage } from './29_GraphicsResourceUsage';
import { TextureCanvas } from './35_TextureCanvas';
import { Texture } from './41_Texture';
import { IndexBuffer } from './61_IndexBuffer';
import { BlendState } from './63_BlendState';
import { Blend } from './68_Blend';
import { VertexBuffer } from './75_VertexBuffer';

export class RenderDeviceCanvas extends RenderDevice {
  createBlend(enabled: boolean, src: Blend, dst: Blend): BlendState {
    return new BlendState(enabled, src, dst);
  }

  createShaderProgram(
    _vsSource: string,
    _fsSource: string,
    _defines: string[]
  ): ShaderProgram | null {
    return null;
  }

  createTextureFromCanvas(canvas: HTMLCanvasElement): Texture {
    return new TextureCanvas(canvas, canvas.width, canvas.height);
  }

  createTextureFromImage(image: HTMLImageElement): Texture {
    return new TextureCanvas(image, image.width, image.height);
  }

  createVertexBuffer(_size: number, _usage: GraphicsResourceUsage): VertexBuffer | null {
    return null;
  }

  createIndexBuffer(_count: number, _usage: GraphicsResourceUsage): IndexBuffer | null {
    return null;
  }

  createTextureFromVideo(video: HTMLVideoElement): Texture | null {
    return new TextureCanvas(video, video.width, video.height);
  }

  updateTextureFromVideo(_texture: Texture, _video: HTMLVideoElement): void {
    // TODO: implement updateTextureFromVideo
  }

  updateTextureFromCanvas(_texture: Texture, _canvas: HTMLCanvasElement): void {
    // TODO: implement updateTextureFromCanvas
  }

  createRenderTarget(width: number, height: number): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return new TextureCanvas(canvas, width, height);
  }
}
