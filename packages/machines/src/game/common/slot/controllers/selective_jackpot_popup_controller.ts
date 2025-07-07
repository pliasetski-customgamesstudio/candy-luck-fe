import {
  ISpinResponse,
  IClientProperties,
  T_IClientProperties,
  SpinResponse,
  ReelWinPosition,
} from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import { Container, Action, EmptyAction, SequenceSimpleAction, FunctionAction } from '@cgs/syd';
import { GameTimeAccelerationProvider } from '../../../components/game_time_acceleration_provider';
import { IGameConfigProvider } from '../../../components/interfaces/i_game_config_provider';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { RegularSpinsSoundModelComponent } from '../../../components/regular_spins_sound_model_component';
import { WinLineActionComponent } from '../../../components/win_lines/complex_win_line_action_providers/win_line_action_component';
import { IFadeReelsProvider } from '../../../components/win_lines/i_fade_reels_provider';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { AbstractGameConfig } from '../../../../reels_engine/game_config/abstract_game_config';
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
import { SelectiveJackpotPopupView } from '../views/selective_jackpot_popup_view';
import { JackPotWinPopupController } from './jackpot_popup_controller';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';

export class SelectiveJackpotPopupController extends JackPotWinPopupController {
  private static readonly selectJackpotStateFormat: string = 'jackpot{0}';
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _config: AbstractGameConfig;
  private _winLineActionProvider: WinLineActionComponent;
  private _fadeReelsProvider: IFadeReelsProvider;
  private _winPositionsToRemove: string[];

  constructor(
    container: Container,
    popupView: SelectiveJackpotPopupView,
    stopBackgroundSound: boolean,
    useTextAnimation: boolean,
    winPositionsSymbolId: number,
    soundName: string,
    updateJackpotAtClose: boolean,
    winPositionsToRemove: string[],
    shortWinLineGroups: string[]
  ) {
    super(
      container,
      popupView,
      stopBackgroundSound,
      useTextAnimation,
      winPositionsSymbolId,
      soundName,
      updateJackpotAtClose,
      shortWinLineGroups
    );
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._config = container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._winLineActionProvider =
      container.forceResolve<WinLineActionComponent>(T_WinLineActionComponent);
    this._fadeReelsProvider = container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider);
    this._fastSpinsController = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    this._winPositionsToRemove = winPositionsToRemove;
  }

  onPopupShown(): void {
    const symbols = this._gameStateMachine.curResponse.specialSymbolGroups;
    const symbol = symbols
      ? symbols.find((p) => p.type === JackPotWinPopupController.jackpotMarker)
      : null;

    if (symbol && typeof symbol.symbolId === 'number') {
      this.view.postEvent(
        StringUtils.format(SelectiveJackpotPopupController.selectJackpotStateFormat, [
          symbol.symbolId.toString(),
        ])
      );
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
      ? symbols.find((p) => p.type === JackPotWinPopupController.jackpotMarker)
      : null;

    if (!symbol || !symbol.positions || symbol.positions.length === 0) {
      return new EmptyAction();
    }
    if (
      this._slotSession.GameId !== '48' &&
      this._slotSession.GameId !== '53' &&
      this._slotSession.GameId !== '58' &&
      this._slotSession.GameId !== '61' &&
      this._slotSession.GameId !== '88' &&
      this._fastSpinsController.isFastSpinsActive &&
      (this._gameStateMachine.isAutoSpins || this._gameStateMachine.curResponse.isFreeSpins)
    ) {
      return new EmptyAction();
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
          symbol.previousSymbolId as number,
          symbol.totalJackPotWin
        ),
      ]
    );

    return new SequenceSimpleAction([
      new FunctionAction(() => this._fadeReelsProvider.EnableFade(true)),
      this._winLineActionProvider.SpecialLineAction
        ? this._winLineActionProvider.SpecialLineAction
        : new EmptyAction(),
      new FunctionAction(() => {
        if (this._winPositionsToRemove && this._winPositionsToRemove.some((x) => !!x)) {
          for (const type of this._winPositionsToRemove) {
            const positions = this._gameStateMachine.curResponse.winPositions.filter(
              (p) => p.type === type
            );
            for (const winPostion of positions) {
              this._gameStateMachine.curResponse.winPositions.splice(
                this._gameStateMachine.curResponse.winPositions.indexOf(winPostion),
                1
              );
            }
          }
        }
      }),
      super.jackPotAction(response),
      new FunctionAction(() => this._fadeReelsProvider.EnableFade(false)),
    ]);
  }
}
