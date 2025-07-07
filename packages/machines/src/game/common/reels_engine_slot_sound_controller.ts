import { Container } from '@cgs/syd';
import { IconsSoundModelComponent } from '../components/icons_sound_model_component';
import { RegularSpinsSoundModelComponent } from '../components/regular_spins_sound_model_component';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { SlotParams } from '../../reels_engine/slot_params';
import {
  T_ISlotGame,
  T_ISlotGameEngineProvider,
  T_IconsSoundModelComponent,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { BaseSlotSoundController } from './base_slot_sound_controller';
import { SlotSoundConfigEntry } from './slot_sound_config_entry';

export class ReelsEngineSlotSoundController extends BaseSlotSoundController {
  private _reelsSlotGameParams: SlotParams;
  private _reelEngine: ReelsEngine;

  constructor(container: Container, configEntries: SlotSoundConfigEntry[]) {
    super(container, configEntries);
    this._reelsSlotGameParams = container.forceResolve<ISlotGame>(T_ISlotGame)
      .gameParams as SlotParams;
    this._reelEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._iconAnimationHelper = this._reelEngine.iconAnimationHelper;
    this._iconSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this.reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
  }

  public stopWinSounds(): void {
    super.stopWinSounds();

    for (
      let position = 0;
      position < this._reelEngine.ReelConfig.reelCount * this._reelEngine.ReelConfig.lineCount;
      position++
    ) {
      const entities = this._iconAnimationHelper.getSoundEntities(position);
      for (const entity of entities) {
        const drawIndex = this._reelEngine.entityEngine.getComponentIndex(
          ComponentNames.DrawableIndex
        );
        const drawId = entity.get(drawIndex) as number;

        if (this.isLongIcon(drawId)) {
          let updatedDrawId = drawId;
          this.stopSoundIfExist(updatedDrawId);
          while (updatedDrawId >= 10) {
            updatedDrawId = Math.round(updatedDrawId / 10);
            this.stopSoundIfExist(updatedDrawId);
          }
        } else {
          this.stopSoundIfExist(drawId);
        }
      }
    }
  }

  private stopSoundIfExist(drawId: number): void {
    if (!drawId || drawId < 1) return;
    if (this._iconSoundModel.hasSound(drawId)) {
      this._iconSoundModel.getIconSound(drawId).stop();
    }
  }

  private isLongIcon(drawId: number): boolean {
    return (
      this._reelsSlotGameParams.longIcons.filter((p) => p.iconIndex == Math.floor(drawId / 100))
        .length > 0
    );
  }
}
