import { Container } from 'inversify';
import { ResourcesComponent } from 'machines';
import { IconsSoundModelComponent } from 'syd';
import { FreeFallIconsSoundModel } from 'machines/src/reels_engine_library';

class FreeFallIconsSoundModelComponent implements IconsSoundModelComponent {
  iconsSoundModel: IconsSoundModel;
  constructor(container: Container, { maxIconId = 60 }: { maxIconId?: number }) {
    console.log('load ' + this.constructor.name);
    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this.iconsSoundModel = new FreeFallIconsSoundModel(res.sounds, maxIconId);
  }
}
