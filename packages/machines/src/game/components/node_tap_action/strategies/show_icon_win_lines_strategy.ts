import { Container } from '@cgs/syd';
import { IActionNodeStrategy } from './i_action_node_strategy';
import { IconActionContext } from '../contexts/icon_action_context';
import { IconWinLinesProvider } from '../../win_lines/icon_win_lines_provider';
import { ISpinResponse } from '@cgs/common';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import { ISlotPopupCoordinator } from '../../../common/slot_popup_coordinator';
import {
  T_IconWinLinesProvider,
  T_IGameStateMachineProvider,
  T_ISlotPopupCoordinator,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export class ShowIconWinLinesStrategy implements IActionNodeStrategy<IconActionContext> {
  private _container: Container;
  private _iconWinLinesProvider: IconWinLinesProvider;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _popupCoordinator: ISlotPopupCoordinator;

  constructor(container: Container) {
    this._container = container;
    this._iconWinLinesProvider = this._container.forceResolve(T_IconWinLinesProvider);
    this._popupCoordinator =
      this._container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameStateMachine.accelerate.entered.listen(() => {
      this.GoToDefault();
    });
  }

  public performStrategy(actionContext: IconActionContext): void {
    if (
      [GameStateMachineStates.Idle, GameStateMachineStates.RegularSpin].some((state) =>
        this._gameStateMachine.isActive(state)
      ) &&
      !this._popupCoordinator.isPopupShown() &&
      (!this._gameStateMachine.curResponse.winLines ||
        this._gameStateMachine.curResponse.winLines.length === 0) &&
      this._gameStateMachine.curResponse.isScatter === false &&
      this._gameStateMachine.curResponse.isBonus === false &&
      (!this._gameStateMachine.curResponse.freeSpinsInfo ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ===
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      this._iconWinLinesProvider.showWinLines(actionContext.reelIndex, actionContext.lineIndex);
    }
  }

  private GoToDefault(): void {
    this._iconWinLinesProvider.hideWinLines();
  }
}
