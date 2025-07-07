import { Container } from '@cgs/syd';
import { ResponseHolder } from '../response_holder';
import { BaseGameState } from '../states/base_game_state';
import { BaseGameRule } from './infra/base_game_rule';
import { ISpinResponse } from '@cgs/common';
import { ISlotGameEngine } from '../../i_slot_game_engine';
import { ISlotGameEngineProvider } from '../../game_components_providers/i_slot_game_engine_provider';
import { T_ISlotGameEngineProvider } from '../../../type_definitions';

export class WaitAccelerationCompleteRule<
  TResponse extends ISpinResponse,
> extends BaseGameRule<TResponse> {
  private _container: Container;
  private _gameEngine: ISlotGameEngine;

  constructor(
    container: Container,
    sourceState: BaseGameState<TResponse>,
    responseHolder: ResponseHolder<TResponse>
  ) {
    super(sourceState, responseHolder);
    this._container = container;
  }

  public update(_dt: number): void {
    if (!this._gameEngine) {
      this._gameEngine =
        this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
    }

    this.triggered =
      this._gameEngine.isSlotAccelerated &&
      this.ruleCondition(this.responseHolder) &&
      this.sourceState.isFinished;
  }
}
