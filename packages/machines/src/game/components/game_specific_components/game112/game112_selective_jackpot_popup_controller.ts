import {
  ISpinResponse,
  IClientProperties,
  T_IClientProperties,
  SpinResponse,
  ReelWinPosition,
} from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import { Container, Action, EmptyAction, SequenceSimpleAction, FunctionAction } from '@cgs/syd';
import { JackPotWinPopupController } from '../../../common/slot/controllers/jackpot_popup_controller';
import { SelectiveJackpotPopupView } from '../../../common/slot/views/selective_jackpot_popup_view';
import { GameTimeAccelerationProvider } from '../../game_time_acceleration_provider';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import { RegularSpinsSoundModelComponent } from '../../regular_spins_sound_model_component';
import { WinLineActionComponent } from '../../win_lines/complex_win_line_action_providers/win_line_action_component';
import { IFadeReelsProvider } from '../../win_lines/i_fade_reels_provider';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { AbstractGameConfig } from '../../../../reels_engine/game_config/abstract_game_config';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotSessionProvider,
  T_IGameStateMachineProvider,
  T_IGameConfigProvider,
  T_RegularSpinsSoundModelComponent,
  T_WinLineActionComponent,
  T_IFadeReelsProvider,
  T_GameTimeAccelerationProvider,
} from '../../../../type_definitions';
import { IGameConfigProvider } from '../../interfaces/i_game_config_provider';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';

export class Game112SelectiveJackpotPopupController extends JackPotWinPopupController {
  private static readonly selectJackpotStateFormat: string = 'jackpot{0}';
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _config: AbstractGameConfig;
  private _winLineActionProvider: WinLineActionComponent;
  private _fadeReelsProvider: IFadeReelsProvider;
  private _countOfFlashCashToTrigger: number;

  constructor(
    container: Container,
    popupView: SelectiveJackpotPopupView,
    stopBackgroundSound: boolean,
    useTextAnimation: boolean,
    winPositionsSymbolId: number | null,
    soundName: string | null,
    updateJackpotAtClose: boolean,
    countOfFlashCashRequired: number
  ) {
    super(
      container,
      popupView,
      stopBackgroundSound,
      useTextAnimation,
      winPositionsSymbolId,
      soundName,
      updateJackpotAtClose
    );
    this._countOfFlashCashToTrigger = countOfFlashCashRequired;
    this._clientProperties = container.forceResolve<IClientProperties>(
      T_IClientProperties
    ) as IClientProperties;
    this._slotSession = (
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider) as ISlotSessionProvider
    ).slotSession;
    this._gameStateMachine = (
      container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ) as IGameStateMachineProvider
    ).gameStateMachine;
    this._config = (
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider) as IGameConfigProvider
    ).gameConfig;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel as ReelsSoundModel;
    this._winLineActionProvider = container.forceResolve<WinLineActionComponent>(
      T_WinLineActionComponent
    ) as WinLineActionComponent;
    this._fadeReelsProvider = container.forceResolve<IFadeReelsProvider>(
      T_IFadeReelsProvider
    ) as IFadeReelsProvider;
    this._fastSpinsController = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    ) as GameTimeAccelerationProvider;
  }

  onPopupShown(): void {
    const symbols = this._gameStateMachine.curResponse.specialSymbolGroups;
    const symbol = symbols
      ? symbols.find((p) => p.type == JackPotWinPopupController.jackpotMarker)
      : null;

    if (this._countOfFlashCashToTrigger == -1) {
      if (symbol && typeof symbol.symbolId === 'number') {
        this.view.postEvent(
          StringUtils.format(Game112SelectiveJackpotPopupController.selectJackpotStateFormat, [
            symbol.symbolId.toString(),
          ])
        );
      }
    } else {
      if (symbol && symbol.positions) {
        const countOfFlashCash = symbol.positions.length;
        const state = Math.min(Math.max(0, countOfFlashCash - this._countOfFlashCashToTrigger), 4);
        this.view.postEvent(
          StringUtils.format(Game112SelectiveJackpotPopupController.selectJackpotStateFormat, [
            state,
          ])
        );
      }
    }

    if (this.soundName && this.soundName.length > 0) {
      const sound = this._reelsSoundModel.getSoundByName(this.soundName);
      sound.stop();
      sound.play();
    }
  }

  jackPotAction(response: SpinResponse): Action {
    const symbols = response.specialSymbolGroups;
    const symbol = symbols
      ? symbols.find((p) => p.type == JackPotWinPopupController.jackpotMarker)
      : null;

    if (!symbol || !symbol.positions || !symbol.positions.length) {
      return new EmptyAction();
    }
    let symbolId = symbol.symbolId;
    if (response.winPositions && response.winPositions.length > 0) {
      const winPosition = response.winPositions[0];
      if (winPosition) {
        symbolId = winPosition.symbol;
      }
    }

    this._winLineActionProvider.Update(
      this._reelsSoundModel,
      [],
      response.viewReels,
      this._config.regularSpinConfig as SpinConfig,
      [
        new ReelWinPosition(
          symbol.positions,
          symbol.type as string,
          symbolId as number,
          symbol.totalJackPotWin
        ),
      ]
    );

    let popupAction: Action;

    if (
      this._countOfFlashCashToTrigger != -1 &&
      symbol &&
      symbol.positions.length < this._countOfFlashCashToTrigger
    ) {
      popupAction = new EmptyAction();
    } else {
      popupAction = super.jackPotAction(response);
    }

    return new SequenceSimpleAction([
      new FunctionAction(() => this._fadeReelsProvider.EnableFade(true)),
      this._winLineActionProvider.SpecialLineAction
        ? this._winLineActionProvider.SpecialLineAction
        : new EmptyAction(),
      popupAction,
      new FunctionAction(() => this._fadeReelsProvider.EnableFade(false)),
    ]);
  }
}
