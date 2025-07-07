import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { ResponseDependentGameComponentProvider } from './response_dependent_game_component_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { IconModel } from './icon_model';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import { SlotParams } from '../../reels_engine/slot_params';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import {
  T_IconModelComponent,
  T_IconsSoundModelComponent,
  T_IGameParams,
  T_ISlotGameEngineProvider,
  T_IWinLineStrategyProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { IconModelComponent } from './icon_model_component';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { SubstituteIconSystem } from '../../reels_engine/systems/substitute_icon_system';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import { VisibilityRestoreSystem } from '../../reels_engine/systems/visibility_restore_system';
import { IWinLineStrategyProvider } from './win_lines/win_line_strategy_providers/i_win_line_strategy_provider';
import { InternalRespinSpecGroup, SpecialSymbolGroup } from '@cgs/common';
import { Entity } from '../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { UpdateEntityCacheAction } from '../../reels_engine/actions/update_entity_cache_action';
import { UpdateEntityCacheMode } from '../../reels_engine/systems/update_entity_cache_system';
import { StopSoundAction } from '../../reels_engine/actions/stop_sound_action';
import { PlaySoundAction } from '../../reels_engine/actions/play_sound_action';
import { IconDescr } from '../../reels_engine/long_icon_enumerator';

export class SubstituteIconComponent extends ResponseDependentGameComponentProvider {
  protected _container: Container;

  private _reelsEngine: ReelsEngine;
  private _iconModel: IconModel;
  private _iconsSoundModel: IconsSoundModel;
  private _reelsSoundModel: ReelsSoundModel;
  private _iconAnimationHelper: IconAnimationHelper;
  private _symbolMap: SubstituteIconItem[];
  private _slotParams: SlotParams;
  private _allowPartialSubstitution: boolean;
  private _checkIconSizeInSearch: boolean;
  private _takeFirstSubstituteIconIfNull: boolean;
  private _hideBeforeAnimation: boolean;
  private _playSubstituteSound: boolean;
  private _soundName: string;
  private _substituteOnRespin: boolean;

  constructor(
    container: Container,
    symbolMap: SubstituteIconItem[],
    allowPartialSubstitution: boolean,
    marker: string,
    substituteStateName: string,
    {
      checkIconSizeInSearch = false,
      takeFirstSubstituteIconIfNull = true,
      useInStrategy = false,
      hideBeforeAnimation = true,
      playSubstituteSound = true,
      soundName = '',
      substituteOnRespin = false,
    }: {
      checkIconSizeInSearch?: boolean;
      takeFirstSubstituteIconIfNull?: boolean;
      useInStrategy?: boolean;
      hideBeforeAnimation?: boolean;
      playSubstituteSound?: boolean;
      soundName?: string;
      substituteOnRespin?: boolean;
    } = {}
  ) {
    super(container);
    console.log('load ' + this.constructor.name);
    this._container = container;
    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent)
      .iconModel as IconModel;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._slotParams = container.forceResolve<SlotParams>(T_IGameParams);
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;

    this._createSystems(marker);

    this.subscribeActions(marker, substituteStateName, useInStrategy);

