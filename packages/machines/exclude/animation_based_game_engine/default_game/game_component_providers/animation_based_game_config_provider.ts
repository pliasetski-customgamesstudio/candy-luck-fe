import { Container } from 'inversify';
import { IAnimationBasedGameConfigProvider } from './IAnimationBasedGameConfigProvider';
import { IAnimationBasedGameConfig } from './IAnimationBasedGameConfig';
import { IGameParams } from './IGameParams';
import { AnimationBasedGameConfig } from './AnimationBasedGameConfig';

class AnimationBasedGameConfigProvider implements IAnimationBasedGameConfigProvider {
  private _gameConfig: IAnimationBasedGameConfig;

  constructor(container: Container) {
    const gameParams = container.get<IGameParams>(IGameParams);
    this._gameConfig = new AnimationBasedGameConfig(
      gameParams.iconsCount,
      gameParams.groupsCount,
      gameParams.maxIconsPerGroup,
      0,
      0,
      60.0
    );
  }

  get gameConfig(): IAnimationBasedGameConfig {
    return this._gameConfig;
  }
}
