import { WebGL } from './WebGL';

export enum GraphicsResourceUsage {
  Static = WebGL.STATIC_DRAW,
  Dynamic = WebGL.DYNAMIC_DRAW,
  Stream = WebGL.STREAM_DRAW,
}
