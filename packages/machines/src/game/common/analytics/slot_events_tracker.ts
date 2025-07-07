import { ISpinResponse, SpinResponse } from '@cgs/common';
import { Container, IDisposable } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../../components/game_state_machine_notifier_component';
import { IWinLinesConverter } from '../../components/win_lines/win_line_converters/i_win_lines_converter';
import { IWinPositionsConverter } from '../../components/win_lines/win_position_converters/i_win_positions_converter';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import {
  T_GameStateMachineNotifierComponent,
  T_IWinLinesConverter,
  T_IWinPositionsConverter,
} from '../../../type_definitions';

export class SlotEventsTracker implements AbstractListener, IDisposable {
  private _winLinesConverter: IWinLinesConverter;
  private _winPositionsConverter: IWinPositionsConverter;
  private _isWinAnimation: boolean = false;
  private _container: Container;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsEngine: ReelsEngine;
  private _reelStopedSub: any;

  constructor(container: Container) {
    this._winLinesConverter = container.forceResolve<IWinLinesConverter>(T_IWinLinesConverter);
    this._winPositionsConverter =
      container.forceResolve<IWinPositionsConverter>(T_IWinPositionsConverter);
    const stComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    const notifier = stComponent.notifier;
    this._gameStateMachine = stComponent.gameStateMachine;
    notifier.AddListener(this);
  }

  OnStateEntered(slotState: string): void {}

  OnStateExited(slotState: string): void {}

  private static _isFreeSpins(currentResponse: SpinResponse): boolean {
    return (
      !!currentResponse.freeSpinsInfo?.currentFreeSpinsGroup &&
      currentResponse.freeSpinsInfo.currentFreeSpinsGroup.count! > 0
    );
  }

  dispose(): void {
    this._reelStopedSub?.cancel();
    this._reelStopedSub = null;
  }
}
