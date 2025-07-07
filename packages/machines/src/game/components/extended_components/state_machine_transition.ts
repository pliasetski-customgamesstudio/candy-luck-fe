import { ISpinResponse } from '@cgs/common';
import { BaseGameState } from '../../../reels_engine/state_machine/states/base_game_state';
import { RuleFactory } from '../../../reels_engine/state_machine/game_state_machine';

export class StateMachineTransition {
  private readonly _from: BaseGameState<ISpinResponse>;
  private readonly _to: BaseGameState<ISpinResponse>;
  private readonly _factory: RuleFactory<ISpinResponse>;

  constructor(
    from: BaseGameState<ISpinResponse>,
    to: BaseGameState<ISpinResponse>,
    factory: RuleFactory<ISpinResponse>
  ) {
    this._from = from;
    this._to = to;
    this._factory = factory;
  }

  get from(): BaseGameState<ISpinResponse> {
    return this._from;
  }

  get to(): BaseGameState<ISpinResponse> {
    return this._to;
  }

  get factory(): RuleFactory<ISpinResponse> {
    return this._factory;
  }
}
