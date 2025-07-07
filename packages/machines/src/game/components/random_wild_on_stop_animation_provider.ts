import {
  Action,
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SceneObject,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse, SceneCommon } from '@cgs/common';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { SoundInstance } from '../../reels_engine/sound_instance';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import {
  T_IconsSoundModelComponent,
  T_IReelsConfigProvider,
  T_ISpinController,
  T_ResourcesComponent,
} from '../../type_definitions';
import {
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { DrawOrderConstants } from '../common/slot/views/base_popup_view';
import { ResourcesComponent } from './resources_component';
import { StringUtils } from '@cgs/shared';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { ISpinController } from '../common/footer/i_spin_controller';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';

export class RandomWildOnStopAnimationProvider {
  static readonly RandomWildMarker: string = 'FeatureRandomWild';
  private _reelsEngine: ReelsEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelSoundModel: ReelsSoundModel;
  private _iconsSoundModel: IconsSoundModel;
  private _marker: string;
  private _wildIconId: number;
  private _useEffectScene: boolean;
  private _useIconAnimDuration: boolean;
  private _effectStateName: string | null;
  private _stopEffectStateName: string | null;
  private _soundName: string | null;
  private _showIconsDelay: number;
  private _iconAnimationDelay: number;
  private _animateAllReels: boolean;
  private _reelEffectScene: SceneObject | null;
  private _reelEffectNodes: Map<number, SceneObject>;
  private _existingWildPositions: number[];
  private _reelEffectSound: SoundInstance | null;
  private _wildIconSound: SoundInstance;
  private _container: Container;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    marker: string,
    wildIconId: number,
    useEffectScene: boolean = false,
    runParallel: boolean = true,
    useIconAnimDuration: boolean = true,
    reelEffectSceneName: string | null = null,
    reelEffectNameFormat: string | null = null,
    stateMachineNodeName: string | null = null,
    effectStateName: string | null = null,
    stopEffectStateName: string | null = null,
    soundName: string | null = null,
    showIconsDelay: number = 0.0,
    iconAnimationDelay: number = 0.0,
    animateAllReels: boolean = false
  ) {
    this._container = container;
    this._marker = marker;
    this._wildIconId = wildIconId;
    this._useEffectScene = useEffectScene;
    this._useIconAnimDuration = useIconAnimDuration;
    this._effectStateName = effectStateName;
    this._stopEffectStateName = stopEffectStateName;
    this._soundName = soundName;
    this._showIconsDelay = showIconsDelay;
    this._iconAnimationDelay = iconAnimationDelay;
    this._animateAllReels = animateAllReels;

    this._reelEffectNodes = new Map<number, SceneObject>();
    this._existingWildPositions = new Array<number>();
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this._reelEffectSound =
      soundName && soundName.length > 0 ? this._reelSoundModel.getSoundByName(soundName) : null;
    this._wildIconSound = this._iconsSoundModel.getIconSound(wildIconId);

    this._gameStateMachine.stop.addLazyAnimationToBegin(
      () =>
        new FunctionAction(() => {
          this._reelsEngine.RemoveEntitiesByFilter([
            this._marker,
            RandomWildOnStopAnimationProvider.RandomWildMarker,
          ]);
        })
    );
    this._gameStateMachine.freeSpinsRecovery.entering.listen((_e) => this.InitExistingPositions());
    this._gameStateMachine.regularSpins.entering.listen(
      (_e) => (this._existingWildPositions.length = 0)
    );

    if (runParallel) {
      this._gameStateMachine.stop.addParallelLazyAnimation(() => this.buildRandomWildAction());
    } else {
      this._gameStateMachine.stop.addLazyAnimationToBegin(() => this.buildRandomWildAction());
    }

    this._gameStateMachine.stop.addLazyAnimationToBegin(
      () =>
        new FunctionAction(() => {
          this._wildIconSound.stop();
        })
    );

    if (
      useEffectScene &&
      (this._reelEffectScene = sceneCommon.sceneFactory.build(reelEffectSceneName!))
    ) {
      this._reelEffectScene.initialize();
      this._reelEffectScene.z = DrawOrderConstants.Top;

      const root = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
      root.addChild(this._reelEffectScene);

      const reelsConfig =
        container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
      for (let reel = 0; reel < reelsConfig.reelCount; reel++) {
        const effectNode = this._reelEffectScene.findById(
          StringUtils.format(reelEffectNameFormat!, [reel.toString()])
        );
        if (effectNode) {
          if (!stateMachineNodeName && effectNode.stateMachine) {
            this._reelEffectNodes.set(reel, effectNode);
          } else {
            const stateMachineNode = effectNode.findById(stateMachineNodeName!);
            if (stateMachineNode && stateMachineNode.stateMachine) {
              this._reelEffectNodes.set(reel, stateMachineNode);
            }
          }
        }
      }

      this._gameStateMachine.immediatelyStop.addLazyAnimationToBegin(
        () =>
          new FunctionAction(() => {
            this._reelEffectSound?.stop();
            this._reelEffectScene!.visible = false;
            this._reelEffectNodes.forEach((node, _reel) =>
              node.stateMachine!.switchToState(stopEffectStateName!)
            );
          })
      );
    }
  }

  private InitExistingPositions(): void {
    const randomWildSymbols = this._gameStateMachine.curResponse.specialSymbolGroups
      ? this._gameStateMachine.curResponse.specialSymbolGroups.filter((g) => g.type == this._marker)
      : null;

    if (randomWildSymbols && randomWildSymbols.length > 0) {
      const wildPositions = new Array<number>();
      randomWildSymbols.forEach((s) => wildPositions.push(...s.positions!));
      this._existingWildPositions.length = 0;
      this._existingWildPositions.push(...wildPositions);
    }
  }

  private buildRandomWildAction(): Action {
    const controller = this._container.forceResolve<ISpinController>(T_ISpinController);
    controller.disableSpinButton();
    if (
      this._gameStateMachine.curResponse.specialSymbolGroups &&
      !this._gameStateMachine.curResponse.specialSymbolGroups.some((g) => g.type == 'cheshire')
    ) {
      return new EmptyAction();
    }
    const randomWildSymbols = this._gameStateMachine.curResponse.specialSymbolGroups
      ? this._gameStateMachine.curResponse.specialSymbolGroups.filter((g) => g.type == this._marker)
      : null;

    if (!randomWildSymbols || !randomWildSymbols.length) {
      return new EmptyAction().withDuration(0.0);
    }

    let wildPositions = new Array<number>();
    randomWildSymbols.forEach((s) => wildPositions.push(...s.positions!));
    wildPositions = wildPositions.filter((p) => !this._existingWildPositions.includes(p));

    if (wildPositions.length == 0) {
      return new EmptyAction().withDuration(0.0);
    }

    this._existingWildPositions.push(...wildPositions);

    let reelEffectActions: IntervalAction[] = [new EmptyAction()];
    let stopEffectActions: IntervalAction[] = [new EmptyAction()];

    if (this._useEffectScene) {
      let effectReels = wildPositions.map((p) => this._reelsEngine.getReelByPosition(p));
      this.uniqifyList(effectReels);
      effectReels = effectReels.filter((reel) => this._reelEffectNodes.has(reel));

      if (effectReels.length == 0) {
        return new EmptyAction().withDuration(0.0);
      }

      if (this._animateAllReels) {
        const reelRange = new Array<number>(this._reelsEngine.ReelConfig.reelCount).filter((reel) =>
          this._reelEffectNodes.has(reel)
        );

        reelEffectActions = reelRange.map(
          (reel) =>
            new FunctionAction(() =>
              this._reelEffectNodes.get(reel)!.stateMachine!.switchToState(this._effectStateName!)
            )
        );

        stopEffectActions = reelRange.map(
          (reel) =>
            new FunctionAction(() =>
              this._reelEffectNodes
                .get(reel)!
                .stateMachine!.switchToState(this._stopEffectStateName!)
            )
        );
      } else {
        reelEffectActions = effectReels.map(
          (reel) =>
            new FunctionAction(() =>
              this._reelEffectNodes.get(reel)!.stateMachine!.switchToState(this._effectStateName!)
            )
        );

        stopEffectActions = effectReels.map(
          (reel) =>
            new FunctionAction(() =>
              this._reelEffectNodes
                .get(reel)!
                .stateMachine!.switchToState(this._stopEffectStateName!)
            )
        );
      }

      reelEffectActions.push(
        new FunctionAction(() => {
          this._reelEffectSound?.stop();
          this._reelEffectSound?.play();
        })
      );
    }
    const animateIconActions: IntervalAction[] = [];
    for (const position of wildPositions) {
      const reel = this._reelsEngine.getReelByPosition(position);
      const line = this._reelsEngine.getLineByPosition(position);

      const entity = this._reelsEngine.CreateEntity(reel, line, this._wildIconId, [
        this._marker,
        RandomWildOnStopAnimationProvider.RandomWildMarker,
      ]);
      const offset = this._reelsEngine.internalConfig.reelsOffset[reel];
      entity.addComponent(
        ComponentNames.Position,
        new Vector2(
          this._reelsEngine.ReelConfig.symbolSize.x * reel + offset.x,
          this._reelsEngine.ReelConfig.symbolSize.y * line + offset.y
        )
      );

      const entityCacheHolder = this._reelsEngine.entityCacheHolder;
      const entities = entityCacheHolder.getAnimationEntities(reel, line, false);
      entity.addComponent(ComponentNames.Visible, false);

      const parallelShowActions = new ParallelAction([
        new SequenceAction([
          new EmptyAction().withDuration(0.5),
          new FunctionAction(() => {
            for (const en of entities) {
              en.addComponent(ComponentNames.DrawableIndex, this._wildIconId);
            }
          }),
        ]),
        new SequenceAction([
          new FunctionAction(() => entity.register()),
          new FunctionAction(() => entity.addComponent(ComponentNames.Visible, true)),
          new SequenceAction([
            new FunctionAction(() =>
              this._reelsEngine.iconAnimationHelper.startAnimOnEntity(entity, 'show')
            ),
            this._useIconAnimDuration
              ? new SequenceAction([
                  new EmptyAction().withDuration(
                    this._reelsEngine.iconAnimationHelper.getAnimDurationByIconId(
                      this._wildIconId,
                      'show'
                    )
                  ),
                  new FunctionAction(() =>
                    this._reelsEngine.iconAnimationHelper.stopAnimOnEntity(entity, 'show')
                  ),
                ])
              : new EmptyAction(),
          ]),
        ]),
      ]);

      animateIconActions.push(parallelShowActions);
    }

    return new ParallelAction([
      new SequenceAction([
        new FunctionAction(() => {
          if (this._useEffectScene) {
            this._reelEffectScene!.visible = true;
          }
        }),
        new ParallelAction(reelEffectActions),
        new EmptyAction().withDuration(this._showIconsDelay),
        new ParallelAction(stopEffectActions),
      ]),
      new SequenceAction([
        new EmptyAction().withDuration(this._iconAnimationDelay),
        new SequenceAction(animateIconActions),
      ]),
    ]);
  }

  private uniqifyList(list: any[]): void {
    for (let i = 0; i < list.length; i++) {
      const o = list[i];
      let index: number;
      do {
        index = list.indexOf(o, i + 1);
        if (index != -1) {
          list.splice(index, 1);
        }
      } while (index != -1);
    }
  }
}
