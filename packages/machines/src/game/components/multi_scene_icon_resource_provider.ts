import { SceneCommon } from '@cgs/common';
import { SceneObject } from '@cgs/syd';
import { AbstractMultisceneIconResourceProvider } from './abstract_multiscene_icon_resource_provider';

export class MultiSceneIconResourceProvider extends AbstractMultisceneIconResourceProvider {
  private _iconScenes: SceneObject[] = [];
  private _iconsRoot: string;
  private _iconPool: Record<string, SceneObject[]> = {};
  private _staticIcons: Record<string, SceneObject> = {};
  private _bluredIconRoot: string;

  constructor(
    sceneCommon: SceneCommon,
    iconsRoot: string = 'slot',
    bluredIconRoot: string = 'slot'
  ) {
    super(sceneCommon);
    this._iconsRoot = iconsRoot;
    this._bluredIconRoot = bluredIconRoot;
  }

  checkAndCreate(iconId: string, count: number): void {
    if (!this._iconPool[iconId]) {
      this._iconPool[iconId] = [];
    }
    for (let i = 0; i < count; i++) {
      const iconScene = this.sceneFactory?.build(this._iconsRoot + '/' + iconId) as SceneObject;

      if (iconScene) {
        iconScene.initialize();
        this._iconScenes.push(iconScene);
        const icons: SceneObject[] = [];
        const iconNodes = iconScene.findAllById(iconId);
        if (iconNodes) {
          for (const iconNode of iconNodes) {
            const parent = iconNode.parent;
            if (parent) {
              parent.removeChild(iconNode);
            }

            icons.push(iconNode);
          }
        }

        iconScene.active = false;
        this._iconPool[iconId].push(...icons);
      }
    }
  }

  returnIcon(icon: SceneObject): void {
    if (icon) {
      if (!this._iconPool[icon.id]) {
        this._iconPool[icon.id] = [];
      }
      if (icon.stateMachine) {
        icon.restartStateMachine();
        icon.stateMachine.switchToState('default');
      }
      this._iconPool[icon.id].push(icon);
    }
  }

  loadIcon(iconId: string): SceneObject[] | null {
    let iconScene: SceneObject | null = null;
    if (this._iconPool[iconId] && this._iconPool[iconId].length > 0) {
      const icon = this._iconPool[iconId].shift() as SceneObject;
      return [icon];
    }
    iconScene = this.sceneFactory?.build(this._iconsRoot + '/' + iconId) as SceneObject;

    if (iconScene) {
      iconScene.initialize();
      this._iconScenes.push(iconScene);
      const icons: SceneObject[] = [];
      const iconNodes = iconScene.findAllById(iconId);
      if (iconNodes) {
        for (const iconNode of iconNodes) {
          const parent = iconNode.parent;
          if (parent) {
            parent.removeChild(iconNode);
          }

          icons.push(iconNode);
        }
      }

      iconScene.active = false;

      return icons;
    }

    return null;
  }

  loadBluredIcon(iconId: string): SceneObject[] | null {
    let iconScene: SceneObject | null = null;
    if (this._iconPool[iconId] && this._iconPool[iconId].length > 0) {
      const icon = this._iconPool[iconId].shift() as SceneObject;
      return [icon];
    }
    iconScene = this.sceneFactory?.build(this._bluredIconRoot + '/' + iconId) as SceneObject;

    if (iconScene) {
      iconScene.initialize();
      this._iconScenes.push(iconScene);
      const icons: SceneObject[] = [];
      const iconNodes = iconScene.findAllById(iconId);
      if (iconNodes) {
        for (const iconNode of iconNodes) {
          const parent = iconNode.parent;
          if (parent) {
            parent.removeChild(iconNode);
          }

          icons.push(iconNode);
        }
      }

      iconScene.active = false;

      return icons;
    }

    return null;
  }

  unload(): void {
    this._iconScenes.forEach((iconScene) => iconScene.deinitialize());
    this._iconScenes = [];
    this._staticIcons = {};
  }

  getStaticIconNodes(iconId: string): SceneObject | null {
    if (this._staticIcons[iconId]) {
      return this._staticIcons[iconId];
    }

    return null;
  }
}
