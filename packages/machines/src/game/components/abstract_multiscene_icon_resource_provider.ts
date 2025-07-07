import { SceneCommon } from '@cgs/common';
import { SceneObject } from '@cgs/syd';
import { AbstractIconResourceProvider } from './abstract_icon_resource_provider';

export abstract class AbstractMultisceneIconResourceProvider extends AbstractIconResourceProvider {
  constructor(sceneCommon: SceneCommon) {
    super(sceneCommon);
  }

  abstract getStaticIconNodes(iconId: string): SceneObject | null;
}
