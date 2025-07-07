import { ISlotPrimaryActionsProvider } from '../interfaces/i_slot_primary_actions_provider';
import { WinLineActionComponent } from './complex_win_line_action_providers/win_line_action_component';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { AbstractGameConfig } from '../../../reels_engine/game_config/abstract_game_config';
import { RegularSpinsSoundModel } from '../../../reels_engine/reels_sound_model';
import { IWinLinesConverter } from './win_line_converters/i_win_lines_converter';
import { IWinPositionsConverter } from './win_position_converters/i_win_positions_converter';
import { IStartSlotActionProvider, SpinMode } from '../i_start_slot_action_provider';
import { IStopSlotActionProvider } from '../i_stop_slot_action_provider';
import { Action, Container, EmptyAction, IntervalAction } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameConfigProvider,
  T_IGameStateMachineProvider,
  T_IStartSlotActionProvider,
  T_IStopSlotActionProvider,
  T_IWinLinesConverter,
  T_IWinPositionsConverter,
  T_RegularSpinsSoundModelComponent,
  T_WinLineActionComponent,
} from '../../../type_definitions';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { InternalRespinSpecGroup } from '@cgs/common';
import { SpinConfig } from '../../../reels_engine/game_config/game_config';

export class SlotPrimaryActionsProvider implements ISlotPrimaryActionsProvider {
  private _winLineComponent: WinLineActionComponent;
  get winLineComponent(): WinLineActionComponent {
    return this._winLineComponent;
  }
  private _gameStateMachine: GameStateMachine<any>;
  get gameStateMachine(): GameStateMachine<any> {
    return this._gameStateMachine;
  }
  private _gameConfig: AbstractGameConfig;
  get gameConfig(): AbstractGameConfig {
    return this._gameConfig;
  }
  private _regularSpinSoundModel: RegularSpinsSoundModel;
  get regularSpinSoundModel(): RegularSpinsSoundModel {
    return this._regularSpinSoundModel;
  }
  private _winLinesConverter: IWinLinesConverter;
  get winLinesConverter(): IWinLinesConverter {
    return this._winLinesConverter;
  }
  private _winPositionsConverter: IWinPositionsConverter;
  get winPositionsConverter(): IWinPositionsConverter {
    return this._winPositionsConverter;
  }
  private _startSlotActionProvider: IStartSlotActionProvider;
  private _stopSlotActionProvider: IStopSlotActionProvider;

  constructor(container: Container) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameConfig =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._regularSpinSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._winLineComponent =
      container.forceResolve<WinLineActionComponent>(T_WinLineActionComponent);
    this._winLinesConverter = container.forceResolve(T_IWinLinesConverter);
    this._winPositionsConverter = container.forceResolve(T_IWinPositionsConverter);
    this._startSlotActionProvider = container.forceResolve(T_IStartSlotActionProvider);
    this._stopSlotActionProvider = container.forceResolve(T_IStopSlotActionProvider);
  }

  getStartSlotAction(): Action {
    const respinGroup =
      this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
        : null;
    return this._startSlotActionProvider.getStartSlotAction(
      respinGroup && respinGroup.respinCounter < respinGroup.groups.length
        ? SpinMode.ReSpin
        : SpinMode.Spin
    );
  }

  getStopSlotAction(): Action {
    const respinGroup =
      this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
        : null;
    return this._stopSlotActionProvider.getStopSlotAction(
      respinGroup && respinGroup.respinStarted ? SpinMode.ReSpin : SpinMode.Spin
    );
  }

  getImmediatelyStopSlotAction(): Action {
    return new EmptyAction().withDuration(0.0);
  }

  getWinLinesAction(): IntervalAction {
    const winLines = this._winLinesConverter.getWinLines(
      this._gameStateMachine.curResponse.reelState
    );
    const winPosition = this._winPositionsConverter.getSimpleWinPositions(
      this._gameStateMachine.curResponse.reelState
    );
    this._winLineComponent.Update(
      this._regularSpinSoundModel,
      winLines,
      this._gameStateMachine.curResponse.viewReels,
      this._gameConfig.regularSpinConfig as SpinConfig,
      winPosition
    );
    return this._winLineComponent.WinLineAction;
  }

  getShortWinLinesAction(): Action {
    const winLines = this._winLinesConverter.getWinLines(
      this._gameStateMachine.curResponse.reelState
    );
    const winPosition = this._winPositionsConverter.getSimpleWinPositions(
      this._gameStateMachine.curResponse.reelState
    );
    this._winLineComponent.Update(
      this._regularSpinSoundModel,
      winLines,
      this._gameStateMachine.curResponse.viewReels,
      this._gameConfig.regularSpinConfig as SpinConfig,
      winPosition
    );
    return this._winLineComponent.ShortWinLineAction;
  }

  getSpecialWinLinesAction(): IntervalAction {
    const winLines = this._winLinesConverter.getWinLines(
      this._gameStateMachine.curResponse.reelState
    );
    const winPosition = this._winPositionsConverter.getSpecialWinPositions(
      this._gameStateMachine.curResponse.reelState
    );
    this._winLineComponent.Update(
      this._regularSpinSoundModel,
      winLines,
      this._gameStateMachine.curResponse.viewReels,
      this._gameConfig.regularSpinConfig as SpinConfig,
      winPosition
    );
    return this._winLineComponent.SpecialLineAction;
  }

  getRespinWinLinesAction(): Action {
    const respinGroup = this._gameStateMachine.curResponse
      .additionalData as InternalRespinSpecGroup;

    if (respinGroup && respinGroup.respinCounter < respinGroup.groups.length - 1) {
      const winLines = respinGroup.currentRound.winLines;
      const winPosition = respinGroup.currentRound.winPositions;

      if ((winLines && winLines.length > 0) || (winPosition && winPosition.length > 0)) {
        this._winLineComponent.Update(
          this._regularSpinSoundModel,
          winLines,
          respinGroup.currentRound.newViewReels,
          this._gameConfig.regularSpinConfig as SpinConfig,
          winPosition
        );
        return this._winLineComponent.ShortWinLineAction;
      }
    }

    return new EmptyAction().withDuration(0.0);
  }
}
