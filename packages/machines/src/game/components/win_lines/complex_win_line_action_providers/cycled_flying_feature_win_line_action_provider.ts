import { WinLineActionComponent } from './win_line_action_component';
import { IWinLineStrategyProvider } from '../win_line_strategy_providers/i_win_line_strategy_provider';
import { Line, ReelWinPosition, SceneCommon } from '@cgs/common';
import { Container, SequenceAction } from '@cgs/syd';
import {
  T_IconsSoundModelComponent,
  T_ILinesModelProvider,
  T_IWinLineStrategyProvider,
  T_LinesSceneObjectComponent,
  T_ResourcesComponent,
} from '../../../../type_definitions';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { ILinesModelProvider } from '../../interfaces/i_lines_model_provider';
import { LinesSceneObjectComponent } from '../../lines_scene_object_component';
import { IconsSoundModelComponent } from '../../icons_sound_model_component';
import { ResourcesComponent } from '../../resources_component';
import { FlyingFeatureWinLineAction } from '../complex_win_line_actions/flying_feature_win_line_action';
import { ShortFlyingFeatureWinLineAction } from '../complex_win_line_actions/short_flying_feature_win_line_action';
import { SpecialNWaysAction } from '../complex_win_line_actions/special_nways_action';

export class CycledFlyingFeatureWinLineActionProvider extends WinLineActionComponent {
  private readonly _strategyProvider: IWinLineStrategyProvider;
  private readonly _sceneCommon: SceneCommon;
  private readonly _regularLinesFeatureSceneName: string;
  private readonly _shortLinesFeatureSceneName: string;
  private readonly _regularLinesFlyDuration: number;
  private readonly _shortLinesFlyDuration: number;
  private readonly _regularLinesDirection: string;
  private readonly _shortLinesDirection: string;
  private readonly _shortWinLinesTimeLimit: number;
  private readonly _shortWinLinesMaxTimeInterval: number;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    regularLinesFeatureSceneName: string,
    shortLinesFeatureSceneName: string,
    regularLinesFlyDuration: number,
    shortLinesFlyDuration: number,
    regularLinesDirection: string,
    shortLinesDirection: string,
    shortWinLinesTimeLimit: number,
    shortWinLinesMaxTimeInterval: number,
    repeatWinLineSound: boolean = true
  ) {
    super(container, repeatWinLineSound);
    console.log('load ' + this.constructor.name);
    this._strategyProvider = container.forceResolve<IWinLineStrategyProvider>(
      T_IWinLineStrategyProvider
    );
    this._sceneCommon = sceneCommon;
    this._regularLinesFeatureSceneName = regularLinesFeatureSceneName;
    this._shortLinesFeatureSceneName = shortLinesFeatureSceneName;
    this._regularLinesFlyDuration = regularLinesFlyDuration;
    this._shortLinesFlyDuration = shortLinesFlyDuration;
    this._regularLinesDirection = regularLinesDirection;
    this._shortLinesDirection = shortLinesDirection;
    this._shortWinLinesTimeLimit = shortWinLinesTimeLimit;
    this._shortWinLinesMaxTimeInterval = shortWinLinesMaxTimeInterval;
  }

  public Update(
    reelsSoundModel: ReelsSoundModel,
    winLines: Line[],
    viewReels: number[][],
    spinConfig: SpinConfig,
    winPositions: ReelWinPosition[]
  ): void {
    super.Update(reelsSoundModel, winLines, viewReels, spinConfig, winPositions);

    const lineModel =
      this.container.forceResolve<ILinesModelProvider>(T_ILinesModelProvider).lineModel;
    const lineNode = this.container.forceResolve<LinesSceneObjectComponent>(
      T_LinesSceneObjectComponent
    ).linesSceneObject;
    const iconSoundModel = this.container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    const slot = this.container.forceResolve<ResourcesComponent>(T_ResourcesComponent).slot;
    const fadeSceneObject = slot.findById('fade_static_icons')!;

    const winLineAction = new FlyingFeatureWinLineAction(
      this.container,
      lineNode,
      lineModel,
      spinConfig,
      winLines,
      winPositions,
      iconSoundModel,
      reelsSoundModel,
      this._sceneCommon,
      this._regularLinesFeatureSceneName,
      this._regularLinesFlyDuration,
      this._regularLinesDirection,
      this.repeatWinLineSound
    );
    const shortWinLineAction = new SequenceAction([
      new ShortFlyingFeatureWinLineAction(
        this.container,
        lineNode,
        lineModel,
        spinConfig,
        winLines,
        winPositions,
        iconSoundModel,
        reelsSoundModel,
        this._sceneCommon,
        this._shortLinesFeatureSceneName,
        this._shortLinesFlyDuration,
        this._shortLinesDirection
      ).withTimeLimits(this._shortWinLinesTimeLimit, this._shortWinLinesMaxTimeInterval) /*,
      _parleyProgressActivator
          ? _parleyProgressActivator.getActivateParleyProgressOnWinLinesAction()
          : new EmptyAction()*/,
    ]);
    const specialLineAction = new SpecialNWaysAction(
      this.container,
      winLines,
      fadeSceneObject,
      spinConfig,
      winPositions
    );

    if (this._strategyProvider) {
      this.ShortWinLineAction = this._strategyProvider
        .getShortWinLineStrategy()
        .applyStrategy(shortWinLineAction);
      this.WinLineAction = new SequenceAction([
        this.ShortWinLineAction,
        this._strategyProvider.getWinLineStrategy().applyStrategy(winLineAction),
      ]);

      this.SpecialLineAction = this._strategyProvider
        .getSpecialWinLineStrategy()
        .applyStrategy(specialLineAction);
    } else {
      this.WinLineAction = new SequenceAction([shortWinLineAction, winLineAction]);
      this.ShortWinLineAction = shortWinLineAction;
      this.SpecialLineAction = specialLineAction;
    }
  }
}
