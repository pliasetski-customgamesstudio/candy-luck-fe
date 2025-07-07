export class GameBonusGift {
  machineId: string;
  winSum: number;
  giftId: string;

  constructor(machineId: string, winSum: number, giftId: string) {
    this.machineId = machineId;
    this.winSum = winSum;
    this.giftId = giftId;
  }
}
