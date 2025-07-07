import { Container, Action } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_IFadeReelsProvider,
  T_IGameStateMachineProvider,
  T_ISlotPrimaryActionsProvider,
} from '../../type_definitions';
import { ISlotPrimaryActionsProvider } from './interfaces/i_slot_primary_actions_provider';
import { ISlotPrimaryAnimationProvider } from './interfaces/i_slot_primary_animation_provider';
import { ISpinResponse } from '@cgs/common';
import { IFadeReelsProvider } from './win_lines/i_fade_reels_provider';

export class SlotPrimaryAnimationProvider implements ISlotPrimaryAnimationProvider {
  private readonly container: Container;
  private readonly _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _primarySlotActionsProvider: ISlotPrimaryActionsProvider;

  constructor(container: Container) {
    this.container = container;
    console.log('load ' + this.constructor.name);
    this._gameStateMachine = this.container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }

  clearWinLines(): void {
    this._gameStateMachine.regularSpins.animation.end();
    this.container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider).EnableFade(false);
  }

  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  get primarySlotActionsProvider(): ISlotPrimaryActionsProvider {
    if (!this._primarySlotActionsProvider) {
      this._primarySlotActionsProvider = this.container.forceResolve<ISlotPrimaryActionsProvider>(
        T_ISlotPrimaryActionsProvider
      );
    }
    return this._primarySlotActionsProvider;
  }

  attachPrimaryAnimationsToStateMachine(): void {
    this._gameStateMachine.accelerate.setLazyAnimation(() => this.buildStartSlotAction());
    this._gameStateMachine.stopping.setLazyAnimation(() => this.buildStopSlotAction());
    this._gameStateMachine.immediatelyStop.setLazyAnimation(() =>
      this.buildImmediatelyStopSlotAction()
    );

    this._gameStateMachine.regularSpins.setLazyAnimation(() => this.buildWinLinesAction());

    this._gameStateMachine.shortWinLines.setLazyAnimation(() => this.buildShortWinLinesAction());
    this._gameStateMachine.endFreeSpins.setLazyAnimation(() => this.buildShortWinLinesAction());

    this._gameStateMachine.respin.setLazyAnimation(() => this.buildRespinWinLinesAction());

    this._gameStateMachine.beginFreeSpins.setLazyAnimation(() => this.buildSpecialWinLinesAction());
    this._gameStateMachine.beginBonus.setLazyAnimation(() => this.buildSpecialWinLinesAction());
    this._gameStateMachine.beginScatter.setLazyAnimation(() => this.buildSpecialWinLinesAction());
  }

  buildStartSlotAction(): Action {
    this._gameStateMachine.regularSpins.setLazyAnimation(() => this.buildWinLinesAction());
    return this.primarySlotActionsProvider.getStartSlotAction();
  }

  buildStopSlotAction(): Action {
    return this.primarySlotActionsProvider.getStopSlotAction();
  }

  buildImmediatelyStopSlotAction(): Action {
    return this.primarySlotActionsProvider.getImmediatelyStopSlotAction();
  }

  buildWinLinesAction(): Action {
    return this.primarySlotActionsProvider.getWinLinesAction();
  }

  buildShortWinLinesAction(): Action {
    return this.primarySlotActionsProvider.getShortWinLinesAction();
  }

  buildRespinWinLinesAction(): Action {
    return this.primarySlotActionsProvider.getRespinWinLinesAction();
  }

  buildSpecialWinLinesAction(): Action {
    return this.primarySlotActionsProvider.getSpecialWinLinesAction();
  }
}
