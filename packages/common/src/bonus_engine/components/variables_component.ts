import { RoundComponentBase } from './round_component_base';
import { SceneObject } from '@cgs/syd';
import { ComponentConfiguration } from '../configuration/elements/component_configuration';
import { RoundMessage } from '../messaging/round_message';

export class VariablesComponent extends RoundComponentBase {
  static declarationComponent: string = 'declarationComponent';
  private _variables: Map<string, any> = new Map<string, any>();

  constructor(source: SceneObject[], configuration: ComponentConfiguration) {
    super(source, configuration.name);
  }

  getValue(key: string): any {
    return this._variables.get(key) || null;
  }

  setValue(key: string, value: any): void {
    this._variables.set(key, value);
  }

  proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    this._variables.forEach((value, key) => message.setValue(key, value));
    message.setValue(VariablesComponent.declarationComponent, this);
  }
}
