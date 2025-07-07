export class Completer<T> {
  public complete: (value: T) => void;
  public completeError: (reason?: any) => void;
  public _value: T | null = null;

  private readonly _promise: Promise<T>;
  private _isCompleted: boolean = false;
  private _isResolved: boolean = false;
  private _isRejected: boolean = false;
  private _error: any | null = null;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this.complete = (value) => {
        this._isCompleted = true;
        this._isResolved = true;
        this._value = value;
        resolve(value);
      };
      this.completeError = (reason) => {
        this._isCompleted = true;
        this._isRejected = true;
        this._error = reason || null;
        reject(reason);
      };
    });
  }

  get promise(): Promise<T> {
    return this._promise;
  }

  get isCompleted(): boolean {
    return this._isCompleted;
  }

  get isResolved(): boolean {
    return this._isResolved;
  }

  get isRejected(): boolean {
    return this._isRejected;
  }

  get error(): any | null {
    return this._error;
  }

  get value(): T | null {
    return this._value;
  }
}
