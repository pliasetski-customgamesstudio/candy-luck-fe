export class SlotCheat {
  bonus: boolean;
  command: string;
  customConfig: string;
  freeSpins: boolean;
  reelsPositions: number[][] | null;
  scatter: boolean;

  toJson(): Record<string, unknown> {
    return {
      bonus: this.bonus,
      command: this.command,
      customConfig: this.customConfig,
      freeSpins: this.freeSpins,
      reelsPositions: this.reelsPositions,
      scatter: this.scatter,
    };
  }
}
