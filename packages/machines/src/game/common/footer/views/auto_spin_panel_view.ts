import { Container, SceneObject, Button } from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { AutoSpinsCounterController } from '../../../components/auto_spins_counter_controller';
import { T_ISpinController, T_AutoSpinsCounterController } from '../../../../type_definitions';
import { AutoSpinPanelViewController } from '../controllers/auto_spin_panel_view_controller';
import { SpinController } from '../controllers/spin_controller';
import { ISpinController } from '../i_spin_controller';
import { SoundInstance } from '../../../../reels_engine/sound_instance';

export class AutoSpinPanelView extends BaseSlotView<AutoSpinPanelViewController> {
  private _container: Container;
  private _spinController: SpinController;
  public isPanelVisible: boolean = false;

  set spinController(value: SpinController) {
    this._spinController = value;
  }
  get spinController(): SpinController {
    if (!this._spinController) {
      this._spinController = this._container.forceResolve<ISpinController>(
        T_ISpinController
      ) as SpinController;
    }
    return this._spinController;
  }

  private _panel: SceneObject;
  private _btn0: Button;
  private _btn1: Button;
  private _btn2: Button;
  private _btn3: Button;
  private _btn4: Button;
  private _btn5: Button;
  private _btnUnl: Button;
  private _autoSpinsCounter: AutoSpinsCounterController;
  private readonly _clickSound: SoundInstance;

  constructor(parent: SceneObject, container: Container, clickSound: SoundInstance) {
    super(parent);
    this._clickSound = clickSound;
    this._container = container;
    this._autoSpinsCounter = this._container.forceResolve<AutoSpinsCounterController>(
      T_AutoSpinsCounterController
    );
    this._panel = parent.findById('AutoSpinPanel') as SceneObject;
    this._btn0 = parent.findById('AutoSpinBtn_0') as Button;
    this._btn0.clicked.listen(() => {
      this.setAutoSpinCount(10);
      this._autoSpinsCounter.unlimitedSpins = false;
      this.onSpinClicked();
    });
    this._btn1 = parent.findById('AutoSpinBtn_1') as Button;
    this._btn1.clicked.listen(() => {
      this.setAutoSpinCount(25);
      this._autoSpinsCounter.unlimitedSpins = false;
      this.onSpinClicked();
    });
    this._btn2 = parent.findById('AutoSpinBtn_2') as Button;
    this._btn2.clicked.listen(() => {
      this.setAutoSpinCount(50);
      this._autoSpinsCounter.unlimitedSpins = false;
      this.onSpinClicked();
    });
    this._btn3 = parent.findById('AutoSpinBtn_3') as Button;
    this._btn3.clicked.listen(() => {
      this.setAutoSpinCount(100);
      this._autoSpinsCounter.unlimitedSpins = false;
      this.onSpinClicked();
    });
    this._btn4 = parent.findById('AutoSpinBtn_4') as Button;
    this._btn4.clicked.listen(() => {
      this.setAutoSpinCount(250);
      this._autoSpinsCounter.unlimitedSpins = false;
      this.onSpinClicked();
    });
    this._btn5 = parent.findById('AutoSpinBtn_5') as Button;
    this._btn5.clicked.listen(() => {
      this.setAutoSpinCount(500);
      this._autoSpinsCounter.unlimitedSpins = false;
      this.onSpinClicked();
    });
    this._btnUnl = parent.findById('AutoSpinBtn_6') as Button;
    this._btnUnl.clicked.listen(() => {
      this.setUnlimitedSpins();
      this._autoSpinsCounter.unlimitedSpins = true;
      this.onSpinClicked();
    });

    ['closeBTN', 'blackoutBTN'].forEach((sceneId) => {
      const closeBtn = parent.findById<Button>(sceneId);
      closeBtn?.clicked.listen(() => {
        this.hidePanel();
      });
    });
  }

  private setAutoSpinCount(count: number): void {
    this._autoSpinsCounter.count = count;
  }

  public setUnlimitedSpins(): void {
    this._autoSpinsCounter.count = -1;
  }

  private onSpinClicked(): void {
    this.hidePanel();
    this.spinController.autoSpinClicked();
    this._clickSound.stop();
    this._clickSound.play();
  }

  public hidePanel(): void {
    const spinView = this.spinController?.view;
    if (spinView && spinView.longTouched) {
      spinView.longTouched = false;
      return;
    }

    this.isPanelVisible = false;
    this._panel.stateMachine!.switchToState('auto_spin_panel_hide');
  }

  public showPanel(): void {
    this.isPanelVisible = true;
    this._panel.stateMachine!.switchToState('auto_spin_panel_show');
  }
}
