export function is_FutureCancelledError(e: any): e is FutureCancelledError {
  return e.name === 'FutureCancelledError';
}

export class FutureCancelledError implements Error {
  public readonly name: string = 'FutureCancelledError';
  public readonly message: string;
  private readonly _futureName: string;

  constructor(futureName: string) {
    this._futureName = futureName;
    this.message = this.toString();
  }

  toString(): string {
    return `Future ${this._futureName} was cancelled`;
  }
}
