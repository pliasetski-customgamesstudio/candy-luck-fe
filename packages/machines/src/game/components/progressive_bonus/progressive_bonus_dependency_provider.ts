import { IProgressiveBonusDependencyProvider } from './i_progressive_bonus_dependency_provider';

export class ProgressiveBonusDependencyProvider implements IProgressiveBonusDependencyProvider {
  private _symbolProgressiveStepsCount: Map<number, number>;

  constructor(symbolProgressiveStepsCount: Map<number, number>) {
    this._symbolProgressiveStepsCount = symbolProgressiveStepsCount;
  }

  get symbolProgressiveStepsCount(): Map<number, number> {
    return this._symbolProgressiveStepsCount;
  }
}
