import { Container, ParamEvent } from '@cgs/syd';
import { T_ResourcesComponent } from '../../../type_definitions';
import { ResourcesComponent } from '../resources_component';
import { IFadeReelsProvider } from './i_fade_reels_provider';

export class FadeReelsProvider implements IFadeReelsProvider {
  private _container: Container;

  constructor(container: Container) {
    this._container = container;
  }

  EnableFade(enable: boolean): void {
    const fadeNodes = this._container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .root.findAllById('fade_static_icons');
    for (const fadeNode of fadeNodes) {
      if (fadeNode && fadeNode.stateMachine) {
        fadeNode.stateMachine.dispatchEvent(new ParamEvent<string>(enable ? 'anim' : 'default'));
      }
    }
  }
}
