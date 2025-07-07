import { Container, SceneObject, ParamEvent, TextSceneObject } from '@cgs/syd';
import { ResourcesComponent } from '../../../components/resources_component';
import { T_ResourcesComponent } from '../../../../type_definitions';

export class FreeSpinsLogoView {
  private _container: Container;
  private scene: SceneObject;
  private _embededLogo: boolean;

  constructor(container: Container, scene: SceneObject, embededLogo: boolean) {
    this._container = container;
    this.scene = scene;
    this._embededLogo = embededLogo;
  }

  enableFreeSpinsMode(): void {
    const container = this.scene.findById('table')!;
    container.stateMachine!.dispatchEvent(new ParamEvent<string>('freespins'));
  }

  enableLogoMode(): void {
    const container = this.scene.findById('table')!;
    container.stateMachine!.dispatchEvent(new ParamEvent<string>('logo'));
  }

  setFreeSpinsCounter(freeSpinsCount: number): void {
    const texts = (
      this._embededLogo
        ? this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root
        : this.scene
    ).findAllById('free_spins') as TextSceneObject[];
    for (const text of texts) {
      text.text = freeSpinsCount.toString();
    }
  }
}
