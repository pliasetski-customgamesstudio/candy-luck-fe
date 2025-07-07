import {
  Container,
  EmptyAction,
  EventDispatcher,
  EventStream,
  FunctionAction,
  IntervalAction,
  MouseDownEvent,
  ParallelAction,
  ParallelSimpleAction,
  SceneObject,
  SequenceAction,
} from '@cgs/syd';
import { DynamicDrawOrdersProvider } from '../dynamic_draw_orders_provider';
import { ICoordinateSystemInfoProvider, ISpinResponse, SceneCommon } from '@cgs/common';
import { AnimationAvailabilityProvider } from '../animation_availability_provider';
import {
  T_AnimationAvailabilityProvider,
  T_DynamicDrawOrdersProvider,
  T_IGameStateMachineProvider,
  T_ResourcesComponent,
} from '../../../type_definitions';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { LazyAction } from '@cgs/shared';
import { ResourcesComponent } from '../resources_component';
import { DrawOrderConstants } from '../../common/slot/views/base_popup_view';

export enum CharacterActionTypes {
  Idle = 0,
  Win = 1,
  Lose = 2,
  Stopping = 3,
  BeginFreeSpins = 4,
  EndFreeSpins = 5,
  Custom = 6,
  BeginFreeSpinsPopup = 7,
  EndFreeSpinsPopup = 8,
  FreeSpinsRecovery = 9,
  Accelerate = 10,
  BigWin = 11,
  Bonus = 12,
  Collapse = 13,
  BeginCollapse = 14,
}

export class CharacterAction {
  actionType: CharacterActionTypes;
  sourceStates: string[] | null;
  characterActions: string[];
  customActionNames: string[] | null;
  condition: any;
  useDynamicDrawOrders: boolean;
  private _hideCharacterAfterAnimation: boolean;

  constructor(
    actionType: CharacterActionTypes,
    characterActions: string[],
    sourceStates?: string[],
    customActionNames?: string[],
    condition?: any,
    useDynamicDrawOrders?: boolean
  ) {
    this.actionType = actionType;
    this.characterActions = characterActions;
    this.sourceStates = sourceStates ?? null;
    this.customActionNames = customActionNames ?? null;
    this.condition = condition ?? null;
    this.useDynamicDrawOrders = useDynamicDrawOrders ?? false;
  }
}

export class CharacterAnimationProvider {
  private _container: Container;
  private _dynamicDrawOrdersProvider: DynamicDrawOrdersProvider;
  private _characterActions: { [key: string]: CharacterAction[] };
  public characters: { [key: string]: SceneObject };
  private _charactersHolder: SceneObject;
  private _sceneCommon: SceneCommon;
  private _loseCount: number;
  private _loseCountConfig: number = 3;
  private _useHolder: boolean;
  private _isUnderContestPanel: boolean;
  private _hideCharacterAfterAnimation: boolean;
  private _characterId: string | null;
  private _sourcePath: string;
  private _coordinateSystemInfoProvider: ICoordinateSystemInfoProvider;
  private _animationAvailabilityProvider: AnimationAvailabilityProvider;

  private _characterClickedDispatcher: EventDispatcher<string> = new EventDispatcher<string>();

