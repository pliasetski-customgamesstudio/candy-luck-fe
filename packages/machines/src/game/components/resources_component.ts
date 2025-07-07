import { Container, SceneObject } from '@cgs/syd';
import { AbstractIconResourceProvider } from './abstract_icon_resource_provider';
import { InstantCoinsAnimationProvider } from './instant_coins_animation_provider';
import { WinMovieSceneProvider } from './win_movie_scene_provider';
import {
  T_AbstractIconResourceProvider,
  T_InstantCoinsAnimationProvider,
  T_WinMovieSceneProvider,
} from '../../type_definitions';

export class ResourcesComponent {
  private _container: Container;
  private _rootObject: SceneObject | null;
  private _iconResourceProvider: AbstractIconResourceProvider;

  constructor(container: Container, root: SceneObject) {
    console.log('load ' + this.constructor.name);
    this._container = container;
    this._rootObject = root;
  }

  get iconResourceProvider(): AbstractIconResourceProvider {
    if (!this._iconResourceProvider) {
      this._iconResourceProvider = this._container.forceResolve<AbstractIconResourceProvider>(
        T_AbstractIconResourceProvider
      );
    }

    return this._iconResourceProvider;
  }

  private _slotHolder: SceneObject | null;
  private _slotRoot: SceneObject;
  public slot: SceneObject;
  public bonusHolder: SceneObject;
  public sounds: SceneObject;
  public bg: SceneObject;
  public footer: SceneObject;

  get root(): SceneObject {
    return this._rootObject!;
  }

  get fadeStaticIcons(): SceneObject {
    return this.slot.findById('fade_static_icons') as SceneObject;
  }

  getIcon(iconId: string): SceneObject[] {
    return this.iconResourceProvider.getIconNodes(iconId) || [];
  }

  getBluredIcon(iconId: string): SceneObject[] {
    return this.iconResourceProvider.getBluredIconNodes(iconId) || [];
  }

  RegisterSlot(
    slot: SceneObject,
    holderId: string | null = null,
    machineNodeId: string | null = null
  ): void {
    const machineNode = machineNodeId ? slot.findById(machineNodeId) : slot;
    this.slot = machineNode ? machineNode : slot;
    const holder = holderId ? (this._rootObject?.findById(holderId) as SceneObject | null) : null;

    this._slotHolder = holder;
    this._slotRoot = slot;
    if (holder) {
      holder.addChild(slot);
    } else {
      this._rootObject?.addChild(slot);
    }
  }

  RegisetBonusHolder(bonusHolder: SceneObject): void {
    this.bonusHolder = bonusHolder;
    this._rootObject?.addChild(bonusHolder);
  }

  RegisterSound(sounds: SceneObject): void {
    this.sounds = sounds;
    this._rootObject?.addChild(sounds);
  }

  RegisterBack(bg: SceneObject): void {
    this.bg = bg;
    this._rootObject?.addChild(bg);
  }

  RegisterFooter(footer: SceneObject): void {
    this.footer = footer;
  }

  findStartReelNode(reelIndex: number): SceneObject {
    return this.slot.findById('slot_start_' + reelIndex.toString()) as SceneObject;
  }

  unload(): void {
    const winMovieSceneProvider =
      this._container.forceResolve<WinMovieSceneProvider>(T_WinMovieSceneProvider);
    if (winMovieSceneProvider) {
      winMovieSceneProvider.unload();
    }

    const instantCoinsProvider = this._container.forceResolve<InstantCoinsAnimationProvider>(
      T_InstantCoinsAnimationProvider
    );
    if (instantCoinsProvider) {
      instantCoinsProvider.unload();
    }

    this.iconResourceProvider.unload();

    if (this._slotRoot) {
      this._slotRoot.active = false;
      if (this._slotHolder) {
        this._slotHolder.removeChild(this._slotRoot);
      } else {
        this._rootObject?.removeChild(this._slotRoot);
      }
    }

    if (this.sounds) {
      this.sounds.active = false;
      this._rootObject?.removeChild(this.sounds);
    }

    if (this.bg) {
      this.bg.active = false;
      this._rootObject?.removeChild(this.bg);
    }

    if (this.bonusHolder) {
      this._rootObject?.removeChild(this.bonusHolder);
    }

    this._slotRoot.deinitialize();
    if (this.sounds) {
      this.sounds.deinitialize();
    }
    if (this.bg) {
      this.bg.deinitialize();
    }
    if (this.bonusHolder) {
      this.bonusHolder.deinitialize();
    }

    this._rootObject = null;
  }
}
