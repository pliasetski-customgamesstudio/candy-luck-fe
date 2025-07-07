import { Container } from '@cgs/syd';
import { IAnalyticsProcessor } from '../processor/i_analytics_processor';
import { TimeRangeProcessorController } from './time_range_processor_controller';

export class ContinuousProcessorController extends TimeRangeProcessorController {
  constructor(container: Container, analyticsProcessor: IAnalyticsProcessor) {
    super(container, analyticsProcessor);
  }

  public static ProcessorType = 'ContinuousProcessorController';
  override _onEnd(): void {
    //Don't execute super._onEnd
  }

  update(dt: number): void {
    this.analyticsProcessor.add(Math.round(1000 * dt));
    super.update(dt);
  }
}