  get characterClicked(): EventStream<string> {
    return this._characterClickedDispatcher.eventStream;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    characterActions: { [key: string]: CharacterAction[] },
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
    {
      useHolder = true,
      characterId = null,
      sourcePath = 'slot/',
      hideCharacterAfterAnimation = false,
    }
  ) {
    this._container = container;
    this._sceneCommon = sceneCommon;
    this._characterActions = characterActions;
    this._coordinateSystemInfoProvider = coordinateSystemInfoProvider;
    this._useHolder = useHolder;
    this._characterId = characterId;
    this._sourcePath = sourcePath;
    this._hideCharacterAfterAnimation = hideCharacterAfterAnimation;

    this.characters = {};
    this._addCharactersToRootScene();
    this._loseCount = 0;

    const gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._dynamicDrawOrdersProvider = this._container.forceResolve(T_DynamicDrawOrdersProvider);
    this._animationAvailabilityProvider = this._container.forceResolve(
      T_AnimationAvailabilityProvider
    );

    let initAction = gameStateMachine.init.enterAction;
    if (!initAction) {
      initAction = new EmptyAction();
    }
    gameStateMachine.init.enterAction = new LazyAction(
      () => new ParallelSimpleAction([this.performAction(CharacterActionTypes.Idle), initAction])
    );

    let stoppingAction = gameStateMachine.stopping.animation;
    if (!stoppingAction) {
      stoppingAction = new EmptyAction();
    }
    gameStateMachine.stopping.setLazyAnimation(
      () =>
        new ParallelSimpleAction([
          this.performAction(CharacterActionTypes.Stopping),
          stoppingAction,
        ])
    );

    let regularSpinsAction = gameStateMachine.regularSpins.animation;
    if (!regularSpinsAction) {
      regularSpinsAction = new EmptyAction();
    }
    gameStateMachine.regularSpins.setLazyAnimation(
      () =>
        new ParallelSimpleAction([
          this._stopAction(gameStateMachine.curResponse),
          regularSpinsAction,
        ])
    );

    let beginFreeSpinsAction = gameStateMachine.beginFreeSpins.animation;
    if (!beginFreeSpinsAction) {
      beginFreeSpinsAction = new EmptyAction();
    }
    gameStateMachine.beginFreeSpins.setLazyAnimation(
      () =>
        new ParallelSimpleAction([
          this.performAction(CharacterActionTypes.BeginFreeSpins),
          beginFreeSpinsAction,
        ])
    );

    let freeSpinsRecoveryAction = gameStateMachine.freeSpinsRecovery.animation;
    if (!freeSpinsRecoveryAction) {
      freeSpinsRecoveryAction = new EmptyAction();
    }
    gameStateMachine.freeSpinsRecovery.setLazyAnimation(
      () =>
        new ParallelSimpleAction([
          this.performAction(CharacterActionTypes.FreeSpinsRecovery),
          freeSpinsRecoveryAction,
        ])
    );

    let endFreeSpinsAction = gameStateMachine.endFreeSpins.animation;
    if (!endFreeSpinsAction) {
      endFreeSpinsAction = new EmptyAction();
    }
    gameStateMachine.endFreeSpins.setLazyAnimation(
      () =>
        new ParallelSimpleAction([
          this.performAction(CharacterActionTypes.EndFreeSpins),
          endFreeSpinsAction,
        ])
    );

    let bonusAction = gameStateMachine.bonus.animation;
    if (!bonusAction) {
      bonusAction = new EmptyAction();
    }
    gameStateMachine.bonus.setLazyAnimation(
      () => new ParallelSimpleAction([this.performAction(CharacterActionTypes.Bonus), bonusAction])
    );

    let shortWinLinesAction = gameStateMachine.shortWinLines.animation;
    if (!shortWinLinesAction) {
      shortWinLinesAction = new EmptyAction();
    }
    gameStateMachine.shortWinLines.setLazyAnimation(
      () =>
        new ParallelSimpleAction([
          this._stopAction(gameStateMachine.curResponse),
          shortWinLinesAction,
        ])
    );

    let accelerateAction = gameStateMachine.accelerate.animation;
    if (!accelerateAction) {
      accelerateAction = new EmptyAction();
    }
    gameStateMachine.accelerate.setLazyAnimation(
      () =>
        new ParallelSimpleAction([
          this.performAction(CharacterActionTypes.Accelerate),
          accelerateAction,
        ])
    );

    // TODO: reference to excluded CollapseGameStateMachine
    // if (gameStateMachine instanceof CollapseGameStateMachine) {
    //   let collapseAction = gameStateMachine.collapseState.animation;
    //   if (!collapseAction) {
    //     collapseAction = new EmptyAction();
    //   }
    //   gameStateMachine.collapseState.setLazyAnimation(
    //     () =>
    //       new ParallelSimpleAction([
    //         this.performAction(CharacterActionTypes.Collapse),
    //         collapseAction,
    //       ])
    //   );
    //
    //   let beginCollapseState = gameStateMachine.beginCollapseState.animation;
    //   if (!beginCollapseState) {
    //     beginCollapseState = new EmptyAction();
    //   }
    //   gameStateMachine.beginCollapseState.setLazyAnimation(
    //     () =>
    //       new ParallelSimpleAction([
    //         this.performAction(CharacterActionTypes.BeginCollapse),
    //         beginCollapseState,
    //       ])
    //   );
    // }

    gameStateMachine.beginFreeSpinsPopup.appendLazyAnimation(() =>
      this.performAction(CharacterActionTypes.BeginFreeSpinsPopup)
    );
    gameStateMachine.endFreeSpinsPopup.setLazyAnimation(() =>
      this.performAction(CharacterActionTypes.EndFreeSpinsPopup)
    );
  }

