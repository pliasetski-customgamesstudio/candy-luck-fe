import { Container } from 'machines';
import { BaseFreeFallDelayLogicProvider } from 'syd';

class Game19FreeFallDelayLogicProvider extends BaseFreeFallDelayLogicProvider {
  constructor(container: Container) {
    super(container);
  }

  getReelFallDelay(): number[] {
    const reelsDelay: number[] = new Array(reelsConfig.reelCount).fill(0.0);
    for (let i = 0; i < reelsDelay.length; i++) {
      if (i % 2 === 0) {
        reelsDelay[i] = collapsingSpinConfig.collapsingParameters.reelFallingStartDelay;
      }
    }
    return reelsDelay;
  }
}
