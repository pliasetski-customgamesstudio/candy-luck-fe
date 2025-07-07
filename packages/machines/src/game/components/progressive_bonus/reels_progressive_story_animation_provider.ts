import { ISpinResponse, SceneCommon, SpecialSymbolGroup } from '@cgs/common';
import { LazyAction, StringUtils } from '@cgs/shared';
import {
  Container,
  SceneObject,
  Action,
  Vector2,
  ParallelSimpleAction,
  SequenceSimpleAction,
  EmptyAction,
  FunctionAction,
} from '@cgs/syd';
import { DrawOrderConstants } from '../../common/slot/views/base_popup_view';
import { ComponentIndex } from '../../../reels_engine/entities_engine/component_index';
import { Entity } from '../../../reels_engine/entities_engine/entity';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { IconAnimationHelper } from '../../../reels_engine/utils/icon_animation_helper';
import {
  T_ISlotGameEngineProvider,
  T_IGameStateMachineProvider,
  T_RegularSpinsSoundModelComponent,
  T_IconsSceneObjectComponent,
  T_ResourcesComponent,
  T_CharacterAnimationProvider,
} from '../../../type_definitions';
import {
  CharacterAnimationProvider,
  CharacterActionTypes,
} from '../characters/character_animation_provider';
import { IconsSceneObjectComponent } from '../icons_scene_object_component';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { ResourcesComponent } from '../resources_component';
import { ReelProgressiveStoryItem } from './reel_progressive_story_item';

export class ReelsProgressiveStoryAnimationProvider {
  private _container: Container;
  private _sceneCommon: SceneCommon;
  private _reelsEngine: ReelsEngine;
  private _iconAnimationHelper: IconAnimationHelper;
  private _reelsSoundModel: ReelsSoundModel;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _characterAnimationProvider: CharacterAnimationProvider;

  private _storyItems: ReelProgressiveStoryItem[];
  private _marker: string;
  private _activationFeatureMarker: string;
  private _storySceneName: string;
  private _progressiveScene: SceneObject;
  private _drawableIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;

