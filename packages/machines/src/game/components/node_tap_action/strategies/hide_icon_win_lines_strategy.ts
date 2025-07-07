import { IActionNodeStrategy } from './i_action_node_strategy';
import { IconActionContext } from '../contexts/icon_action_context';
import { Container } from '@cgs/syd';
import { IconWinLinesProvider } from '../../win_lines/icon_win_lines_provider';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { T_IconWinLinesProvider, T_IGameStateMachineProvider } from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export class HideIconWinLinesStrategy implements IActionNodeStrategy<IconActionContext> {
  private _container: Container;
  private _iconWinLinesProvider: IconWinLinesProvider;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(container: Container) {
    this._container = container;
    this._iconWinLinesProvider = this._container.forceResolve(T_IconWinLinesProvider);
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }

  performStrategy(actionContext: IconActionContext): void {
    if (
      [GameStateMachineStates.Idle, GameStateMachineStates.RegularSpin].some((state) =>
        this._gameStateMachine.isActive(state)
      ) &&
      (!this._gameStateMachine.curResponse.winLines ||
        this._gameStateMachine.curResponse.winLines.length === 0) &&
      this._gameStateMachine.curResponse.isScatter === false &&
      this._gameStateMachine.curResponse.isBonus === false &&
      (!this._gameStateMachine.curResponse.freeSpinsInfo ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ===
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      this._iconWinLinesProvider.hideWinLines();
    }
  }
}
