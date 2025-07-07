import {
  Action,
  Container,
  EmptyAction,
  FunctionAction,
  InterpolateInplaceAction,
  IntervalAction,
  ParallelSimpleAction,
  SceneObject,
  SequenceSimpleAction,
  Vector2,
} from '@cgs/syd';
import { IBreakeable } from './node_tap_action/progressive_breaker/ibreakeable';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ResourcesComponent } from './resources_component';
import { ISpinResponse, SceneCommon } from '@cgs/common';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { SoundInstance } from '../../reels_engine/sound_instance';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import {
  T_CharacterAnimationProvider,
  T_IconsSoundModelComponent,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
} from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { CharacterAnimationProvider } from './characters/character_animation_provider';
import { LazyAction } from '@cgs/shared';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';
import { EntityRemovalSystem } from '../../reels_engine/systems/entity_removal_system';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';

export class RandomWildByCharacterProvider implements IBreakeable {
  private _reelsEngine: ReelsEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _resourcesComponent: ResourcesComponent;
  private _sceneCommon: SceneCommon;
  private _iconsSoundModel: IconsSoundModel;
  private _reelSoundModel: ReelsSoundModel;
  private _marker: string;
  private _featureSceneName: string;
  private _characterDefaultAction: string;
  private _characterAction: string;
  private _movingSoundName: string;
  private _wildIconId: number;
  private _wildIconSound: SoundInstance;
  private _movingSound: SoundInstance;
  private _characterScene: SceneObject;
  private _animIconHolder: SceneObject;
  private _randomWildAction: Action;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    marker: string,
    wildIconId: number,
    characterNode: string = 'character',
    _characterAction: string = 'RandomWild',
    _featureSceneName: string = 'slot/feature_wild',
    _characterDefaultAction: string = 'idle',
    movingSoundName: string = 'sound_random_wild'
  ) {
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this._reelSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._wildIconSound = this._iconsSoundModel.getIconSound(wildIconId);
    this._animIconHolder = this._resourcesComponent.slot.findById('anim_icons_holder')!;
    this._movingSound = this._reelSoundModel.getSoundByName(movingSoundName);

    const characterAnimationProvider: CharacterAnimationProvider = container.forceResolve(
      T_CharacterAnimationProvider
    );
    this._characterScene = characterAnimationProvider.characters[characterNode];
    if (characterAnimationProvider.characterId) {
      this._characterScene = this._characterScene.findById(characterAnimationProvider.characterId)!;
    }

    this._randomWildAction = new LazyAction(() => this.buildRandomWildAction());
    this._gameStateMachine.stop.animation = new SequenceSimpleAction([
      this._randomWildAction,
      this._gameStateMachine.stop.animation,
    ]);

    this.createSystems();
  }

  private createSystems(): void {
    const updateEntityCacheSystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(this._marker)],
      UpdateEntityCacheMode.Replace,
      UpdateEntityCacheMode.Replace
    ).withInitialize();
    updateEntityCacheSystem.updateOrder = 501;
    updateEntityCacheSystem.register();

    const entityRemovalSystem = new EntityRemovalSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig,
      this._marker
    );
    entityRemovalSystem.updateOrder = 601;
    entityRemovalSystem.register();
  }

  public doBreak(): void {
    if (this._randomWildAction && !this._randomWildAction.isDone) {
      this._characterScene.stateMachine!.switchToState(this._characterDefaultAction);
      this._randomWildAction.end();
    }
  }

  private buildRandomWildAction(): Action {
    const randomWildSymbols = this._gameStateMachine.curResponse.specialSymbolGroups
      ? this._gameStateMachine.curResponse.specialSymbolGroups.filter((g) => g.type == this._marker)
      : null;

    if (!randomWildSymbols || randomWildSymbols.length == 0) {
      return new EmptyAction().withDuration(0.0);
    }

    const wildPositions: number[] = [];
    randomWildSymbols.forEach((s) => wildPositions.push(...s.positions!));

    if (wildPositions.length == 0) {
      return new EmptyAction().withDuration(0.0);
    }

    const characterActions: Action[] = [];
    const movingActions: Action[] = [];
    const addIconsAction: Action[] = [];
    const animateIconActions: Action[] = [];

    characterActions.push(
      new FunctionAction(() => {
        this._characterScene.stateMachine!.switchToState(this._characterDefaultAction);
        this._characterScene.stateMachine!.switchToState(this._characterAction);
      }, false)
    );
    characterActions.push(new EmptyAction().withDuration(0.9));

    let featureAnimDuration = 0.0;

    for (const position of wildPositions) {
      const featureActions: Action[] = [];
      const reel = this._reelsEngine.getReelByPosition(position);
      const line = this._reelsEngine.getLineByPosition(position);

      const scene = this._buildMovingScene();
      if (featureAnimDuration == 0) {
        featureAnimDuration = (scene.stateMachine!.findById('anim')!.enterAction as IntervalAction)
          .duration;
      }

      const startPosition = new Vector2(
        this._characterScene.findById('hat_holder')!.worldTransform.tx,
        this._characterScene.findById('hat_holder')!.worldTransform.ty
      );
      this._resourcesComponent.root.inverseTransform.transformVectorInplace(startPosition);
      featureActions.push(new FunctionAction(() => (scene.position = startPosition)));

      const placeholderEntity = this._reelsEngine.entityCacheHolder.getAnimationEntities(
        reel,
        line,
        true
      )[0];
      const enumerationIndex = placeholderEntity.get(
        this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.EnumerationIndex)
      );

      featureActions.push(
        new ParallelSimpleAction([
          this._featureMoveAction(
            scene,
            startPosition,
            placeholderEntity
              .get<Vector2>(
                this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
              )
              .add(this._animIconHolder.position)
              .add(
                new Vector2(
                  this._reelsEngine.ReelConfig.symbolSize.x / 2,
                  this._reelsEngine.ReelConfig.symbolSize.y / 2
                )
              ),
            featureAnimDuration
          ),
          new FunctionAction(() => {
            scene.visible = true;
            scene.stateMachine!.switchToState('default');
            scene.stateMachine!.switchToState('anim');
            this._movingSound.stop();
            this._movingSound.play();
          }, false),
        ])
      );

      featureActions.push(
        new SequenceSimpleAction([
          new EmptyAction().withDuration(featureAnimDuration),
          new FunctionAction(() => {
            scene.visible = false;
            this._resourcesComponent.root.removeChild(scene);
          }),
        ])
      );

      movingActions.push(new SequenceSimpleAction(featureActions));

      const entity = this._reelsEngine.CreateEntity(reel, line, this._wildIconId, [this._marker]);
      const offset = this._reelsEngine.internalConfig.reelsOffset[reel];
      entity.addComponent(
        ComponentNames.Position,
        new Vector2(
          this._reelsEngine.ReelConfig.symbolSize.x * reel + offset.x,
          this._reelsEngine.ReelConfig.symbolSize.y * line + offset.y
        )
      );
      entity.addComponent(ComponentNames.EnumerationIndex, enumerationIndex);
      entity.addComponent(ComponentNames.Visible, false);
      entity.addComponent(ComponentNames.ToRemoveIndex, true);

      addIconsAction.push(new FunctionAction(() => entity.register()));
      animateIconActions.push(
        new SequenceSimpleAction([
          new FunctionAction(() =>
            entity.set(
              this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.Visible),
              true
            )
          ),
          new FunctionAction(
            () => this._reelsEngine.iconAnimationHelper.startAnimOnEntity(entity, 'show'),
            false
          ),
          new EmptyAction().withDuration(
            this._reelsEngine.iconAnimationHelper.getEntityAnimDuration(entity, 'show')
          ),
        ])
      );
    }

    animateIconActions.push(
      new FunctionAction(() => {
        this._wildIconSound.stop();
        this._wildIconSound.play();
      }, false)
    );

    return new SequenceSimpleAction([
      new SequenceSimpleAction(characterActions),
      new ParallelSimpleAction([
        new ParallelSimpleAction(movingActions),
        new SequenceSimpleAction([
          new EmptyAction().withDuration(featureAnimDuration),
          new ParallelSimpleAction(addIconsAction),
          new ParallelSimpleAction(animateIconActions),
        ]),
      ]),
    ]);
  }

  private _featureMoveAction(
    featureScene: SceneObject,
    startPosition: Vector2,
    endPosition: Vector2,
    duration: number
  ): IntervalAction {
    const moveToObject = new InterpolateInplaceAction<Vector2>((v) => v.clone())
      .withInterpolateFunction(Vector2.lerpInplace)
      .withValues(startPosition, endPosition)
      .withTimeFunction((time, _start, _dx) => time)
      .withDuration(duration);

    moveToObject.valueChange.listen((e) => {
      featureScene.position = e;
    });

    return moveToObject;
  }

  private _buildMovingScene(): SceneObject {
    const scene = this._sceneCommon.sceneFactory.build(this._featureSceneName)!;
    scene.z = 999;
    scene.visible = false;
    scene.initialize();
    this._resourcesComponent.root.addChild(scene);
    return scene;
  }
}
