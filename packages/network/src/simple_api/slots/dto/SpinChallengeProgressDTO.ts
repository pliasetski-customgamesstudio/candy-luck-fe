import { SpinTaskStateDTO } from './SpinTaskStateDTO';

export class SpinChallengeProgressDTO {
  challengeConfigId: number | null;
  stepConfigId: number | null;
  taskStates: SpinTaskStateDTO[] | null;

  constructor({
    challengeConfigId,
    stepConfigId,
    taskStates,
  }: {
    challengeConfigId: number | null;
    stepConfigId: number | null;
    taskStates: SpinTaskStateDTO[] | null;
  }) {
    this.challengeConfigId = challengeConfigId;
    this.stepConfigId = stepConfigId;
    this.taskStates = taskStates;
  }

  static fromJson(json: Record<string, any>): SpinChallengeProgressDTO {
    return new SpinChallengeProgressDTO({
      challengeConfigId: json['challengeConfigId'] ?? null,
      stepConfigId: json['stepConfigId'] ?? null,
      taskStates: json['taskStates']
        ? json['taskStates'].map((x: any) => SpinTaskStateDTO.fromJson(x))
        : null,
    });
  }
}
