import { ISpinResponse } from '@cgs/common';
import { Container } from '@cgs/syd';
import { ISpinViewConditionComponent } from '../../i_spin_view_condition_component';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { T_IGameStateMachineProvider } from '../../type_definitions';

export class SpinViewConditionComponent implements ISpinViewConditionComponent {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _container: Container;
  private readonly _respinName: string;
  private readonly _allowedFreeSpinsWithRespins: string[];

  constructor(container: Container, respinName: string, allowedFreeSpinsWithRespins: string[]) {
    this._container = container;
    this._gameStateMachine = (
      this._container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ) as IGameStateMachineProvider
    ).gameStateMachine;
    this._respinName = respinName;
    this._allowedFreeSpinsWithRespins = allowedFreeSpinsWithRespins;
  }

  isStopDisState(): boolean {
    const response = this._gameStateMachine.curResponse;
    const prevResponse = this._gameStateMachine.prevResponse;

    const hasCurrentFsGroup =
      response && response.isFreeSpins
        ? response.freeSpinsInfo!.freeSpinGroups!.some((arg) =>
            this._allowedFreeSpinsWithRespins.includes(arg!.name!)
          )
        : false;

    const hasPreviousFSGroup =
      prevResponse && prevResponse.isFreeSpins
        ? prevResponse.freeSpinsInfo!.freeSpinGroups!.some((arg) =>
            this._allowedFreeSpinsWithRespins.includes(arg!.name!)
          )
        : false;

    return (
      response.isFreeSpins &&
      (response.freeSpinsInfo!.name !== this._respinName ||
        (response.freeSpinsInfo!.name === this._respinName && hasCurrentFsGroup)) &&
      response.freeSpinsInfo!.event !== FreeSpinsInfoConstants.FreeSpinsStarted &&
      (!prevResponse ||
        !prevResponse.isFreeSpins ||
        prevResponse.freeSpinsInfo!.name !== this._respinName ||
        (prevResponse.freeSpinsInfo!.name === this._respinName && hasPreviousFSGroup))
    );
  }

  isSpinDisState(): boolean {
    const response = this._gameStateMachine.curResponse;

    const hasCurrentFsGroup = response.isFreeSpins
      ? response.freeSpinsInfo!.freeSpinGroups!.some((arg) =>
          this._allowedFreeSpinsWithRespins.includes(arg!.name!)
        )
      : false;

    return (
      response.isFreeSpins &&
      (response.freeSpinsInfo!.name != this._respinName ||
        (response.freeSpinsInfo!.name == this._respinName && hasCurrentFsGroup)) &&
      response.freeSpinsInfo!.event != FreeSpinsInfoConstants.FreeSpinsFinished
    );
  }
}
