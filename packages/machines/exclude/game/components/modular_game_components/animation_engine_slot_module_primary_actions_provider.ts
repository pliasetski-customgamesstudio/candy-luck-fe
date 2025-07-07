import { Container } from 'machines';
import { SlotPrimaryActionsProvider, Action, FunctionAction } from 'syd';
import {
  AnimationBasedGameEngine,
  ISlotGameEngineProvider,
  IAnimationBasedGameEngineProvider,
} from 'machines/src/reels_engine_library';

class AnimationEngineSlotModulePrimaryActionsProvider extends SlotPrimaryActionsProvider {
  private _gameEngine: AnimationBasedGameEngine;

  constructor(container: Container) {
    super(container);
    this._gameEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IAnimationBasedGameEngineProvider
    ).gameEngine;
  }

  getImmediatelyStopSlotAction(): Action {
    return new FunctionAction(() => this._gameEngine.stopAllAnimations());
  }
}
