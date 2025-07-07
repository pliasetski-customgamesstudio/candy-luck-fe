export class RetryingParams {
  public readonly noInternetRemaining: number;
  public readonly serverErrorRemaining: number;

  constructor(noInternetRemaining: number, serverErrorRemaining: number) {
    this.noInternetRemaining = noInternetRemaining;
    this.serverErrorRemaining = serverErrorRemaining;
  }
}
