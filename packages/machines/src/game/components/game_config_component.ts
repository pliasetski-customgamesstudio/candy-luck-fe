import { Container, Vector2 } from '@cgs/syd';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { ReelsEngineGameConfig } from '../../reels_engine/game_config/game_config';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { T_ISlotGame } from '../../type_definitions';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';

export class GameConfigComponent implements IGameConfigProvider {
  private _gameConfig: AbstractGameConfig;

  constructor(container: Container, displayResolution: Vector2) {
    console.log('load ' + this.constructor.name);
    const game = container.forceResolve<ISlotGame>(T_ISlotGame);
    this._gameConfig = new ReelsEngineGameConfig(container, game.gameConfig, displayResolution);
  }

  get gameConfig(): AbstractGameConfig {
    return this._gameConfig;
  }
}
