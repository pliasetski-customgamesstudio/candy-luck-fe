import { EventDispatcher, EventStream, CheckBox, SceneObject, ParamEvent } from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { AutoSpinCheckboxController } from '../controllers/auto_spin_checkbox_view_controller';

export class EmptyAutoSpinCheckboxView extends BaseSlotView<AutoSpinCheckboxController> {
  private _clicked: EventDispatcher<void> = new EventDispatcher<void>();
  public get clicked(): EventStream<void> {
    return this._clicked.eventStream;
  }

  constructor(parent: SceneObject) {
    super(parent);
  }

  public initialize(): void {}

  public disableButton(): void {}

  public enableButton(): void {}

  public checked(): void {}

  public unchecked(): void {}

  public raiseClicked(): void {
    this._clicked.dispatchEvent();
  }
}

export class AutoSpinCheckboxView extends EmptyAutoSpinCheckboxView {
  private show: string = 'up';
  private disable: string = 'dis';
  private _autoSpin: CheckBox;

  constructor(parent: SceneObject) {
    super(parent);
  }

  public initialize(): void {
    this.root = this.parentNode;
    this._autoSpin = this.parentNode.findById('autoSpinCbx') as CheckBox;
    this._autoSpin.clicked.listen((e) => this.onButtonClicked());
  }

  private _parentNode: SceneObject;
  public get parentNode(): SceneObject {
    return this._parentNode;
  }
  public set parentNode(v: SceneObject) {
    this._parentNode = v;
  }

  private onButtonClicked(): void {
    this.raiseClicked();
  }

  public disableButton(): void {
    this._autoSpin.sendEvent(new ParamEvent(this.disable));
    this._autoSpin.touchable = false;
  }

  public enableButton(): void {
    this._autoSpin.sendEvent(new ParamEvent(this.show));
    this._autoSpin.touchable = true;
  }

  public checked(): void {
    this._autoSpin.checked = true;
  }

  public unchecked(): void {
    this._autoSpin.checked = false;
  }
}
