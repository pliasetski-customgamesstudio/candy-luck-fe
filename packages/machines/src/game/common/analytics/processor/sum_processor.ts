import { IAnalyticsProcessor } from './i_analytics_processor';

export class SumProcessor implements IAnalyticsProcessor {
  private _value: number = 0;

  public add(value: number): void {
    this._value += value;
  }

  public postprocess(key: string, props: Map<string, string>): void {
    props.set(key, this._value.toString());
  }
}
