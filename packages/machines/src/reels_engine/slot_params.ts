import { IGameParams } from './interfaces/i_game_params';
import { IconDescr } from './long_icon_enumerator';

export class SlotParams implements IGameParams {
  get machineId(): string {
    return this._gameId;
  }
  get iconsCount(): number {
    return this.reelsCount * this.linesCount;
  }
  get groupsCount(): number {
    return this.reelsCount;
  }
  get maxIconsPerGroup(): number {
    return this.linesCount;
  }

  private _gameId: string;
  public reelsCount: number;
  public linesCount: number;
  public longIcons: IconDescr[];

  constructor(gameId: string, reelsCount: number, linesCount: number, longIcons: IconDescr[]) {
    this._gameId = gameId;
    this.reelsCount = reelsCount;
    this.linesCount = linesCount;
    this.longIcons = longIcons ? longIcons : [];
  }
}
