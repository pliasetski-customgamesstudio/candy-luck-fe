// import { EventDispatcher, EventStream } from 'syd';
// import { GameStateMachine } from 'machines';
// import {
//   AbstractIconResourceProvider,
//   ResourcesComponent,
//   IconModelComponent,
//   DynamicDrawOrdersProvider,
// } from 'shared';
// import {
//   IAnimationBasedGameConfig,
//   IAnimationGameEngineParams,
//   IInitialIconsProvider,
//   IGameStateMachineProvider,
//   ISlotGameEngine,
//   SpinResponse,
// } from 'common';

// export class AnimationBasedGameEngine implements ISlotGameEngine {
//   private _gameStateMachine: GameStateMachine<SpinResponse>;
//   private _iconModel: IconModel;
//   private gameConfig: IAnimationBasedGameConfig;
//   private _gameResourceProvider: ResourcesComponent;
//   private iconResourceProvider: AbstractIconResourceProvider;
//   private _dynamicDrawOrdersProvider: DynamicDrawOrdersProvider;
//   private _engineParams: IAnimationGameEngineParams;
//   private _outgoinAnimationDuration: number;
//   private _stopAnimationDuration: number;
//   private _respinAnimationDuration: number;
//   private _stopAfterRespinAnimationDuration: number;

//   private readonly container: Container;
//   private readonly entityEngine: EntitiesEngine;

//   public active: boolean;
//   public root: SceneObject;
//   public slotPlaceholderNode: SceneObject;
//   public iconsStopEventTracker: SceneObject;
//   public respinPlaceholderNode: SceneObject;
//   public respinIconsStopEventTracker: SceneObject;
//   public symbolPositionCache: Map<number, number> = new Map<number, number>();
//   public respinSymbolPositionCache: Map<number, number> = new Map<number, number>();
//   public lockedStateIcons: number[] = [];

//   public isSlotAccelerated: boolean = false;
//   public isSlotStopped: boolean = true;

//   private readonly _iconStopped: EventDispatcher<number> = new EventDispatcher<number>();
//   private readonly _respinIconStopped: EventDispatcher<number> = new EventDispatcher<number>();
//   public get iconStopped(): EventStream<number> {
//     return this._iconStopped.eventStream;
//   }
//   public get respinIconStopped(): EventStream<number> {
//     return this._respinIconStopped.eventStream;
//   }

//   public get showAnimName(): string {
//     return this._engineParams.showAnimName;
//   }
//   public get hideAnimName(): string {
//     return this._engineParams.hideAnimName;
//   }
//   public get idleStateName(): string {
//     return this._engineParams.idleStateName;
//   }
//   public get iconPlaceholderId(): string {
//     return this._engineParams.iconPlaceholderId;
//   }
//   public get iconContainerIdFormat(): string {
//     return this._engineParams.iconContainerIdFormat;
//   }
//   public get iconIdFormat(): string {
//     return this._engineParams.iconIdFormat;
//   }

//   private get outgoingAnimationAction(): IntervalAction {
//     return new SequenceAction([
//       new FunctionAction(() => {
//         this.isSlotStopped = false;
//         this.startOutgoingAnimation();
//       }),
//       new EmptyAction().withDuration(this._outgoinAnimationDuration),
//       new FunctionAction(() => (this.isSlotAccelerated = true)),
//     ]);
//   }

//   private get stopAnimationAction(): IntervalAction {
//     return new SequenceAction([
//       new FunctionAction(() => (this.isSlotAccelerated = false)),
//       new FunctionAction(() => this.startStoppingAnimation()),
//       new EmptyAction().withDuration(this._stopAnimationDuration),
//       new FunctionAction(() => (this.isSlotStopped = true)),
//     ]);
//   }

//   private get respinAnimationAction(): IntervalAction {
//     return new SequenceAction([
//       new FunctionAction(() => {
//         this.isSlotStopped = false;
//         this.startRespinAnimation();
//       }),
//       new EmptyAction().withDuration(this._outgoinAnimationDuration),
//       new FunctionAction(() => (this.isSlotAccelerated = true)),
//     ]);
//   }

//   private get stopAfterRespinAnimationAction(): IntervalAction {
//     return new SequenceAction([
//       new FunctionAction(() => (this.isSlotAccelerated = false)),
//       new FunctionAction(() => this.startStoppingAfterRespinAnimation()),
//       new EmptyAction().withDuration(this._stopAnimationDuration),
//       new FunctionAction(() => (this.isSlotStopped = true)),
//     ]);
//   }

//   constructor(
//     container: Container,
//     entityEngine: EntitiesEngine,
//     engineParams: IAnimationGameEngineParams
//   ) {
//     this.container = container;
//     this.entityEngine = entityEngine;
//     this._engineParams = engineParams;

