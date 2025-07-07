import { Blend } from './68_Blend';

export class BlendState {
  enabled: boolean;
  src: Blend;
  dst: Blend;

  constructor(enabled: boolean, src: Blend, dst: Blend) {
    this.enabled = enabled;
    this.src = src;
    this.dst = dst;
  }
}
