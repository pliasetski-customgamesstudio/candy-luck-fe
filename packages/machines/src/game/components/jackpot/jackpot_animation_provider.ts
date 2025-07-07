import { Action, Container, EmptyAction } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../../type_definitions';
import { InternalCollapsingSpecGroup, ISpinResponse, SpecialSymbolGroup } from '@cgs/common';

export abstract class JackpotAnimationProvider {
  private _container: Container;
  get container(): Container {
    return this._container;
  }

  constructor(container: Container) {
    this._container = container;
    const gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    gameStateMachine.stop.appendLazyAnimation(() =>
      this.buildOnStopAnimationAction(gameStateMachine.curResponse)
    );
    // TODO: CollapseGameStateMachine in excluded currently
    // if (gameStateMachine instanceof CollapseGameStateMachine) {
    //   (gameStateMachine as CollapseGameStateMachine).endCollapseState.appendLazyAnimation(() => this.buildOnEndCollapseAnimationAction(gameStateMachine.curResponse));
    // }
  }

  buildOnStopAnimationAction(response: ISpinResponse): Action {
    return !response.additionalData ||
      !(response.additionalData instanceof InternalCollapsingSpecGroup)
      ? this.buildAnimationAction(response)
      : new EmptyAction().withDuration(0.0);
  }

  buildOnEndCollapseAnimationAction(response: ISpinResponse): Action {
    if (response.additionalData instanceof InternalCollapsingSpecGroup) {
      const collapsingGroup = response.additionalData as InternalCollapsingSpecGroup;
      return collapsingGroup && collapsingGroup.collapsingCounter == collapsingGroup.groups.length
        ? this.buildAnimationAction(response)
        : new EmptyAction().withDuration(0.0);
    }

    return new EmptyAction().withDuration(0.0);
  }

  buildAnimationAction(response: ISpinResponse): Action {
    const symbols = response.specialSymbolGroups;
    const symbol = symbols ? symbols.find((p) => p.type == 'JackPotWin') : null;

    if (symbol) {
      return this.getJackpotAction(response, symbol);
    }

    return new EmptyAction().withDuration(0.0);
  }

  abstract getJackpotAction(response: ISpinResponse, symbol: SpecialSymbolGroup): Action;
}