//     this.iconResourceProvider =
//       container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider);
//     this._gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
//     this.root = this._gameResourceProvider.root;
//     this.slotPlaceholderNode = this.root.findById(this._engineParams.slotPlaceholderId);
//     this.respinPlaceholderNode =
//       this._engineParams.respinSlotPlaceholderId &&
//       this._engineParams.respinSlotPlaceholderId.length > 0
//         ? this.root.findById(this._engineParams.respinSlotPlaceholderId)
//         : null;

//     this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
//     this.gameConfig = container.resolve(IAnimationBasedGameConfigProvider).gameConfig;
//     this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
//       T_IGameStateMachineProvider
//     ).gameStateMachine;
//     this._dynamicDrawOrdersProvider = container.resolve(DynamicDrawOrdersProvider);

//     const initialIconsProvider = container.resolve(IInitialIconsProvider);
//     this.setInitialIcons(
//       initialIconsProvider.getInitialIcons(
//         this.gameConfig.groupsCount * this.gameConfig.maxIconsPerGroup
//       )
//     );

//     if (this.slotPlaceholderNode) {
//       this._outgoinAnimationDuration =
//         (
//           this.slotPlaceholderNode.stateMachine.findById(this.hideAnimName)
//             .enterAction as IntervalAction
//         ).duration + this.gameConfig.afterOutgoingAnimationDelay;
//       this._stopAnimationDuration =
//         (
//           this.slotPlaceholderNode.stateMachine.findById(this.showAnimName)
//             .enterAction as IntervalAction
//         ).duration + this.gameConfig.afterStopAnimationdelay;

//       this.iconsStopEventTracker = this.slotPlaceholderNode.findById(
//         this._engineParams.iconsStopEventTrackerId
//       );
//       if (this.iconsStopEventTracker) {
//         this.subscribeToIconStopEvents(this.iconsStopEventTracker, this._iconStopped);
//       }
//     }

//     if (this.respinPlaceholderNode) {
//       this._respinAnimationDuration =
//         (
//           this.respinPlaceholderNode.stateMachine.findById(this.hideAnimName)
//             .enterAction as IntervalAction
//         ).duration + this.gameConfig.afterOutgoingAnimationDelay;
//       this._stopAfterRespinAnimationDuration =
//         (
//           this.respinPlaceholderNode.stateMachine.findById(this.showAnimName)
//             .enterAction as IntervalAction
//         ).duration + this.gameConfig.afterStopAnimationdelay;

//       this.respinIconsStopEventTracker = this.respinPlaceholderNode.findById(
//         this._engineParams.iconsStopEventTrackerId
//       );
//       if (this.respinIconsStopEventTracker) {
//         this.subscribeToIconStopEvents(this.respinIconsStopEventTracker, this._respinIconStopped);
//       }
//     }

//     this.active = true;
//   }

//   public getInitialIcons(): number[][] {
//     const initialIconsProvider = this.container.resolve(IInitialIconsProvider);
//     return initialIconsProvider.getInitialIcons(
//       this.gameConfig.groupsCount * this.gameConfig.maxIconsPerGroup
//     );
//   }

//   private subscribeToIconStopEvents(
//     tracker: SceneObject,
//     iconStopped: EventDispatcher<number>
//   ): void {
//     if (tracker.stateMachine) {
//       for (let pos = 0; pos < this.gameConfig.iconsCount; pos++) {
//         const posState = tracker.stateMachine.findById(pos.toString());
//         if (posState) {
//           const stopIconState = posState.findById(
//             StringUtils.format(this._engineParams.iconStopStateFormat, [pos.toString()])
//           );
//           if (stopIconState) {
//             const position = pos;
//             stopIconState.entered.listen((e) => iconStopped.dispatchEvent(position));
//           }
//         }
//       }
//     }
//   }

//   private getIconIdByPosition(position: number): number {
//     return this.symbolPositionCache.has(position) ? this.symbolPositionCache.get(position) : -1;
//   }

//   private getRespinIconIdByPosition(position: number): number {
//     return this.respinSymbolPositionCache.has(position)
//       ? this.respinSymbolPositionCache.get(position)
//       : -1;
//   }

//   private getIconByPosition(position: number): SceneObject {
//     if (this.symbolPositionCache.has(position)) {
//       const symbolId = this.symbolPositionCache.get(position);
//       const container = this.slotPlaceholderNode.findById(
//         StringUtils.format(this.iconContainerIdFormat, [position.toString()])
//       );

//       return container.findById(StringUtils.format(this.iconIdFormat, [symbolId.toString()]));
//     }

//     return null;
//   }

