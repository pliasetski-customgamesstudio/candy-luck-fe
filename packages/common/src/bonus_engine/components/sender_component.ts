import { RoundComponentBase } from './round_component_base';
import { SenderSetConfiguration } from '../configuration/elements/sender_set_configuration';
import { SelectionArgs } from '../messaging/selection_args';
import { EventDispatcher, EventStream, SceneObject } from '@cgs/syd';
import { SelectAction } from '../enums/select_action';
import { RoundMessage } from '../messaging/round_message';

export class SenderComponent extends RoundComponentBase {
  static readonly SenderKey: string = 'ExecuteSend';
  private _configuration: SenderSetConfiguration;

  public readonly OnTouchController: EventDispatcher<SelectionArgs> =
    new EventDispatcher<SelectionArgs>();

  public get invoked(): EventStream<SelectionArgs> {
    return this.OnTouchController.eventStream;
  }

  constructor(configuration: SenderSetConfiguration, rootScene: SceneObject[]) {
    super(rootScene, configuration.name);
    this._configuration = configuration;
  }

  public invokeSend(selectedIndex: number, selectedValue: number | null = null): void {
    const selectedAction =
      this._configuration.selectAction === SelectAction.SendValue
        ? new SelectionArgs(
            'defaultSenderButtonSetName',
            this._configuration.selectAction,
            selectedIndex,
            selectedValue
          )
        : new SelectionArgs(
            'defaultSenderButtonSetName',
            this._configuration.selectAction,
            selectedIndex
          );
    this.OnTouchController.dispatchEvent(selectedAction);
  }

  public proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    message.setValue(this.getComponentKey(SenderComponent.SenderKey), this);
  }
}
