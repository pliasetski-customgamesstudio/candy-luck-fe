// import { ISlotExtension } from '../i_slot_extension';
// import { ExtendedSlotGameParams } from '../extended_slot_game_params';
// import { SceneCommon } from '@cgs/common';
//
// export class FreeSpinsExtension implements ISlotExtension {
//   private _fsNames: string[];
//   private _slotGameParams: ExtendedSlotGameParams;
//   private _ignoreDefaultStartFSPopup: boolean = false;
//   private _ignoreDefaultEndFSPopup: boolean = false;
//   private _sceneCommon: SceneCommon;
//   private _useViewUpdater: boolean;
//
//   get customFSReels(): boolean {
//     return !!this.customFreeSpinsReelSet?.size;
//   }
//
//   private _customFreeSpinsReelSet: Map<string, number[][]> | null = null;
//
//   get customFreeSpinsReelSet(): Map<string, number[][]> | null {
//     return this._customFreeSpinsReelSet;
//   }
//   set customFreeSpinsReelSet(value: Map<string, number[][]> | null) {
//     this._customFreeSpinsReelSet = value;
//   }
//
//   constructor(
//     slotGameParams: ExtendedSlotGameParams,
//     sceneCommon: SceneCommon,
//     {
//       ignoreDefaultStartFSPopup = false,
//       ignoreDefaultEndFSPopup = false,
//       customFreeSpinsReelSet = null,
//       fsNames = null,
//       useViewUpdater = false
//     }
//   ) {
//     this._sceneCommon = sceneCommon;
//     this.customFreeSpinsReelSet = customFreeSpinsReelSet;
//     this._fsNames = fsNames;
//     this._slotGameParams = slotGameParams;
//     this._ignoreDefaultStartFSPopup = ignoreDefaultStartFSPopup;
//     this._ignoreDefaultEndFSPopup = ignoreDefaultEndFSPopup;
//     this._useViewUpdater = useViewUpdater;
//   }
//
//   getInitialRequiredTypes(): Type[] {
//     const list: Type[] = [];
//     list.push(IFreeSpinsModeProvider);
//     list.push(ElementsStateController);
//
//     if (!this._ignoreDefaultEndFSPopup) list.push(EndFreeSpinsPopupComponent);
//     if (!this._ignoreDefaultStartFSPopup) list.push(StartFreeSpinsPopupComponent);
//     if (this.customFSReels) list.push(GameConfigController);
//
//     return list;
//   }
//
//   getExtensionComponents(): OverridingComponentProvider[] {
//     const freeSpinsMode = this._fsNames.length > 1;
//
//     return [
//       new OverridingComponentProvider(
//         (c) =>
//           new ExtendedStartFreeSpinsPopupProvider(c, this._sceneCommon, {
//             startWithButton: true,
//             stopBackgroundSoundOnStart: true,
//             useFreeSpinMode: freeSpinsMode,
//             useViewUpdater: this._useViewUpdater
//           }),
//         StartFreeSpinsPopupComponent
//       ),
//       new OverridingComponentProvider(
//         (c) =>
//           new ExtendedEndFreeSpinsPopupProvider(c, this._sceneCommon, {
//             stopBackgroundSound: true,
//             useFreespinMode: freeSpinsMode,
//             useViewUpdater: this._useViewUpdater
//           }),
//         EndFreeSpinsPopupComponent
//       ),
//       new OverridingComponentProvider(
//         (c) =>
//           new CustomFreeSpinsModeProvider(c, 'reel_bg', '{0}', this._fsNames),
//         IFreeSpinsModeProvider
//       ),
//       new OverridingComponentProvider(
//         (c) =>
//           new ElementsStateController(
//             c,
//             ElementsStateController.defaultStates('table', ['reel_bg'])
//           ),
//         ElementsStateController
//       ),
//       this.getGameConfigController()
//     ];
//   }
//
//   private getGameConfigController(): OverridingComponentProvider {
//     if (this.customFSReels) {
//       return new OverridingComponentProvider((c) => {
//         return new GameConfigController(c, (freeSpinName) => {
//           const gameStateMachine = c.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider).gameStateMachine;
//           const currentResponse = gameStateMachine.curResponse;
//           freeSpinName =
//             !freeSpinName || !this.customFreeSpinsReelSet.has(freeSpinName)
//               ? 'free'
//               : freeSpinName;
//           const result: number[][] = new Array(this._slotGameParams.reelsCount);
//           for (let i = 0; i < this._slotGameParams.reelsCount; i++) {
//             result[i] = this.customFreeSpinsReelSet.get(freeSpinName)[i];
//           }
//
//           return result;
//         });
//       }, GameConfigController);
//     }
//     return new OverridingComponentProvider(
//       (c) => new ExtendableGameConfigController(c),
//       GameConfigController
//     );
//   }
// }
