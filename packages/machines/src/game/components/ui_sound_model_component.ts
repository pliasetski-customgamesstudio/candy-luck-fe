import { Container } from '@cgs/syd';
import { UiSoundModel } from '../../reels_engine/ui_sound_model';
import { ResourcesComponent } from './resources_component';
import { T_ResourcesComponent } from '../../type_definitions';

export class UiSoundModelComponent {
  uiSoundModel: UiSoundModel;
  constructor(container: Container, featureSound: string) {
    const res: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this.uiSoundModel = new UiSoundModel(res.sounds, featureSound);
  }
}
