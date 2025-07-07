import { BonusScreenMessage } from './bonus_message';
import { RoundMessageType } from '../enums/round_message_type';

export class RoundMessage<T = any> extends BonusScreenMessage {
  static fromProperties<T = any>(type: RoundMessageType, properties: Map<string, T>): RoundMessage {
    return new RoundMessage<T>(type, properties);
  }

  public type: RoundMessageType;
  public properties: Map<string, T> = new Map();

  constructor(type: RoundMessageType, properties?: Map<string, T>) {
    super();
    this.type = type;
    this.properties = properties || new Map();
  }

  getValue(key: string): T | null {
    return this.properties.get(key) ?? null;
  }

  setValue(key: string, value: T): void {
    this.properties.set(key, value);
  }

  has(key: string): boolean {
    return this.properties.has(key);
  }
}
