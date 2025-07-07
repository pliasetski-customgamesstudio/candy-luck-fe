import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import { SubstituteIconItem } from './substitute_icon_componenent';
import { SlotParams } from '../../reels_engine/slot_params';
import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IconModelComponent,
  T_IconsSoundModelComponent,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_IWinLineStrategyProvider,
} from '../../type_definitions';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconModelComponent } from './icon_model_component';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import { IIconModel } from '../../reels_engine/i_icon_model';
import { SubstituteIconSystem } from '../../reels_engine/systems/substitute_icon_system';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import { VisibilityRestoreSystem } from '../../reels_engine/systems/visibility_restore_system';
import { RegularWinLineWithSubstituteStrategyProvider } from './win_lines/win_line_strategy_providers/regular_win_line_with_substitute_strategy_provider';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';

export class SubstituteStairsProvider {
  private _reelsEngine: ReelsEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _iconModel: IIconModel;
  private _iconsSoundModel: IconsSoundModel;
  private _iconAnimationHelper: IconAnimationHelper;
  private _symbolMap: SubstituteIconItem[];
  private _slotParams: SlotParams;
  private _allowPartialSubstitution: boolean;
  private _container: Container;

  constructor(
    container: Container,
    symbolMap: SubstituteIconItem[],
    marker: string,
    allowPartialSubstitution: boolean = true
  ) {
    console.log('load ' + this.constructor.name);
    this._container = container;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._slotParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this._allowPartialSubstitution = allowPartialSubstitution;

    this._createSystems(marker);
    this._gameStateMachine.stop.appendLazyAnimation(() =>
      this.substituteAction(this._gameStateMachine.curResponse, marker)
    );
  }

  private _createSystems(marker: string): void {
    const substituteIconSystem = new SubstituteIconSystem(this._reelsEngine.entityEngine);
    substituteIconSystem.updateOrder = 100;
    substituteIconSystem.register();

    const updateEntitySystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(marker)],
      UpdateEntityCacheMode.Replace,
      UpdateEntityCacheMode.Replace
    ).withInitialize();
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();

    const entityRemovalSystem = new EntityRemovalSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig,
      marker
    );
    entityRemovalSystem.updateOrder = 601;
    entityRemovalSystem.register();

    const visibilityRestoreSystem = new VisibilityRestoreSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      this._reelsEngine.internalConfig
    ).withInitialize();
    visibilityRestoreSystem.updateOrder = 601;
    visibilityRestoreSystem.register();
  }

  private _stateMachineStopEntered(marker: string): void {
    const winLineStrategyProvider =
      this._container.forceResolve<RegularWinLineWithSubstituteStrategyProvider>(
        T_IWinLineStrategyProvider
      );
    const subAction = this.substituteAction(this._gameStateMachine.curResponse, marker);
    winLineStrategyProvider.substituteAnimationAction =
      subAction instanceof EmptyAction ? null : subAction;
  }

  private preSubstituteAction(symbol: SpecialSymbolGroup): IntervalAction {
    return new EmptyAction();
  }

  private substituteAction(response: ISpinResponse, marker: string): IntervalAction {
    const actions: IntervalAction[] = [];
    const symbols: SpecialSymbolGroup[] | null = response.specialSymbolGroups;
    const symbolGroups = symbols ? symbols.filter((p) => p.type === marker) : null;

    if (symbolGroups) {
      for (const symbolGroup of symbolGroups) {
        const symbolActions: IntervalAction[] = [];
        const reels = this.getReels(symbolGroup);

        for (const [reel, positions] of Object.entries(reels)) {
          positions.sort();

          for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const reelIndex = parseInt(reel);
            const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);

            const drawId = this._iconAnimationHelper.getDrawIndexes(pos)[0];
            const substituteItem =
              this._symbolMap.find((x) => x.symbolId === symbolGroup.symbolId) ?? null;

            this.applySubstitution(
              substituteItem,
              drawId,
              reelIndex,
              lineIndex,
              pos,
              i,
              symbolGroup,
              symbolActions
            );
          }
        }

        actions.push(
          new SequenceAction([
            this.preSubstituteAction(symbolGroup),
            new ParallelAction(symbolActions),
          ])
        );
      }
      return new ParallelAction(actions);
    }
    return new EmptyAction();
  }

  private getReels(group: SpecialSymbolGroup): Map<number, number[]> {
    const result = new Map<number, number[]>();

    for (const position of group.positions!) {
      const reel = this._reelsEngine.getReelByPosition(position);
      if (!result.has(reel)) {
        result.set(reel, []);
      }

      result.get(reel)!.push(position);
    }
    return result;
  }

  private applySubstitution(
    substituteItem: SubstituteIconItem | null,
    drawId: number,
    reelIndex: number,
    lineIndex: number,
    pos: number,
    i: number,
    symbolGroup: SpecialSymbolGroup,
    symbolActions: IntervalAction[]
  ): void {
    if (substituteItem) {
      const symbol = substituteItem.iconDescr;

      const longIcon = this._slotParams.longIcons.find(
        (p) => p.iconIndex === Math.floor(drawId / 100)
      );
      const iconLength = longIcon ? longIcon.length : 1;
      const symbolLength = symbol.length;

      const stoppedEntity =
        iconLength > symbolLength || this._allowPartialSubstitution
          ? this._reelsEngine.getStopedEntities(reelIndex, lineIndex)[0]
          : this._iconAnimationHelper.getEntities(pos)[0];
      const hiddedEntity = this._iconAnimationHelper.getEntities(pos)[0];
      const entityPosition = stoppedEntity.get<Vector2>(
        this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
      );
      drawId = iconLength > symbolLength ? symbol.iconIndex : symbol.iconIndex + i;

      const iconsActions: IntervalAction[] = [];
      const entity = this._reelsEngine.CreateEntity(reelIndex, lineIndex, drawId, [
        symbolGroup.type!,
      ]);
      entity.addComponent(ComponentNames.Visible, false);

      iconsActions.push(
        new FunctionAction(() =>
          entity.addComponent(
            ComponentNames.Position,
            new Vector2(entityPosition.x, entityPosition.y)
          )
        )
      );
      iconsActions.push(new FunctionAction(() => entity.register()));
      iconsActions.push(
        new FunctionAction(() => hiddedEntity.addComponent(ComponentNames.Visible, false))
      );
      iconsActions.push(
        new FunctionAction(() => entity.addComponent(ComponentNames.Visible, true))
      );

      symbolActions.push(new SequenceAction(iconsActions));
    }
  }
}
