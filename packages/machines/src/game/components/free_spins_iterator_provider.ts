// import { ISpinResponse, InternalFreeSpinsInfo, InternalCollapsingSpecGroup } from "@cgs/common";
// import { BitmapTextSceneObject, Container } from "@cgs/syd";
// import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
// import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
// import { GameStateMachineStates } from '../../reels_engine/state_machine/game_state_machine';
// import { T_IGameStateMachineProvider, T_ResourcesComponent, T_GameStateMachineNotifierComponent } from '../../type_definitions';
// import { AbstractListener, GameStateMachineNotifierComponent } from "./game_state_machine_notifier_component";
// import { ResourcesComponent } from "./resources_component";

// export class FreeSpinsIteratorProvider implements AbstractListener {
//   private static readonly DefaultIterationValue: number = 0;
//   private static readonly DefaultOffset: number = 0;
//   private static readonly OneStepOffset: number = 1;

//   private _iterator: BitmapTextSceneObject;
//   private _gmStMach: CollapseGameStateMachine;
//   private _minCollapsesCountGetFs: number;
//   private _marker: string;

//   private get _currentResponse(): ISpinResponse { return this._gmStMach.curResponse; }
//   private get _freeSpinsInfo(): InternalFreeSpinsInfo { return this._currentResponse.freeSpinsInfo!; }
//   private get _collapsingGroup(): InternalCollapsingSpecGroup { return this._currentResponse.additionalData as InternalCollapsingSpecGroup; }
//   private _getFreeSpinsCount(): number { return this._freeSpinsInfo ? this._freeSpinsInfo.currentFreeSpinsGroup!.count! : FreeSpinsIteratorProvider.DefaultIterationValue; }
//   private _addFreeSpins: number = 0;

//   constructor(container: Container, minCollapsesCountGetFs: number = 2, scattersStaticFreeSpins: number = 4, marker: string = "additionalFreeSpins") {
//     this._gmStMach = container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider).gameStateMachine as CollapseGameStateMachine;
//     this._iterator = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root.findById("iterator");
//     container.forceResolve<GameStateMachineNotifierComponent>(T_GameStateMachineNotifierComponent).notifier.AddListener(this);

//     this._gmStMach.endCollapseState.entered.listen((_) => {
//       if (this._collapsingGroup && this._collapsingGroup.collapsingCounter == this._collapsingGroup.groups.length) {
//         const currentGroup = this._collapsingGroup.groups[this._collapsingGroup.collapsingCounter - 1].specialSymbolGroups;
//         if (currentGroup) {
//           const addFreeSpinsRound = currentGroup.firstWhere((x) => x.type == this._marker, () => null);
//           if (addFreeSpinsRound) {
//             this._addFreeSpins = !this._freeSpinsInfo || this._freeSpinsInfo.event != "collapsingAdded"
//               ? addFreeSpinsRound.collectCount
//               : FreeSpinsIteratorProvider.DefaultIterationValue;

//             const offset = this._freeSpinsInfo && this._freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsAdded
//               ? FreeSpinsIteratorProvider.OneStepOffset - scattersStaticFreeSpins
//               : this._freeSpinsInfo && this._freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted && this._freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsFinished
//                 ? FreeSpinsIteratorProvider.OneStepOffset
//                 : FreeSpinsIteratorProvider.DefaultOffset;

//             this._setIteratorsText(offset);
//           }
//         }
//       }
//     });

//     this._gmStMach.stop.entered.listen((_) => {
//       if (this._freeSpinsInfo && this._freeSpinsInfo.event == "collapsingAdded") {
//         this._addFreeSpins = FreeSpinsIteratorProvider.DefaultIterationValue;

//         if (!this._collapsingGroup || this._collapsingGroup.groups.length < this._minCollapsesCountGetFs) {
//           this._setIteratorsText();
//         }
//       }
//     });
//   }

//   public OnStateEntered(slotState: string): void {
//     switch (slotState) {
//       case GameStateMachineStates.InitGame:
//         this._onInitEntered();
//         break;

//       case GameStateMachineStates.Accelerate:
//         this._onAccelerateEntered();
//         break;

//       case GameStateMachineStates.EndOfFreeSpinsPopup:
//         this._onEndFreeSpinsPopupEntered();
//         break;
//     }
//   }

//   public OnStateExited(slotState: string): void {
//     switch (slotState) {
//       case GameStateMachineStates.BeginFreeSpinsPopup:
//         this._onBeginFreeSpinsPopupExited();
//         break;
//     }
//   }

//   private _onInitEntered(): void {
//     if (this._currentResponse.specialSymbolGroups) {
//       const addFreeSpinsRound = this._currentResponse.specialSymbolGroups.firstWhere((x) => x.type == this._marker, () => null);

//       if (addFreeSpinsRound) {
//         this._addFreeSpins = addFreeSpinsRound.collectCount;
//       }
//     }
//     this._setIteratorsText();
//   }

//   private _onAccelerateEntered(): void {
//     this._setIteratorsText();
//   }

//   private _onEndFreeSpinsPopupEntered(): void {
//     this._addFreeSpins = FreeSpinsIteratorProvider.DefaultIterationValue;
//     this._setIteratorsText();
//   }

//   private _onBeginFreeSpinsPopupExited(): void {
//     const offset = this._freeSpinsInfo && this._freeSpinsInfo.event == FreeSpinsInfoConstants.FreeSpinsAdded
//       ? FreeSpinsIteratorProvider.OneStepOffset
//       : FreeSpinsIteratorProvider.DefaultOffset;

//     if (!this._collapsingGroup || this._collapsingGroup.groups.length < this._minCollapsesCountGetFs) {
//       this._addFreeSpins = FreeSpinsIteratorProvider.DefaultIterationValue;
//     }

//     this._setIteratorsText(offset);
//   }

//   private _setIteratorsText(offset: number = FreeSpinsIteratorProvider.DefaultOffset): void {
//     this._iterator.text = (this._addFreeSpins + this._getFreeSpinsCount() + offset).toString();
//   }
// }
