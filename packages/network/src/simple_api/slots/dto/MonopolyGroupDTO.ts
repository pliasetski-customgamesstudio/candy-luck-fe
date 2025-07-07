import { SpotGroupDTO } from './SpotGroupDTO';
import { UpgradeGroup } from './UpgradeGroup';

export class MonopolyGroupDTO {
  avatarId: number | null;
  avatarInit: number | null;
  avatarPosition: number | null;
  board: SpotGroupDTO[] | null;
  nextBoard: SpotGroupDTO[] | null;
  nextTokens: number | null;
  tokens: number | null;
  attributes: SpotGroupDTO[] | null;
  updates: UpgradeGroup[] | null;

  constructor(data: {
    avatarId: number | null;
    avatarInit: number | null;
    avatarPosition: number | null;
    board: SpotGroupDTO[] | null;
    nextBoard: SpotGroupDTO[] | null;
    nextTokens: number | null;
    tokens: number | null;
    attributes: SpotGroupDTO[] | null;
    updates: UpgradeGroup[] | null;
  }) {
    this.avatarId = data.avatarId || 0;
    this.avatarInit = data.avatarInit || 0;
    this.avatarPosition = data.avatarPosition || 0;
    this.board = data.board || [];
    this.nextBoard = data.nextBoard || [];
    this.nextTokens = data.nextTokens || 0;
    this.tokens = data.tokens || 0;
    this.attributes = data.attributes || [];
    this.updates = data.updates || [];
  }

  static fromJson(json: Record<string, any>): MonopolyGroupDTO {
    return new MonopolyGroupDTO({
      avatarId: json.avatarId ?? null,
      avatarInit: json.avatarInit ?? null,
      avatarPosition: json.avatarPosition ?? null,
      board: json.board ? json.board.map((x: any) => SpotGroupDTO.fromJson(x)) : null,
      nextBoard: json.nextBoard ? json.nextBoard.map((x: any) => SpotGroupDTO.fromJson(x)) : null,
      nextTokens: json.nextTokens ?? null,
      tokens: json.tokens ?? null,
      attributes: json.attributes
        ? json.attributes.map((x: any) => SpotGroupDTO.fromJson(x))
        : null,
      updates: json.updates ? json.updates.map((x: any) => UpgradeGroup.fromJson(x)) : null,
    });
  }
}
