import { Container } from 'inversify';
import { ISlotGameEngineProvider, IAnimationBasedGameEngineProvider } from 'machines';
import { IFadeReelsProvider } from 'syd';
import { AnimationBasedGameEngine } from 'machines/src/reels_engine_library';

class FadeIconsProvider implements IFadeReelsProvider {
  private _gameEngine: AnimationBasedGameEngine;

  constructor(container: Container) {
    this._gameEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IAnimationBasedGameEngineProvider
    ).gameEngine;
  }

  EnableFade(enable: boolean): void {
    const state = enable ? 'fade' : 'default';
    this._gameEngine.switchAllIconsToState(state);
  }
}
