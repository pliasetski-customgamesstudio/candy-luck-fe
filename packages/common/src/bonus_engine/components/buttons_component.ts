import {
  Button,
  ButtonBase,
  EmptyAction,
  EventDispatcher,
  EventStream,
  IntervalAction,
  IStreamSubscription,
  SceneObject,
  SequenceAction,
} from '@cgs/syd';
import { RoundComponentBase } from './round_component_base';
import { ButtonSetConfiguration } from '../configuration/elements/button_set_configuration';
import { SelectionInfo } from './selection_info';
import { SelectionArgs } from '../messaging/selection_args';
import { SelectAction } from '../enums/select_action';
import { RoundMessage } from '../messaging/round_message';
import { RoundMessageType } from '../enums/round_message_type';
import { MessagingConstants } from '../messaging/messaging_constants';
import { DisableTouchTrigger } from '../enums/disable_touch_trigger';
import { IMessageContext } from '../execute/i_message_context';
import { ConfigConstants } from '../configuration/config_constants';
import { ButtonEntry } from './button_entry';
import { TemplateExtension } from '../utils/template_extension';
import { SceneExtensions } from '../utils/scene_extensions';
import { MessageExtension } from '../utils/message_extension';

export class ButtonsComponent extends RoundComponentBase {
  private _configuration: ButtonSetConfiguration;
  private _selectionInfo: SelectionInfo | null;
  public OnTouchController: EventDispatcher<SelectionArgs> = new EventDispatcher<SelectionArgs>();
  private _attempts: number;

  public get clicked(): EventStream<SelectionArgs> {
    return this.OnTouchController.eventStream;
  }

  constructor(configuration: ButtonSetConfiguration, rootScene: SceneObject[]) {
    super(rootScene, configuration.name);
    this._configuration = configuration;
  }

  public get selectAction(): SelectAction | null {
    return this._configuration.selectAction;
  }

  private _isEnabled(serverIndex: number): boolean {
    return (
      this._configuration.serverIndexes.length === 0 ||
      this._configuration.serverIndexes.includes(serverIndex)
    );
  }

