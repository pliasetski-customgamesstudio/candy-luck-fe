import {
  IComponent,
  IFramePulse,
  Container,
  SpriteBatch,
  CgsEvent,
  EventStreamSubscription,
  T_IFramePulse,
} from '@cgs/syd';
import { IAnalyticsProcessor } from '../processor/i_analytics_processor';
import { ProcessorControllerBase } from './processor_controller_base';

export class TimeRangeProcessorController extends ProcessorControllerBase implements IComponent {
  private _framePulse: IFramePulse;
  private _pulserSub: EventStreamSubscription<number>;
  private _time: number = 0.0;
  private _isRunning: boolean = false;

  public static ProcessorType = 'TimeRangeProcessorController';
  constructor(container: Container, analyticsProcessor: IAnalyticsProcessor) {
    super(analyticsProcessor);
    this._framePulse = container.forceResolve<IFramePulse>(T_IFramePulse);
  }

  update(dt: number): void {
    this._time += dt;
  }
  draw(spriteBatch: SpriteBatch): void {}
  dispatchEvent(event: CgsEvent): void {}

  begin(): void {
    this._time = 0.0;
    this._onBegin();
    this._pulserSub = this._framePulse.framePulsate.listen((dt) => {
      this.update(dt);
    });
    this._isRunning = true;
  }

  end(): void {
    if (this._isRunning) {
      this._onEnd();
      this._pulserSub.cancel();
      this._isRunning = false;
    }
  }

  private _onBegin(): void {}

  protected _onEnd(): void {
    if (this._time > 0) {
      this.analyticsProcessor.add(Math.round(this._time * 1000));
    }
  }

  get isRunning(): boolean {
    return this._isRunning;
  }
}
