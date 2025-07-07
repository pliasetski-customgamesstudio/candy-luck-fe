import {
  Completer,
  EventDispatcher,
  EventStream,
  IFramePulse,
  IStreamSubscription,
} from '@cgs/syd';
import { CancellationToken } from '../future/cancellation_token';

export enum GameTimerMode {
  OnlyOnce,
  ResetOnComplete,
}

export class GameTimer {
  private static _defaultPulser: IFramePulse;
  private _pulser: IFramePulse;
  private _interval: number;
  private _mode: GameTimerMode;
  private _left: number;
  private _isRunning: boolean;
  private _elapsedEventDispatcher: EventDispatcher<void>;
  public elapsed: EventStream<void>;
  private _cancellationToken: CancellationToken;
  private _pulserSub: IStreamSubscription | null = null;

  get left(): number {
    return this._left;
  }

  constructor(
    firstInterval: number,
    otherIntervals: number = firstInterval,
    timerMode: GameTimerMode = GameTimerMode.ResetOnComplete,
    updater: IFramePulse | null = null
  ) {
    this._initialize(
      firstInterval,
      otherIntervals,
      updater ?? GameTimer._defaultPulser,
      timerMode,
      CancellationToken.none
    );
  }

  static initSimple(
    interval: number,
    _timerMode: GameTimerMode = GameTimerMode.ResetOnComplete,
    _updater: IFramePulse | null = null
  ): GameTimer {
    return new GameTimer(interval, interval);
  }

  private _initialize(
    firstInterval: number,
    otherIntervals: number,
    pulser: IFramePulse,
    mode: GameTimerMode,
    cancellationToken: CancellationToken
  ) {
    if (!pulser) {
      throw new Error('GameTimer is not initialized with proper pulser');
    }

    this._interval = otherIntervals;
    this._pulser = pulser;
    this._mode = mode;
    this._cancellationToken = cancellationToken;

    this._left = firstInterval;
    this._isRunning = true;

    this._pulserSub = this._pulser.framePulsate.listen((time) => this._update(time!));
  }

  private _update(time: number) {
    if (this._isRunning) {
      this._left -= time;

      if (this._left <= 0 || this._cancellationToken.isCancellationRequested) {
        this._fire();
      }
    }
  }

  public stop() {
    if (this._pulserSub) {
      this._pulserSub.cancel();
      this._pulserSub = null;
    }
    this._isRunning = false;
  }

  public start() {
    this._left = this._interval;
    this._isRunning = true;
    if (!this._pulserSub) {
      this._pulserSub = this._pulser.framePulsate.listen((time) => this._update(time!));
    }
  }

  public reset() {
    this._left = this._interval;
  }

  public resetTo(_interval: number) {
    this._left = this._interval;
  }

  private _fire() {
    if (this._isRunning) {
      if (this._mode === GameTimerMode.ResetOnComplete) {
        this._left = this._interval;
      } else {
        this.stop();
      }

      this._elapsedEventDispatcher.dispatchEvent();
    }
  }

  public static async wait(seconds: number, pulser: IFramePulse | null = null) {
    const timer = GameTimer.initSimple(seconds, GameTimerMode.OnlyOnce, pulser);
    const completer = new Completer<void>();
    timer.elapsed.listen(() => {
      completer.complete();
    });
    return completer.promise;
  }

  public static setDefaultPulser(pulser: IFramePulse) {
    GameTimer._defaultPulser = pulser;
  }
}
