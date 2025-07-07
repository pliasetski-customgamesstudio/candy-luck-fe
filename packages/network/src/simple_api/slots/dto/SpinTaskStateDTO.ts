export class SpinTaskStateDTO {
  currentNumber: number | null;
  rewarded: boolean | null;
  taskConfigId: number | null;

  constructor({
    currentNumber,
    rewarded,
    taskConfigId,
  }: {
    currentNumber: number | null;
    rewarded: boolean | null;
    taskConfigId: number | null;
  }) {
    this.currentNumber = currentNumber;
    this.rewarded = rewarded;
    this.taskConfigId = taskConfigId;
  }

  static fromJson(json: { [key: string]: any }): SpinTaskStateDTO {
    return new SpinTaskStateDTO({
      currentNumber: json['currentNumber'] ?? null,
      rewarded: json['rewarded'] ?? null,
      taskConfigId: json['taskConfigId'] ?? null,
    });
  }
}
