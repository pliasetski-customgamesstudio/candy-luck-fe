import { SceneObject } from '@cgs/syd';
import { IRoundComponent } from './i_round_component';
import { IMessageContext } from '../execute/i_message_context';
import { RoundMessage } from '../messaging/round_message';

export abstract class RoundComponentBase implements IRoundComponent {
  private readonly _source: SceneObject[];
  private readonly _name: string;

  constructor(source: SceneObject[], name: string = '') {
    this._source = source;
    this._name = name;
  }

  get source(): SceneObject[] {
    return this._source;
  }

  get name(): string {
    return this._name;
  }

  getComponentKey(key: string): string {
    return !this._name ? key : `${this._name}.${key}`;
  }

  deinit(): void {}

  execute(_method: string, _context: IMessageContext, _args: Record<string, string>): void {}

  init(): void {}

  proceedMessage(message: RoundMessage): void {
    if (this.name) {
      message.setValue(this.name, this);
    }
  }
}
