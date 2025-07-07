import { IClientProperties, ISpinResponse, T_IClientProperties } from '@cgs/common';
import { Container } from '@cgs/syd';
import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { T_GameConfigController, T_ISlotSessionProvider } from '../../type_definitions';
import { GameConfigController } from './game_config_controller';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';

export class FakeReelReplacerComponent {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _iconsEnumerator: IconEnumerator;
  get iconsEnumerator(): IconEnumerator {
    return this._iconsEnumerator;
  }
  private _gameConfigProvider: IGameConfigProvider;
  get gameConfigProvider(): IGameConfigProvider {
    return this._gameConfigProvider;
  }
  private _clientProperties: IClientProperties;
  private _container: Container;

  constructor(container: Container) {
    this._container = container;
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    const gameId =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession.GameId;
  }

  private newIconsDependOnSpin(): void {
    let fakeReels;

    if (
      !this._gameConfigProvider?.gameConfig ||
      !this._gameStateMachine.curResponse ||
      this._gameStateMachine.curResponse.isFakeResponse
    ) {
      return;
    }
    if (this._gameStateMachine.curResponse.spinningReelId) {
      fakeReels = this._gameConfigProvider.gameConfig.getFakeConfig(
        'staticConfig_' + this._gameStateMachine.curResponse.spinningReelId
      ).spinedReels;
    } else {
      fakeReels = this._gameConfigProvider.gameConfig.getFakeConfig('staticConfig').spinedReels;
      if (
        this._gameStateMachine.curResponse.isFreeSpins &&
        this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
          FreeSpinsInfoConstants.FreeSpinsStarted
      ) {
        const configController =
          this._container.forceResolve<GameConfigController>(T_GameConfigController);
        if (configController) {
          fakeReels = configController.getReelsByFreeSpinsName(
            this._gameStateMachine.prevResponse.freeSpinsInfo!.name
          );
        }
      }
    }
    this._iconsEnumerator.setSpinedReels(fakeReels);
  }
}