    this._checkIconSizeInSearch = checkIconSizeInSearch;
    this._takeFirstSubstituteIconIfNull = takeFirstSubstituteIconIfNull;
    this._hideBeforeAnimation = hideBeforeAnimation;
    this._playSubstituteSound = playSubstituteSound;
    this._soundName = soundName;
    this._substituteOnRespin = substituteOnRespin;
  }

  get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }

  get iconModel(): IconModel {
    return this._iconModel;
  }

  get iconsSoundModel(): IconsSoundModel {
    return this._iconsSoundModel;
  }

  get reelsSoundModel(): ReelsSoundModel {
    return this._reelsSoundModel;
  }

  get iconAnimationHelper(): IconAnimationHelper {
    return this._iconAnimationHelper;
  }

  get symbolMap(): SubstituteIconItem[] {
    return this._symbolMap;
  }

  get slotParams(): SlotParams {
    return this._slotParams;
  }

  get allowPartialSubstitution(): boolean {
    return this._allowPartialSubstitution;
  }

  get checkIconSizeInSearch(): boolean {
    return this._checkIconSizeInSearch;
  }

  get takeFirstSubstituteIconIfNull(): boolean {
    return this._takeFirstSubstituteIconIfNull;
  }

  get container(): Container {
    return this._container;
  }

  get hideBeforeAnimation(): boolean {
    return this._hideBeforeAnimation;
  }

  get substituteOnRespin(): boolean {
    return this._substituteOnRespin;
  }

  private subscribeActions(
    marker: string,
    substituteStateName: string,
    useInStrategy: boolean
  ): void {
    if (useInStrategy) {
      this.gameStateMachine.stop.entered.listen(() => {
        this._stateMachineStopEntered(marker, substituteStateName);
      });
    } else {
      this.gameStateMachine.stop.appendLazyAnimation(() =>
        this.substituteAction(marker, substituteStateName)
      );
    }
  }

  private _createSystems(marker: string): void {
    const substituteIconSystem = new SubstituteIconSystem(this._reelsEngine.entityEngine);
    substituteIconSystem.updateOrder = 100;
    substituteIconSystem.register();

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

  private _stateMachineStopEntered(marker: string, substituteStateName: string): void {
    const winLineStrategyProvider = this._container.resolve<IWinLineStrategyProvider>(
      T_IWinLineStrategyProvider
    );
    const subAction = this.substituteAction(marker, substituteStateName);
    // @ts-expect-error TODO: there is no substituteAnimationAction in IWinLineStrategyProvider interface
    winLineStrategyProvider.substituteAnimationAction =
      subAction instanceof EmptyAction ? null : subAction;
  }

  preSubstituteAction(_symbol: SpecialSymbolGroup): IntervalAction {
    return new EmptyAction();
  }

  substituteAction(marker: string, substituteStateName: string): IntervalAction {
    const respinGroup =
      this.currentResponse.additionalData instanceof InternalRespinSpecGroup
        ? this.currentResponse.additionalData
        : null;
    if (respinGroup && respinGroup.respinStarted && !this._substituteOnRespin) {
      return new EmptyAction().withDuration(0.0);
    }

    const symbolGroups =
      respinGroup && respinGroup.respinStarted
        ? this.getRespinSpecialSymbolsByMarker(respinGroup.currentRound, marker)
        : this.getSpecialSymbolsByMarker(this.currentResponse, marker);

    const actions: IntervalAction[] = [];
    if (symbolGroups && symbolGroups.length > 0) {
      for (const symbolGroup of symbolGroups) {
        const symbolActions: IntervalAction[] = [];
        const substitutedEntities: Entity[] = [];
        for (let i = 0; i < (symbolGroup.positions?.length || 0); i++) {
          const pos = symbolGroup.positions![i];
          const reelIndex = pos % this._reelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);
          const drawId = this._iconAnimationHelper.getDrawIndexes(pos)[0];

          let substituteItem: SubstituteIconItem | null = null;
          this._symbolMap.forEach((x) => {
            if (
              x.symbolId === symbolGroup.symbolId &&
              (!this._checkIconSizeInSearch ||
                x.iconDescr.length * x.iconDescr.width === symbolGroup.positions!.length)
            ) {
              substituteItem = x;
            }
          });

          if (this._takeFirstSubstituteIconIfNull) {
            substituteItem = !substituteItem ? this._symbolMap[0] : substituteItem;
          }

          if (substituteItem) {
            const symbol = substituteItem.iconDescr;

            const longIcon =
              this._slotParams.longIcons.find((p) => p.iconIndex === drawId / 100) || null;
            const iconLength = longIcon ? longIcon.length : 1;
            const symbolLength = symbol.length;

            const stoppedEntity =
              iconLength > symbolLength ||
              this._allowPartialSubstitution ||
              !this._hideBeforeAnimation
                ? this._reelsEngine.getStopedEntities(reelIndex, lineIndex)[0]
                : this._iconAnimationHelper.getEntities(pos)[0];
            const hiddedEntity = this._iconAnimationHelper.getEntities(pos)[0];
            substitutedEntities.push(stoppedEntity);
            const entityPosition = stoppedEntity.get(
              this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
            ) as any;
            const newDrawId = iconLength > symbolLength ? symbol.iconIndex : symbol.iconIndex + i;

            const iconsActions: IntervalAction[] = [];
            const entity = this._reelsEngine.CreateEntity(reelIndex, lineIndex, newDrawId, [
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

            const icons = this._iconModel.getAnimIcon(newDrawId);
            if (
              icons.some(
                (icon) => icon.stateMachine && icon.stateMachine.findById(substituteStateName)
              )
            ) {
              const animationDuration = this._iconAnimationHelper.getEntityAnimDuration(
                entity,
                substituteStateName
              );
              iconsActions.push(
                new FunctionAction(
                  () => this._reelsEngine.startAnimation(entity, substituteStateName),
                  false
                )
              );
              iconsActions.push(
                new FunctionAction(() => entity.addComponent(ComponentNames.Visible, true))
              );
              if (this._hideBeforeAnimation) {
                iconsActions.push(
                  new FunctionAction(() => hiddedEntity.addComponent(ComponentNames.Visible, false))
                );
              }
              iconsActions.push(new EmptyAction().withDuration(animationDuration));
              iconsActions.push(
                new FunctionAction(() =>
                  this._reelsEngine.stopAnimation(entity, substituteStateName)
                )
              );
              this.ProcessSubstitudeSymbolSounds(symbolActions, newDrawId);
            } else {
              iconsActions.push(
                new FunctionAction(() => entity.addComponent(ComponentNames.Visible, true))
              );
              if (this._hideBeforeAnimation) {
                iconsActions.push(
                  new FunctionAction(() => hiddedEntity.addComponent(ComponentNames.Visible, false))
                );
              }
            }

            iconsActions.push(
              new UpdateEntityCacheAction(
                this._container,
                entity,
                UpdateEntityCacheMode.Replace,
                UpdateEntityCacheMode.Replace
              )
            );

            symbolActions.push(new SequenceAction(iconsActions));
          }
        }
        actions.push(
          new SequenceAction([
            this.preSubstituteAction(symbolGroup),
            new ParallelAction(symbolActions),
            new FunctionAction(() => {
              if (!this._hideBeforeAnimation) {
                substitutedEntities.forEach((e) => e.addComponent(ComponentNames.Visible, false));
              }
            }),
          ])
        );
      }
      return new ParallelAction(actions);
    }
    return new EmptyAction();
  }

  private ProcessSubstitudeSymbolSounds(symbolActions: IntervalAction[], drawId: number): void {
    if (this._playSubstituteSound) {
      if (this._soundName) {
        const sound = this._reelsSoundModel.getSoundByName(this._soundName);
        symbolActions.push(new StopSoundAction(sound));
        symbolActions.push(PlaySoundAction.withSound(sound));
      } else {
        symbolActions.push(
          new FunctionAction(() => {
            this._iconsSoundModel.getIconSound(drawId).stop();
            this._iconsSoundModel.getIconSound(drawId).play();
          })
        );
      }
    }
  }
}

export class SubstituteIconItem {
  symbolId: number;
  iconDescr: IconDescr;

  constructor(symbolId: number, drawId: number, length: number, width: number = 1) {
    this.symbolId = symbolId;
    this.iconDescr = new IconDescr(drawId, length, width);
  }
}
