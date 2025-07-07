// import {AnimatedSplashView} from "./animated_splash_view";
// import {IControllerView} from "@cgs/common";
// import {ISplashManager} from "@cgs/common";
// import {ICoordinateSystemInfoProvider} from "@cgs/common";
// import {ScaleManager} from "@cgs/common";
// import {IStreamSubscription, SceneObject} from "@cgs/syd";
// import {SceneFactory} from "@cgs/common";
//
// export class AnimatedSplashController implements IControllerView<AnimatedSplashView>, ISplashManager {
//   private _view: AnimatedSplashView;
//   private _coordinateSystemProvider: ICoordinateSystemInfoProvider;
//   private _scaleManager: ScaleManager;
//   private _scaleSubscription: IStreamSubscription;
//   private _sceneFactory: SceneFactory;
//   private _splashIsShown: boolean = false;
//
//   private _isInitialized: boolean = false;
//   get isInitialized(): boolean {
//     return this._isInitialized;
//   }
//
//   private _isStarted: boolean = false;
//   get isStarted(): boolean {
//     return this._isStarted;
//   }
//
//   get splashIsShown(): boolean {
//     return this._splashIsShown;
//   }
//
//   get view(): AnimatedSplashView {
//     return this._view;
//   }
//
//   constructor(view: AnimatedSplashView, coordinateSystemProvider: ICoordinateSystemInfoProvider, scaleManager: ScaleManager, sceneFactory: SceneFactory) {
//     this._view = view;
//     this._coordinateSystemProvider = coordinateSystemProvider;
//     this._scaleManager = scaleManager;
//     this._sceneFactory = sceneFactory;
//   }
//
//   async initialize(): Promise<void> {
//     this._isInitialized = true;
//     this._view.sceneFactory = this._sceneFactory;
//     this._view.initialize();
//     this._view.addSteps(6);
//     await this.initScaler(this.view);
//     return Promise.resolve();
//   }
//
//   stop(): Promise<void> {
//     this._isStarted = false;
//     this._scaleSubscription?.cancel();
//     this._scaleSubscription = null;
//     return Promise.resolve();
//   }
//
//   afterHide(): Promise<void> {
//     return Promise.resolve();
//   }
//
//   start(): Promise<void> {
//     this._isStarted = true;
//     return Promise.resolve();
//   }
//
//   addSteps(steps: number): void {
//     this.view.addSteps(steps);
//   }
//
//   step(): void {
//     this.view.step();
//   }
//
//   startShowingProgress(): void {
//     this.view.startShowingProgress();
//   }
//
//   setWelcomeBonusPreparing(freeSpinsBonus: number): void {
//     this.view.setWelcomeBonusPreparing(freeSpinsBonus);
//   }
//
//   setWelcomeBonusReady(coinsBonus: number, freeSpinsBonus: number): void {
//     this.view.setWelcomeBonusReady(coinsBonus, freeSpinsBonus);
//   }
//
//   getWelcomeBonusPreparingTimerTask(): Promise<void> {
//     return this.view.getWelcomeBonusPreparingTimerTask();
//   }
//
//   getWelcomeBonusReadyTimerTask(): Promise<void> {
//     return this.view.getWelcomeBonusReadyTimerTask();
//   }
//
//   getFinishedLoadingTask(): Promise<void> {
//     return this.view.getFinishedLoadingTask();
//   }
//
//   private async initScaler(lobbyBg: SceneObject): Promise<void> {
//     // var coordinateSystem = this._coordinateSystemProvider.coordinateSystem;
//
//     // var bgMinBounds = lobbyBg.findById("minBounds");
//     // var bgMaxBounds = lobbyBg.findById("maxBounds");
//
//     // if (bgMinBounds && bgMaxBounds) {
//     //   await this._scaleManager.lobbyScaler.initialize(
//     //       [
//     //         new ScaleEntry(new Rectangle(bgMinBounds.position.x, bgMinBounds.position.y, bgMinBounds.size.x, bgMinBounds.size.y),
//     //             new Rectangle(bgMaxBounds.position.x, bgMaxBounds.position.y, bgMaxBounds.size.x, bgMaxBounds.size.y), true, true)
//     //       ],
//     //       new Rectangle(0.0, 0.0, coordinateSystem.width, coordinateSystem.height),
//     //       Stretch.Uniform);
//
//     //   this._scaleManager.lobbyScaler.addScaleChangedListener((info)  {
//     //     this.view.scale= info.scale.clone();
//     //     this.view.position = info.position.clone();
//     //   });
//
//     //   this._scaleManager.lobbyScaler.invalidate();
//     // }
//   }
// }
