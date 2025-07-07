import { NumberFormatter } from '@cgs/common';
import {
  TextSceneObject,
  SceneObject,
  EventDispatcher,
  ActionActivator,
  InterpolateCopyAction,
  EmptyAction,
  Button,
  BitmapTextSceneObject,
  State,
  SequenceAction,
  FunctionAction,
  lerp,
  EventStreamSubscription,
  EventStream,
} from '@cgs/syd';
import { BaseSlotPopupView, SlotPopups } from '../../../common/slot/views/base_popup_view';
import { ExtendedEndFreeSpinsPopupController } from './extended_end_free_spins_popup_controller';

export class ExtendedEndFreeSpinsPopupView extends BaseSlotPopupView<ExtendedEndFreeSpinsPopupController> {
  private _totalWins: TextSceneObject[];
  private _totalLose: TextSceneObject | null;
  private _spinsCounts: TextSceneObject[];
  private _spinsLoseCounts: TextSceneObject[];
  private _pages: Array<SceneObject>;
  private _popupView: SceneObject;
  private reBuySpinsSub: EventStreamSubscription<void>;
  private reBuySpinsDispatcher: EventDispatcher<void>;
  get reBuySpins(): EventStream<void> {
    return this.reBuySpinsDispatcher.eventStream;
  }
  private _closeOnAnimFinished: boolean;
  private _hasWin: boolean;
  private _activator: ActionActivator;
  private _delayActivator: ActionActivator;
  private _animateTotalWin: boolean;
  private _action: InterpolateCopyAction<number>;

  constructor(_root: SceneObject, popupView: SceneObject, closeOnAnimFinished: boolean) {
    super(_root, popupView, null, SlotPopups.EndFreeSpins);
    this._popupView = popupView;
    this._activator = ActionActivator.withAction(popupView, new EmptyAction());
    this._delayActivator = ActionActivator.withAction(popupView, new EmptyAction());
    const closeButtons = this._popupView.findAllById('back_to_game').map((t) => t as Button);
    const rebuyButtons = this._popupView.findAllById('rebuy_btn').map((t) => t as Button);
    closeButtons.forEach((closeButton) =>
      closeButton.clicked.listen(() => this.onBackToGameClicked())
    );
    if (rebuyButtons && rebuyButtons.length > 0) {
      for (const rebuyButton of rebuyButtons) {
        rebuyButton.clicked.listen((_b) => this.reBuySpinsDispatcher.dispatchEvent());
      }
    }
    this._totalWins = this._popupView
      .findAllById('total_win_text')
      .map((n) => n as BitmapTextSceneObject);
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
      let winState: State | null;
      let loseState: State | null;
      for (const _page of this._pages) {
        if (
          _page &&
          _page.stateMachine &&
          (winState = _page.stateMachine.findById(winStateName)) &&
          (loseState = _page.stateMachine.findById(loseStateName))
        ) {
          winState.enterAction.done.listen((_e) => this.controller.onCloseClicked());
          loseState.enterAction.done.listen((_e) => this.controller.onCloseClicked());
        }
      }
    }
  }

  onShown() {
    if (this._activator) {
      if (this._action) {
        this._action.end();
      }
      this._activator.end();
    }
    this.controller.onEndFreeSpinShown();
  }

  onBackToGameClicked(): void {
    const isDone = !this._activator.action || this._activator.action.isDone;
    if (this._activator) {
      if (this._action) {
        this._action.end();
      }
      this._activator.end();
    }
    const closeStateName = (this._hasWin ? 'win' : 'lose') + 'Close';
    let closeState: State;

    if (this._animateTotalWin && !isDone) {
      this._delayActivator.action = new SequenceAction([
        new EmptyAction().withDuration(1.0),
        new FunctionAction(() => {
          this._delayActivator.stop();
          this.controller.onCloseClicked();
        }),
      ]);
      this._delayActivator.start();
    } else if (!this._delayActivator || this._delayActivator.action!.isDone) {
      for (const _page of this._pages) {
        if (
          _page &&
          _page.stateMachine &&
          (closeState = _page.stateMachine.findById(closeStateName)!)
        ) {
          closeState.enterAction.done.listen((_e) => this.controller.onCloseClicked());
          _page.stateMachine.switchToState(closeStateName);
        }
      }
      this.controller.onCloseClicked();
    }
  }

  setSpins(spins: string) {
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

  setMode(hasWin: boolean) {
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

  setTotalWin(totalWin: number, withAnim: boolean = false) {
    this._animateTotalWin = withAnim;
    if (withAnim) {
      this.setTextByIdWithAnim(totalWin);
    } else {
      if (this._activator) {
        if (this._action) {
          this._action.end();
        }
        this._activator.end();
      }
      for (const _totalWin of this._totalWins) {
        if (_totalWin) _totalWin.text = NumberFormatter.format(totalWin);
      }
      if (this._totalLose) this._totalLose.text = NumberFormatter.format(totalWin);
    }
  }

  setRebuyState(isRebuy: boolean, price: number) {
    const rebuyStates = this._popupView.findAllById('ButtonStates');
    const rebuyPrices = this._popupView.findAllById('RebuyPrice').map((t) => t as TextSceneObject);
    if (rebuyStates.length > 0 && rebuyPrices.length > 0) {
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

  setFreeSpinsMode(modePickerId: string, mode: string) {
    for (const _page of this._pages) {
      const modePickers = _page.findAllById(modePickerId);
      for (const modePicker of modePickers) {
        if (modePicker.stateMachine) {
          modePicker.stateMachine.switchToState(mode);
        }
      }
    }
  }

  displayBalance(value: number) {
    for (const _totalWin of this._totalWins) {
      if (_totalWin) _totalWin.text = NumberFormatter.format(Math.round(value));
    }
    if (this._totalLose) this._totalLose.text = NumberFormatter.format(Math.round(value));
  }

  setTextByIdWithAnim(value: number) {
    for (const _totalWin of this._totalWins) {
      if (_totalWin) _totalWin.text = '0';
    }
    const duration = 4.0;
    const incrementWinAction = new InterpolateCopyAction<number>()
      .withInterpolateFunction(lerp)
      .withDuration(duration)
      .withValues(1.0, value);
    incrementWinAction.valueChange.listen((value: number) => {
      this.displayBalance(value);
    });

    this._action = incrementWinAction;
    this._activator = new ActionActivator(this._root);
    this._activator.action = incrementWinAction;
    this._activator.start();
  }
}
