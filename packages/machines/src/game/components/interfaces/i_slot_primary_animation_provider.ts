import { SceneFactory } from '@cgs/common';
import { Container, SceneObject } from '@cgs/syd';

export interface ISlotPrimaryAnimationProvider {
  attachPrimaryAnimationsToStateMachine(): void;
  clearWinLines(): void;
}

export interface IFooterProvider {
  GetFooter(sceneFactory: SceneFactory): SceneObject;
}

export class FooterProvider implements IFooterProvider {
  constructor(_: Container) {}

  GetFooter(sceneFactory: SceneFactory): SceneObject {
    return sceneFactory.build('bottom/scene')!;
  }
}
