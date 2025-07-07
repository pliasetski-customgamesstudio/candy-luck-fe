// import {
//   Action,
//   ActionActivator,
//   clamp,
//   Completer, FunctionAction,
//   IntervalAction,
//   SceneObject,
//   SequenceSimpleAction,
//   Vector2
// } from "@cgs/syd";
// import {SceneFactory} from "@cgs/common";
// import {GameTimer} from "@cgs/common";
// import {MathHelper} from "../../../shared/lib/src/utils/math_helper";
// import {ListUtil} from "../../../shared/lib/src/utils/list_util";
//
// class SplashConstants {
//   static CoinStateMachineNode = "Coin";
//   static CoinDefaultStateName = "default";
//   static CoinAnimStateName = "anim";
//   static ProgressbarNodeName = "Preloader";
//   static StateControllerNodeName = "LoaderStates";
//   static LoginButtonsStateName = "buttons";
//   static LoginButtonsNoAnimationStateName = "buttonsOnly";
//   static ButtonsToProgressBarStateName = "buttonsToPreloader";
//   static ProgressBarOnlyStateName = "preloader";
//   static WelcomeBonusPreparingStateName = "preparing";
//   static WelcomeBonusReadyStateName = "ready";
//   static ConnectButtonNodeName = "ConnectBtn";
//   static LaterButtonNodeName = "LaterBtn";
//   static ProgressStartHolderNodeName = "start_holder";
//   static ProgressEndHolderNodeName = "end_holder";
//   static WelcomeBonusCoinsText = "coinsLoginText";
//   static WelcomeBonusFsText = "spinsFreeText_1";
//   static WelcomeBonusFsInboxText = "spinsFreeText_2";
//   static CoinsCountNodeName = "CoinCount";
// }
//
// export class AnimatedSplashView extends SceneObject {
//   private _sceneFactory: SceneFactory;
//   private _stepsCount = 0;
//   private _currentStep = 0;
//
//   private _curValue = 0.0;
//   private _targetValue = 0.0;
//   private _progressBarStepValue = 1.0;
//
//   private _startTime = 0.0;
//   private _prevStepTime = 0.0;
//   private _timePerStep = 1000.0;
//   private _time = 0.0;
//
//   private _currentProgress = 0.0;
//   private _targetProgress = 0.0;
//
//   private _coinFlyDistance: Vector2;
//   private _progressBarStepsCount: number;
//   private _coinAnimDuration: number;
//   private _coinFlyDelay: number;
//
//   private _coinSceneCache: SceneObject[] = [];
//   private _addCoinActionActivators: ActionActivator[] = [];
//
//   private _welcomeBonusPreparingCompleter = new Completer<void>();
//   private _welcomeBonusReadyCompleter = new Completer<void>();
//   private _loadingCompleter = new Completer<void>();
//
//   private _preparingTimer: GameTimer;
//   private _readyTimer: GameTimer;
//
//   set sceneFactory(value: SceneFactory) {
//     this._sceneFactory = value;
//   }
//
//   constructor(root: SceneObject) {
//     super();
//   }
//
//   initialize(): void {
//     super.initialize();
//
//     //_coinFlyDistance = NodeUtils.worldPosition(end_holder) - NodeUtils.worldPosition(start_holder);
//
//     //_progressBarStepsCount = int.parse(coinCount.text);
//     this._progressBarStepValue = 1.0 / this._progressBarStepsCount;
//
//     const coinScene = this.getCoinScene();
//     if (coinScene) {
//       this._coinAnimDuration =
//         (coinScene.findById(SplashConstants.CoinStateMachineNode)!.stateMachine.findById(SplashConstants.CoinAnimStateName)!.enterAction as IntervalAction).duration;
//       this._coinFlyDelay = this._coinAnimDuration / 2;
//       this.putCoinScene(coinScene);
//     }
//
//     this._preparingTimer = GameTimer.initSimple(2.0);
//     this._preparingTimer.elapsed.listen((e) => this.onBonusPreparingTimerElapsed());
//     this._preparingTimer.stop();
//
//     this._readyTimer = GameTimer.initSimple(4.0);
//     this._readyTimer.elapsed.listen((e) => this.onBonusReadyTimerElapsed());
//     this._readyTimer.stop();
//   }
//
//   addSteps(steps: number): void {
//     this._stepsCount += steps;
//   }
//
//   step(): void {
//     this._targetValue = this._currentStep >= this._stepsCount ? 1.0 : ++this._currentStep / this._stepsCount;
//     this._timePerStep = (this._time - this._startTime) * 2.0 / this._currentStep;
//     this._prevStepTime = this._time;
//   }
//
//   startShowingProgress(): void {
//     //loaderStates_preloader();
//   }
//
//   setWelcomeBonusPreparing(freeSpinsBonus: number): void {
//     // spinsFreeText_1.text = NumberFormatter.format(freeSpinsBonus);
//     // spinsFreeText_2.text = NumberFormatter.format(freeSpinsBonus);
//     // loaderStates_preparing();
//     this._preparingTimer.start();
//   }
//
//   setWelcomeBonusReady(coinsBonus: number, freeSpinsBonus: number): void {
//     // spinsFreeText_1.text = NumberFormatter.format(freeSpinsBonus);
//     // spinsFreeText_2.text = NumberFormatter.format(freeSpinsBonus);
//     // coinsLoginText.text = NumberFormatter.format(coinsBonus);
//     // loaderStates_ready();
//     this._readyTimer.start();
//   }
//
//   private _nextCoinsDelay = 0.03;
//   private _waitCoinsDelay = 0.0;
//
//   update(dt: number): void {
//     this._waitCoinsDelay += dt;
//     // if (!preloader.hidden && preloader.visible) {
//     //   var maxPrediction = 1.0 / _stepsCount;
//     //   var delta = _targetValue + maxPrediction - _curValue;
//     //   var prediction = min((_time - _prevStepTime) / _timePerStep * delta, delta);
//     //   _curValue = _curValue + prediction;
//     //   _targetProgress = toProgress(_curValue);
//     // }
//
//     this._time += dt;
//
//     // if (preloader && _targetProgress > _currentProgress) {
//     //   if (_addCoinActionActivators.length == 0) {
//     //     createAndRunCoin();
//     //   }
//     //   else if (_currentProgress < _targetProgress) {
//     //     if (_nextCoinsDelay < _waitCoinsDelay) {
//     //       createAndRunCoin();
//     //     }
//     //   }
//     // }
//     if (this._nextCoinsDelay < this._waitCoinsDelay) {
//       this._waitCoinsDelay = 0.0;
//     }
//
//     if (ListUtil.all(this._addCoinActionActivators, (a) => a.action.isDone && this._currentProgress >= 1.0 - this._progressBarStepValue)) {
//       if (!this._loadingCompleter.isCompleted) {
//         this._loadingCompleter.complete();
//       }
//     }
//
//     super.update(dt);
//   }
//
//   createAndRunCoin(): void {
//     const currentStep = Math.round(this._currentProgress / this._progressBarStepValue);
//     // HACKATON var endPosition = coin_holder.position - start_holder.position;
//     // var endPosition = new Vector2(0.0, 0.0) - start_holder.position;
//     // var startPosition = endPosition + _coinFlyDistance;
//
//     this._currentProgress += this._progressBarStepValue;
//
//     const value = this._currentProgress - this._progressBarStepValue / 2;
//     // var coinActivator = new ActionActivator.withAction(
//     //     this,
//     //     new SequenceSimpleAction([
//     //       new LazyAction(() {
//     //         return buildIncrementProgressAction(startPosition, endPosition, value);
//     //       })])
//     // );
//     // coinActivator.start();
//     // _addCoinActionActivators.add(coinActivator);
//   }
//
//   toProgress(value: number): number {
//     return MathHelper.linearInterpolation(0.1, 0.98, clamp(value, 0.0, 1.0));
//   }
//
//   getWelcomeBonusPreparingTimerTask(): Promise<void> {
//     return this._welcomeBonusPreparingCompleter.promise;
//   }
//
//   getWelcomeBonusReadyTimerTask(): Promise<void> {
//     return this._welcomeBonusReadyCompleter.promise;
//   }
//
//   getFinishedLoadingTask(): Promise<void> {
//     return this._loadingCompleter.promise;
//   }
//
//   onBonusPreparingTimerElapsed(): void {
//     if (!this._welcomeBonusPreparingCompleter.isCompleted) {
//       this._welcomeBonusPreparingCompleter.complete();
//     }
//
//     this._preparingTimer.stop();
//   }
//
//   onBonusReadyTimerElapsed(): void {
//     if (!this._welcomeBonusReadyCompleter.isCompleted) {
//       this._welcomeBonusReadyCompleter.complete();
//     }
//
//     this._readyTimer.stop();
//   }
//
//   buildIncrementProgressAction(startPosition: Vector2, endPosition: Vector2, progressValue: number): Action {
//     // if (!preloader) {
//     //   return new EmptyAction()..withDuration(0.0);
//     // }
//
//     const scene = this.getCoinScene();
//     const stateMachineNode = scene.findById(SplashConstants.CoinStateMachineNode)!;
//
//     // if (!start_holder || !end_holder || !scene || !stateMachineNode) {
//     //   return new FunctionAction(() => { preloader.progress = progressValue; });
//     // }
//     // HACKATON var endPosition1 = coin_holder.position - start_holder.position;
//     //var endPosition1 = new Vector2(0.0, 0.0) - start_holder.position;
//     // var startPosition1 = endPosition1 + _coinFlyDistance;
//
//     // var interpolatePositionAction = new InterpolateInplaceAction<Vector2>((v) => v.clone())
//     //   ..withInterpolateFunction(Vector2.LerpInplace)
//     //   ..withValues(startPosition1, endPosition1)
//     //   ..withTimeFunction((time, start, dx) => time)
//     //   ..withDuration(_coinAnimDuration);
//
//     // interpolatePositionAction.valueChange.listen((e) {
//     //   scene.position = e;
//     // });
//
//
//     return new SequenceSimpleAction([
//       new FunctionAction(() => {
//         //start_holder.addChild(scene);
//         scene.visible = scene.active = true;
//         stateMachineNode.stateMachine.switchToState(SplashConstants.CoinAnimStateName);
//       }),
//       //interpolatePositionAction,
//       /* new EmptyAction()..withDuration(1.0),*/
//       new FunctionAction(() => {
//         //preloader.progress = progressValue;
//         stateMachineNode.stateMachine.switchToState(SplashConstants.CoinDefaultStateName);
//         scene.visible = scene.active = false;
//         //start_holder.removeChild(scene);
//         this.putCoinScene(scene);
//       })
//     ]);
//   }
//
//   getCoinScene(): SceneObject {
//     if (this._coinSceneCache.length > 0) {
//       const scene = this._coinSceneCache.find(() => true);
//       this._coinSceneCache.splice(this._coinSceneCache.indexOf(scene), 1);
//       return scene;
//     }
//
//     const newScene = this.buildCoinScene();
//     newScene.visible = newScene.active = false;
//     return newScene;
//   }
//
//   putCoinScene(scene: SceneObject): void {
//     this._coinSceneCache.push(scene);
//   }
//
//   buildCoinScene(): SceneObject {
//     const scene = this._sceneFactory.build("lobby/login/sceneCoin");
//     scene.initialize();
//     return scene;
//   }
// }
