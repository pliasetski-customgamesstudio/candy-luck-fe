import { ClientConfigPropertyDTO, IClientProperties } from './interfaces/i_client_properties';
import { EventDispatcher, EventStream, Tuple3 } from '@cgs/syd';
import { Diff } from '../utils/diff';
import { Logger } from '@cgs/shared';

export class ClientProperties implements IClientProperties {
  private _propertiesUpdated: EventDispatcher<void> = new EventDispatcher<void>();
  private _propertyChangedDispatcher: EventDispatcher<Tuple3<string, string, string>> =
    new EventDispatcher<Tuple3<string, string, string>>();
  private _properties: Map<string, string> = new Map<string, string>();
  private _lastRefresh: Date;

  constructor() {
    this._lastRefresh = new Date(0);
  }

  public getValue(key: string, _value: any) {
    return this._properties.get(key);
  }

  public get(key: string, defOrType?: any): any {
    let type = null;
    let def = null;
    if (defOrType !== null && defOrType !== undefined) {
      if (typeof defOrType === 'function') {
        type = defOrType;
      } else {
        def = defOrType;
        type = def.constructor;
      }
    }
    if (!this.keyExists(key)) {
      return def;
    }

    return type !== null && type !== undefined
      ? Diff.convertString(this.get(key), type)
      : this.get(key);
  }

  public getConv(key: string, { type, def }: { type?: any; def?: any }): any {
    if (!this.keyExists(key)) {
      return def;
    }

    const res =
      type !== null && type !== undefined ? Diff.convertString(this.get(key), type) : this.get(key);

    return res === null || res === undefined ? def : res;
  }

  public keyExists(key: string): boolean {
    return this._properties.has(key);
  }

  public setLocal(key: string, value: any): void {
    this._properties.set(key, value.toString());
  }

  public get propertiesUpdated(): EventStream<void> {
    return this._propertiesUpdated.eventStream;
  }

  public updateProperties(
    properties: ClientConfigPropertyDTO[],
    shouldRemove: boolean = true
  ): void {
    properties = properties ?? [];

    this._lastRefresh = new Date();

    const updated: Tuple3<string, string, string>[] = [];

    if (shouldRemove) {
      const newKeys: string[] = properties.map((p) => p.key);

      for (const property of Array.from(this._properties.keys())) {
        if (!newKeys.includes(property)) {
          Logger.Info(`Property removed ${property}`);
          this._properties.delete(property);
        }
      }
    }

    for (const property of properties) {
      if (property.value !== this._properties.get(property.key)) {
        updated.push(
          new Tuple3<string, string, string>(
            property.key,
            this._properties.get(property.key)!,
            property.value
          )
        );
        this._properties.set(property.key, property.value);
      }
    }

    for (const propChange of updated) {
      Logger.Info(
        `Property changed ${propChange.item1}: ${propChange.item2} -> ${propChange.item3}`
      );
      this._propertyChangedDispatcher.dispatchEvent(propChange);
    }

    this._propertiesUpdated.dispatchEvent();
  }

  public isFeatureEnabled(key: string, def: boolean = false): boolean {
    if (!this.keyExists(key)) {
      return def;
    }

    const value = this.get(key, Boolean);

    return value;
  }

  public get propertyChanged(): EventStream<Tuple3<string, string, string>> {
    return this._propertyChangedDispatcher.eventStream;
  }

  public get lastRefresh(): Date {
    return this._lastRefresh;
  }

  public resetData(): void {
    this._lastRefresh = new Date(0);
    this._properties.clear();
  }

  public getBackTracking(keys: string[], defOrType?: any): any {
    for (const key of keys) {
      if (this.keyExists(key)) {
        return this.get(key, defOrType);
      }
    }
    return defOrType;
  }
}
