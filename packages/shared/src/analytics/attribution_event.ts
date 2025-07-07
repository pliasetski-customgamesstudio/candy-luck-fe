import { IAttributionEvent } from './i_attribution_event';

export enum AttributionEventConstants {
  Revenue = 'af_revenue',
  Currency = 'af_currency',
  ContentType = 'af_content_type',
  ContentId = 'af_content_id',
  Purchase = 'af_purchase',
}

export class AttributionEvent implements IAttributionEvent {
  private readonly _eventName: string;
  private readonly _values: Record<string, any> = {};

  constructor(eventName: string) {
    this._eventName = eventName;
  }

  get eventName(): string {
    return this._eventName;
  }

  get values(): Record<string, any> {
    return this._values;
  }
}
