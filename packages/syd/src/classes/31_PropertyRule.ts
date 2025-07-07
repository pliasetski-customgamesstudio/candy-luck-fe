import { Rule } from './125_Rule';

export type PropertyGetter<T> = () => T;

export class PropertyRule<T> extends Rule {
  private _getter: PropertyGetter<T>;
  private _value: T;

  constructor(getter: PropertyGetter<T>, value: T) {
    super();
    this._getter = getter;
    this._value = value;
  }

  get isTriggered(): boolean {
    return this._getter() == this._value;
  }
}
