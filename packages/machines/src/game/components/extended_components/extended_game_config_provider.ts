// import { BaseSlotFeatureConfig } from './base_slot_feature_config';
// import { GameConfigComponent } from '../game_config_component';
// import { Container, Vector2 } from '@cgs/syd';
// import { ISlotGame } from '../../../reels_engine/i_slot_game';
// import { T_ISlotGame } from '../../../type_definitions';

// export class ExtendedGameConfigProvider<
//   T extends BaseSlotFeatureConfig,
// > extends GameConfigComponent {
//   private _slotFeatureConfig: T;

//   public get slotFeatureConfig(): T {
//     return this._slotFeatureConfig;
//   }

//   constructor(c: Container, displayResolution: Vector2) {
//     super(c, displayResolution);
//     const game = c.forceResolve<ISlotGame>(T_ISlotGame);
//     const rawConfig = game.gameConfig;

//     if (rawConfig.has('slotFeatureConfiguration')) {
//       const slotFeatureConfig = rawConfig.get('slotFeatureConfiguration');

//       // TODO: Uses reflection
//       this._slotFeatureConfig = ModelReflection.fromMap(T, slotFeatureConfig);
//       c.bind(T).toConstantValue(this._slotFeatureConfig);
//     }
//   }
// }
