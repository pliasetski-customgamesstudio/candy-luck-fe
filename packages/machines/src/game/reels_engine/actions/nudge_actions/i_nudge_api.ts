export enum NudgeDirection {
  Down,
  Up,
}

export interface INudgeApi {
  isNugdeRequied: boolean;
  nudgeParticlyVisibleOnReels: number[];
  getNudgeGroups(): NudgeGroup[];
}

export class NudgeGroup {
  private readonly _nudgeDirection: NudgeDirection;
  private readonly _nudgeCount: number = 0;
  private readonly _nudgeReel: number = 0;

  constructor(nudgeDirection: NudgeDirection, nudgeReel: number, nudgeCount: number) {
    this._nudgeReel = nudgeReel;
    this._nudgeDirection = nudgeDirection;
    this._nudgeCount = nudgeCount;
  }

  get nudgeDirection(): NudgeDirection {
    return this._nudgeDirection;
  }

  get nudgeCount(): number {
    return this._nudgeCount;
  }

  get nudgeReel(): number {
    return this._nudgeReel;
  }
}
