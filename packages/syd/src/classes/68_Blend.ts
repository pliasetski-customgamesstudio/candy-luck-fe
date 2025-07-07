import { WebGL } from './WebGL';

export enum Blend {
  Zero = WebGL.ZERO,
  One = WebGL.ONE,
  SrcAlpha = WebGL.SRC_ALPHA,
  InvSrcAlpha = WebGL.ONE_MINUS_SRC_ALPHA,
  InvSrcColor = WebGL.ONE_MINUS_SRC_COLOR,
}
