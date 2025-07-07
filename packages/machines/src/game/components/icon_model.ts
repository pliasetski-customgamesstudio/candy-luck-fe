import { Container, SceneObject } from '@cgs/syd';
import { OptionalLoader } from './optional_loader';
import { ResourcesComponent } from './resources_component';
import { T_OptionalLoader, T_ResourcesComponent } from '../../type_definitions';
import { WrapSceneObject } from '../../reels_engine/utils/wrap_scene_object';

interface IIconModel {
  minStaticIconId: number;
  maxStaticIconId: number;
  getStaticIcon(iconIndex: number): SceneObject[];
  getBluredStaticIcon(iconIndex: number): SceneObject[];
  getAnimIcon(iconIndex: number): SceneObject[];
  hasStaticIcon(iconId: number): boolean;
  dispose(): void;
}

export class IconModel implements IIconModel {
  private _container: Container;
  private _optionalLoader: OptionalLoader;
  private _animOnStart: boolean;
  private _maxIconId: number;
  private _bluredIconCollected: boolean = false;
  private _resourceComponent: ResourcesComponent;
  private _staticIcons: Map<number, SceneObject[]> = new Map<number, SceneObject[]>();
  private _bluredStaticIcons: Map<number, SceneObject[]> = new Map<number, SceneObject[]>();
  private _animIcons: Map<number, SceneObject[]> = new Map<number, SceneObject[]>();

  public get minStaticIconId(): number {
    return Array.from(this._staticIcons.keys()).reduce((i1, i2) => Math.min(i1, i2));
  }

  public get maxStaticIconId(): number {
    return Array.from(this._staticIcons.keys()).reduce((i1, i2) => Math.max(i1, i2));
  }

  constructor(container: Container, animOnStart: boolean, maxIconId: number) {
    this._container = container;
    this._animOnStart = animOnStart;
    this._maxIconId = maxIconId;
    this._resourceComponent =
      this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._optionalLoader = this._container.forceResolve<OptionalLoader>(T_OptionalLoader);
    this._init();
  }

  private _init(): void {
    for (let iconIdx = 0; iconIdx <= this._maxIconId; ++iconIdx) {
      this._collectStaticIcon(iconIdx, `icon_${iconIdx}`);
      this._collectAnimIcon(iconIdx, `anim_${iconIdx}`);
    }

    for (let iconIdx = 1; iconIdx <= this._maxIconId; ++iconIdx) {
      const longIconIdx = iconIdx * 100;
      this._collectStaticIcon(longIconIdx, `icon_${longIconIdx}`);
      this._collectAnimIcon(longIconIdx, `anim_${longIconIdx}`);
    }

    for (let iconIdx = 0; iconIdx <= this._maxIconId; ++iconIdx) {
      const substituteIconIdx = 1000 + iconIdx;
      this._collectStaticIcon(substituteIconIdx, `icon_${substituteIconIdx}`);
      this._collectAnimIcon(substituteIconIdx, `anim_${substituteIconIdx}`);
    }

    if (this._optionalLoader) {
      if (this._optionalLoader.isLoaded) {
        this.collectBluredIcons();
      } else {
        this._optionalLoader.loaded.listen(() => this.collectBluredIcons());
      }
    }

    this._collectRender('render');
    this._collectRender('renderAnim');
  }

  private collectBluredIcons(): void {
    if (!this._bluredIconCollected) {
      for (let iconIdx = 0; iconIdx <= this._maxIconId; ++iconIdx) {
        this._collectBluredStaticIcon(iconIdx, `icon_${iconIdx}_blur`);
      }

      for (let iconIdx = 1; iconIdx <= this._maxIconId; ++iconIdx) {
        const longIconIdx = iconIdx * 100;
        this._collectBluredStaticIcon(longIconIdx, `icon_${longIconIdx}_blur`);
      }

      for (let iconIdx = 0; iconIdx <= this._maxIconId; ++iconIdx) {
        const substituteIconIdx = 1000 + iconIdx;
        this._collectBluredStaticIcon(substituteIconIdx, `icon_${substituteIconIdx}_blur`);
      }

      this._bluredIconCollected = true;
    }
  }

