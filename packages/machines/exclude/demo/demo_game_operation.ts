class StubBonusSharer implements IBonusSharer {
  get enabled(): boolean {
    return false;
  }

  shareBonus(): void {}

  shareFreeSpins(gameId: string): Future<void> {
    return new Future<void>.value(Common.VoidType.value);
  }

  shareEpicWin(): void {}
}
