import { IDisposable, IFramePulse, Container, Random } from '@cgs/syd';
import { ISlotSessionProvider } from '../../components/interfaces/i_slot_session_provider';
import { ContinuousProcessorController } from './controller/continuous_processor_controller';
import { NumericProcessorController } from './controller/numeric_processor_controller';
import { TimeRangeProcessorController } from './controller/time_range_processor_controller';
import { IAnalyticsProcessor } from './processor/i_analytics_processor';
import { SumProcessor } from './processor/sum_processor';
import { SlotEvents } from './slot_events';
import { T_ISlotSessionProvider } from '../../../type_definitions';

export class SlotAnalytics implements IDisposable {
  private _framePulse: IFramePulse;
  private _uniqueIdentifier: string = this._randomString(16);
  private _valueEntries: Map<string, NumericProcessorController> = new Map<
    string,
    NumericProcessorController
  >();
  private _timeRangeEntries: Map<string, TimeRangeProcessorController> = new Map<
    string,
    TimeRangeProcessorController
  >();
  private _container: Container;

  constructor(container: Container) {
    this._container = container;
  }

  public registerEntry(
    key: string,
    analyticsProcessor: IAnalyticsProcessor,
    controllerType: string
  ): void {
    if (controllerType === NumericProcessorController.ProcessorType) {
      this._valueEntries.set(key, new NumericProcessorController(analyticsProcessor));
    } else if (controllerType === TimeRangeProcessorController.ProcessorType) {
      this._timeRangeEntries.set(
        key,
        new TimeRangeProcessorController(this._container, analyticsProcessor)
      );
    } else if (controllerType === ContinuousProcessorController.ProcessorType) {
      this._timeRangeEntries.set(
        key,
        new ContinuousProcessorController(this._container, analyticsProcessor)
      );
    }
  }

  public track(key: string, value: number = 1): void {
    if (!this._valueEntries.has(key)) {
      this._valueEntries.set(key, new NumericProcessorController(new SumProcessor()));
    }
    this._valueEntries.get(key)?.analyticsProcessor.add(value);
  }

  public begin(key: string): void {
    if (this._timeRangeEntries.has(key)) {
      this._timeRangeEntries.get(key)?.begin();
    } else {
      const entry = new TimeRangeProcessorController(this._container, new SumProcessor());
      entry.begin();
      this._timeRangeEntries.set(key, entry);
    }
  }

  public end(key: string): void {
    if (this._timeRangeEntries.has(key)) {
      this._timeRangeEntries.get(key)?.end();
    }
  }

  public trackImmediate(
    eventName: string,
    eventValue: string,
    additionalParams: string | null = null
  ): void {
    const provider: ISlotSessionProvider =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider);
    const gameId = provider.slotSession.GameId;
  }

  public overrideKey(key: string, outputKey: string): void {
    if (this._valueEntries.has(key)) {
      const valueEntry = this._valueEntries.get(key);
      if (valueEntry) {
        valueEntry.overridingKey = outputKey;
      }
    }
    if (this._timeRangeEntries.has(key)) {
      const timeRangeEntry = this._timeRangeEntries.get(key);
      if (timeRangeEntry) {
        timeRangeEntry.overridingKey = outputKey;
      }
    }
  }

  public flush(): void {
    const props: Map<string, string> = new Map<string, string>();
    this._valueEntries.forEach((v: NumericProcessorController, k: string) => {
      if (v instanceof NumericProcessorController) {
        v.postprocess(v.overridingKey || k, props);
      }
    });
    this._timeRangeEntries.forEach((v: TimeRangeProcessorController, k: string) => {
      if (v instanceof TimeRangeProcessorController) {
        if (v.isRunning) {
          this.end(k);
        }
        v.postprocess(v.overridingKey || k, props);
      }
    });
    const provider: ISlotSessionProvider =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider);
    const gameId = provider.slotSession.GameId;

    const sessionSpinCount = props.has(SlotEvents.SpinCount)
      ? props.get(SlotEvents.SpinCount)
      : '-1';
    const additionalParams = `{"spinCount":${sessionSpinCount}, "id":${this._uniqueIdentifier}}`;
  }

  private _randomString(length: number): string {
    const rand = new Random();
    const codeUnits = Array.from({ length }, () => rand.nextInt(33) + 89);
    return String.fromCharCode(...codeUnits);
  }

  public dispose(): void {
    this.flush();
  }
}
