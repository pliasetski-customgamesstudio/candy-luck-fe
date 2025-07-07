import { IClientProperties, T_IClientProperties } from '@cgs/common';
import { Logger, NodeUtils } from '@cgs/shared';
import {
  Button,
  SceneObject,
  Container,
  Rect,
  Vector2,
  MouseDownEvent,
  AbstractMouseEvent,
} from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { AutoSpinsCounterController } from '../../../components/auto_spins_counter_controller';
import { ProgressiveBreakerProvider } from '../../../components/node_tap_action/progressive_breaker/progressive_breaker_provider';
import { SoundInstance } from '../../../../reels_engine/sound_instance';
import { AutoSpinPanelViewController } from '../controllers/auto_spin_panel_view_controller';
import { SpinController } from '../controllers/spin_controller';
import {
  T_AutoSpinPanelViewController,
  T_AutoSpinsCounterController,
  T_ProgressiveBreakerProvider,
} from '../../../../type_definitions';

export enum SpinViewState {
  SpinEnabled,
  SpinDisabled,
  StopEnabled,
  StopDisabled,
  AutospinEnabled,
  AutospinDisabled,
}

export class SpinView extends BaseSlotView<SpinController> {
  private _spin: Button;
  private _handle: Button;
  private _autoPlay: Button;
  private _spinSound: SoundInstance;
  private _buttonClickSound: SoundInstance;
  private _state: SpinViewState = SpinViewState.SpinEnabled;
  get state(): SpinViewState {
    return this._state;
  }
  private _clientProperties: IClientProperties;
  private _autoSpinPanelController: AutoSpinPanelViewController;
  private _autoSpinsCounterController: AutoSpinsCounterController;

  private _spinStates: string[] = ['up', 'up_extra', 'up_freeSpin'];
  private _stopStates: string[] = ['up_stop', 'up_extra_stop', 'up_autospin', 'up_freeSpin_stop'];

  private _longTouched: boolean = false;
  get spinBtn(): Button {
    return this._spin;
  }

  get longTouched(): boolean {
    return this._longTouched;
  }
  set longTouched(val: boolean) {
    this._longTouched = val;
  }

  constructor(
    parent: SceneObject,
    container: Container,
    spinSound: SoundInstance,
    buttonClickSound: SoundInstance
  ) {
    super(parent);
    this._spinSound = spinSound;
    this._buttonClickSound = buttonClickSound;
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    this._autoSpinPanelController = container.forceResolve<AutoSpinPanelViewController>(
      T_AutoSpinPanelViewController
    );
    this._spin = parent.findById<Button>('PlayBtn')!;
    this._spin.clicked.listen(() => {
      Logger.Info('_spin.clicked: _longTouched = ' + this._longTouched);
      this.spinClicked();
    });
    this._autoSpinsCounterController = container.forceResolve<AutoSpinsCounterController>(
      T_AutoSpinsCounterController
    );

    this._handle = parent.findById<Button>('handle')!;
    if (this._handle) {
      this._handle.touchEvent.listen(() => this._onHandleTouchEvent);
    }

    this._autoPlay = parent.findById<Button>('Autoplay_button')!;
    if (this._autoPlay) {
      this._autoPlay.clicked.listen(() => {
        Logger.Info('_autoPlay.clicked: _longTouched = ' + this._longTouched);
        this.autoPlayClicked();
      });
    } else {
      this._spin.longPressed.listen(() => {
        this._longTouched = true;
      });
    }

    const coverSpinNode = new SceneObject();
    coverSpinNode.touchable = true;
    coverSpinNode.id = 'coverSpinNode';
    coverSpinNode.touchArea = new Rect(
      new Vector2(0.0, 0.0),
      new Vector2(Number.MAX_VALUE, Number.MAX_VALUE)
    );
    coverSpinNode.touchEvent.listen((e) => {
      if (e instanceof MouseDownEvent) {
        const progProv = container.forceResolve<ProgressiveBreakerProvider>(
          T_ProgressiveBreakerProvider
        );
        if (progProv) {
          progProv.doBreak();
        }
      }
    });
    coverSpinNode.initialize();
    this._spin.addChild(coverSpinNode);
  }

  private _onHandleTouchEvent(e: AbstractMouseEvent): void {
    if (e instanceof MouseDownEvent) {
      setTimeout(this.spinClicked, 100);
    }
  }

