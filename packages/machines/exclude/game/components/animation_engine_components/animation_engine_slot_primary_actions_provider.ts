import {
  ISlotGameEngineProvider,
  SlotPrimaryActionsProvider,
  T_ISlotGameEngineProvider,
} from '../../../../src';
import { Action, Container, FunctionAction } from '@cgs/syd';
import { IAnimationBasedGameEngineProvider } from '../../../animation_based_game_engine/game_component_providers/i_animation_based_game_engine_provider';

class AnimationEngineSlotPrimaryActionsProvider extends SlotPrimaryActionsProvider {
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
