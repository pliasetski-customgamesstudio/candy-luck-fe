import { Container } from '@cgs/syd';
import { GameComponentProvider } from './game_component_provider';

export class AnimationAvailabilityProvider extends GameComponentProvider {
  private _container: Container;

  constructor(container: Container) {
    super();
    this._container = container;
  }

  get container(): Container {
    return this._container;
  }

  isAnimationAvailable(): boolean {
    return true;
  }
}
