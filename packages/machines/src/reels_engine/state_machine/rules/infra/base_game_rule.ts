import { ISpinResponse } from '@cgs/common';
import { CgsEvent, Rule } from '@cgs/syd';
import { BaseGameState } from '../../states/base_game_state';
import { ResponseHolder } from '../../response_holder';

export class BaseGameRule<TResponse extends ISpinResponse> extends Rule {
  private _triggered: boolean = false;
  set triggered(value: boolean) {
    this._triggered = value;
  }

  private readonly _sourceState: BaseGameState<TResponse>;
  get sourceState(): BaseGameState<TResponse> {
    return this._sourceState;
  }
  targetState: BaseGameState<TResponse>;
  private _responseHolder: ResponseHolder<TResponse>;
  get responseHolder(): ResponseHolder<TResponse> {
    return this._responseHolder;
  }

  constructor(sourceState: BaseGameState<TResponse>, responseHolder: ResponseHolder<TResponse>) {
    super();
    this._sourceState = sourceState;
    this._responseHolder = responseHolder;
  }

  get isTriggered(): boolean {
    return this._triggered;
  }

  dispatchEvent(_event: CgsEvent): void {
    this._triggered = this.ruleCondition(this._responseHolder) && this._sourceState.isFinished;
  }

  ruleCondition(_responseHolder: ResponseHolder<TResponse>): boolean {
    return true;
  }

  setActive(_active: boolean): void {
    this._triggered = false;
  }

  update(_dt: number): void {
    this._triggered = this.ruleCondition(this._responseHolder) && this._sourceState.isFinished;
  }
}
