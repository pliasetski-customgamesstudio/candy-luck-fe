import {
  ISplashManager,
  SceneFactory,
  ScaleManager,
  ICoordinateSystemInfoProvider,
} from '@cgs/common';
import { MathHelper } from '@cgs/shared';
import { SceneObject, ProgressBar, IStreamSubscription, clamp } from '@cgs/syd';

export class MachinePreloader extends SceneObject implements ISplashManager {
  private _sceneFactory: SceneFactory;
  private _scene: SceneObject;
  private _progress: ProgressBar;
  private _scaleManager: ScaleManager;
  private _coordinateSystemProvider: ICoordinateSystemInfoProvider;
  private _scaleChangedSub: IStreamSubscription;
  private _stepsCount: number = 0;
  private _currentStep: number = 0;

  private _curValue: number = 0.0;
  private _targetValue: number = 0.0;

  private _startTime: number = 0.0;
  private _prevStepTime: number = 0.0;
  private _timePerStep: number = 1000.0;
  private _time: number = 0.0;

  get progress(): number {
    return this._targetValue;
  }
  set progress(value: number) {
    this._targetValue = value;
  }

  constructor(
    sceneFactory: SceneFactory,
    coordinateSystemProvider: ICoordinateSystemInfoProvider,
    scaleManager: ScaleManager
  ) {
    super();
    this._time = 0.0;
    this._startTime = this._time;
    this._prevStepTime = this._time;
    this._sceneFactory = sceneFactory;
    this._coordinateSystemProvider = coordinateSystemProvider;
    this._scaleManager = scaleManager;
  }

  public update(dt: number): void {
    super.update(dt);
    this._time += dt;

    const maxPrediction: number = 1.0 / this._stepsCount;
    const delta: number = this._targetValue + maxPrediction - this._curValue;
    const prediction: number = Math.min(
      ((this._time - this._prevStepTime) / this._timePerStep) * delta,
      delta
    );
    this._curValue = this._curValue + prediction;
    this._progress.progress = this.toProgress(this._curValue);
  }

  private toProgress(value: number): number {
    return MathHelper.linearInterpolation(0.1, 0.98, clamp(value, 0.0, 1.0));
  }

  public initialize(): void {
    this._scene = this._sceneFactory.build('loading/scene')!;
    this._scene.initialize();
    this._progress = this._scene.findAllByType(ProgressBar)[0];
    this.addChild(this._scene);
  }

  public async initializeScaler(): Promise<void> {
    // var bgMinBounds = this._scene.findById("minBounds");
    // var bgMaxBounds = this._scene.findById("maxBounds");
    // if (bgMinBounds && bgMaxBounds) {
    //   this._scaleChangedSub = this._scaleManager.gamesScaler.addScaleChangedListener((ScaleInfo info) => {
    //     this._scene.position = info.position;
    //     this._scene.scale = info.scale;
    //   });
    //   await this._scaleManager.gamesScaler.initialize([
    //     new ScaleEntry(
    //         new Rectangle(bgMinBounds.position.x, bgMinBounds.position.y, bgMinBounds.size.x, bgMinBounds.size.y),
    //         new Rectangle(bgMaxBounds.position.x, bgMaxBounds.position.y, bgMaxBounds.size.x, bgMaxBounds.size.y), true,
    //         true)
    //   ], new Rectangle(0.0, 0.0, this._coordinateSystemProvider.coordinateSystem.width,
    //       this._coordinateSystemProvider.coordinateSystem.height));
    // }
  }

  public addSteps(steps: number): void {
    this._stepsCount += steps;
  }

  public step(): void {
    this.progress =
      this._currentStep >= this._stepsCount ? 1.0 : ++this._currentStep / this._stepsCount;
    this._timePerStep = ((this._time - this._startTime) * 2.0) / this._currentStep;
    this._prevStepTime = this._time;
  }

  public async finish(): Promise<void> {
    if (this._scaleChangedSub) {
      this._scaleChangedSub.cancel();
    }
    const teleport = this.findById('teleport');
    if (teleport) {
      teleport.stateMachine!.switchToState('end');
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  get splashIsShown(): boolean {
    return false;
  }

  public startShowingProgress(): void {}

  public setWelcomeBonusPreparing(_freeSpinsBonus: number): void {}

  public setWelcomeBonusReady(_coinsBonus: number, _freeSpinsBonus: number): void {}

  public getWelcomeBonusPreparingTimerTask(): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  public getWelcomeBonusReadyTimerTask(): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  public getFinishedLoadingTask(): Promise<void> {
    return new Promise((resolve) => resolve());
  }
}
