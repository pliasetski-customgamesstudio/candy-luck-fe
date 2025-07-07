export class ProgressBarHelper {
  static progressToIndex(progress: number, count: number): number {
    return Math.round((count - 1) * progress);
  }

  static indexToProgress(index: number, count: number): number {
    return count > 1 ? index / (count - 1) : 0.5;
  }
}
