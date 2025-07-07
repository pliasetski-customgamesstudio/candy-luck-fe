// import { Disposable } from "@cgs/common";
// import { IAppResumeListener, IAppResumeWatcher } from "@cgs/shared";
// import { GameTimer } from 'syd';
// import { Func0 } from 'func2';
//
// @iocReflector
// class AppPauseResumeAwareTimer implements IAppResumeListener, Disposable {
//   private _appResumeWatcher: IAppResumeWatcher;
//   private _timer: GameTimer;
//   private _handler: Func0<Promise<void>>;
//   private _paused: boolean = false;
//   private _executing: number = 0;
//   private _timerSub: StreamSubscription;
//
//   constructor(appResumeWatcher: IAppResumeWatcher) {
//     this._appResumeWatcher = appResumeWatcher;
//   }
//
//   public setup(firstInterval: number, interval: number, handler: Func0<Promise<void>>, startImmediately: boolean = true): void {
//     if (this._timer) {
//       throw new Error("Timer was already set up");
//     }
//
//     this._timer = new GameTimer.intervals(firstInterval / 1000.0, interval / 1000.0);
//     if (!startImmediately) {
//       this._timer.stop();
//     }
//     this._timerSub = this._timer.elapsed.listen((d) => this.onTimerElapsed());
//     this._handler = handler;
//
//     this._appResumeWatcher.registerListener(this);
//   }
//
//   public get isInitialized(): boolean {
//     return !!this._timer;
//   }
//
//   private async onTimerElapsed(): Promise<void> {
//     if (this._executing == 0) {
//       this._executing = 1;
//       try {
//         if (this._paused) {
//           return;
//         }
//         await this._handler();
//       }
//       finally {
//         this._executing = 0;
//       }
//     }
//   }
//
//   public start(): void {
//     this.checkTimerSetup();
//     this._timer.start();
//   }
//
//   private checkTimerSetup(): void {
//     if (!this._timer) {
//       throw new Error("Timer wasn't set up");
//     }
//   }
//
//   public stop(): void {
//     this.checkTimerSetup();
//     this._timer.stop();
//   }
//
//   public onPaused(): void {
//     this._paused = true;
//   }
//
//   public onPauseCancelled(): void {
//     this._paused = false;
//   }
//
//   public async onAppResume(): Promise<void> {
//     await this._handler();
//     this._paused = false;
//   }
//
//   public dispose(): void {
//     if (this._timer) {
//       this.stop();
//       this._timerSub?.cancel();
//       this._timer = null;
//       this._handler = null;
//       this._appResumeWatcher.unregisterListener(this);
//     }
//   }
// }
