import { CancellationToken } from './cancellation_token';

export class CancellationTokenSource {
  private readonly _token: CancellationToken;

  constructor(linkedToken?: CancellationToken) {
    this._token = new CancellationToken(linkedToken);
  }

  get token(): CancellationToken {
    return this._token;
  }

  cancel(): void {
    this._token.cancel();
  }

  get isCancellationRequested(): boolean {
    return this._token.isCancellationRequested;
  }
}
