import { SceneCommon, ISpinResponse } from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import {
  FunctionAction,
  IntervalAction,
  ParallelAction,
  EmptyAction,
  SceneObject,
  Container,
} from '@cgs/syd';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import {
  T_ISlotGameEngineProvider,
  T_ResourcesComponent,
  T_RegularSpinsSoundModelComponent,
  T_IconEnumeratorComponent,
} from '../../type_definitions';
import { IconEnumeratorComponent } from './icon_enumerator_component';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { ResourcesComponent } from './resources_component';
import { ResponseDependentGameComponentProvider } from './response_dependent_game_component_provider';

export class AnticipationConfiguration {
  constructor(
    public scenePattern: string,
    public placeholderPattern: string,
    public animationToLeft?: string,
    public animationToRight?: string
  ) {}
}

export class WildReelProvider extends ResponseDependentGameComponentProvider {
  private _reelsEngine: ReelsEngine;
  private _iconEnumerator: IconEnumerator;
  private _gameResourceProvider: ResourcesComponent;
  private _reelsSoundModel: ReelsSoundModel;

  private _sceneCommon: SceneCommon;
  private _marker: string;
  get marker(): string {
    return this._marker;
  }
  private _symbolId: number;
  private _soundName: string;
  private _showAnticipationOnPreviousPositions: boolean;

  private _fsTypes: string[];
  private _previousFeatureReelIndexes: number[] | null;
  get previousFeatureReelIndexes(): number[] | null {
    return this._previousFeatureReelIndexes;
  }
  set previousFeatureReelIndexes(value: number[]) {
    this._previousFeatureReelIndexes = value;
  }
  private _initialFeatureReelIndexes: number[];
  get initialFeatureReelIndexes(): number[] {
    return this._initialFeatureReelIndexes;
  }
  private _featureReelIndexes: number[] | null;
  get featureReelIndexes(): number[] | null {
    return this._featureReelIndexes;
  }
  set featureReelIndexes(value: number[]) {
    this._featureReelIndexes = value;
  }
  private _anticipationConfig: AnticipationConfiguration[];

  constructor(
    container: Container,
    featureReel: number[],
    initialFeatureReelIndexes: number[],
    sceneCommon: SceneCommon,
    {
      fsTypes = null,
      symbolId = 2,
      marker = 'WildReel',
      anticipationConfig = null,
      showAnticipationOnPreviousPositions = true,
      soundName = 'wild_reel',
    }: any
  ) {
    super(container);
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._iconEnumerator =
      container.forceResolve<IconEnumeratorComponent>(T_IconEnumeratorComponent).iconsEnumerator;
    this._gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._sceneCommon = sceneCommon;

    this._fsTypes = fsTypes;
    this._marker = marker;
    this._symbolId = symbolId;
    this._anticipationConfig = anticipationConfig;
    this._showAnticipationOnPreviousPositions = showAnticipationOnPreviousPositions;
    this._soundName = soundName;

    this._iconEnumerator.setFeatureReel(featureReel);
  }

  initialize(): void {
    this.attachActionsToGameStateMachine(this._marker);
  }

