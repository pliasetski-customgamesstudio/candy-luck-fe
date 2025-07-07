export class UnreadCountEventArgs {
  private readonly _unreadCount: number;

  constructor(unreadCount: number) {
    this._unreadCount = unreadCount;
  }

  get unreadCount(): number {
    return this._unreadCount;
  }
}