//   private getRespinIconByPosition(position: number): SceneObject {
//     if (this.respinSymbolPositionCache.has(position)) {
//       const symbolId = this.respinSymbolPositionCache.get(position);
//       const container = this.respinPlaceholderNode.findById(
//         StringUtils.format(this.iconContainerIdFormat, [position.toString()])
//       );

//       return container.findById(StringUtils.format(this.iconIdFormat, [symbolId.toString()]));
//     }

//     return null;
//   }

//   private setIconDrawOrder(position: number, z: number): void {
//     const containerId = StringUtils.format(this.iconContainerIdFormat, [position.toString()]);
//     const container = this.slotPlaceholderNode.findById(containerId);

//     if (container) {
//       container.z = z;
//     }
//   }

//   private stopAllAnimations(): void {
//     this.slotPlaceholderNode.stateMachine.switchToState(this.idleStateName);
//     if (this.respinPlaceholderNode) {
//       this.respinPlaceholderNode.stateMachine.switchToState(this.idleStateName);
//     }
//   }

//   private switchRespinPlaceholderToIdle(): void {
//     if (this.respinPlaceholderNode) {
//       this.respinPlaceholderNode.stateMachine.switchToState(this.idleStateName);
//     }
//   }

//   private switchAllIconsToState(state: string): void {
//     for (let i = 0; i < this.gameConfig.iconsCount; i++) {
//       const icon = this.getIconByPosition(i);
//       if (icon && icon.stateMachine && !this.isIconStateLocked(i)) {
//         icon.stateMachine.switchToState(state);
//       }
//     }
//   }

//   private getAnimationIconIds(position: number): number[] {
//     return [this.getIconIdByPosition(position)];
//   }

//   private getSoundIconIds(position: number): number[] {
//     return [this.getIconIdByPosition(position)];
//   }

//   private startOutgoingAnimation(): void {
//     this.slotPlaceholderNode.stateMachine.switchToState(this.hideAnimName);
//   }

//   private startStoppingAnimation(): void {
//     this.symbolPositionCache.clear();

//     for (let group = 0; group < this.gameConfig.groupsCount; group++) {
//       for (let posInGroup = 0; posInGroup < this.gameConfig.maxIconsPerGroup; posInGroup++) {
//         const symbolId = this._gameStateMachine.curResponse.viewReels[group][posInGroup];
//         const position = posInGroup * this.gameConfig.groupsCount + group;
//         this.removeItemIcon(position);
//         this.setItemIcon(position, symbolId);
//         this.symbolPositionCache.set(position, symbolId);
//       }
//     }

//     this.slotPlaceholderNode.stateMachine.switchToState(this.showAnimName);
//   }

//   private startRespinAnimation(): void {
//     if (this.respinPlaceholderNode) {
//       this.respinPlaceholderNode.stateMachine.switchToState(this.hideAnimName);
//     }
//   }

//   private startStoppingAfterRespinAnimation(): void {
//     if (this.respinPlaceholderNode) {
//       this.respinPlaceholderNode.stateMachine.switchToState(this.showAnimName);
//     }
//   }

//   private clearIcons(): void {
//     for (let group = 0; group < this.gameConfig.groupsCount; group++) {
//       for (let posInGroup = 0; posInGroup < this.gameConfig.maxIconsPerGroup; posInGroup++) {
//         const position = group * this.gameConfig.maxIconsPerGroup + posInGroup;
//         this.removeItemIcon(position);
//       }
//     }
//   }

//   private clearRespinIcons(): void {
//     this.respinSymbolPositionCache.clear();

//     for (let group = 0; group < this.gameConfig.groupsCount; group++) {
//       for (let posInGroup = 0; posInGroup < this.gameConfig.maxIconsPerGroup; posInGroup++) {
//         const position = group * this.gameConfig.maxIconsPerGroup + posInGroup;
//         this.removeRespinItemIcon(position);
//       }
//     }
//   }

//   private switchItemToState(position: number, state: string): void {
//     const containerId = StringUtils.format(this.iconContainerIdFormat, [position.toString()]);
//     const container = this.slotPlaceholderNode.findById(containerId);

//     if (container && container.stateMachine) {
//       container.stateMachine.switchToState(state);
//     }
//   }

//   private setInitialIcons(symbolIds: number[]): void {
//     if (this.slotPlaceholderNode) {
//       for (let i = 0; i < this.gameConfig.groupsCount; i++) {
//         for (let j = 0; j < this.gameConfig.maxIconsPerGroup; j++) {
//           const itemIndex = i + this.gameConfig.groupsCount * j;
//           const index = j + this.gameConfig.maxIconsPerGroup * i;
//           this.setItemIcon(itemIndex, symbolIds[index]);
//         }
//       }

