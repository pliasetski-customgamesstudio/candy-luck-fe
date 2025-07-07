import { Container } from '@cgs/syd';
import { ResourcesComponent } from './resources_component';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { T_ResourcesComponent } from '../../type_definitions';

export class IconsSoundModelComponent {
  iconsSoundModel: IconsSoundModel;
  constructor(
    container: Container,
    { maxIconId = 60 }: { maxIconId?: number } = { maxIconId: 60 }
  ) {
    console.log('load ' + this.constructor.name);
    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this.iconsSoundModel = new IconsSoundModel(res.sounds, maxIconId);
  }
}
