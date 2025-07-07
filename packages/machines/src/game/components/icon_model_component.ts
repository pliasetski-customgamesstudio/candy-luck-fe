import { Container, IDisposable } from '@cgs/syd';
import { IconModel } from './icon_model';
import { ResourcesComponent } from './resources_component';
import { IIconModel } from '../../reels_engine/i_icon_model';
import { T_ResourcesComponent } from '../../type_definitions';

export class IconModelComponent implements IDisposable {
  public readonly iconModel: IIconModel;

  constructor(
    container: Container,
    { animOnStart = false, maxIconId = 60 }: { animOnStart?: boolean; maxIconId?: number } = {
      animOnStart: false,
      maxIconId: 60,
    }
  ) {
    console.log('load ' + this.constructor.name);
    const _res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this.iconModel = new IconModel(container, animOnStart, maxIconId);
  }

  dispose(): void {
    this.iconModel.dispose();
  }
}
