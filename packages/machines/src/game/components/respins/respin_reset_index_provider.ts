import { Container, Random, Action, FunctionAction, EmptyAction } from '@cgs/syd';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';
import { IReelsEngineProvider } from '../../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconEnumerator } from '../../../reels_engine/icon_enumerator';
import { LongIconEnumerator } from '../../../reels_engine/long_icon_enumerator';
import { LongStoppingIconEnumerator } from '../../../reels_engine/long_stopping_icons_enumerator';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import {
  T_GameConfigController,
  T_ISlotGameEngineProvider,
  T_IconEnumeratorComponent,
} from '../../../type_definitions';
import { GameConfigController } from '../game_config_controller';
import { IconEnumeratorComponent } from '../icon_enumerator_component';
import { ResponseDependentGameComponentProvider } from '../response_dependent_game_component_provider';

export class RespinResetIndexesProvider extends ResponseDependentGameComponentProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _iconsEnumerator: IconEnumerator;
  private _config: GameConfigController;
  private _random: Random;
  private _fsNames: string[];

  constructor(container: Container, fsNames: string[] | null = null) {
    super(container);
    this._fsNames = fsNames!;
    if (!this._fsNames) {
      this._fsNames = ['freeRespin'];
    }
    this._container = container;
    this._reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._iconsEnumerator =
      container.forceResolve<IconEnumeratorComponent>(T_IconEnumeratorComponent).iconsEnumerator;
    this._config = this._container.forceResolve<GameConfigController>(T_GameConfigController);

    this.gameStateMachine.freeSpins.appendLazyAnimation(() => this.resetIndexes());
    this.gameStateMachine.endFreeSpinsPopup.appendLazyAnimation(() => this.resetIndexes());
    this.gameStateMachine.beginFreeSpinsPopup.appendLazyAnimation(() => this.resetIndexes());
  }

  private resetIndexes(): Action {
    if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo &&
      (this._fsNames.includes(this.gameStateMachine.curResponse.freeSpinsInfo.name) ||
        this.gameStateMachine.curResponse.freeSpinsInfo.event ==
          FreeSpinsInfoConstants.FreeSpinsGroupSwitched)
    ) {
      return new FunctionAction(() => {
        const respinReels = this._config.getReelsByFreeSpinsName(
          this.gameStateMachine.curResponse.freeSpinsInfo!.name
        );
        let maxPosition =
          this._reelsEngine.internalConfig.reelCount * this._reelsEngine.internalConfig.lineCount -
          1;
        if (respinReels && respinReels.length > 0) {
          maxPosition = 0;
          for (const respinReel of respinReels) {
            if (respinReel.length > maxPosition) {
              maxPosition = respinReel.length - 1;
            }
          }
        }
        const randomPosition =
          this._random.nextInt(maxPosition) + this._reelsEngine.internalConfig.lineCount;

        let stoppedEnumerator: LongStoppingIconEnumerator | null = null;
        let longIconEnumerator: LongIconEnumerator | null = null;

        if (this._iconsEnumerator instanceof LongStoppingIconEnumerator) {
          stoppedEnumerator = this._iconsEnumerator as LongStoppingIconEnumerator;
        }
        if (this._iconsEnumerator instanceof LongIconEnumerator) {
          longIconEnumerator = this._iconsEnumerator as LongIconEnumerator;
        }

        for (let reel = 0; reel < this._reelsEngine.internalConfig.reelCount; ++reel) {
          for (
            let lineIndex = 0;
            lineIndex <
            this._reelsEngine.internalConfig.lineCount -
              this._reelsEngine.internalConfig.additionalLines;
            ++lineIndex
          ) {
            this._iconsEnumerator.setMappedWinIndex(reel, lineIndex, 0);
          }
          if (stoppedEnumerator) {
            stoppedEnumerator.cleareMapedIcons(reel);
          }
          if (longIconEnumerator) {
            longIconEnumerator.cleareMapedIcons(reel);
          }
        }
        for (let reel = 0; reel < this._reelsEngine.internalConfig.reelCount; ++reel) {
          for (
            let lineIndex = 0;
            lineIndex < this._reelsEngine.internalConfig.lineCount;
            ++lineIndex
          ) {
            const enumerationIndex = randomPosition - lineIndex - 1;
            const entities = this._reelsEngine.getStopedEntities(
              reel,
              lineIndex - this._reelsEngine.internalConfig.additionalUpLines
            );
            for (const e of entities) {
              if (
                !e ||
                e.hasComponent(this._reelsEngine.entityEngine.getComponentIndex('HoldedPositions'))
              ) {
                continue;
              }
              e.addComponent(ComponentNames.EnumerationIndex, enumerationIndex);
            }
          }
        }
      });
    }
    return new EmptyAction();
  }
}
