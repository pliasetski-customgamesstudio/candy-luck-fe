import {
  ISlotGameEngineProvider,
  IStartSlotActionProvider,
  SpinMode,
  T_ISlotGameEngineProvider,
} from '../../../../src';
import { Action, Container } from '@cgs/syd';

class AnimationGameOutgoingActionProvider implements IStartSlotActionProvider {
  private _container: Container;
  private _gameEngine: AnimationBasedGameEngine;

  constructor(container: Container) {
    this._container = container;
    this._gameEngine = this._container.forceResolve<ISlotGameEngineProvider>(
      T_ISlotGameEngineProvider
    ).gameEngine as AnimationBasedGameEngine;
  }

  getStartSlotAction(spinMode: SpinMode): Action {
    switch (spinMode) {
      case SpinMode.Spin:
        return this._gameEngine.outgoingAnimationAction;
      case SpinMode.ReSpin:
        return new AnimationEngineRespinAction(this._container);
      default:
        return this._gameEngine.outgoingAnimationAction;
    }
  }
}
