export class CgsEvent {
  static Empty: CgsEvent = new CgsEvent();

  private _accepted: boolean = false;

  get isAccepted(): boolean {
    return this._accepted;
  }

  accept(): void {
    this._accepted = true;
  }

  ignore(): void {
    this._accepted = false;
  }
}
