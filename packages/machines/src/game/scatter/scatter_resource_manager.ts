import { SceneFactory } from '@cgs/common';
import { BonusResourceManager } from '@cgs/features';

export class ScatterResourceManager extends BonusResourceManager {
  constructor(sceneFactory: SceneFactory, scenePrefix: string = 'slot/popups/') {
    super(sceneFactory, scenePrefix);
  }
}
