import { HttpUtil, ISpinResponse } from '@cgs/common';
import { SlotCheat } from '@cgs/network';
import { Container } from '@cgs/syd';
import { ISpinController } from '../common/footer/i_spin_controller';
import { BaseSlotPopupController } from '../common/slot/controllers/base_popup_controller';
import { CheatConsole, CheatType } from '../common/slot/custom_cheat_console';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../reels_engine/state_machine/game_state_machine';
import {
  T_GameStateMachineNotifierComponent,
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
  T_ISpinController,
} from '../../type_definitions';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';
import { Cheat } from './node_tap_action/strategies/cheat_provider_strategy';

export class CheatComponent implements AbstractListener {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsPositions: number[][] = [];
  public get reelsPositions(): number[][] {
    return this._reelsPositions;
  }

  private _cheatConsole: CheatConsole;
  private _container: Container;
  private _active: boolean = false;

  constructor(container: Container) {
    container
      .forceResolve<GameStateMachineNotifierComponent>(T_GameStateMachineNotifierComponent)
      .notifier.AddListener(this);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    console.log('load ' + this.constructor.name);

    this._container = container;
    const session =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    const info = session.machineInfo;

    this._cheatConsole = new CheatConsole(
      info.configs,
      info.cheatCommands,
      info.cheatReels,
      info.customCheatInput,
      this._container
    );

    let cheatConfigPromise = Promise.resolve([]);

    if (info.cheatReels) {
      cheatConfigPromise = HttpUtil.wrapWithLogError(
        fetch('configs/cheat.json'),
        'configs/cheat.json'
      )
        .then((response) => response.json())
        .then((data) => data?.predefinedReels || []);
    }

    cheatConfigPromise.then((reels) => this._cheatConsole.initialize(reels));
  }

  public getSpinCheat(): SlotCheat {
    if (!this._cheatConsole) {
      return new SlotCheat();
    }

    const activeCheat = this._cheatConsole.getActiveCheat();

    const slotCheat = new SlotCheat();

    switch (activeCheat?.type) {
      case CheatType.Cfg:
        slotCheat.customConfig = activeCheat.value;
        break;
      case CheatType.Command:
        slotCheat.command = activeCheat.value;
        break;
      case CheatType.Reels:
        slotCheat.reelsPositions = activeCheat.value;
        break;
    }

    return slotCheat;
  }

  public getFastSpinMode(): boolean {
    return this._cheatConsole.getFastSpinMode();
  }

  public doSpin(): void {
    if (
      this._active &&
      !this._gameStateMachine.curResponse.isFakeResponse &&
      ![GameStateMachineStates.Bonus, GameStateMachineStates.Scatter].some((item) =>
        this._gameStateMachine.isActive(item)
      )
    ) {
      const spinController: ISpinController =
        this._container.forceResolve<ISpinController>(T_ISpinController);
      if (spinController.doSpin()) {
        //
      }
    }
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
      case GameStateMachineStates.BeginBonus:
      case BaseSlotPopupController.popupState:
      case GameStateMachineStates.BonusRecovery:
      case GameStateMachineStates.Bonus:
        this._active = false;
        break;
      case GameStateMachineStates.RegularSpin:
      case GameStateMachineStates.Idle:
        this._active = true;
        break;
    }
  }

  public OnStateExited(slotState: string): void {
    switch (slotState) {
      case BaseSlotPopupController.popupState:
        this._active = true;
        break;
    }
  }

  public dispose(): void {
    if (this._cheatConsole) {
      this._cheatConsole.destroy();
    }
  }

  public setCheatType(_: Cheat): void {}
}
