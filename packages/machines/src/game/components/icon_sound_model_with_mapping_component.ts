import { IconsSoundModelComponent } from './icons_sound_model_component';
import { Container, SceneObject } from '@cgs/syd';
import { T_ResourcesComponent } from '../../type_definitions';
import { ResourcesComponent } from './resources_component';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { SoundInstance } from '../../reels_engine/sound_instance';

export class IconsSoundModelWithMappingComponent extends IconsSoundModelComponent {
  constructor(
    container: Container,
    {
      maxIconId = 60,
      soundMapping = null,
    }: { maxIconId?: number; soundMapping?: Map<number, number> | null }
  ) {
    super(container);
    const res: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this.iconsSoundModel = new IconsSoundModelWithMapping(res.sounds, maxIconId, soundMapping);
  }
}

export class IconsSoundModelWithMapping extends IconsSoundModel {
  private _soundMapping: Map<number, number>;

  constructor(
    soundsScene: SceneObject,
    maxIconId: number,
    soundMapping: Map<number, number> | null = null
  ) {
    super(soundsScene, maxIconId);
    this._soundMapping = soundMapping || new Map<number, number>();
  }

  getIconSound(iconIndex: number): SoundInstance {
    if (this._soundMapping.has(iconIndex)) {
      const newIndex = this._soundMapping.get(iconIndex)!;
      return super.getIconSound(newIndex);
    }
    return super.getIconSound(iconIndex);
  }

  hasSound(iconIndex: number): boolean {
    if (this._soundMapping.has(iconIndex)) {
      const newIndex = this._soundMapping.get(iconIndex)!;
      return super.hasSound(newIndex);
    }
    return super.hasSound(iconIndex);
  }
}
