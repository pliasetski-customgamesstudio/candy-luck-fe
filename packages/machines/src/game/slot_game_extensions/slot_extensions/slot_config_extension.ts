// import { BaseSlotFeatureConfig } from '../../components/extended_components/base_slot_feature_config';
// import { ICoordinateSystemInfoProvider } from '@cgs/common';
// import { ISlotExtension } from '../i_slot_extension';
// import { OverridingComponentProvider } from '../../base_slot_game';
// import { ExtendedGameConfigProvider } from '../../components/extended_components/extended_game_config_provider';
// import { T_IGameConfigProvider } from '../../../type_definitions';

// export class SlotConfigExtension<T extends BaseSlotFeatureConfig> implements ISlotExtension {
//   private _coordinateSystemProvider: ICoordinateSystemInfoProvider;

//   constructor(coordinateSystemProvider: ICoordinateSystemInfoProvider) {
//     this._coordinateSystemProvider = coordinateSystemProvider;
//   }

//   getInitialRequiredTypes(): Array<any> {
//     return [];
//   }

//   getExtensionComponents(): Array<OverridingComponentProvider> {
//     const components: Array<OverridingComponentProvider> = [
//       new OverridingComponentProvider(
//         (c) =>
//           new ExtendedGameConfigProvider<T>(c, this._coordinateSystemProvider.displayResolution),
//         T_IGameConfigProvider
//       ),
//     ];

//     return components;
//   }
// }
