import { Button, Container, SceneObject, TextSceneObject } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../reels_engine/state_machine/game_state_machine';
import { IconWinLinesProvider } from './win_lines/icon_win_lines_provider';
import { ISpinResponse } from '@cgs/common';
import {
  T_GameStateMachineNotifierComponent,
  T_IconWinLinesProvider,
  T_IGameStateMachineProvider,
  T_ISlotPopupCoordinator,
  T_ResourcesComponent,
} from '../../type_definitions';
import { ResourcesComponent } from './resources_component';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotPopupCoordinator } from '../common/slot_popup_coordinator';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';

export class BackgroundLinesCountProvider implements AbstractListener {
  private _container: Container;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _btnAllLinesIdTemplate: string = 'btnLines_';
  private _btnLineNumberIdTemplate: string = 'line_btn_';
  private _iconWinLinesProvider: IconWinLinesProvider;
  private _buttonsList: SceneObject[] = [];

  constructor(
    container: Container,
    btnAllLines: boolean,
    btnLineNumber: boolean,
    lineNodeFormat: string | null = null,
    isDuplicateBtns: boolean = false,
    linesCount: number | null = null
  ) {
    this._container = container;
    this._container
      .forceResolve<GameStateMachineNotifierComponent>(T_GameStateMachineNotifierComponent)
      .notifier.AddListener(this);
    const resourceProvider = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._iconWinLinesProvider =
      this._container.forceResolve<IconWinLinesProvider>(T_IconWinLinesProvider);

    if (typeof linesCount === 'number') {
      const linesNodes = resourceProvider.slot.findAllById('lines_count') as TextSceneObject[];
      linesNodes.forEach((e) => (e.text = linesCount.toString()));
    }

    if (btnAllLines) {
      let i = 0;
      let linesCountBtn = resourceProvider.bg.findById(
        this._btnAllLinesIdTemplate + i.toString()
      )! as Button;

      while (linesCountBtn) {
        this._buttonsList.push(linesCountBtn);
        linesCountBtn.clicked.listen(() => this.linesCountBtnClick());
        i++;
        linesCountBtn = resourceProvider.bg.findById(
          this._btnAllLinesIdTemplate + i.toString()
        ) as Button;
      }
    }

    if (btnLineNumber) {
      let lineNumber = 1;
      let dublicateNumber = 1;
      let linesCountBtn: Button | null = resourceProvider.slot.findById(
        this._getLineBtnId(lineNodeFormat!, lineNumber, dublicateNumber)
      ) as Button;

      while (linesCountBtn) {
        while (linesCountBtn) {
          this._buttonsList.push(linesCountBtn);
          const lineNumberForClick = lineNumber;
          linesCountBtn.clicked.listen(() => this.lineNumberBtnClick(lineNumberForClick));
          lineNumber++;
          linesCountBtn = resourceProvider.slot.findById(
            this._getLineBtnId(lineNodeFormat!, lineNumber, dublicateNumber)
          ) as Button;
        }
        linesCountBtn = null;
        if (isDuplicateBtns) {
          lineNumber = 1;
          dublicateNumber++;
          linesCountBtn = resourceProvider.slot.findById(
            this._getLineBtnId(lineNodeFormat!, lineNumber, dublicateNumber)
          ) as Button;
        }
      }
    }

    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameStateMachine.accelerate.entered.listen((_) => {
      this.GoToDefault();
    });

    const coordinator =
      this._container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    coordinator.popupShown.listen((_) => {
      this._buttonsList.forEach((x) => (x.active = false));
    });

    coordinator.popupHidden.listen((_) => {
      this._buttonsList.forEach((x) => (x.active = true));
    });
  }

  private _getLineBtnId(
    lineNodeFormat: string,
    lineNumber: number,
    dublicateNumber: number
  ): string {
    let result = lineNodeFormat
      .replaceAll('lineNumber', lineNumber.toString())
      .replaceAll('dublicateNumber', dublicateNumber.toString());

    return result;
  }

  private linesCountBtnClick(): void {
    if (
      [GameStateMachineStates.Idle, GameStateMachineStates.RegularSpin].some((state) =>
        this._gameStateMachine.isActive(state)
      ) &&
      (!this._gameStateMachine.curResponse.winLines ||
        this._gameStateMachine.curResponse.winLines.length == 0) &&
      !this._gameStateMachine.curResponse.isScatter &&
      !this._gameStateMachine.curResponse.isBonus &&
      (!this._gameStateMachine.curResponse.freeSpinsInfo ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      this._iconWinLinesProvider.showAllLines();
    }
  }

  private lineNumberBtnClick(lineNumber: number): void {
    if (
      [GameStateMachineStates.Idle, GameStateMachineStates.RegularSpin].some((state) =>
        this._gameStateMachine.isActive(state)
      ) &&
      (!this._gameStateMachine.curResponse.winLines ||
        this._gameStateMachine.curResponse.winLines.length === 0) &&
      !this._gameStateMachine.curResponse.isScatter &&
      !this._gameStateMachine.curResponse.isBonus &&
      (!this._gameStateMachine.curResponse.freeSpinsInfo ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      this._iconWinLinesProvider.showLineByNumber(lineNumber);
    }
  }

  private GoToDefault(): void {
    if (this._iconWinLinesProvider) {
      this._iconWinLinesProvider.hideWinLines();
    }
  }

  OnStateEntered(slotState: string): void {
    this._changeButtonsActivity(slotState, false);
  }

  OnStateExited(slotState: string): void {
    this._changeButtonsActivity(slotState, true);
  }

  private _changeButtonsActivity(slotState: string, value: boolean): void {
    switch (slotState) {
      case GameStateMachineStates.Scatter:
      case GameStateMachineStates.Bonus:
        this._buttonsList.forEach((x) => (x.active = value));
        break;
    }
  }
}
