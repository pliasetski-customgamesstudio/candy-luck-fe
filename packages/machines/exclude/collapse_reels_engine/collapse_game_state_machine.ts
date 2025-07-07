import { Container } from 'inversify';
import { GameStateMachine, BaseGameState, ResponseProvider } from 'machines';
import { SpinResponse } from 'machines/src/reels_engine_library';
import { GameStateMachineStates } from 'common';

class CollapseGameStateMachine<TResponse extends SpinResponse> extends GameStateMachine {
  collapseState: BaseGameState<TResponse>;
  beginCollapseState: BaseGameState<TResponse>;
  endCollapseState: BaseGameState<TResponse>;

  constructor(container: Container, responseProvider: ResponseProvider) {
    super(container, responseProvider);
  }

  createStates(): void {
    this.beginCollapseState = this.createBaseState(GameStateMachineStates.BeginCollapse);
    this.collapseState = this.createBaseState(GameStateMachineStates.Collapse);
    this.endCollapseState = this.createBaseState(GameStateMachineStates.EndCollapse);
    super.createStates();
  }

  createRules(): void {
    this.createRule(stop, shortWinLines, (s, r) => new StopToShiftingCollapse<TResponse>(s, r));
    this.createRule(
      shortWinLines,
      this.beginCollapseState,
      (s, r) => new StopToShiftingCollapse<TResponse>(s, r)
    );

    this.createRule(
      stop,
      this.beginCollapseState,
      (s, r) => new StopToBeginCollapseState<TResponse>(s, r)
    );
    this.createRule(
      this.beginCollapseState,
      this.collapseState,
      (s, r) => new BaseGameRule<TResponse>(s, r)
    );
    this.createRule(
      this.collapseState,
      this.endCollapseState,
      (s, r) => new BaseGameRule<TResponse>(s, r)
    );

    this.createRule(
      this.endCollapseState,
      shortWinLines,
      (t, r) => new StopToShiftingCollapse<TResponse>(t, r)
    );
    this.createRule(
      this.endCollapseState,
      this.beginCollapseState,
      (t, r) => new EndCollapseToBeginCollapse<TResponse>(t, r)
    );

    this.createRule(this.endCollapseState, animation, (s, r) => new StopToBonus<TResponse>(s, r));
    this.createRule(
      this.endCollapseState,
      animation,
      (s, r) => new StopToBeginScatter<TResponse>(s, r)
    );
    this.createRule(
      this.endCollapseState,
      animation,
      (s, r) => new StopToBeginFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endCollapseState,
      animation,
      (s, r) => new StopToFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endCollapseState,
      animation,
      (s, r) => new StopToEndFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endCollapseState,
      animation,
      (s, r) => new StopToRegularSpin<TResponse>(s, r)
    );
    super.createRules();
  }
}
