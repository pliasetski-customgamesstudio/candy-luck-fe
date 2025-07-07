import { IAnimationBasedGameConfig } from 'machines';

class AnimationBasedGameConfig implements IAnimationBasedGameConfig {
  readonly iconsCount: number;
  readonly groupsCount: number;
  readonly maxIconsPerGroup: number;
  readonly afterOutgoingAnimationDelay: number;
  readonly afterStopAnimationdelay: number;
  readonly fps: number;

  constructor(
    iconsCount: number,
    groupsCount: number,
    maxIconsPerGroup: number,
    afterOutgoingAnimationDelay: number,
    afterStopAnimationdelay: number,
    fps: number
  ) {
    this.iconsCount = iconsCount;
    this.groupsCount = groupsCount;
    this.maxIconsPerGroup = maxIconsPerGroup;
    this.afterOutgoingAnimationDelay = afterOutgoingAnimationDelay;
    this.afterStopAnimationdelay = afterStopAnimationdelay;
    this.fps = fps;
  }
}
