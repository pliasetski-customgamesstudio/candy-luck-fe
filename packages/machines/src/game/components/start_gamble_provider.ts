import {
  ISlotsApiService,
  T_ISlotsApiService,
  NotEnoughBalanceException,
  RestartInitiatedException,
  InvalidSequenceNumberException,
  T_GameOperation,
  ISpinResponse,
} from '@cgs/common';
import { BackToLobbyGameResult } from '@cgs/features';
import { StartMachineRequest, ServerException } from '@cgs/network';
import { Container } from '@cgs/syd';
import { BonusConverterExtention } from '../../bonus/bonus_converter_extention';
import { GameOperation } from '../../game_operation';
import { ISomethingWentWrongShower } from '../../i_something_went_wrong_shower';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_ISomethingWentWrongShower,
} from '../../type_definitions';

export class StartGambleProvider {
  private _gameParams: IGameParams;
  private _container: Container;
  private _slotService: ISlotsApiService;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(container: Container) {
    this._container = container;
    this._gameParams = this._container.forceResolve<IGameParams>(T_IGameParams);
    this._slotService = this._container.forceResolve<ISlotsApiService>(T_ISlotsApiService);

    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameStateMachine.startGamble.entered.listen((e) => {
      this._startGambleOnEntered();
    });
  }

  private async _startGambleOnEntered(): Promise<void> {
    const request: StartMachineRequest = new StartMachineRequest();
    request.machineId = this._gameParams.machineId;

    try {
      const bonusInfo = await this._slotService.startGamble(request);
      this._gameStateMachine.curResponse.scatterInfo =
        BonusConverterExtention.toInternalResponse(bonusInfo);
      this._gameStateMachine.doGamble(true);
    } catch (e) {
      if (e instanceof NotEnoughBalanceException) {
        this.onException(e);
      } else if (e instanceof RestartInitiatedException) {
        this.onException(e);
      } else if (e instanceof ServerException) {
        this.onException(e);
        // } else if (e instanceof PaymentPageMissingException) {
        //   this.onException(e);
      } else if (e instanceof InvalidSequenceNumberException) {
        this.onException(e);
      }
    }
  }

  private async onException(e: Error): Promise<void> {
    await this._container
      .forceResolve<ISomethingWentWrongShower>(T_ISomethingWentWrongShower)
      .showSomethingWentWrong();
    this._container
      .forceResolve<GameOperation>(T_GameOperation)
      .complete(new BackToLobbyGameResult());
    this._gameStateMachine.doGamble(false);
  }
}
