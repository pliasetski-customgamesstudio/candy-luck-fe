import { IAnalyticsProcessor } from '../processor/i_analytics_processor';
import { ProcessorControllerBase } from './processor_controller_base';

export class NumericProcessorController extends ProcessorControllerBase {
  constructor(analyticsProcessor: IAnalyticsProcessor) {
    super(analyticsProcessor);
  }

  add(value: number): void {
    this.analyticsProcessor.add(value);
  }

  public static ProcessorType = 'NumericProcessorController';
}
