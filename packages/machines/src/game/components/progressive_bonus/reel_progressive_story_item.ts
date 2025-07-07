import { SceneObject } from '@cgs/syd';

export class ReelProgressiveStoryItem {
  reel: number;
  featureIconId: number;
  storyHolderId: string;
  spinsToLiveIndicatorId: string;
  collectCount: number;
  maxCollectCount: number;
  progressScene: string;
  progressNode: SceneObject;
  spinsToLiveIndicatorNode: SceneObject;
  spinsToLive: number;
  isActivated: boolean;

  get IsCollected(): boolean {
    return this.collectCount === this.maxCollectCount;
  }

  constructor(
    reel: number,
    featureIconId: number,
    storyHolderId: string,
    spinsToLiveIndicatorId: string,
    progressScene: string,
    maxCollectCount: number
  ) {
    this.reel = reel;
    this.featureIconId = featureIconId;
    this.storyHolderId = storyHolderId;
    this.spinsToLiveIndicatorId = spinsToLiveIndicatorId;
    this.progressScene = progressScene;
    this.maxCollectCount = maxCollectCount;
    this.collectCount = 0;
    this.spinsToLive = 0;
    this.isActivated = false;
  }

  reset(): void {
    this.collectCount = 0;
    this.spinsToLive = 0;
    this.isActivated = false;
  }
}
