export class ProgressiveJPShortInfoDTO {
  currentUserWin: number | null;
  generation: number | null;
  giftId: string | null;
  highRolling: boolean | null;
  jackpotConfigId: number | null;
  jpName: string | null;

  constructor({
    currentUserWin,
    generation,
    giftId,
    highRolling,
    jackpotConfigId,
    jpName,
  }: {
    currentUserWin: number | null;
    generation: number | null;
    giftId: string | null;
    highRolling: boolean | null;
    jackpotConfigId: number | null;
    jpName: string | null;
  }) {
    this.currentUserWin = currentUserWin;
    this.generation = generation;
    this.giftId = giftId;
    this.highRolling = highRolling;
    this.jackpotConfigId = jackpotConfigId;
    this.jpName = jpName;
  }

  static fromJson(json: { [key: string]: any }): ProgressiveJPShortInfoDTO {
    return new ProgressiveJPShortInfoDTO({
      currentUserWin: json['currentUserWin'] ?? null,
      generation: json['generation'] ?? null,
      giftId: json['giftId'] ?? null,
      highRolling: json['highRolling'] ?? null,
      jackpotConfigId: json['jackpotConfigId'] ?? null,
      jpName: json['jpName'] ?? null,
    });
  }
}
