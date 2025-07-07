import { Container, IntervalAction, SceneObject, SequenceAction } from '@cgs/syd';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { Line, ReelWinPosition } from '@cgs/common';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { ILinesModelProvider } from '../../interfaces/i_lines_model_provider';
import {
  T_IconsSoundModelComponent,
  T_IFadeReelsProvider,
  T_IGameStateMachineProvider,
  T_ILinesModelProvider,
  T_IWinLineStrategyProvider,
  T_LinesSceneObjectComponent,
  T_ResourcesComponent,
} from '../../../../type_definitions';
import { LinesSceneObjectComponent } from '../../lines_scene_object_component';
import { IconsSoundModelComponent } from '../../icons_sound_model_component';
import { AllWinLinesAction } from '../complex_win_line_actions/all_win_lines_action';
import { ShortWinLinesAction } from '../complex_win_line_actions/short_win_lines_action';
import { SpecialWinLinesAction } from '../complex_win_line_actions/special_win_lines_action';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IFadeReelsProvider } from '../i_fade_reels_provider';
import { IWinLineStrategyProvider } from '../win_line_strategy_providers/i_win_line_strategy_provider';
import { ResourcesComponent } from '../../resources_component';
import { MorphingWinLineAction } from '../complex_win_line_actions/morphing_lines_action';
import { SpecialNWaysAction } from '../complex_win_line_actions/special_nways_action';
import { ShortNWaysLinesAction } from '../complex_win_line_actions/short_nways_lines_action';
import { NWaysLinesAction } from '../complex_win_line_actions/nways_lines_action';

export class WinLineActionComponent {
  container: Container;
  WinLineAction: IntervalAction;
  ShortWinLineAction: IntervalAction;
  SpecialLineAction: IntervalAction;
  private readonly _repeatWinLineSound: boolean;

  constructor(container: Container, repeatWinLineSound: boolean = true) {
    this.container = container;
    this._repeatWinLineSound = repeatWinLineSound;
  }

  get repeatWinLineSound(): boolean {
    return this._repeatWinLineSound;
  }

  Update(
    reelsSoundModel: ReelsSoundModel,
    winLines: Line[],
    viewReels: number[][],
    spinConfig: SpinConfig,
    winPositions: ReelWinPosition[]
  ): void {
    const lineModel =
      this.container.forceResolve<ILinesModelProvider>(T_ILinesModelProvider).lineModel;
    const lineNode = this.container.forceResolve<LinesSceneObjectComponent>(
      T_LinesSceneObjectComponent
    ).linesSceneObject;
    const iconsSound = this.container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;

    const winLineAction = new AllWinLinesAction(this.container, winLines);
    const shortWinLineAction = new ShortWinLinesAction(
      this.container,
      winLines,
      winPositions,
      lineNode,
      lineModel,
      spinConfig,
      reelsSoundModel
    );
    const specialLineAction = new SpecialWinLinesAction(
      this.container,
      iconsSound,
      winLines,
      winPositions
    );

    this.WinLineAction = new SequenceAction([shortWinLineAction, winLineAction]);
    this.ShortWinLineAction = shortWinLineAction;
    this.SpecialLineAction = specialLineAction;

    this.enableFade(winLines, winPositions);
  }

  protected enableFade(winLines: Line[], winPositions: ReelWinPosition[]): void {
    const stateMachine = this.container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    if (
      (winLines && winLines.length > 0) ||
      (winPositions &&
        winPositions.length > 0 &&
        (stateMachine.curResponse.isScatter ||
          stateMachine.curResponse.isBonus ||
          stateMachine.curResponse.freeSpinsInfo ||
          winPositions.some((x) => x.type === 'PayingSpecSymbol')))
    ) {
      this.container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider).EnableFade(true);
    }
  }
}

export class MorphWinLineActionComponent extends WinLineActionComponent {
  protected _strategyProvider: IWinLineStrategyProvider;

  constructor(container: Container, repeatWinLineSound: boolean = true) {
    super(container, repeatWinLineSound);
    this._strategyProvider = container.forceResolve<IWinLineStrategyProvider>(
      T_IWinLineStrategyProvider
    );
  }

  get strategyProvider(): IWinLineStrategyProvider {
    return this._strategyProvider;
  }

  Update(
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

    const winLineAction = new MorphingWinLineAction(
      this.container,
      lineNode,
      lineModel,
      spinConfig,
      winLines,
      winPositions,
      iconSoundModel,
      reelsSoundModel,
      this.repeatWinLineSound
    );
    const shortWinLineAction = new ShortWinLinesAction(
      this.container,
      winLines,
      winPositions,
      lineNode,
      lineModel,
      spinConfig,
      reelsSoundModel
    );
    const specialLineAction = new SpecialNWaysAction(
      this.container,
      winLines,
      fadeSceneObject,
      spinConfig,
      winPositions
    );

    if (this.strategyProvider) {
      const winLineActipPart = this.strategyProvider
        .getWinLineStrategy()
        .applyStrategy(winLineAction);
      this.ShortWinLineAction = this.strategyProvider
        .getShortWinLineStrategy()
        .applyStrategy(shortWinLineAction);
      this.SpecialLineAction = this.strategyProvider
        .getSpecialWinLineStrategy()
        .applyStrategy(specialLineAction);

      this.WinLineAction = new SequenceAction([shortWinLineAction, winLineActipPart]);
    } else {
      this.WinLineAction = new SequenceAction([shortWinLineAction, winLineAction]);
      this.ShortWinLineAction = shortWinLineAction;
      this.SpecialLineAction = specialLineAction;
    }
  }
}

export class NWaysLineActionProvider extends WinLineActionComponent {
  private readonly _fadeSceneObject: SceneObject;

  constructor(container: Container, repeatWinLineSound: boolean = true) {
    super(container, repeatWinLineSound);
    const slot = this.container.forceResolve<ResourcesComponent>(T_ResourcesComponent).slot;
    this._fadeSceneObject = slot.findById('fade_static_icons')!;
  }

  protected get fadeSceneObject(): SceneObject {
    return this._fadeSceneObject;
  }

  Update(
    reelsSoundModel: ReelsSoundModel,
    winLines: Line[],
    viewReels: number[][],
    spinConfig: SpinConfig,
    winPositions: ReelWinPosition[]
  ): void {
    super.Update(reelsSoundModel, winLines, viewReels, spinConfig, winPositions);

    const shortWinLineAction = new SequenceAction([
      new ShortNWaysLinesAction(
        this.container,
        winLines,
        winPositions,
        spinConfig,
        this.fadeSceneObject
      ),
    ]);
    const winLineAction = new NWaysLinesAction(
      this.container,
      winLines,
      winPositions,
      spinConfig,
      this.fadeSceneObject,
      this.repeatWinLineSound
    );
    const specialLineAction = new SpecialNWaysAction(
      this.container,
      winLines,
      this.fadeSceneObject,
      spinConfig,
      winPositions
    );

    this.WinLineAction = new SequenceAction([shortWinLineAction, winLineAction]);

    this.ShortWinLineAction = shortWinLineAction;

    this.SpecialLineAction = specialLineAction;
  }
}
