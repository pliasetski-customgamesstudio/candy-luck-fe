// import { Container, Vector2 } from "@cgs/syd";
// import { BaseSlotGame } from '../../base_slot_game';
// import { AbstractGameConfig } from '../../../reels_engine/game_config/abstract_game_config';
// import { IGameConfigProvider } from "../interfaces/i_game_config_provider";

// export class CollapseGameConfigComponent implements IGameConfigProvider {
//   private _gameConfig: AbstractGameConfig;

//   constructor(container: Container, displayResolution: Vector2) {
//     console.log("load " + this.constructor.name);
//     const game: BaseSlotGame = container.resolve(BaseSlotGame);
//     this._gameConfig = new CollapseGameConfig(container, game.gameConfig, displayResolution);
//   }

//   get gameConfig(): AbstractGameConfig {
//     return this._gameConfig;
//   }
// }