//       this.slotPlaceholderNode.stateMachine.switchToState(this.idleStateName);
//     }
//   }

//   private setItemIcon(position: number, symbolId: number, state: string = null): void {
//     this.symbolPositionCache.set(position, symbolId);
//     const containerId = StringUtils.format(this.iconContainerIdFormat, [position.toString()]);
//     const container = this.slotPlaceholderNode.findById(containerId);
//     const icons = this.iconResourceProvider.getIconNodes(
//       StringUtils.format(this.iconIdFormat, [symbolId.toString()])
//     );
//     this.addIconToContainer(position, container, icons, state);
//   }

//   private setExistingItemIcon(
//     position: number,
//     symbolId: number,
//     icon: SceneObject,
//     state: string = null
//   ): void {
//     this.symbolPositionCache.set(position, symbolId);
//     const containerId = StringUtils.format(this.iconContainerIdFormat, [position.toString()]);
//     const container = this.slotPlaceholderNode.findById(containerId);
//     this.addIconToContainer(position, container, [icon], state);
//   }

//   private setRespinItemIcon(position: number, symbolId: number, state: string = null): void {
//     this.respinSymbolPositionCache.set(position, symbolId);
//     const containerId = StringUtils.format(this.iconContainerIdFormat, [position.toString()]);
//     const container = this.respinPlaceholderNode.findById(containerId);
//     const icons = this.iconResourceProvider.getIconNodes(
//       StringUtils.format(this.iconIdFormat, [symbolId.toString()])
//     );
//     this.addIconToContainer(position, container, icons, state);
//   }

//   private setExistingRespinItemIcon(
//     position: number,
//     symbolId: number,
//     icon: SceneObject,
//     state: string = null
//   ): void {
//     this.respinSymbolPositionCache.set(position, symbolId);
//     const containerId = StringUtils.format(this.iconContainerIdFormat, [position.toString()]);
//     const container = this.respinPlaceholderNode.findById(containerId);
//     this.addIconToContainer(position, container, [icon], state);
//   }

//   private removeItemIcon(position: number): void {
//     const containerId = StringUtils.format(this.iconContainerIdFormat, [position.toString()]);
//     const container = this.slotPlaceholderNode.findById(containerId);
//     this.clearContainer(container);
//   }

//   private removeRespinItemIcon(position: number): void {
//     const containerId = StringUtils.format(this.iconContainerIdFormat, [position.toString()]);
//     const container = this.respinPlaceholderNode.findById(containerId);
//     this.clearContainer(container);
//   }

//   private lockIconState(position: number): void {
//     if (!this.lockedStateIcons.includes(position)) {
//       this.lockedStateIcons.push(position);
//     }
//   }

//   private unlockIconState(position: number): void {
//     const index = this.lockedStateIcons.indexOf(position);
//     if (index !== -1) {
//       this.lockedStateIcons.splice(index, 1);
//     }
//   }

//   private unlockAllIconStates(): void {
//     this.lockedStateIcons = [];
//   }

//   private isIconStateLocked(position: number): boolean {
//     return this.lockedStateIcons.includes(position);
//   }

//   private addIconToContainer(
//     position: number,
//     container: SceneObject,
//     icons: SceneObject[],
//     state: string
//   ): void {
//     if (icons) {
//       for (const icon of icons) {
//         if (container && icon) {
//           const placeholder = container.findById(this.iconPlaceholderId);
//           if (
//             placeholder &&
//             this.iconPlaceholderId &&
//             this.iconPlaceholderId.length > 0
//           ) {
//             placeholder.addChild(icon);
//             container.z = icon.z;
//             if (state && !this.isIconStateLocked(position)) {
//               icon.stateMachine.switchToState(state);
//             }
//           } else if (!this.iconPlaceholderId || this.iconPlaceholderId.length === 0) {
//             container.addChild(icon);
//             container.z = icon.z;
//             if (state && !this.isIconStateLocked(position)) {
//               icon.stateMachine.switchToState(state);
//             }
//           } else {
//             icon.active = false;
//           }
//         }
//       }
//     }
//   }

//   private clearContainer(container: SceneObject): void {
//     if (container) {
//       const placeholder = container.findById(this.iconPlaceholderId);
//       if (
//         placeholder &&
//         this.iconPlaceholderId &&
//         this.iconPlaceholderId.length > 0
//       ) {
//         placeholder.removeAllChilds();
//       } else if (!this.iconPlaceholderId || this.iconPlaceholderId.length === 0) {
//         container.removeAllChilds();
//       }
//     }
//   }

//   public update(dt: number): void {
//     this.entityEngine.update(dt);
//   }
// }
