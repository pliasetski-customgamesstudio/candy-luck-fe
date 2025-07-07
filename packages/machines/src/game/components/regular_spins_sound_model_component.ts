import { Container } from '@cgs/syd';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { RegularSpinsSoundModel } from '../../reels_engine/reels_sound_model';
import { ResourcesComponent } from './resources_component';
import { T_IGameConfigProvider, T_IGameParams, T_ResourcesComponent } from '../../type_definitions';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { AnticipationConfig } from '../../reels_engine/game_config/game_config';

export class RegularSpinsSoundModelComponent {
  regularSpinSoundModel: RegularSpinsSoundModel;

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const res: ResourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const params: IGameParams = container.forceResolve<IGameParams>(T_IGameParams);
    const anticipationConfig =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig.anticipationConfig;
    this.regularSpinSoundModel = new RegularSpinsSoundModel(
      res.sounds,
      anticipationConfig as AnticipationConfig,
      params.groupsCount
    );
  }
}