  attachActionsToGameStateMachine(marker: string): void {
    this.gameStateMachine.beginFreeSpins.entered.listen((_): void => {
      if (
        this.currentResponse.freeSpinsInfo &&
        (!this._fsTypes || this._fsTypes.includes(this.currentResponse.freeSpinsInfo.name))
      ) {
        this.initializeInner(
          this.FeatureReelIndexes.length > 0
            ? this.FeatureReelIndexes
            : this._initialFeatureReelIndexes
        );
      }
    });

    this.gameStateMachine.scatter.entered.listen((_): void => {
      if (
        this.currentResponse.freeSpinsInfo &&
        (!this._fsTypes || this._fsTypes.includes(this.currentResponse.freeSpinsInfo.name))
      ) {
        this.initializeInner(
          this.FeatureReelIndexes.length > 0
            ? this.FeatureReelIndexes
            : this._initialFeatureReelIndexes
        );
      }
    });

    this.gameStateMachine.freeSpinsRecovery.entered.listen((_): void => {
      if (
        this.currentResponse.freeSpinsInfo &&
        (!this._fsTypes || this._fsTypes.includes(this.currentResponse.freeSpinsInfo.name))
      ) {
        const nextFeatureReelIndexes = this.getNextFeatureReelIndexes(this.currentResponse);
        this.initializeInner(
          nextFeatureReelIndexes ? nextFeatureReelIndexes : this._initialFeatureReelIndexes
        );
      }
    });

    this.gameStateMachine.accelerate.addLazyAnimationToBegin(() =>
      this.addAnticipationAction(this.currentResponse)
    );
    this.gameStateMachine.endFreeSpinsPopup.entered.listen((_): void => {
      this._iconEnumerator.setCurrentFeatureReelIndexes([]);
      this._iconEnumerator.setNextFeatureReelIndexes([]);

      this._featureReelIndexes = null;
    });
    this.gameStateMachine.stopping.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.wildReelStoppingAction(this.currentResponse))
    );
    this.gameStateMachine.stop.addLazyAnimationToBegin(
      () => new FunctionAction(() => this.wildReelStopAction(this.currentResponse))
    );
  }

  initializeInner(featureReel: number[]): void {
    this._featureReelIndexes = featureReel;
    this._iconEnumerator.setCurrentFeatureReelIndexes(featureReel);
  }

  get PreviousFeatureReelIndexes(): number[] {
    return this._previousFeatureReelIndexes || [];
  }

  get FeatureReelIndexes(): number[] {
    return this._featureReelIndexes || [];
  }

  addAnticipationAction(currentResponse: ISpinResponse): IntervalAction {
    const indexesForProcess = this._showAnticipationOnPreviousPositions
      ? this.FeatureReelIndexes
      : this.FeatureReelIndexes.filter((i) => !this.PreviousFeatureReelIndexes.includes(i));

    if (
      !this._showAnticipationOnPreviousPositions &&
      this.PreviousFeatureReelIndexes.length > 0 &&
      this.FeatureReelIndexes.length > 0
    ) {
      this._reelsEngine.frozenReels.push(
        ...this.PreviousFeatureReelIndexes.filter((i) => this.FeatureReelIndexes.includes(i))
      );
    }

    if (indexesForProcess && indexesForProcess.length > 0) {
      const list: FunctionAction[] = new Array<FunctionAction>();

      for (const ind of indexesForProcess) {
        if (typeof ind === 'number') {
          list.push(new FunctionAction(() => this._addAnticipation(ind, currentResponse)));
        }
      }

      list.push(
        new FunctionAction(() => {
          const sceneSound = this._reelsSoundModel.getSoundByName(this._soundName);
          sceneSound.stop();
          sceneSound.play();
        })
      );

      return new ParallelAction(list);
    }

    return new EmptyAction().withDuration(0.0);
  }

  private _addAnticipation(reel: number, currentResponse: ISpinResponse): void {
    if (this._anticipationConfig) {
      for (const c of this._anticipationConfig) {
        this._addAnticipationSceneByConfig(c, this._symbolId, reel, currentResponse);
      }
    } else {
      this._addAnticipationScene(
        `additional/anticipator_${this._symbolId}`,
        `anticipation_${this._symbolId}_${reel}`
      );
      this._addAnticipationScene(
        `additional/anticipator_${this._symbolId}0`,
        `anticipation_${this._symbolId}0_${reel}`
      );
    }
  }

  private _addAnticipationSceneByConfig(
    configuration: AnticipationConfiguration,
    placeholderId: number,
    reel: number,
    currentResponse: ISpinResponse
  ): void {
    const anticipationScene = StringUtils.format(configuration.scenePattern, [
      this._symbolId.toString(),
    ]);
    const anticipationPlaceholder = StringUtils.format(configuration.placeholderPattern, [
      this._symbolId.toString(),
      reel.toString(),
    ]);

    const anticipationSceneNode = this._sceneCommon.sceneFactory.build(anticipationScene);

    if (anticipationSceneNode) {
      anticipationSceneNode.initialize();
      anticipationSceneNode.z = 999999;

      const placeholder = this._gameResourceProvider.slot.findById(
        anticipationPlaceholder
      ) as SceneObject;
      placeholder.addChild(anticipationSceneNode);

      if (currentResponse) {
        const directionState = this.getDirection(currentResponse, configuration);
        if (directionState) {
          anticipationSceneNode.stateMachine!.switchToState(directionState);
        }
      }
    }
  }

  private getDirection(response: ISpinResponse, configuration: AnticipationConfiguration): string {
    let result: string | null = null;
    const currentReels = this.getCurrentFeatureReelIndexes(response);
    const nextReels = this.getNextFeatureReelIndexes(response);

    if (currentReels && nextReels) {
      if (currentReels[0] == 0) {
        if (nextReels[0] > 0 && configuration.animationToRight) {
          result = configuration.animationToRight;
        }
      } else if (currentReels[0] < nextReels[0] && configuration.animationToRight) {
        result = configuration.animationToRight;
      } else if (configuration.animationToLeft) {
        result = configuration.animationToLeft;
      }
    }

    return result!;
  }

  private _addAnticipationScene(anticipationScene: string, anticipationPlaceholder: string): void {
    const anticipationSceneNode = this._sceneCommon.sceneFactory.build(anticipationScene);

    if (anticipationSceneNode) {
      anticipationSceneNode.initialize();
      anticipationSceneNode.z = 999999;

      const placeholder = this._gameResourceProvider.slot.findById(
        anticipationPlaceholder
      ) as SceneObject;
      placeholder.addChild(anticipationSceneNode);
    }
  }

  private removeAnticipation(reel: number): void {
    if (this._anticipationConfig) {
      for (const c of this._anticipationConfig) {
        this._removeAnticipationScene(
          StringUtils.format(c.placeholderPattern, [this._symbolId.toString(), reel.toString()])
        );
      }
    } else {
      this._removeAnticipationScene(`anticipation_${this._symbolId}_${reel}`);
      this._removeAnticipationScene(`anticipation_${this._symbolId}0_${reel}`);
    }
  }

  private _removeAnticipationScene(scene: string): void {
    const reelAnticipation = this._gameResourceProvider.slot.findById(scene) as SceneObject;
    const children: SceneObject[] = [];
    children.push(...reelAnticipation.childs);

    reelAnticipation!.removeAllChilds();
    for (const child of children) {
      child.deinitialize();
    }
  }

  private wildReelStoppingAction(currentResponse: ISpinResponse): void {
    this._iconEnumerator.setNextFeatureReelIndexes(
      this.getNextFeatureReelIndexes(currentResponse)!
    );
    this._reelsEngine.frozenReels.length = 0;
  }

  private wildReelStopAction(currentResponse: ISpinResponse): void {
    const currentReel = this.getCurrentFeatureReelIndexes(currentResponse) || [];
    const nextReel = this.getNextFeatureReelIndexes(currentResponse) || [];

    this._previousFeatureReelIndexes = this._featureReelIndexes;
    this._featureReelIndexes = nextReel;

    for (const reel of currentReel) {
      if (typeof reel === 'number') {
        this.removeAnticipation(reel);
      }
    }

    this._iconEnumerator.setCurrentFeatureReelIndexes(nextReel);
  }

  private getNextFeatureReelIndexes(currentResponse: ISpinResponse): number[] | null {
    if (currentResponse) {
      const symbol = currentResponse.specialSymbolGroups
        ? currentResponse.specialSymbolGroups.find((p) => p.type == this._marker)
        : null;

      return symbol
        ? symbol.positions
        : currentResponse.freeSpinsInfo &&
            this._fsTypes &&
            this._fsTypes.includes(currentResponse.freeSpinsInfo.name)
          ? this._initialFeatureReelIndexes
          : null;
    }
    return null;
  }

  private getCurrentFeatureReelIndexes(currentResponse: ISpinResponse): number[] | null {
    if (currentResponse) {
      const symbol = currentResponse.specialSymbolGroups
        ? currentResponse.specialSymbolGroups.find((p) => p.type == this._marker)
        : null;
      return symbol ? symbol.previousPositions : null;
    }
    return null;
  }
}
