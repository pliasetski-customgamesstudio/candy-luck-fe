import { SceneObject, SoundSceneObject } from '@cgs/syd';
import { AnticipationConfig } from './game_config/game_config';
import { SoundInstance } from './sound_instance';

export abstract class AbstractSoundModel {
  private _soundsScene: SceneObject;
  get soundsScene(): SceneObject {
    return this._soundsScene;
  }

  constructor(soundsScene: SceneObject) {
    this._soundsScene = soundsScene;
  }

  getSoundByName(soundName: string): SoundInstance {
    const wrapSound = this._soundsScene.findById(soundName);
    return wrapSound && wrapSound.childs.length > 0
      ? new SoundInstance(wrapSound.childs[0] as SoundSceneObject, wrapSound.stateMachine)
      : SoundInstance.Empty;
  }

  isNotEmpty(soundName: string): boolean {
    const wrapSound = this._soundsScene?.findById(soundName) || null;
    return !!wrapSound && wrapSound.childs.length > 0;
  }

  getSoundNode(soundName: string): SceneObject {
    return this._soundsScene.findById(soundName) as SceneObject;
  }
}

export abstract class ReelsSoundModel extends AbstractSoundModel {
  private _spin: SoundInstance;
  private _stop: SoundInstance;
  private _win: SoundInstance;
  private _anticipators: Map<number, Map<number, SoundInstance>>;
  private _reelAnticipators: Map<number, SoundInstance>;
  private _speedUp: SoundInstance;
  private _background: SceneObject;
  private _freeSpinsBackground: SceneObject;
  get freeSpinsBackground(): SceneObject {
    return this._freeSpinsBackground;
  }
  private _backgroundSpinSoundNode: SceneObject;
  private _reelsCount: number;

  constructor(
    soundsScene: SceneObject,
    anticipationConfig: AnticipationConfig,
    reelsCount: number
  ) {
    super(soundsScene);
    this._background = this.getSoundNode('background');
    this._freeSpinsBackground = this.getSoundNode('background_fs');
    this._backgroundSpinSoundNode = this.getSoundNode('background_spin');
    this._spin = this.getSpinSound();
    this._stop = this.getSoundByName('spin_stop');
    this._win = this.getSoundByName('general_win');
    this._anticipators = new Map<number, Map<number, SoundInstance>>();
    this._reelAnticipators = new Map<number, SoundInstance>();
    for (let i = 0; i < anticipationConfig.anticipationIcons.length; i++) {
      const symbolId = anticipationConfig.anticipationIcons[i];
      const symbolMap = new Map<number, SoundInstance>();
      this._anticipators.set(symbolId, symbolMap);
      for (let k = 0; k < anticipationConfig.anticipationReels[i].length; k++) {
        const reel = anticipationConfig.anticipationReels[i][k];
        symbolMap.set(reel, this.getSoundByName(`anticipation_${symbolId}_${reel}`));
      }
      this._reelAnticipators.set(symbolId, this.getSoundByName(`anticipation_reel_${symbolId}`));
    }
    this._speedUp = this.getSoundByName('accelerator');
    this._reelsCount = reelsCount;
  }

  protected abstract getSpinSound(): SoundInstance;
  get stopReelSound(): SoundInstance {
    return this._stop;
  }
  get startSpinSound(): SoundInstance {
    return this._spin;
  }
  get winSound(): SoundInstance {
    return this._win;
  }
  get reelAccelerationSound(): SoundInstance {
    return this._speedUp;
  }
  get backgroundSoundNode(): SceneObject {
    return this._background;
  }
  get freeSpinsBackgroundSoundNode(): SceneObject {
    return this._freeSpinsBackground;
  }
  get backgroundSpinSoundNode(): SceneObject {
    return this._backgroundSpinSoundNode;
  }

  anticipatorSound(symbolId: number, reel: number): SoundInstance {
    return this._reelAnticipators.has(symbolId)
      ? (this._reelAnticipators.get(symbolId) as SoundInstance)
      : this._anticipators.has(symbolId) && this._anticipators.get(symbolId)?.has(reel)
        ? (this._anticipators.get(symbolId)?.get(reel) as SoundInstance)
        : SoundInstance.Empty;
  }
}

export class RegularSpinsSoundModel extends ReelsSoundModel {
  constructor(
    soundsScene: SceneObject,
    anticipationConfig: AnticipationConfig,
    reelsCount: number
  ) {
    super(soundsScene, anticipationConfig, reelsCount);
  }
  protected getSpinSound(): SoundInstance {
    return this.getSoundByName('reels_spin');
  }
}

export class FreeSpinsSoundModel extends ReelsSoundModel {
  constructor(
    soundsScene: SceneObject,
    anticipationConfig: AnticipationConfig,
    reelsCount: number
  ) {
    super(soundsScene, anticipationConfig, reelsCount);
  }
  protected getSpinSound(): SoundInstance {
    return SoundInstance.Empty;
  }
}