  getCharacterScene(characterId: string): SceneObject {
    return this.characters[characterId];
  }

  getTopCharacterScene(characterId: string): SceneObject {
    return this._charactersHolder ? this._charactersHolder : this.characters[characterId];
  }

  private _stopAction(currentResponse: ISpinResponse): IntervalAction {
    if (currentResponse.totalWin > 0) {
      this._loseCount = 0;
      return !currentResponse.bigWinName
        ? this.performAction(CharacterActionTypes.Win)
        : this.performAction(CharacterActionTypes.BigWin);
    } else {
      this._loseCount++;
      if (this._loseCount === this._loseCountConfig) {
        this._loseCount = 0;
        return this.performAction(CharacterActionTypes.Lose);
      }
    }
    return new EmptyAction();
  }

  private _addCharactersToRootScene(): void {
    const rootScene = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
    if (this._useHolder) {
      this._charactersHolder = this._sceneCommon.sceneFactory.build(
        `${this._sourcePath}sceneCharacters`
      )!;
      if (this._charactersHolder) {
        this._charactersHolder.layout(this._coordinateSystemInfoProvider.coordinateSystem);
        this._charactersHolder.z = DrawOrderConstants.CharacterUnderContestPanelDrawOrder;
        this._charactersHolder.initialize();
        rootScene.addChild(this._charactersHolder);
      }
    }

    Object.entries(this._characterActions).forEach(([key, _value]) => {
      const characterScene = this._sceneCommon.sceneFactory.build(`${this._sourcePath}${key}`)!;
      characterScene.initialize();
      if (this._hideCharacterAfterAnimation) {
        characterScene.active = characterScene.visible = false;
      }
      characterScene.z = DrawOrderConstants.CharacterUnderContestPanelDrawOrder;
      this.characters[key] = characterScene;
      if (this._useHolder) {
        const parent = this._charactersHolder ? this._charactersHolder : rootScene;
        parent.findById(`${key}_holder`)!.addChild(characterScene);
      } else {
        rootScene.addChild(characterScene);
      }

      characterScene.touchable = true;
      characterScene.touchEvent.listen((e) => {
        if (e instanceof MouseDownEvent) {
          this._characterClickedDispatcher.dispatchEvent(key);
        }
      });
    });
  }

  performAction(type: CharacterActionTypes, customActionName?: string): IntervalAction {
    if (!this._animationAvailabilityProvider.isAnimationAvailable()) {
      return new EmptyAction();
    }

    const actions: IntervalAction[] = [];
    Object.entries(this._characterActions).forEach(([key, value]) => {
      value
        .filter((action) => action.actionType === type)
        .forEach((states) => {
          const characterActions: IntervalAction[] = [];
          let characterScene = this.characters[key];
          if (this._characterId) {
            characterScene = characterScene.findById(this._characterId)!;
          }
          if (
            (!states.condition || states.condition()) &&
            (!states.sourceStates ||
              states.sourceStates.filter((state) => characterScene.stateMachine!.isActive(state))
                .length > 0) &&
            ((states.actionType === CharacterActionTypes.Custom &&
              customActionName &&
              states.customActionNames &&
              states.customActionNames.includes(customActionName)) ||
              states.actionType !== CharacterActionTypes.Custom)
          ) {
            states.characterActions.forEach((state) => {
              characterActions.push(
                new FunctionAction(() => {
                  if (this._hideCharacterAfterAnimation) {
                    characterScene.active = characterScene.visible = true;
                  }
                  if (this._dynamicDrawOrdersProvider && states.useDynamicDrawOrders) {
                    this._dynamicDrawOrdersProvider.showHudUnderCharacter(key);
                  }

                  characterScene.stateMachine!.switchToState(state);
                })
              );

              characterActions.push(
                new EmptyAction().withDuration(
                  (characterScene.stateMachine!.findById(state)!.enterAction as IntervalAction)
                    .duration
                )
              );

              characterActions.push(
                new FunctionAction(() => {
                  if (this._dynamicDrawOrdersProvider && states.useDynamicDrawOrders) {
                    this._dynamicDrawOrdersProvider.normalizeDrawOrders();
                  }
                  if (this._hideCharacterAfterAnimation) {
                    characterScene.active = characterScene.visible = false;
                  }
                })
              );
            });
            actions.push(new SequenceAction(characterActions));
          }
        });
    });

    return actions.length > 0 ? new ParallelAction(actions) : new EmptyAction();
  }

  get characterId(): string | null {
    return this._characterId;
  }
}
