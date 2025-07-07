import { ISpinResponse, Line } from '@cgs/common';
import { NetworkSymbol } from '@cgs/network';
import { Duration } from '@cgs/shared';
import { Container, Timer } from '@cgs/syd';
import { CheatComponent } from './cheat_component';
import { CheatSceneObjectProvider, CheatSceneObject } from './cheat_scene_object';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import { ISpinController } from '../common/footer/i_spin_controller';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../reels_engine/state_machine/game_state_machine';
import {
  T_CheatComponent,
  T_CheatSceneObjectProvider,
  T_GameStateMachineNotifierComponent,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
  T_ISpinController,
} from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';
import { Cheat } from './node_tap_action/strategies/cheat_provider_strategy';
import { SlotParams } from '../../reels_engine/slot_params';
import { BaseSlotPopupController } from '../common/slot/controllers/base_popup_controller';

export class QaCheatComponent implements AbstractListener {
  private _symbols: NetworkSymbol[];
  private _cheatComponent: CheatComponent;
  private _spinController: ISpinController;
  private _container: Container;
  private _reelsCount: number;
  private _linesCount: number;
  private _longIconIds: number[];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _symbol: NetworkSymbol;

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    this._cheatComponent = container.forceResolve<CheatComponent>(T_CheatComponent);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const cheatSceneObject = container.forceResolve<CheatSceneObjectProvider>(
      T_CheatSceneObjectProvider
      // @ts-ignore TODO: this is no cheatSceneObject property in CheatSceneObjectProvider class
    ).cheatSceneObject;
    cheatSceneObject.addDispatcher(this);

    const notifier = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    ).notifier;
    notifier.AddListener(this);

    const session =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    session.RegisterKeyListener(this.OnCheatKeyPressed);
  }

  get cheat(): CheatSceneObject {
    return this._container.forceResolve<CheatSceneObjectProvider>(T_CheatSceneObjectProvider) // @ts-ignore TODO: this is no cheatSceneObject property in CheatSceneObjectProvider class
      .cheatSceneObject;
  }

  private _symbolIndex: number;
  _firstLineRow: number;
  _firstLineStartPosition: number;
  _gainIndex: number;
  private _expectedWin: number;
  private _isActive: boolean = false;

  OnCheatKeyPressed(keyCode: number): void {
    if (keyCode === 81 /*KeyCode.Q*/) {
      if (this._isActive) {
        this._isActive = false;
      } else {
        this.initCheat();
        this._cheatComponent.setCheatType(Cheat.Config);
      }
    }
  }

  private _simpleShortIds: number[];
  private _rowTemplate: number[];

  initCheat(): void {
    // const slotSession = this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    //_symbols = slotSession.machineInfo.symbols.map((s) => new Symbol()).toList();
    this._spinController = this._container.forceResolve<ISpinController>(T_ISpinController);
    const slotParams = this._container.forceResolve<SlotParams>(T_IGameParams);
    this._reelsCount = slotParams.reelsCount;
    this._linesCount = slotParams.linesCount;
    this._longIconIds = slotParams.longIcons?.map((desc) => desc.iconIndex) || [];

    this._simpleShortIds = this._symbols
      .filter((symb) => symb.type == 'simple' && !this._longIconIds.includes(symb.id!))
      .map((symb) => symb.id!);

    this._isActive = true;

    this._firstLineRow = this._linesCount % 2 == 0 ? 0 : 1;
    this._firstLineStartPosition = this._firstLineRow * this._reelsCount;
    this._symbolIndex = this._symbols.length - 1;
    this._gainIndex = 0;

    this._rowTemplate = this.cycleList(
      this._simpleShortIds.filter((symb) => symb != this._symbols[this._symbolIndex].id),
      this._reelsCount
    );
  }

  runCheat(): void {
    this.initCheat();
    this.runOne();
  }

  cycleList(template: number[], length: number): number[] {
    return Array.from({ length: length }, (_, pos) => template[pos % template.length]);
  }

  runOne(): void {
    this._symbol = this._symbols[this._symbolIndex];

    for (let j = 0; j < this._reelsCount; j++) {
      for (let i = 0; i < this._linesCount; i++) {
        if (
          (this._firstLineRow == i && j <= this._gainIndex) ||
          (this._firstLineRow == i + 1 &&
            j <= this._gainIndex &&
            this._longIconIds.includes(this._symbol.id!))
        ) {
          this._cheatComponent.reelsPositions[j][i] = this._symbol.id!;
        } else {
          this._cheatComponent.reelsPositions[j][i] = this._rowTemplate[j];
        }
      }
    }
    this._cheatComponent.setCheatType(Cheat.Config);
    this._spinController.doSpin();

    const session =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._expectedWin = Math.round(
      this._symbol.gains![this._gainIndex] * session.Bets[session.BetIndex].bet
    );

    this._gainIndex++;
    if (this._gainIndex >= (this._symbol.gains?.length || 0)) {
      this._gainIndex = 0;
      this._symbolIndex--;
      this._rowTemplate = this.cycleList(
        this._simpleShortIds.filter((symb) => symb != this._symbols[this._symbolIndex].id),
        this._reelsCount
      );
    }
    if (this._symbolIndex < 0) {
      this._isActive = false;
    }
  }

  isFirstLine(line: Line, startIndex: number): boolean {
    for (let i = 0; i < line.iconsIndexes.length; i++) {
      //Check whether position in current line is the same as in FIRST line
      if (line.iconsIndexes[i] != startIndex + i) {
        return false;
      }
    }
    return true;
  }

  //TODO:Implement this
  //  @override
  //  bool handleMessage(e) {
  //    if (e is Cheat && e.value == 4) {
  //      runCheat();
  //      return true;
  //    }
  //    return false;
  //  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Scatter:
      case GameStateMachineStates.Bonus:
      case BaseSlotPopupController.popupState:
        this.cheat.active = false;
        break;
      case 'regularSpin':
      case 'idle':
        if (this._isActive) {
          const session =
            this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
          const winLines = this._gameStateMachine.curResponse.winLines.filter((line) =>
            this.isFirstLine(line, this._firstLineStartPosition)
          );
          const winLine = winLines[0];

          // TODO: DART2 Check fix: session.Bets[session.BetIndex] -> session.Bets[session.BetIndex].bet
          const serverWin = winLine
            ? winLine.winAmount * winLine.multiplier! * session.Bets[session.BetIndex].bet
            : 0;

          const isWinCorrect = serverWin == this._expectedWin;
          new Timer(new Duration({ seconds: isWinCorrect ? 3 : 7 }).Number, () => this.runOne());
        }
        break;
    }
  }

  OnStateExited(slotState: string): void {
    switch (slotState) {
      case BaseSlotPopupController.popupState:
        this._isActive = true;
    }
  }
}
