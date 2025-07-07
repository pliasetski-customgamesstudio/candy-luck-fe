export type VoidFunc0 = () => void;
export type VoidFunc1<A> = (a: A) => void;
export type Func0<R> = () => R;
export type Func1<A, R> = (a: A) => R;
export type Func2<A, B, R> = (a: A, b: B) => R;
export type Func3<A, B, C, R> = (a: A, b: B, c: C) => R;
export type Func4<A, B, C, D, R> = (a: A, b: B, c: C, d: D) => R;

export class FuncEx0<R> {
  private _f: Func0<R>;

  constructor(f: Func0<R>) {
    this._f = f;
  }

  public call(): R | void {
    return this._f();
  }

  public innerFunc(): Func0<R> {
    return this._f;
  }

  public wrap(wrapFunc: Func1<Func0<R>, R>): FuncEx0<R> {
    const f = this._f;
    this._f = () => wrapFunc(f);
    return this;
  }

  public tryWrap(exceptionType: any): FuncEx0<R | null> {
    const f = this._f;
    return new FuncEx0<R | null>(() => {
      try {
        return f();
      } catch (error) {
        if (error instanceof exceptionType) {
          return null;
        }
        throw error;
      }
    });
  }

  public extend2<K, M>(): FuncEx2<K, M, R> {
    const f = this._f;
    return new FuncEx2<K, M, R>((_arg1, _arg2) => f());
  }

  public extend1<K>(): FuncEx1<K, R> {
    const f = this._f;
    return new FuncEx1<K, R>((_arg) => f());
  }
}

export class FuncEx1<K, R> {
  private _f: Func1<K, R>;

  constructor(f: Func1<K, R>) {
    this._f = f;
  }

  call(arg: K): R | null {
    return this._f(arg);
  }

  wrap(wrapFunc: Func2<Func1<K, R>, K, R>): FuncEx1<K, R> {
    const f = this._f;
    this._f = (arg) => wrapFunc(f, arg);
    return this;
  }

  apply(arg: K): FuncEx0<R> {
    const f = this._f;
    return new FuncEx0(() => f(arg));
  }
}

export class FuncEx2<K, M, R> {
  private _f: Func2<K, M, R>;

  constructor(f: Func2<K, M, R>) {
    this._f = f;
  }

  call(arg1: K, arg2: M): R | null {
    return this._f(arg1, arg2);
  }

  wrap(wrapFunc: Func3<Func2<K, M, R>, K, M, R>): FuncEx2<K, M, R> {
    const f = this._f;
    this._f = (arg1, arg2) => wrapFunc(f, arg1, arg2);
    return this;
  }

  apply(arg1: K, arg2: M): FuncEx0<R> {
    const f = this._f;
    return new FuncEx0(() => f(arg1, arg2));
  }
}
