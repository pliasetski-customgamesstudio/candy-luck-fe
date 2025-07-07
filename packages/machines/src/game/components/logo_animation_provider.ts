import { ILogoAnimationProvider } from './i_logo_animation_provider';
import { Container, EmptyAction, FunctionAction, IntervalAction, SceneObject } from '@cgs/syd';
import { ResourcesComponent } from './resources_component';
import { T_ResourcesComponent } from '../../type_definitions';

export class LogoAnimationProvider implements ILogoAnimationProvider {
  private _container: Container;
  private _logoNodeId: string;
  private _logoNode: SceneObject | null;

  constructor(container: Container, logoNodeId: string) {
    this._container = container;
    this._logoNodeId = logoNodeId;
  }

  get logoNode(): SceneObject {
    if (!this._logoNode) {
      this._logoNode = this._container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .root.findById(this._logoNodeId);
    }

    return this._logoNode!;
  }

  getLogoAnimationAction(symbolId: number): IntervalAction {
    return new FunctionAction(() =>
      this.logoNode.stateMachine!.switchToState('win_' + symbolId.toString())
    );
  }

  stopLogoAnimation(): void {
    this.logoNode.stateMachine!.switchToState('default');
  }

  getShortWinLineAction(): IntervalAction {
    return new EmptyAction();
  }
}
