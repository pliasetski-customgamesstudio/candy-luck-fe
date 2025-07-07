import { Container } from 'inversify';
import { Vector2 } from 'three';
import { IGameConfigProvider, AbstractGameConfig } from 'machines';
import { IModularSlotGame, ISlotGameModule } from 'syd';
import { IGameConfigProvider as IGameConfigProvider2 } from 'machines/src/reels_engine_library';

class GameModuleConfigProvider implements IGameConfigProvider {
  gameConfig: AbstractGameConfig;
  constructor(container: Container, displayResolution: Vector2) {
    console.log('load ' + this.constructor.name);
    const slotGame = container.resolve<IModularSlotGame>(IModularSlotGame);
    const gameConfigProvider =
      slotGame.container.resolve<IGameConfigProvider2>(IGameConfigProvider2);
    const moduleParams = container.resolve<ISlotGameModule>(ISlotGameModule).moduleParams;
    this.gameConfig = gameConfigProvider.gameConfig.moduleConfigs[moduleParams.gameId];
  }
}
