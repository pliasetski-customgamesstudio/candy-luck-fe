import { SceneCommon } from '@cgs/common';
import { SceneObject } from '@cgs/syd';
import { AbstractIconResourceProvider } from './abstract_icon_resource_provider';

export class SingleSceneIconResourceProvider extends AbstractIconResourceProvider {
  checkAndCreate(iconId: string, count: number): void {
    throw new Error('Method not implemented.');
  }
  returnIcon(icon: SceneObject): void {
    throw new Error('Method not implemented.');
  }

  private _iconsScene: SceneObject;
  private _bluredIconScene: SceneObject;
  private _iconsSceneName: string;
  private _additionalSceneName: string;

  get iconsScene(): SceneObject {
    if (!this._iconsScene) {
      this._iconsScene = this.sceneFactory?.build(this._iconsSceneName) as SceneObject;
      this._iconsScene.initialize();
    }

    return this._iconsScene;
  }

  get bluredIconsScene(): SceneObject {
    if (!this._bluredIconScene) {
      this._bluredIconScene = this._additionalSceneName
        ? (this.sceneFactory?.build(this._additionalSceneName) as SceneObject)
        : this.iconsScene;
      if (this._bluredIconScene) {
        this._bluredIconScene.initialize();
      }
    }

    return this._bluredIconScene;
  }

  constructor(
    sceneCommon: SceneCommon,
    iconsSceneName = 'slot/icons',
    additionalSceneName = 'additional/icons'
  ) {
    super(sceneCommon);
    this._iconsSceneName = iconsSceneName;
    this._additionalSceneName = additionalSceneName;
  }

  loadIcon(iconId: string): SceneObject[] | null {
    if (this.iconsScene) {
      return this.iconsScene.findAllById(iconId);
    }

    return null;
  }

  loadBluredIcon(iconId: string): SceneObject[] | null {
    if (this.bluredIconsScene) {
      return this.bluredIconsScene.findAllById(iconId);
    }

    return null;
  }

  unload(): void {
    if (this._iconsScene) {
      this._iconsScene.deinitialize();
    }

    if (this._bluredIconScene && this._bluredIconScene !== this._iconsScene) {
      this._bluredIconScene.deinitialize();
    }
  }
}
