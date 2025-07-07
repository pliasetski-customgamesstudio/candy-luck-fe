import { Container, FunctionAction } from '@cgs/syd';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';
import { LazyAction } from '@cgs/shared';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';

export class RebuyFreespinsCleaner {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _fsMarker: string;
  private _alwaysCleanup: boolean;

  constructor(container: Container, fsMarker: string, alwaysCleanup: boolean = false) {
    this._fsMarker = fsMarker;
    this._alwaysCleanup = alwaysCleanup;
    this._gameStateMachine = (
      container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ) as IGameStateMachineProvider
    ).gameStateMachine;
    this._gameStateMachine.reBuyFreeSpinsPopup.appendLazyAnimation(
      () => new LazyAction(() => new FunctionAction(() => this.resetFSGroupsAfterRebuy()))
    );
  }

  private resetFSGroupsAfterRebuy(): void {
    const currentResponse = this._gameStateMachine.curResponse;
    if (
      this._alwaysCleanup ||
      (currentResponse.freeSpinsInfo &&
        currentResponse.freeSpinReBuyInfo &&
        currentResponse.freeSpinsInfo.freeSpinGroups &&
        currentResponse.freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsStarted)
    ) {
      const respinGroupExist = currentResponse.freeSpinsInfo!.freeSpinGroups!.some(
        (x) => x!.name == this._fsMarker
      );
      if (respinGroupExist) {
        this._gameStateMachine.curResponse!.freeSpinsInfo!.freeSpinGroups =
          this._gameStateMachine.curResponse!.freeSpinsInfo!.freeSpinGroups!.filter(
            (x) => x!.name != this._fsMarker
          );
        this._gameStateMachine.curResponse.specialSymbolGroups = new Array<SpecialSymbolGroup>();
      }
    }
  }
}
