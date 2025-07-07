// import { Container } from 'inversify';
// import { GameComponentProvider } from 'machines';
// import { IMapFeatureComponent, IMapConfiguration } from './interfaces';
// import { Button, ProgressBar, SceneObject } from 'shared';
// import { ActionActivator, ActionFactory, SequenceSimpleAction, FunctionAction } from '@cgs/syd';
// import { ReelsSoundModel } from './reels_engine_library';
// import { StringUtils } from 'common';

// export class MapFeatureComponent extends GameComponentProvider implements IMapFeatureComponent {
//   private _mapStep: number;
//   private _mapEndPos: number;
//   private _stepCounts: number = 0;

//   private _container: Container;
//   private _gameResourceProvider: CustomGamesGameResourcesProviderStub;
//   private _mapBtn: Button;
//   private _reelsSoundModel: ReelsSoundModel;
//   private _activator: ActionActivator;
//   private _gameNode: SceneObject;
//   private _isShown: boolean = false;
//   private _map: SceneObject;
//   private _map_steps: Map<string, SceneObject> = new Map<string, SceneObject>();
//   private _mapLeftBtn: Button;

//   private _mapPages: number[];

//   private _mapProgressBar: ProgressBar;
//   private _mapRightBtn: Button;
//   private _closeButton: Button;
//   private _progressBar: SceneObject;
//   private currentStep: number = 0;
//   private _mapConfiguration: IMapConfiguration;
//   private _streamSubscription: StreamSubscription;
//   private _streamSubscription1: StreamSubscription;
//   private _streamSubscription2: StreamSubscription;
//   private _streamSubscription3: StreamSubscription;

//   constructor(container: Container, mapContentManager: SceneCommon) {
//     super();
//     const mapConfiguration = container.get<IMapConfiguration>(IMapConfiguration);

//     if (!mapConfiguration)
//       throw new Error("You need to register IMapConfiguration implementation for your slot machine first");

//     this._mapConfiguration = mapConfiguration;
//     this._stateMachineListener = mapConfiguration.registerMachineListener(this);
//     this._mapPages = mapConfiguration.mapStepsOnPages;
//     this._mapStep = mapConfiguration.mapStep;
//     this._mapEndPos = mapConfiguration.mapEndPos;
//     this._stepCounts = mapConfiguration.stepCount;

//     this._container = container;
//     const root = container.get<ISlotGame>(ISlotGame).gameNode;
//     this._reelsSoundModel = container.get<RegularSpinsSoundModelComponent>(RegularSpinsSoundModelComponent).regularSpinSoundModel;
//     this._gameResourceProvider = container.get<CustomGamesGameResourcesProviderStub>(CustomGamesGameResourcesProviderStub);
//     this._gameNode = container.get<ISlotGame>(ISlotGame).gameNode;

//     const rawMap = mapContentManager.sceneFactory.build("map/scene");
//     rawMap.initialize();
//     rawMap.z = 100000000;

//     if (StringUtils.isNullOrWhiteSpace(mapConfiguration.mapHolder))
//       this._gameNode.addChild(rawMap);
//     else
//       this._gameNode.findById(mapConfiguration.mapHolder).addChild(rawMap);

//     this._map = rawMap.findById("map");

//     this._mapBtn = this._gameNode.findById(mapConfiguration.mapButtonId) as Button;
//     this._closeButton = this._gameNode.findById("backtogame") as Button;
//     this._activator = new ActionActivator(this._gameNode);
//     for (let i = 0; i < this._stepCounts; i++)
//       this._map_steps.set(StringUtils.format(this._mapConfiguration.stepNameFormat, [ i ]), this._map.findById(StringUtils.format(this._mapConfiguration.stepNameFormat, [ i ])));

//     this._streamSubscription = this._mapBtn.clicked.listen((d) => this.openMap());

//     if (this._closeButton)
//       this._streamSubscription1 = this._closeButton.clicked.listen((d) => this.closeButtonClicked());

