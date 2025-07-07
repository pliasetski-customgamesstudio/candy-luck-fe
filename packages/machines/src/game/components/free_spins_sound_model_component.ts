import { Container } from '@cgs/syd';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { SlotParams } from '../../reels_engine/slot_params';
import { T_ResourcesComponent, T_IGameParams, T_IGameConfigProvider } from '../../type_definitions';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { ResourcesComponent } from './resources_component';
import { FreeSpinsSoundModel } from '../../reels_engine/reels_sound_model';
import { AnticipationConfig } from '../../reels_engine/game_config/game_config';

export class FreeSpinsSoundModelComponent {
  freeSpinSoundModel: ReelsSoundModel;
  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const res: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const params: SlotParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    const anticipationConfig =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig
        .anticipationConfig;
    this.freeSpinSoundModel = new FreeSpinsSoundModel(
      res.sounds,
      anticipationConfig as AnticipationConfig,
      params.reelsCount
    );
  }
}
