import { IAnalyticsProcessor } from '../processor/i_analytics_processor';

export class ProcessorControllerBase {
  analyticsProcessor: IAnalyticsProcessor;
  constructor(analyticsProcessor: IAnalyticsProcessor) {
    this.analyticsProcessor = analyticsProcessor;
  }

  overridingKey: string;

  postprocess(key: string, props: Map<string, string>): void {
    this.analyticsProcessor.postprocess(key, props);
  }
}
