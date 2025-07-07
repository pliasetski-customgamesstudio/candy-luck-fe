import { Container } from '@cgs/syd';
import { GambleButtonController } from '../common/footer/controllers/gamble_button_controller';
import { GambleButtonView } from '../common/footer/views/gamble_button_view';
import { T_ResourcesComponent } from '../../type_definitions';
import { ResourcesComponent } from './resources_component';

export class GambleButtonProvider {
  private _controller: GambleButtonController;

  constructor(container: Container) {
    const view = new GambleButtonView(
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent).footer
    );
    this._controller = new GambleButtonController(container, view);
  }
}