  private _initialized = false;
  private _progressiveAction: Action;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    marker: string,
    activationFeatureMarker: string,
    storySceneName: string,
    storyItems: ReelProgressiveStoryItem[]
  ) {
    this._container = container;
    this._sceneCommon = sceneCommon;
    this._marker = marker;
    this._activationFeatureMarker = activationFeatureMarker;
    this._storySceneName = storySceneName;
    this._storyItems = storyItems;

    this._reelsEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._characterAnimationProvider = this._container.forceResolve<CharacterAnimationProvider>(
      T_CharacterAnimationProvider
    );

    this._drawableIndex = this._reelsEngine.entityEngine.getComponentIndex(
      ComponentNames.DrawableIndex
    );
    this._lineIndex = this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.LineIndex);

    this._progressiveAction = new LazyAction(() =>this.progressiveAction());
    this._gameStateMachine.stop.appendLazyAnimation(() => this._progressiveAction);

    this._gameStateMachine.accelerate.entered.listen(() => this.onAccelerateentered());
    this._gameStateMachine.stop.entered.listen(() => this.onStopEntered());
    this._gameStateMachine.endFreeSpinsPopup.leaved.listen(() => this.onEndFreeSpinsPopupExited());

    this._gameStateMachine.scatter.entered.listen(() => this.recovery());
    this._gameStateMachine.idle.entered.listen(() => this.recovery());
    this._gameStateMachine.freeSpinsRecovery.entered.listen(() => this.recovery());
    this._gameStateMachine.bonusRecovery.entered.listen(() => this.recovery());
  }

  private initStoryScene(): void {
    this._progressiveScene = this._sceneCommon.sceneFactory.build(
      this._storySceneName
    ) as SceneObject;
    this._progressiveScene.initialize();
    const iconsNode = this._container.forceResolve<IconsSceneObjectComponent>(
      T_IconsSceneObjectComponent
    ).iconsRender;
    const iconsNodePosition = new Vector2(iconsNode.worldTransform.tx, iconsNode.worldTransform.ty);
    this._container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .root.inverseTransform.transformVectorInplace(iconsNodePosition);
    this._progressiveScene.position = this._progressiveScene.position.subtract(iconsNodePosition);
    this._progressiveScene.z = DrawOrderConstants.ProgressiveBonusDrawOrder;
    iconsNode.addChild(this._progressiveScene);

    for (const storyItem of this._storyItems) {
      const storyItemNode = this._progressiveScene.findById(storyItem.storyHolderId);
      if (storyItemNode) {
        storyItem.progressNode = this._sceneCommon.sceneFactory.build(storyItem.progressScene)!;
        storyItem.progressNode.initialize();
        storyItem.spinsToLiveIndicatorNode = storyItem.progressNode.findById(
          storyItem.spinsToLiveIndicatorId
        )!;
        storyItemNode.addChild(storyItem.progressNode);
      }
    }
  }

  private progressiveAction(): Action {
    const storySymbols = this.getStorySymbols();
    const activatingSymbols = this.getActivatingSymbols();
    const actions: Action[] = [];
    for (const storySymbol of storySymbols) {
      for (const position of storySymbol.positions!) {
        actions.push(
          new ParallelSimpleAction([
            this.buildIconAnimationAction(position),
            this.buildStoryProgressAction(storySymbol),
          ])
        );
      }
    }

    actions.push(...activatingSymbols.map(this.buildActivateAction));

    return actions.length > 0
      ? new SequenceSimpleAction(actions)
      : new EmptyAction().withDuration(0.0);
  }

  private buildIconAnimationAction(position: number): Action {
    return new SequenceSimpleAction([
      new FunctionAction(() => {
        this._iconAnimationHelper.startAnimOnIcon(position, 'animL');
        for (const soundEntity of this._iconAnimationHelper.getSoundEntities(position)) {
          const sound = this._reelsSoundModel.getSoundByName(
            'collect_' + soundEntity.get(this._drawableIndex)!.toString()
          );
          sound.stop();
          sound.play();
        }
      }),
      new EmptyAction().withDuration(
        this._iconAnimationHelper.getMaxAnimDuration(position, 'animL')
      ),
      new FunctionAction(() => this._iconAnimationHelper.stopAnimOnIcon(position, 'animL')),
    ]);
  }

  private buildStoryProgressAction(storySymbol: SpecialSymbolGroup): Action {
    const storyItem = this.getStoryItemForSymbol(storySymbol);
    const actions: Action[] = [];
    const activatedReels = this.getActivatingSymbols().map((s) =>
      this._iconAnimationHelper.getReelIndex(s!.positions![0])
    );

    if (
      storySymbol.collectCount === storyItem.maxCollectCount &&
      !activatedReels.includes(storyItem.reel)
    ) {
      actions.push(
        new SequenceSimpleAction([
          this.getCharacterProgressReaction(storyItem.reel, storyItem.collectCount),
          new FunctionAction(() => storyItem.progressNode.stateMachine!.switchToState('wait')),
        ])
      );
    } else {
      if (
        storyItem.collectCount < storyItem.maxCollectCount - 1 ||
        !activatedReels.includes(storyItem.reel)
      ) {
        actions.push(
          new SequenceSimpleAction([
            this.getCharacterProgressReaction(storyItem.reel, storyItem.collectCount),
            new FunctionAction(() => storyItem.progressNode.stateMachine!.switchToState('next')),
          ])
        );
      }
    }

    if (actions.length > 0) {
      storyItem.collectCount++;
      actions.push(new EmptyAction().withDuration(1.0));
      return new SequenceSimpleAction(actions);
    }

    return new EmptyAction().withDuration(0.0);
  }

  private buildActivateAction(activatingSymbol: SpecialSymbolGroup): Action {
    const storyItem = this.getStoryItemForSymbol(activatingSymbol);
    const actions: Action[] = [];
    const activatedReels = this.getActivatingSymbols().map((s) =>
      this._iconAnimationHelper.getReelIndex(s!.positions![0])
    );

    if (
      activatedReels.includes(storyItem.reel) &&
      !storyItem.isActivated &&
      storyItem.collectCount > 0
    ) {
      storyItem.collectCount = 0;
      storyItem.isActivated = true;
      if (storyItem.spinsToLiveIndicatorNode && storyItem.spinsToLiveIndicatorNode.stateMachine) {
        const reelEntities: Entity[] = [];
        for (let line = 0; line < this._reelsEngine.ReelConfig.lineCount; line++) {
          reelEntities.push(
            ...this._iconAnimationHelper.getEntities(
              this._iconAnimationHelper.getPosition(storyItem.reel, line)
            )
          );
        }

        actions.push(
          new SequenceSimpleAction([
            new ParallelSimpleAction([
              this.getCharacterActivateReaction(storyItem.reel),
              new FunctionAction(() => storyItem.progressNode.stateMachine!.switchToState('next')),
              new EmptyAction().withDuration(1.0),
            ]),
            new ParallelSimpleAction([
              new FunctionAction(() =>
                storyItem.spinsToLiveIndicatorNode.stateMachine!.switchToState(
                  StringUtils.format('show_{0}', [this.getSpinsToLive().toString()])
                )
              ),
              new FunctionAction(() =>
                reelEntities.forEach((e) =>
                  e.set(
                    this._drawableIndex,
                    storyItem.featureIconId + e.get<number>(this._lineIndex)
                  )
                )
              ),
              new FunctionAction(() => this._reelsEngine.frozenReels.push(storyItem.reel)),
              new FunctionAction(() => (storyItem.spinsToLive = this.getSpinsToLive())),
            ]),
          ])
        );
      }
    }

    return actions.length > 0
      ? new SequenceSimpleAction(actions)
      : new EmptyAction().withDuration(0.0);
  }

  private onAccelerateentered(): void {
    this._storyItems
      .filter((i) => i.isActivated)
      .forEach((i) => {
        i.spinsToLiveIndicatorNode.stateMachine!.switchToState('back');
        i.spinsToLive--;
      });
  }

  private onEndFreeSpinsPopupExited(): void {
    this._storyItems
      .filter((i) => i.isActivated)
      .forEach((i) => {
        i.reset();
        i.progressNode.stateMachine!.switchToState('next');

        this._reelsEngine.frozenReels = this._reelsEngine.frozenReels.filter(
          (reel) => reel !== i.reel
        );
      });
  }

  private onStopEntered(): void {
    if (
      this._gameStateMachine.curResponse.freeSpinsInfo &&
      this._gameStateMachine.curResponse.freeSpinsInfo.event ===
        FreeSpinsInfoConstants.FreeSpinsAdded
    ) {
      this._storyItems
        .filter((i) => i.isActivated && i.spinsToLive === 0)
        .forEach((i) => {
          i.reset();
          i.progressNode.stateMachine!.switchToState('next');
          this._reelsEngine.frozenReels.filter((reel) => reel !== i.reel);
        });
    }
  }

  private recovery(): void {
    if (!this._initialized) {
      this.initStoryScene();
      this._initialized = true;

      const storySymbols = this.getStorySymbols();

      if (storySymbols && storySymbols.length > 0) {
        for (const storyItem of this._storyItems) {
          if (
            storyItem.progressNode &&
            storyItem.progressNode.stateMachine &&
            storySymbols[storyItem.reel].collectCount! > 0
          ) {
            if (storySymbols[storyItem.reel].collectCount === storyItem.maxCollectCount) {
              storyItem.progressNode.stateMachine.switchToState(
                'step_' + (storySymbols[storyItem.reel].collectCount! - 2).toString()
              );
              storyItem.progressNode.stateMachine.switchToState('wait');
            } else {
              storyItem.progressNode.stateMachine.switchToState(
                'step_' + (storySymbols[storyItem.reel].collectCount! - 1).toString()
              );
            }
          }

          storyItem.collectCount = storySymbols[storyItem.reel].collectCount!;
        }

        const activatingSymbols = this.getActivatingSymbols();
        for (const activatingSymbol of activatingSymbols) {
          const storyItem = this._storyItems.find(
            (i) => i.reel === this._iconAnimationHelper.getReelIndex(activatingSymbol.positions![0])
          )!;

          storyItem.progressNode.stateMachine!.switchToState(
            'step_' + (storyItem.maxCollectCount - 1).toString()
          );
          storyItem.spinsToLiveIndicatorNode.stateMachine!.switchToState(
            'step_' + this.getSpinsToLive().toString()
          );

          const reelEntities: Entity[] = [];
          for (let line = 0; line < this._reelsEngine.ReelConfig.lineCount; line++) {
            reelEntities.push(
              ...this._iconAnimationHelper.getEntities(
                this._iconAnimationHelper.getPosition(storyItem.reel, line)
              )
            );
          }

          reelEntities.forEach((e) =>
            e.set(this._drawableIndex, storyItem.featureIconId + e.get<number>(this._lineIndex))
          );
          storyItem.spinsToLive =
            this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count!;
          storyItem.collectCount = storyItem.maxCollectCount;
          storyItem.isActivated = true;
          this._reelsEngine.frozenReels.push(storyItem.reel);
        }
      }
    }
  }

  private getStorySymbols(): SpecialSymbolGroup[] {
    const symbols = this._gameStateMachine.curResponse.specialSymbolGroups;
    return symbols ? symbols.filter((p) => p.type === this._marker) : [];
  }

  private getActivatingSymbols(): SpecialSymbolGroup[] {
    const symbols = this._gameStateMachine.curResponse.specialSymbolGroups;
    return symbols ? symbols.filter((p) => p.type === this._activationFeatureMarker) : [];
  }

  private getStoryItemForSymbol(storySymbol: SpecialSymbolGroup): ReelProgressiveStoryItem {
    const iconPosition = storySymbol.positions![0];
    const reel = this._iconAnimationHelper.getReelIndex(iconPosition);
    return this._storyItems.find((i) => i.reel === reel)!;
  }

  private getSpinsToLive(): number {
    return this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count!;
  }

  private getCharacterProgressReaction(reel: number, step: number): Action {
    if (!this._characterAnimationProvider) {
      return new EmptyAction().withDuration(0.0);
    }

    return this._characterAnimationProvider.performAction(
      CharacterActionTypes.Custom,
      StringUtils.format('story_{0}_step_{1}', [reel.toString(), step.toString()])
    );
  }

  private getCharacterActivateReaction(reel: number): Action {
    if (!this._characterAnimationProvider) {
      return new EmptyAction().withDuration(0.0);
    }

    return this._characterAnimationProvider.performAction(
      CharacterActionTypes.Custom,
      StringUtils.format('story_{0}_activated', [reel.toString()])
    );
  }
}