  public proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    const serverIndex = MessageExtension.serverIndex(message);
    if (this._isEnabled(serverIndex)) {
      if (
        message.type === RoundMessageType.Init ||
        (message.type === RoundMessageType.Start && MessageExtension.multipleRoundStart(message))
      ) {
        this.enable();
      }
      if (
        message.type === RoundMessageType.Init ||
        message.type === RoundMessageType.Lose ||
        message.type === RoundMessageType.Win
      ) {
        this._attempts = message.getValue(MessagingConstants.attempts);
        if (
          this.selectAction === SelectAction.SendIndex ||
          this.selectAction === SelectAction.SendValue
        ) {
          const selectedIndexes = message.getValue(MessagingConstants.selectedIndexes);
          if (selectedIndexes) {
            const indexes = selectedIndexes.filter(
              (index: number) =>
                this._selectionInfo?.allEntries.some((entry) => entry.index === index)
            );
            if (indexes.length > 0) {
              this.applySelection(selectedIndexes);
              this.updateContext(selectedIndexes);
            }
          }
        }
      }
    }
    if (message.type === RoundMessageType.Finish) {
      this.clearMessageProperties(message);
    }
    this.setMessageProperties(message);
  }

  private setMessageProperties(message: RoundMessage): void {
    if (this._selectionInfo) {
      message.setValue(
        this.getComponentKey(MessagingConstants.allIds),
        this._selectionInfo.allEntries.map((entry) => entry.uniqueId)
      );
      message.setValue(
        this.getComponentKey(MessagingConstants.allIndexes),
        this._selectionInfo.allEntries.map((entry) => entry.index)
      );
      message.setValue(
        this.getComponentKey(MessagingConstants.selectedIds),
        this._selectionInfo.selectedEntries.map((entry) => entry.uniqueId)
      );
      message.setValue(
        this.getComponentKey(MessagingConstants.allSelectedIds),
        this._selectionInfo.allSelectedEntries.map((entry) => entry.uniqueId)
      );
      message.setValue(
        this.getComponentKey(MessagingConstants.allSelectedIndexes),
        this._selectionInfo.allSelectedEntries.map((entry) => entry.index)
      );
      message.setValue(
        this.getComponentKey(MessagingConstants.notSelectedIds),
        this._selectionInfo.notSelectedEntries.map((entry) => entry.uniqueId)
      );
      message.setValue(this.getComponentKey(MessagingConstants.selectionInfo), this._selectionInfo);
    }
  }

  private clearMessageProperties(message: RoundMessage): void {
    message.setValue(this.getComponentKey(MessagingConstants.allIds), null);
    message.setValue(this.getComponentKey(MessagingConstants.allIndexes), null);
    message.setValue(this.getComponentKey(MessagingConstants.selectedIds), null);
    message.setValue(this.getComponentKey(MessagingConstants.allSelectedIds), null);
    message.setValue(this.getComponentKey(MessagingConstants.allSelectedIndexes), null);
    message.setValue(this.getComponentKey(MessagingConstants.notSelectedIds), null);
    message.setValue(this.getComponentKey(MessagingConstants.selectionInfo), this._selectionInfo);
  }

  private applySelection(selectedButtonsIndexes: number[]): void {
    for (const index of selectedButtonsIndexes) {
      const entry = this._selectionInfo?.allEntries.find((x) => x.index === index);
      if (entry?.button) {
        entry.button.touchable = false;
      }
    }
  }

  private updateContext(selectedButtonsIndexes: number[]): void {
    this._selectionInfo?.select(
      selectedButtonsIndexes
        .map((i) => this._selectionInfo?.allEntries.find((entry) => entry.index === i))
        .filter((entry) => !!entry)
        .map((entry) => entry!.uniqueId)
    );
  }

  private _resolveButton(uniqueId: string, index: number): Button | null {
    let button: Button | null = null;
    for (const scene of this.source) {
      button = SceneExtensions.FindByUniqueId(scene, uniqueId) as Button;
      if (button) {
        setTimeout(() => {
          if (button?.touchable) {
            button.findById("glowObject")!.stateMachine!.switchToState('glowObject_anim');
          }
        }, (index % 5) * 250);

        return button;
      }
    }
    return null;
  }

  private _subscribeToClick(button: Button): IStreamSubscription {
    button.touchable = false;
    return button.clicked.listen((btn) => this.onButtonTouch(btn));
  }

  private _updateButtonEntry(entry: ButtonEntry): ButtonEntry {
    if (!entry.button) {
      entry.button = this._resolveButton(entry.uniqueId, entry.index);
      if (entry.button) {
        entry.clickSubscription = this._subscribeToClick(entry.button as Button);
        entry.button.touchable = !this._selectionInfo?.selectedEntries.includes(entry);
      }
    }
    return entry;
  }

  public init(): void {
    const buttonIds = TemplateExtension.resolve(this._configuration.template);
    const indexes = this._configuration.indexesTemplate
      ? TemplateExtension.resolve(this._configuration.indexesTemplate).map(Number)
      : null;
    let index = 0;
    this._selectionInfo = new SelectionInfo(
      buttonIds.map((id) => ButtonEntry.fromId(id, indexes ? indexes[index++] : index++))
    );
    for (const buttonEntry of this._selectionInfo.allEntries) {
      this._updateButtonEntry(buttonEntry);
      if (buttonEntry.button) {
        buttonEntry.button.touchable = false;
      }
    }
  }

  public deinit(): void {
    if (this._selectionInfo) {
      for (const buttonEntry of this._selectionInfo.allEntries) {
        if (buttonEntry.button) {
          buttonEntry.button.touchable = false;
          if (buttonEntry.clickSubscription) {
            buttonEntry.clickSubscription.cancel();
          }
        }
      }
    }
    this._selectionInfo = null;
  }

  public update(): void {
    for (const buttonEntry of this._selectionInfo?.allEntries || []) {
      if (!buttonEntry.button) {
        this._updateButtonEntry(buttonEntry);
      }
    }
  }

  public reinit(): void {
    this.deinit();
    this.init();
    this.enable();
  }

  public execute(method: string, _context: IMessageContext, _args: Record<string, string>): void {
    switch (method) {
      case ConfigConstants.buttonReinit:
        this.reinit();
        break;
      case ConfigConstants.buttonUpdate:
        this.update();
        break;
    }
  }

  public enable(): void {
    for (const entry of this._selectionInfo?.allEntries || []) {
      if (entry.button) {
        entry.button.touchable = !this._selectionInfo?.selectedEntries.includes(entry);
      }
    }
  }

  public disable(): void {
    if (this.selectAction !== SelectAction.InterruptRound) {
      const buttons = (this._selectionInfo?.allEntries || [])
        .map((entry) => entry.button)
        .filter((entry) => entry);

      for (const btn of buttons) {
        btn!.touchable = false;
      }
    }
  }

  public onButtonTouch(btn?: ButtonBase): void {
    if (btn) {
      const index = this._selectionInfo?.allEntries.find((entry) => entry.button?.id === btn.id)
        ?.index;
      if (
        this.selectAction === SelectAction.SendIndex ||
        this.selectAction === SelectAction.SendValue
      ) {
        this.applySelection([index!]);
      }
      const selection =
        this.selectAction === SelectAction.SendValue
          ? new SelectionArgs(this.name, this.selectAction, index!, this._configuration.sendValue)
          : new SelectionArgs(this.name, this.selectAction, index!);
      selection.selectAction = this.selectAction;
      this.OnTouchController.dispatchEvent(selection);
      if (
        typeof this._attempts === 'number' &&
        --this._attempts <= 0 &&
        this._configuration.disableTouchTrigger === DisableTouchTrigger.Attempts
      ) {
        this.disable();
      }
    }
  }
}
