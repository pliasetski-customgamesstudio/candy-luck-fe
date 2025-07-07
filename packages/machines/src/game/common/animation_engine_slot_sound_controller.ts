// import { Container } from "@cgs/syd";
// import { IconsSoundModelComponent } from '../components/icons_sound_model_component';
// import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
// import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
// import { T_ISlotGameEngineProvider } from '../../type_definitions';
// import { BaseSlotSoundController } from "./base_slot_sound_controller";
// import { SlotSoundConfigEntry } from "./slot_sound_config_entry";

// export class AnimationEngineSlotSoundController extends BaseSlotSoundController {
//   private _gameEngine: AnimationBasedGameEngine;
//   private _gameConfig: IAnimationBasedGameConfig;
//   private _iconSoundModel: IconsSoundModel;

//   constructor(container: Container, configEntries: SlotSoundConfigEntry[]) {
//     super(container, configEntries);
//     this._gameEngine = (container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider) as IAnimationBasedGameEngineProvider).gameEngine;
//     this._gameConfig = container.forceResolve<IAnimationBasedGameConfigProvider>(T_IAnimationBasedGameConfigProvider).gameConfig;
//     this._iconSoundModel = container.resolve(IconsSoundModelComponent).iconsSoundModel;
//   }

//   public stopWinSounds(): void {
//     super.stopWinSounds();

//     for (let position = 0; position < this._gameConfig.groupsCount * this._gameConfig.maxIconsPerGroup; position++) {
//       const drawId = this._gameEngine.getIconIdByPosition(position);
//       if (this._iconSoundModel.hasSound(drawId)) {
//         this._iconSoundModel.getIconSound(drawId).stop();
//       }
//     }
//   }
// }
