import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse, SceneCommon, SpecialSymbolGroup } from '@cgs/common';
import { FunctionAction, SceneObject, TextSceneObject } from '@cgs/syd';
import { ResourcesComponent } from '../../resources_component';
import { Container } from '@cgs/syd';
import { MultiSceneReelsEngineV2 } from '../../../../reels_engine/multi_scene_reels_engine_v2';
import { ISlotGame } from '../../../../reels_engine/i_slot_game';
import {
  T_IGameStateMachineProvider,
  T_ISlotGame,
  T_ISlotGameEngineProvider,
  T_ResourcesComponent,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { StringUtils } from '@cgs/shared';

export class Game112SuperSpinsProgressComponent {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _superNodes: SceneObject[];
  private _destinationHolder: SceneObject;
  private _gameNode: SceneObject;
  private _bonusSpinsNodes: SceneObject[];
  private _gameResourceProvider: ResourcesComponent;
  private _isLoaded = false;
  private _container: Container;
  private _sceneCommon: SceneCommon;
  private _reelEngine: MultiSceneReelsEngineV2;
  private _prevFcCounter = -1;

  constructor(container: Container, _sceneCommon: SceneCommon) {
    this._container = container;
    this._sceneCommon = _sceneCommon;
    this._gameNode = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._superNodes = this._gameNode.findAllById('superSpins');
    this._bonusSpinsNodes = this._gameNode.findAllById('bonusSpins');
    this._gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._reelEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as MultiSceneReelsEngineV2;

    this._reelEngine.reelStoped.listen((reel) => {
      if (this._reelEngine.startAnimOnIcon) {
        for (
          let i = -this._reelEngine.internalConfig.additionalUpLines;
          i <
          this._reelEngine.internalConfig.lineCount -
            this._reelEngine.internalConfig.additionalUpLines;
          i++
        ) {
          const entities = this._reelEngine.getReelStopedEntities(reel, i, false);
          for (const entity of entities) {
            const drawId = entity.get<number>(
              this._reelEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
            );
            if (drawId < 14) {
              this._reelEngine.switchIconToState(entity, 'alpha_hide');
              const unsubscribe = entity
                .get<SceneObject>(
                  this._reelEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
                )
                .stateMachine!.findById('alpha_hide')!
                .enterAction.done.listen((_e) => {
                  this._reelEngine.switchIconToState(entity, 'default');
                  unsubscribe.cancel();
                });
            }
          }
        }
      }
      let fcCounter = 0;
      for (let i = 0; i <= reel; i++) {
        for (let line = 0; line < this._reelEngine.ReelConfig.lineCount; line++) {
          if (
            this._gameStateMachine.curResponse.viewReels[i][line] == 14 ||
            this._gameStateMachine.curResponse.viewReels[i][line] == 15
          ) {
            fcCounter++;
          }
        }
      }
      if (fcCounter == 8) {
        this._reelEngine.startAnimOnIcon = true;
      }
    });

    this._reelEngine.entityDirectionChanged.listen((rl) => {
      const reel = rl.item1;
      const line = rl.item2;
      if (line < 0 || line > 2) {
        return;
      }
      let fcCounter = 0;
      for (let i = 0; i <= reel; i++) {
        const lines = reel == i ? line + 1 : this._reelEngine.ReelConfig.lineCount;
        for (let l = 0; l < lines; l++) {
          if (
            this._gameStateMachine.curResponse.viewReels[i][l] == 14 ||
            this._gameStateMachine.curResponse.viewReels[i][l] == 15
          ) {
            fcCounter++;
          }
        }
      }
      fcCounter = fcCounter > 9 ? 4 : fcCounter - 5;
      if (fcCounter > this._prevFcCounter) {
        if (this._prevFcCounter >= 0) {
          this._gameNode
            .findById(StringUtils.format('fc_anim_{0}', [this._prevFcCounter]))!
            .stateMachine!.switchToState('fc_empty');
        }
        if (fcCounter >= 0) {
          this._gameNode
            .findById(StringUtils.format('fc_anim_{0}', [fcCounter]))!
            .stateMachine!.switchToState('fc_anim');
        }
      }
      this._prevFcCounter = fcCounter;
    });

    this._gameStateMachine.init.appendLazyAnimation(
      () =>
        new FunctionAction(() => {
          this.onProcessRecovery();
        })
    );

    this._gameStateMachine.accelerate.entered.listen((_e) => {
      this._reelEngine.startAnimOnIcon = false;
      this._prevFcCounter = -1;
      for (let i = 0; i < 5; i++) {
        this._gameNode
          .findById(StringUtils.format('fc_anim_{0}', [i]))!
          .stateMachine!.switchToState('fc_empty');
      }
    });

    this._gameStateMachine.beginBonus.addLazyAnimationToBegin(
      () =>
        new FunctionAction(() => {
          this.onUpdateFSProgress();
        })
    );

    this._gameStateMachine.beginFreeSpinsPopup.appendLazyAnimation(
      () =>
        new FunctionAction(() => {
          this.onStartFreeSpins();
        })
    );

    this._gameStateMachine.freeSpins.appendLazyAnimation(
      () =>
        new FunctionAction(() => {
          this.onStartFreeSpins();
        })
    );

    this._gameStateMachine.endFreeSpinsPopup.appendLazyAnimation(
      () =>
        new FunctionAction(() => {
          this.onEndFreeSpins();
        })
    );
  }

  onEndFreeSpins() {
    for (const _bonusSpinsNode of this._bonusSpinsNodes) {
      _bonusSpinsNode.stateMachine!.switchToState('hide');
    }
  }

  onStartFreeSpins() {
    if (this._gameStateMachine.curResponse.specialSymbolGroups) {
      const specGroups = this._gameStateMachine.curResponse.specialSymbolGroups;

      this.showBonusSpinsView(specGroups, false);

      const currentProgress = specGroups.find((arg) => arg.type == 'Progress');
      if (
        !currentProgress ||
        currentProgress.collectCount == 0 ||
        currentProgress.collectCount == 20
      ) {
        for (const _superNode of this._superNodes) {
          _superNode.stateMachine!.switchToState('step_0');
        }
        return;
      }
    }
  }

  onProcessRecovery(): void {
    if (this._isLoaded) {
      return;
    }
    this._isLoaded = true;

    const slotContentManagerProvider = this._sceneCommon.sceneFactory;
    const scene = slotContentManagerProvider.build('additional/bonusAnim');
    if (scene) {
      scene.initialize();
      if (this._gameResourceProvider) {
        const holder = this._gameResourceProvider.root.findById('bonusAnimHolder');
        if (holder) holder.addChild(scene);
      }
    }

    if (this._gameStateMachine.curResponse.specialSymbolGroups) {
      const specGroups = this._gameStateMachine.curResponse.specialSymbolGroups;
      if (this._gameStateMachine.curResponse.isFreeSpins) {
        this.showBonusSpinsView(specGroups, true);
      }
      const currentProgress = specGroups.find((arg) => arg.type == 'Progress');
      if (
        !currentProgress ||
        currentProgress.collectCount == 0 ||
        currentProgress.collectCount == 20
      ) {
        for (const _superNode of this._superNodes) {
          _superNode.stateMachine!.switchToState('step_0');
        }
        return;
      }
      const progressState = `step_${currentProgress.collectCount || 0}`;
      for (const _superNode of this._superNodes) {
        _superNode.stateMachine!.switchToState(progressState);
      }
    }
  }

  onUpdateFSProgress() {
    const specGroups = this._gameStateMachine.curResponse.specialSymbolGroups;
    const currentProgress = specGroups?.find((arg) => arg.type == 'Progress');
    if ((currentProgress?.collectCount || 0) === 0) {
      for (const _superNode of this._superNodes) {
        _superNode.stateMachine!.switchToState('step_0');
      }
    } else {
      for (const _superNode of this._superNodes) {
        _superNode.stateMachine!.switchToState('next');
      }
    }
  }

  showBonusSpinsView(specGroups: SpecialSymbolGroup[], restore: boolean) {
    const prefix = restore ? 'r' : 'show';
    if (this.isMultiplierEnabled(specGroups) && this.isRetriggerEnabled(specGroups)) {
      for (const _bonusSpinsNode of this._bonusSpinsNodes) {
        _bonusSpinsNode.stateMachine!.switchToState(prefix + '_mult_rtg');
      }
      this.updateMultTextEntries(specGroups);
    } else if (this.isRetriggerEnabled(specGroups)) {
      for (const _bonusSpinsNode of this._bonusSpinsNodes) {
        _bonusSpinsNode.stateMachine!.switchToState(prefix + '_rtg');
      }
    } else if (this.isMultiplierEnabled(specGroups)) {
      for (const _bonusSpinsNode of this._bonusSpinsNodes) {
        _bonusSpinsNode.stateMachine!.switchToState(prefix + '_mult');
      }
      this.updateMultTextEntries(specGroups);
    } else {
      for (const _bonusSpinsNode of this._bonusSpinsNodes) {
        _bonusSpinsNode.stateMachine!.switchToState(prefix);
      }
    }
  }

  isMultiplierEnabled(specGroup: SpecialSymbolGroup[]): boolean {
    if (!specGroup) {
      return false;
    }
    return specGroup.some((x) => x.type == 'Multiplier');
  }

  isRetriggerEnabled(specGroup: SpecialSymbolGroup[]): boolean {
    if (!specGroup) {
      return false;
    }
    return specGroup.some((x) => x.type == 'ReTrigger');
  }

  updateMultTextEntries(specGroup: SpecialSymbolGroup[]) {
    const collectCount = specGroup
      .find((arg) => arg.type == 'Multiplier')
      ?.collectCount?.toString();

    for (const _bonusSpinsNode of this._bonusSpinsNodes) {
      const multipliers = _bonusSpinsNode.findAllById('multiplier_text');
      for (const txtNode of multipliers) {
        const node = txtNode as TextSceneObject;
        if (node) {
          node.text = collectCount ?? '';
        }
      }
    }
  }
}