  private spinClicked(): void {
    this._spinSound.stop();
    this._spinSound.play();

    Logger.Info('spinClicked: _longTouched = ' + this._longTouched);
    if (NodeUtils.isAnyActiveState(this._spin, this._spinStates)) {
      this.controller.spinClicked();
    } else if (NodeUtils.isAnyActiveState(this._spin, this._stopStates)) {
      this.controller.stopClicked();
    }
  }

  private autoPlayClicked(): void {
    this._buttonClickSound.stop();
    this._buttonClickSound.play();

    Logger.Info('autoPlayClicked: _longTouched = ' + this._longTouched);
    if (this._autoSpinPanelController.isPanelVisible) {
      this._autoSpinPanelController.hidePanel();
    } else {
      this._autoSpinPanelController.showPanel();
    }

    //_autoSpinPanelController.setUnlimitedSpins();
    // _controller.autoSpinClicked();
  }

  toSpinState(extraBet: boolean, isFreeSpins: boolean): void {
    const stateName = extraBet ? 'up_extra' : isFreeSpins ? 'up_freeSpin' : 'up';
    this._spin.touchable = true;
    this._spin.stateMachine!.switchToState(stateName);

    if (this._handle) {
      this._handle.touchable = true;
      this._handle.stateMachine!.switchToState('up');
    }

    if (this._autoPlay) {
      this._autoPlay.touchable = true;
      this._autoPlay.stateMachine!.switchToState('up');
    }

    this._state = SpinViewState.SpinEnabled;
  }

  public toStopState(extraBet: boolean, isFreeSpins: boolean): void {
    const stateName = extraBet ? 'up_extra_stop' : isFreeSpins ? 'up_freeSpin_stop' : 'up_stop';
    this._spin.touchable = true;
    this._spin.stateMachine!.switchToState(stateName);

    if (this._handle) {
      this._handle.touchable = true;
      this._handle.stateMachine!.switchToState('up_stop');
    }

    if (this._autoPlay) {
      this._autoPlay.touchable = false;
      this._autoPlay.stateMachine!.switchToState('dis');
    }

    this._state = SpinViewState.StopEnabled;
  }

  toDisableSpinState(extraBet: boolean, isFreeSpins: boolean): void {
    const stateName = extraBet ? 'dis_spin_extra' : isFreeSpins ? 'dis_freeSpin' : 'dis_spin';
    this._spin.touchable = false;
    this._spin.stateMachine!.switchToState(stateName);

    if (this._handle) {
      this._handle.touchable = false;
      this._handle.stateMachine!.switchToState('dis_spin');
    }

    if (this._autoPlay) {
      this._autoPlay.touchable = false;
      this._autoPlay.stateMachine!.switchToState('dis');
    }

    this._state = SpinViewState.SpinDisabled;

    this._spinSound.stop();
  }

  toDisableStopState(extraBet: boolean, isFreeSpins: boolean): void {
    const stateName = extraBet ? 'dis_extra_stop' : isFreeSpins ? 'dis_freeSpin_stop' : 'dis_stop';
    this._spin.touchable = false;
    this._spin.stateMachine!.switchToState(stateName);

    if (this._handle) {
      this._handle.touchable = false;
      this._handle.stateMachine!.switchToState('dis_stop');
    }

    if (this._autoPlay) {
      this._autoPlay.touchable = false;
      this._autoPlay.stateMachine!.switchToState('dis');
    }

    this._state = SpinViewState.StopDisabled;
  }

  public toAutoSpinState(extraBet: boolean): void {
    const stateName = 'up_stop';
    /*if (_autoSpinsCounterController.unlimitedSpins) {
      stateName = "up_stop";
    }*/
    this._spin.touchable = true;
    this._spin.stateMachine!.switchToState(stateName);

    if (this._handle) {
      this._handle.touchable = true;
      this._handle.stateMachine!.switchToState('up_autospin');
    }

    if (this._autoPlay) {
      this._autoPlay.touchable = false;
      this._autoPlay.stateMachine!.switchToState('up_autospin');
    }

    this._state = SpinViewState.AutospinEnabled;
  }

  public toDisableAutoSpinState(extraBet: boolean): void {
    const stateName = 'dis_spin';
    /*if (_autoSpinsCounterController.unlimitedSpins) {
      stateName = "dis";
    }*/
    this._spin.touchable = false;
    this._spin.stateMachine!.switchToState(stateName);

    if (this._handle) {
      this._handle.touchable = false;
      this._handle.stateMachine!.switchToState('dis_autospin');
    }

    if (this._autoPlay) {
      this._autoPlay.touchable = false;
      this._autoPlay.stateMachine!.switchToState('dis');
    }
    this._state = SpinViewState.AutospinDisabled;
  }
}
