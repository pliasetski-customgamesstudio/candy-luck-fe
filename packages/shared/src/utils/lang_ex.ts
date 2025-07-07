import { IDisposable } from '@cgs/syd';
import { Func1, VoidFunc1 } from '../func/func_imp';

export class LangEx {
  static using(obj: IDisposable, func: VoidFunc1<any>): void {
    try {
      func(obj);
    } finally {
      obj?.dispose();
    }
  }

  static usingWithArg1(obj: IDisposable, func: Func1<any, any>): any {
    try {
      return func(obj);
    } finally {
      obj?.dispose();
    }
  }

  static async usingAsync(obj: IDisposable, func: Func1<any, Promise<any>>): Promise<any> {
    try {
      return await func(obj);
    } finally {
      obj?.dispose();
    }
  }

  static enumName(enumValue: any): string {
    const s = enumValue.toString();
    return s.substring(s.indexOf('.') + 1);
  }
}

export class Out<T> {
  private _value: T;

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }
}

export class Ref<T> {
  private _value: T;

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }
}
