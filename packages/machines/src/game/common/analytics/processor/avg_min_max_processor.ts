import { IAnalyticsProcessor } from './i_analytics_processor';

export class AvgMinMaxProcessor implements IAnalyticsProcessor {
  private _values: number[] = [];

  add(value: number): void {
    this._values.push(value);
  }

  postprocess(key: string, props: Map<string, string>): void {
    if (this._values.length > 0) {
      props.set(
        key + 'Avg',
        Math.floor(
          this._values.reduce((prev, cur) => prev + cur, 0) / this._values.length
        ).toString()
      );
      props.set(
        key + 'Min',
        this._values.reduce((prev, cur) => (cur < prev ? cur : prev), Math.pow(2, 31)).toString()
      );
      props.set(
        key + 'Max',
        this._values.reduce((prev, cur) => (cur > prev ? cur : prev), 0).toString()
      );
      this._values.sort((a, b) => a - b);
      const med = this._values.slice(
        Math.floor((this._values.length - 1) / 2),
        this._values.length > 0 && this._values.length % 2 === 0 ? 2 : 1
      );
      props.set(
        key + 'Med',
        Math.floor(med.reduce((prev, cur) => prev + cur, 0) / med.length).toString()
      );
    }
  }
}
