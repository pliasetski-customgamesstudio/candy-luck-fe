import { IAnalyticsProcessor } from './i_analytics_processor';

export class FpsProcessor implements IAnalyticsProcessor {
  private _below30Time: number = 0;
  private _below20Time: number = 0;
  private _framesCount: number = 0;
  private _totalTime: number = 0;
  private _blockedFrames: number = 0;
  private _blockedTime: number = 0;

  add(value: number): void {
    this._framesCount++;
    this._totalTime += value;
    if (value > 200) {
      this._blockedFrames++;
      this._blockedTime += value;
    } else if (value > 1000 / 20) {
      this._below20Time += value;
    } else if (value > 1000 / 30) {
      this._below30Time += value;
    }
  }

  postprocess(key: string, props: Map<string, string>): void {
    if (this._framesCount > 0) {
      const text = `Below20FpsDuration:${this._below20Time} Below30FpsDuration:${
        this._below30Time
      } AvgFps:${Math.round((this._framesCount * 1000) / this._totalTime)} TotalDuration:${
        this._totalTime
      } BlockedDuration:${this._blockedTime} BlockedFrames:${this._blockedFrames}`;
      props.set(key, text);
    }
  }
}
