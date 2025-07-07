import { IGameParams } from 'package:machines/src/reels_engine_library';

class AnimationBasedGameParams implements IGameParams {
  gameId: string;
  iconsCount: number;
  groupsCount: number;
  maxIconsPerGroup: number;

  constructor(gameId: string, iconsCount: number, groupsCount: number, maxIconsPerGroup: number) {
    this.gameId = gameId;
    this.iconsCount = iconsCount;
    this.groupsCount = groupsCount;
    this.maxIconsPerGroup = maxIconsPerGroup;
  }
}
