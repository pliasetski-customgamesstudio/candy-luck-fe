import { NumberFormatter } from '@cgs/common';
import {
  TextSceneObject,
  SceneObject,
  EventDispatcher,
  Button,
  EventStreamSubscription,
  EventStream,
  Action,
} from '@cgs/syd';
import { EndFreeSpinsPopupController } from '../controllers/end_freespins_popup_controller';
import { BaseSlotPopupView, SlotPopups } from './base_popup_view';

export class EndFreeSpinsPopupView extends BaseSlotPopupView<EndFreeSpinsPopupController> {
  private _totalWins: TextSceneObject[];
  private _totalLose: TextSceneObject;
  private _spinsCounts: TextSceneObject[];
  private _spinsLoseCounts: TextSceneObject[];
  private _pages: SceneObject[];
  private _popupView: SceneObject;
  private reBuySpinsSub: EventStreamSubscription<void>;
  private reBuySpinsDispatcher: EventDispatcher<void> = new EventDispatcher();
  get reBuySpins(): EventStream<void> {
    return this.reBuySpinsDispatcher.eventStream;
  }
  private _closeOnAnimFinished: boolean = false;
  private _hasWin: boolean;

  constructor(_root: SceneObject, popupView: SceneObject, closeOnAnimFinished: boolean) {
    super(_root, popupView, null, SlotPopups.EndFreeSpins);
    this._popupView = popupView;
    const closeButtons = this._popupView.findAllById('back_to_game').map((t) => t as Button);
    const rebuyButtons = this._popupView.findAllById('rebuy_btn').map((t) => t as Button);
    closeButtons.forEach((closeButton) =>
      closeButton.clicked.listen(() => this.onBackToGameClicked())
    );

    for (const rebuyButton of rebuyButtons) {
      if (rebuyButton) {
        rebuyButton.clicked.listen(() => this.reBuySpinsDispatcher.dispatchEvent());
      }
    }
    this._totalWins = this._popupView
      .findAllById('total_win_text')
      .map((t) => t as TextSceneObject);
    this._totalLose = this._popupView.findById('total_lose_text') as TextSceneObject;
    this._spinsCounts = this._popupView
      .findAllById('spins_win_text')
      .map((t) => t as TextSceneObject);
    this._spinsLoseCounts = this._popupView
      .findAllById('spins_lose_text')
      .map((t) => t as TextSceneObject);

    this._pages = this._popupView.findAllById('page');

    if (closeOnAnimFinished) {
      const winStateName = 'winClose';
      const loseStateName = 'loseClose';
      for (const _page of this._pages) {
        const winState = _page.stateMachine!.findById(winStateName);
        const loseState = _page.stateMachine!.findById(loseStateName);

        if (_page && _page.stateMachine && winState && loseState) {
          winState.enterAction.done.listen(() => this.controller.onCloseClicked());
          loseState.enterAction.done.listen(() => this.controller.onCloseClicked());
        }
      }
    }
  }

  private onBackToGameClicked(): void {
    const closeStateName = (this._hasWin ? 'win' : 'lose') + 'Close';
    let _actionDoneSub: EventStreamSubscription<Action> | null = null;
    if (this._pages && this._pages.length === 1 && this._pages[0].stateMachine) {
      const closeState = this._pages[0].stateMachine.findById(closeStateName);

      if (closeState) {
        _actionDoneSub = closeState.enterAction.done.listen(() => {
          if (_actionDoneSub) {
            _actionDoneSub.cancel();
          }
          this.controller.onCloseClicked();
        });
        for (const _page of this._pages) {
          _page.stateMachine!.switchToState(closeStateName);
        }
      }
    } else {
      this.controller.onCloseClicked();
    }
  }

  public setSpins(spins: string): void {
    for (const _spinsCount of this._spinsCounts) {
      if (_spinsCount) {
        _spinsCount.text = spins;
      }
    }
    for (const _spinsLoseCount of this._spinsLoseCounts) {
      if (_spinsLoseCount) {
        _spinsLoseCount.text = spins;
      }
    }
  }

  public onShown(): void {
    this.controller.onEndFreeSpinShown();
  }

  public setMode(hasWin: boolean): void {
    this._hasWin = hasWin;

    for (const _page of this._pages) {
      if (_page && _page.stateMachine) {
        let state = 'win';
        if (!hasWin) {
          state = 'lose';
          console.log('end free spin: no win');
        } else {
          console.log('end free spin: congratulation');
        }

        _page.stateMachine.switchToState(state);
      }
    }
  }

  public setTotalWin(totalWin: string): void {
    for (const _totalWin of this._totalWins) {
      if (_totalWin) _totalWin.text = totalWin;
    }
    if (this._totalLose) this._totalLose.text = totalWin;
  }

  public setRebuyState(isRebuy: boolean, price: number): void {
    const rebuyStates = this._popupView.findAllById('ButtonStates');
    const rebuyPrices = this._popupView.findAllById('RebuyPrice').map((t) => t as TextSceneObject);
    if (rebuyStates.some((x) => !!x) && rebuyPrices.some((x) => !!x)) {
      if (isRebuy) {
        for (const rebuyPrice of rebuyPrices) {
          rebuyPrice.text = NumberFormatter.formatMoney(price);
        }
        for (const rebuyState of rebuyStates) {
          rebuyState.stateMachine!.switchToState('rebuy');
        }
      } else {
        for (const rebuyState of rebuyStates) {
          rebuyState.stateMachine!.switchToState('default');
        }
      }
    }
  }

  public setFreeSpinsMode(modePickerId: string, mode: string): void {
    for (const _page of this._pages) {
      const modePickers = _page.findAllById(modePickerId);

      for (const modePicker of modePickers) {
        if (modePicker.stateMachine) {
          modePicker.stateMachine.switchToState(mode);
        }
      }
    }
  }
}