  private _collectRender(renderName: string): void {
    const rtList = this._resourceComponent.getIcon(renderName);
    if (rtList && rtList.length > 0) {
      const rt = rtList[0];
      rt.parent?.removeChild(rt);
      this._resourceComponent.slot.addChild(rt);
    }
  }

  private _collectStaticIcon(idx: number, name: string): void {
    const staticIcons = this._resourceComponent.getIcon(name);
    if (staticIcons && staticIcons.length > 0) {
      const wrapIcons: SceneObject[] = [];
      for (const staticIcon of staticIcons) {
        const wrap = new WrapSceneObject();
        const parent = staticIcon.parent;
        if (parent) {
          parent.removeChild(staticIcon);
        }
        wrap.z = staticIcon.z;
        wrap.addChild(staticIcon);

        if (staticIcon.stateMachine && this._animOnStart) {
          staticIcon.stateMachine.switchToState('anim');
        }

        if (parent) {
          parent.addChild(wrap);
        }
        wrapIcons.push(wrap);
      }

      this._staticIcons.set(idx, wrapIcons);
    }
  }

  private _collectBluredStaticIcon(idx: number, name: string): void {
    const bluredIcons = this._resourceComponent.getBluredIcon(name);
    if (bluredIcons && bluredIcons.length > 0) {
      const wrapIcons: SceneObject[] = [];
      for (const bluredIcon of bluredIcons) {
        const wrap = new WrapSceneObject();
        const parent = bluredIcon.parent;
        if (parent) {
          parent.removeChild(bluredIcon);
        }
        wrap.z = bluredIcon.z;
        wrap.addChild(bluredIcon);

        if (bluredIcon.stateMachine && this._animOnStart) {
          bluredIcon.stateMachine.switchToState('anim');
        }

        if (parent) {
          parent.addChild(wrap);
        }
        wrapIcons.push(wrap);
      }

      this._bluredStaticIcons.set(idx, wrapIcons);
    }
  }

  private _collectAnimIcon(idx: number, name: string): void {
    const animIcons = this._resourceComponent.getIcon(name);
    if (animIcons?.length > 0) {
      const wrapIcons: SceneObject[] = [];
      for (const animIcon of animIcons) {
        const wrap = new WrapSceneObject();
        const parent = animIcon.parent;
        if (parent) {
          parent.removeChild(animIcon);
        }
        wrap.z = animIcon.z;
        wrap.addChild(animIcon);
        if (parent) {
          parent.addChild(wrap);
        }
        wrapIcons.push(wrap);
      }

      this._animIcons.set(idx, wrapIcons);
    }
  }

  public getStaticIcon(iconIndex: number): SceneObject[] {
    return this._staticIcons.has(iconIndex) ? this._staticIcons.get(iconIndex)! : [];
  }

  public getBluredStaticIcon(iconIndex: number): SceneObject[] {
    return this._bluredStaticIcons.has(iconIndex)
      ? this._bluredStaticIcons.get(iconIndex)!
      : this._staticIcons.has(iconIndex)
        ? this._staticIcons.get(iconIndex)!
        : [];
  }

  public getAnimIcon(iconIndex: number): SceneObject[] {
    return this._animIcons.has(iconIndex)
      ? this._animIcons.get(iconIndex)!
      : this._staticIcons.has(iconIndex)
        ? this._staticIcons.get(iconIndex)!
        : [];
  }

  public hasStaticIcon(iconId: number): boolean {
    return this._staticIcons.has(iconId);
  }

  public dispose(): void {
    this._staticIcons.forEach((nodes) => {
      for (const node of nodes) {
        node.active = false;
      }
    });

    this._animIcons.forEach((nodes) => {
      for (const node of nodes) {
        node.active = false;
      }
    });
  }
}