//     if (mapConfiguration.hasProgressBar) {
//       this._mapProgressBar = this._map.findById("progress_bar") as ProgressBar;
//     }

//     if (this._map.findById("map_left") && this._map.findById("map_right")) {
//       this._mapLeftBtn = this._map.findById("map_left") as Button;
//       this._mapRightBtn = this._map.findById("map_right") as Button;

//       this._streamSubscription2 = this._mapLeftBtn.clicked.listen((d) => this.mapLeftBtnOnClicked());
//       this._streamSubscription3 = this._mapRightBtn.clicked.listen((d) => this.mapRightBtnOnClicked());
//     }

//     this._map.touchEvent.listen((e) => {
//       e.accept();
//     });

//     if (mapConfiguration.fakeBottomTouchArea) {
//       const fakeTouchArea = rawMap.findById(mapConfiguration.fakeBottomTouchArea);
//       if (fakeTouchArea) {
//         fakeTouchArea.touchEvent.listen((e) => {
//           e.accept();
//         });
//       }
//     }
//   }

//   public initMap(): void {
//     if (this._mapConfiguration.questInfoApiProvider) {
//       this.setMapStep(this._mapConfiguration.questInfoApiProvider.getCurrentQuestInfo().stepNumber);
//     }
//   }

//   public deinitialize(): void {
//     this._streamSubscription?.cancel();

//     if (this._closeButton)
//       this._streamSubscription1?.cancel();

//     if (this._mapLeftBtn && this._mapRightBtn) {
//       this._streamSubscription2?.cancel();
//       this._streamSubscription3?.cancel();
//     }
//   }

//   private mapLeftBtnOnClicked(): void {
//     this._activator.end();
//     const endValue = this.calculateEndDestinationPos(false);
//     this._mapRightBtn.touchable = endValue < this._mapEndPos;
//     this._mapLeftBtn.touchable = endValue > 0.0;
//     const incrementWinAction = ActionFactory.CreateInterpolateDouble();
//     incrementWinAction.withValues(this._mapProgressBar.progress, endValue);
//     incrementWinAction.withDurationMs(500);
//     incrementWinAction.withInterpolateFunction((value1, value2, amount) => {
//       value2 -= value1;
//       return -value2 * amount * (amount - 2.0) + value1;
//     });
//     incrementWinAction.valueChange.listen((v) => { this._mapProgressBar.progress = v; });
//     this._activator.action = new SequenceSimpleAction([ incrementWinAction, new FunctionAction(() => this._activator.stop()) ]);
//     this._activator.start();
//   }

//   private mapRightBtnOnClicked(): void {
//     this._activator.end();
//     const endValue = this.calculateEndDestinationPos(true);
//     this._mapRightBtn.touchable = endValue < this._mapEndPos;
//     this._mapLeftBtn.touchable = endValue > 0.0;
//     const incrementWinAction = ActionFactory.CreateInterpolateDouble();
//     incrementWinAction.withValues(this._mapProgressBar.progress, endValue);
//     incrementWinAction.withDurationMs(500);
//     incrementWinAction.withInterpolateFunction((value1, value2, amount) => {
//       value2 -= value1;
//       return -value2 * amount * (amount - 2.0) + value1;
//     });
//     incrementWinAction.valueChange.listen((v) => {
//       if (v > this._mapEndPos) v = this._mapEndPos;
//       this._mapProgressBar.progress = v;
//     });
//     this._activator.action =
//         new SequenceSimpleAction([ incrementWinAction, new FunctionAction(() => this._activator.stop()) ]);
//     this._activator.start();
//   }

//   private closeButtonClicked(): void {
//     this.closeMap();
//   }

//   public get getCurrentMapConfig(): IMapConfiguration {
//     return this._mapConfiguration;
//   }

//   public openMap(): void {
//     if (this._mapLeftBtn && this._mapRightBtn) {
//       this._mapLeftBtn.touchable = true;
//       this._mapRightBtn.touchable = true;
//     }
//     this._activator.end();
//     const state = this._isShown ? "off" : "on";
//     this._isShown = !this._isShown;
//     if (this._isShown) {
//       const page = this.getCurrentPage();
//       this.setCurrentMapProgressStep(page);
//     }

