import { Container, SceneObject } from '@cgs/syd';
import { IconsSoundModelComponent } from '../../icons_sound_model_component';
import { ResourcesComponent } from '../../resources_component';
import { IconsSoundModel } from '../../../../reels_engine/icons_sound_model';
import { SoundInstance } from '../../../../reels_engine/sound_instance';
import { T_ResourcesComponent } from '../../../../type_definitions';

export class Game112IconsSoundModelComponent extends IconsSoundModelComponent {
  private _soundMapping: Map<number, number>;

  constructor(
    container: Container,
    {
      maxIconId = 60,
      soundMapping = null,
    }: { maxIconId?: number; soundMapping?: Map<number, number> | null }
  ) {
    super(container);
    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this.iconsSoundModel = new Game112IconsSoundModel(res.sounds, maxIconId, soundMapping);
  }
}

export class Game112IconsSoundModel extends IconsSoundModel {
  private _soundMapping: Map<number, number>;

  constructor(
    soundsScene: SceneObject,
    maxIconId: number,
    soundMapping: Map<number, number> | null
  ) {
    super(soundsScene, maxIconId);
    this._soundMapping = soundMapping || new Map<number, number>();
  }

  getIconSound(iconIndex: number): SoundInstance {
    if (this._soundMapping.has(iconIndex)) {
      const newIndex = this._soundMapping.get(iconIndex) as number;
      return super.getIconSound(newIndex);
    }
    return super.getIconSound(iconIndex);
  }

  hasSound(iconIndex: number): boolean {
    if (this._soundMapping.has(iconIndex)) {
      const newIndex = this._soundMapping.get(iconIndex) as number;
      return super.hasSound(newIndex);
    }
    return super.hasSound(iconIndex);
  }
}
