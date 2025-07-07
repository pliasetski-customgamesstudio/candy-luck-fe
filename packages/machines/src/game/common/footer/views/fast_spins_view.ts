import { CheckBox, SceneObject, Container, Log } from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider } from '../../../../type_definitions';
import { FastSpinsController } from '../controllers/fast_spins_controller';
import { SoundInstance } from '../../../../reels_engine/sound_instance';

export class FastSpinsView extends BaseSlotView<FastSpinsController> {
  private _fastSpinsCheckBox: CheckBox | null = null;
  private _fastSpinsNode: SceneObject;
  private _container: Container;
  private readonly _clickSound: SoundInstance;

  get isFastSpinsEnable(): boolean {
    return !!this._fastSpinsCheckBox?.checked;
  }

  constructor(parent: SceneObject, container: Container, clickSound: SoundInstance) {
    super(parent);
    this._container = container;
    this._clickSound = clickSound;
    this._fastSpinsNode = parent.findById<SceneObject>('FastSpinsStates')!;
    this._fastSpinsCheckBox = parent.findById<CheckBox>('FastSpinsCheckbox');
    if (this._fastSpinsCheckBox) {
      this._fastSpinsCheckBox.stateMachine?.switchToState('off');
      this._fastSpinsCheckBox.clicked.listen(() => this._fastSpinsCheckBoxClicked());
    }
    const slotSession = (
      this._container.forceResolve<ISlotSessionProvider>(
        T_ISlotSessionProvider
      ) as ISlotSessionProvider
    ).slotSession;
    // const symbols = slotSession.machineInfo.symbols;
    const jsonParsing: Array<Record<string, any>> = [];
    for (let i = 0; i < slotSession.machineInfo.symbols.length; i++) {
      jsonParsing.push({});
      jsonParsing[i]['gains'] = slotSession.machineInfo.symbols[i].gains;
      jsonParsing[i]['id'] = slotSession.machineInfo.symbols[i].id;
      jsonParsing[i]['stacked'] = slotSession.machineInfo.symbols[i].stacked;
      jsonParsing[i]['type'] = slotSession.machineInfo.symbols[i].type;
    }
    const json = JSON.stringify(jsonParsing);
    const text = document.createElement('span');
    text.textContent = json;
    document.querySelector('#paytable-popup-info')?.appendChild(text);
  }

  private _fastSpinsCheckBoxClicked(): void {
    if (!this._fastSpinsCheckBox) {
      return;
    }
    Log.Trace(
      'Fast spins state changed, current state: ' + (this.isFastSpinsEnable ? 'on' : 'off')
    );
    this._fastSpinsCheckBox.stateMachine!.switchToState(this.isFastSpinsEnable ? 'on' : 'off');
    this.controller.onFastSpinsCheckBoxClicked();

    this._clickSound.stop();
    this._clickSound.play();
  }

  showFastSpins(): void {
    if (!this._fastSpinsNode || !this._fastSpinsCheckBox) {
      return;
    }

    this._fastSpinsNode.stateMachine!.switchToState('show');
    this._fastSpinsCheckBox.touchable = true;
  }

  hideFastSpins(): void {
    if (!this._fastSpinsNode || !this._fastSpinsCheckBox) {
      return;
    }

    this._fastSpinsNode.stateMachine!.switchToState('hide');
    this._fastSpinsCheckBox.touchable = false;
  }

  activateFastSpins(): void {
    if (!this._fastSpinsCheckBox) {
      return;
    }
    this._fastSpinsCheckBox.checked = true;
    this._fastSpinsCheckBox.stateMachine!.switchToState('on');
    this.controller.onFastSpinsCheckBoxClicked();
  }

  enableFastSpins(): void {
    if (!this._fastSpinsCheckBox) {
      return;
    }

    this._fastSpinsCheckBox.stateMachine!.switchToState(this.isFastSpinsEnable ? 'on' : 'off');
    this._fastSpinsCheckBox.touchable = true;
  }

  disableFastSpins(): void {
    if (!this._fastSpinsCheckBox) {
      return;
    }

    this._fastSpinsCheckBox.stateMachine!.switchToState(
      this.isFastSpinsEnable ? 'dis_on' : 'dis_off'
    );
    this._fastSpinsCheckBox.touchable = false;
  }
}
