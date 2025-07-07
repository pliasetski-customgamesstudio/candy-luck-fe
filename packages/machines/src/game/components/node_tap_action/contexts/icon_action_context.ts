import { Vector2 } from '@cgs/syd';

export class IconActionContext {
  reelIndex: number;
  lineIndex: number;
  iconId: number;
  drawId: number;
  iconLength: number;
  startActionState: string;
  ignoreIconList: number[];
  uniqueList: number[];
  reelsCount: number;
  position: Vector2;
}
