import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import {
  Container,
  IntervalAction,
  EmptyAction,
  ParallelAction,
  SequenceAction,
  Vector2,
  FunctionAction,
} from '@cgs/syd';
import { PlaySoundAction } from '../../reels_engine/actions/play_sound_action';
import { StopSoundAction } from '../../reels_engine/actions/stop_sound_action';
import { AbstractSystem } from '../../reels_engine/entities_engine/abstract_system';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import {
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
  T_IconModelComponent,
  T_BeforeStickyActionComponent,
} from '../../type_definitions';
import { BeforeStickyActionComponent } from './before_sticky_action_component';
import { IconModel } from './icon_model';
import { IconModelComponent } from './icon_model_component';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';

export class SitckyIconAnimationComponent {
  private _reelsEngine: ReelsEngine;
  private _reelsSoundModel: ReelsSoundModel;
  private _iconAnimationHelper: IconAnimationHelper;
  private _iconModel: IconModel;
  private _beforeStickyActionProvider: BeforeStickyActionComponent;
  private _symbolMap: Map<number, number>;
  private _actionDelay: number;
  private _stickyIconSoundName: string;
  private _updateAnimEntityCacheMode: UpdateEntityCacheMode;
  private _updateSoundEntityCacheMode: UpdateEntityCacheMode;

  constructor(
    container: Container,
    symbolMap: Map<number, number>,
    updateAnimEntityCacheMode: UpdateEntityCacheMode,
    updateSoundEntityCacheMode: UpdateEntityCacheMode,
    marker: string,
    actionDelay: number,
    stickyIconSoundName: string
  ) {
    console.log('load ' + this.constructor.name);
    const gameStateMachine: GameStateMachine<ISpinResponse> =
      container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ).gameStateMachine;
    this._beforeStickyActionProvider = container.forceResolve<BeforeStickyActionComponent>(
      T_BeforeStickyActionComponent
    );
    this._reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent)
      .iconModel as IconModel;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._actionDelay = actionDelay;
    this._stickyIconSoundName = stickyIconSoundName;

    this._createSystems(marker, container);

    let stopAction: IntervalAction = gameStateMachine.stop.animation as IntervalAction;
    if (!stopAction) {
      stopAction = new EmptyAction();
    }

    gameStateMachine.stop.setLazyAnimation(() => {
      const symbols = gameStateMachine.curResponse.specialSymbolGroups;
      return new ParallelAction([this.buildAnimAction(marker, symbols), stopAction]);
    });

    // if (gameStateMachine instanceof CollapseGameStateMachine) {
    //   let endCollapseAction: IntervalAction = gameStateMachine.endCollapseState.animation;
    //   if (!endCollapseAction) {
    //     endCollapseAction = new EmptyAction();
    //   }

    //   gameStateMachine.endCollapseState.setLazyAnimation(() => {
    //     const group = gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;

    //     if (group) {
    //       const symbols = group.groups[group.collapsingCounter - 1].specialSymbolGroups;
    //       return new ParallelAction([this.buildAnimAction(marker, symbols), endCollapseAction]);
    //     }
    //   });
    // }
  }

  private buildAnimAction(marker: string, symbols: SpecialSymbolGroup[] | null): IntervalAction {
    if (symbols) {
      const filteredSymbols = symbols.filter((p) => p.type === marker);
      const resourceActions: IntervalAction[] = [];

      for (const symbol of filteredSymbols) {
        const beforeStickyActions: IntervalAction[] = [];
        if (symbol && symbol.previousPositions) {
          const animAction = this._beforeStickyActionProvider
            ? this._beforeStickyActionProvider.getAction(
                symbol.previousPositions,
                symbol.symbolId!,
                symbol.type!
              )
            : this.StickyIconAction(symbol.previousPositions, symbol.symbolId!, symbol.type!);

          beforeStickyActions.push(animAction);

          if (this._stickyIconSoundName) {
            beforeStickyActions.push(
              new StopSoundAction(this._reelsSoundModel.getSoundByName(this._stickyIconSoundName))
            );
            beforeStickyActions.push(
              PlaySoundAction.withSound(
                this._reelsSoundModel.getSoundByName(this._stickyIconSoundName)
              )
            );
          }
        }

        const stickyAction =
          symbol && symbol.positions
            ? this.StickyIconAction(symbol.positions, symbol.symbolId!, symbol.type!)
            : new EmptyAction();

        resourceActions.push(
          new SequenceAction([
            new ParallelAction(beforeStickyActions),
            new SequenceAction([new EmptyAction().withDuration(this._actionDelay), stickyAction]),
          ])
        );
      }

      if (resourceActions.length > 0) {
        return new ParallelAction(resourceActions);
      }
    }

    return new EmptyAction().withDuration(0.0);
  }

  private _createSystems(marker: string, _: Container): void {
    const entityRemovalSystem = new EntityRemovalSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig,
      marker
    );
    entityRemovalSystem.updateOrder = 601;
    entityRemovalSystem.register();

    const system: AbstractSystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(marker)],
      this._updateAnimEntityCacheMode,
      this._updateSoundEntityCacheMode
    ).withInitialize();
    system.updateOrder = 600;
    system.register();
  }

  private StickyIconAction(
    positions: number[],
    symbolGroupId: number,
    marker: string
  ): IntervalAction {
    const symbolActions: IntervalAction[] = [];

    if (positions) {
      let symbolId = this._symbolMap.get(symbolGroupId)!;
      if (typeof symbolId !== 'number') {
        symbolId = this._symbolMap.values().next().value!;
      }

      for (const pos of positions) {
        const actions: IntervalAction[] = [];

        const stoppedEntity = this._iconAnimationHelper.getEntities(pos)[0];
        const lineIndex = stoppedEntity.get(
          this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.LineIndex)
        ) as number;
        const reelIndex = stoppedEntity.get(
          this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.ReelIndex)
        ) as number;
        const entityPosition = stoppedEntity.get(
          this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
        ) as Vector2;
        const enumerationIndex = stoppedEntity.get(
          this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.EnumerationIndex)
        ) as number;

        if (!this._reelsEngine.GetEntity(reelIndex, lineIndex, symbolId, marker)) {
          const entity = this._reelsEngine.CreateEntity(reelIndex, lineIndex, symbolId, [marker]);
          entity.addComponent(
            ComponentNames.Position,
            new Vector2(entityPosition.x, entityPosition.y)
          );
          entity.addComponent(ComponentNames.Visible, false);
          entity.addComponent(ComponentNames.EnumerationIndex, enumerationIndex);
          entity.addComponent(ComponentNames.ToRemoveIndex, true);
          entity.register();

          actions.push(new FunctionAction(() => entity.addComponent(ComponentNames.Visible, true)));
          actions.push(
            new FunctionAction(() => this._reelsEngine.startAnimation(entity, 'show'), false)
          );
          actions.push(
            new EmptyAction().withDuration(
              this._iconAnimationHelper.getEntityAnimDuration(entity, 'show')
            )
          );
          actions.push(
            new FunctionAction(() => this._reelsEngine.stopAnimation(entity, 'show'), false)
          );

          symbolActions.push(new SequenceAction(actions));
        }
      }

      return new ParallelAction(symbolActions);
    }

    return new EmptyAction();
  }
}
