// import { ISlotExtension } from '../i_slot_extension';
// import { ExtendedSlotGameParams } from '../extended_slot_game_params';
// import { OverridingComponentProvider } from '../../base_slot_game';
// import { FeatureWinHolder } from '../../components/extended_components/dynamic_win_component/feature_win_holder';
// import { WinTextControllerWithDynamicWin } from '../../components/extended_components/dynamic_win_component/total_win_with_dynamic_win_machine_listener';
// import { SpinResponseWithUpdatersProvider } from '../../components/extended_components/spin_response_with_updaters_provider';
//
// export class DynamicWinExtension<TSpinTypeIn, TSpinTypeOut> implements ISlotExtension {
//   private _specGroupsWithFeatureWins: Map<string, string[]>;
//   private _reelsSlotGameParams: ExtendedSlotGameParams;
//
//   constructor(
//     slotGameParams: ExtendedSlotGameParams,
//     specGroupsWithFeatureWins: Map<string, string[]>
//   ) {
//     this._reelsSlotGameParams = slotGameParams;
//     this._specGroupsWithFeatureWins = specGroupsWithFeatureWins;
//   }
//
//   getInitialRequiredTypes(): Type[] {
//     return [IFeatureWinHolder];
//   }
//
//   getExtensionComponents(): OverridingComponentProvider[] {
//     return [
//       new OverridingComponentProvider(
//         (container) =>
//           new FeatureWinHolder(
//             this._specGroupsWithFeatureWins,
//             container.forceResolve<IBalanceUpdater>(T_IBalanceUpdater)
//           ),
//         IFeatureWinHolder
//       ),
//       new OverridingComponentProvider(
//         (container) =>
//           new WinTextControllerWithDynamicWin(container, this._reelsSlotGameParams.waysCount),
//         WinTextController
//       ),
//       new OverridingComponentProvider(
//         (c) =>
//           new SpinResponseWithUpdatersProvider(c, this._reelsSlotGameParams, [
//             c.resolve(IFeatureWinHolder),
//           ]),
//         ResponseProvider
//       ),
//     ];
//   }
// }
