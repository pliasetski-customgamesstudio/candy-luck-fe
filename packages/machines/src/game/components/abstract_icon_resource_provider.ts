import { SceneFactory, SceneCommon } from '@cgs/common';
import { SceneObject } from '@cgs/syd';

export abstract class AbstractIconResourceProvider {
  private readonly _sceneFactory: SceneFactory | null = null;

  constructor(sceneCommon: SceneCommon) {
    this._sceneFactory = sceneCommon.sceneFactory;
  }

  get sceneFactory(): SceneFactory | null {
    return this._sceneFactory!;
  }

  abstract checkAndCreate(iconId: string, count: number): void;

  abstract returnIcon(icon: SceneObject): void;

  getIconNodes(iconId: string): SceneObject[] | null {
    return this.loadIcon(iconId);
  }

  getIconNodes_(iconId: string): SceneObject[] {
    return this.loadIcon(iconId) as SceneObject[];
  }

  getBluredIconNodes(iconId: string): SceneObject[] | null {
    return this.loadBluredIcon(iconId);
  }

  abstract loadIcon(iconId: string): SceneObject[] | null;

  abstract loadBluredIcon(iconId: string): SceneObject[] | null;

  abstract unload(): void;
}