//     if (this._mapLeftBtn && this._mapRightBtn) {
//       this._mapRightBtn.touchable = this._mapProgressBar.progress < this._mapEndPos - this._mapStep;
//       this._mapLeftBtn.touchable = this._mapProgressBar.progress > 0.0;
//     }

//     this._map.touchable = this._isShown;
//     this._map.stateMachine.sendEvent(new ParamEvent<string>(state));
//   }

//   private calculateEndDestinationPos(nextPosition: boolean): number {
//     return (this._mapProgressBar.progress  + (nextPosition ? this._mapStep : -this._mapStep));
//   }

//   private setCurrentMapProgressStep(page: number): void {
//     if (this._mapConfiguration.hasProgressBar) {
//       this._mapProgressBar.progress = page * this._mapStep;
//     }
//   }

//   private updateStepProgress(page: number): void {
//     if (this._mapConfiguration.hasProgressBar) {
//       this._mapProgressBar.progress = page * this._mapStep;
//     }
//   }

//   private updateStepProgressWithInterpolation(page: number): void {
//     this._activator.end();
//     const endValue = this.calculateEndDestinationPos(page > this.currentStep);
//     const incrementWinAction = ActionFactory.CreateInterpolateDouble();
//     incrementWinAction.withValues(this._mapProgressBar.progress, endValue);
//     incrementWinAction.withDurationMs(500);
//     incrementWinAction.withInterpolateFunction((value1, value2, amount) => {
//       value2 -= value1;
//       return -value2 * amount * (amount - 2.0) + value1;
//     });
//     incrementWinAction.valueChange.listen((v) => {
//       if (v > this._mapEndPos) v = this._mapEndPos;
//       this._mapProgressBar.progress = v;
//     });
//     this._activator.action =
//     new SequenceSimpleAction([ incrementWinAction, new FunctionAction(() => this._activator.stop()) ]);
//     this._activator.start();
//   }

//   private getCurrentPage(): number {
//     let page = 0;
//     let items = 0;
//     for (let p = 0; p < this._mapPages.length; p++) {
//       items += this._mapPages[p];
//       page = p;
//       if (this.currentStep < items) break;
//     }
//     return page;
//   }

//   public openMapOnStep(step: number): void {
//     const page = this.getCurrentPage();
//     this._map.stateMachine.sendEvent(new ParamEvent<string>("on"));
//     this._map.touchable = false;
//     this.setCurrentMapProgressStep(page);
//     if (this._mapLeftBtn && this._mapRightBtn) {
//       this._mapLeftBtn.touchable = false;
//       this._mapRightBtn.touchable = false;
//     }

//     this._isShown = true;
//   }

//   public closeMap(): void {
//     this._activator.end();
//     this._map.stateMachine.sendEvent(new ParamEvent<string>("off"));
//     this._isShown = false;
//   }

//   public isMapShown(): boolean {
//     return this._isShown;
//   }

//   public blockButtons(block: boolean): void {
//     this._mapBtn.touchable = !block;
//   }

//   public updateCurrentStep(step: number): void {
//     this.currentStep = step;
//   }

//   public setMapStep(step: number): void {
//     this.updateCurrentStep(step);
//     if (step == 0)
//       for (let i = 0; i < this._stepCounts; i++)
//         this._map_steps.get(StringUtils.format(this._mapConfiguration.stepNameFormat, [ i ])).stateMachine.sendEvent(new ParamEvent<string>("default"));
//     else
//       for (let i = 0; i < step; i++)
//         this._map_steps.get(StringUtils.format(this._mapConfiguration.stepNameFormat, [ i ])).stateMachine.sendEvent(new ParamEvent<string>(this._mapConfiguration.stepActiveState));
//   }

//   private _stateMachineListener: StateMachineListener;

//   public get stateMachineListener(): StateMachineListener { return this._stateMachineListener; }
// }
