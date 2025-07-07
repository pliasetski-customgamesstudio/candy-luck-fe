import { SpeedInterpolation } from '../entity_components/speed_interpolation';

export class InterpolationPair {
  interpolator: SpeedInterpolation;
  step: number;

  constructor(interpolator: SpeedInterpolation, step: number) {
    this.interpolator = interpolator;
    this.step = step;
  }

  equals(other: any): boolean {
    return this.interpolator === other.interpolator && this.step === other.step;
  }

  get hashCode(): number {
    return (this.interpolator.hashCode << 4) | (this.step * 10000);
  }
}

export class IntegrationHelper {
  private _cache: Map<InterpolationPair, number> = new Map<InterpolationPair, number>();

  integrate(interpolator: SpeedInterpolation, step: number): number {
    const key = new InterpolationPair(interpolator, step);
    let result = this._cache.get(key);
    if (result === undefined) {
      result = this._internal_integrate(interpolator, step);
      this._cache.set(key, result);
    }
    return result;
  }

  private _internal_integrate(interpolator: SpeedInterpolation, step: number): number {
    let area = 0.0;
    while (!interpolator.isDone) {
      interpolator.step(step);
      area += interpolator.value.y;
    }
    return area * step;
  }
}
