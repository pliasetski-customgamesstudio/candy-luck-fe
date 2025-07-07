import { MorphWinLineActionComponent } from './win_line_action_component';
import { IWinLineStrategyProvider } from '../win_line_strategy_providers/i_win_line_strategy_provider';
import { Container, SequenceAction } from '@cgs/syd';
import {
  T_IconsSoundModelComponent,
  T_ILinesModelProvider,
  T_IWinLineStrategyProvider,
  T_LinesSceneObjectComponent,
  T_ResourcesComponent,
} from '../../../../type_definitions';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { Line, ReelWinPosition } from '@cgs/common';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { ILinesModelProvider } from '../../interfaces/i_lines_model_provider';
import { LinesSceneObjectComponent } from '../../lines_scene_object_component';
import { IconsSoundModelComponent } from '../../icons_sound_model_component';
import { ResourcesComponent } from '../../resources_component';
import { MorphingWinLineAction } from '../complex_win_line_actions/morphing_lines_action';
import { ShortWinLinesWithIconsAction } from '../complex_win_line_actions/short_win_lines_with_icons_action';
import { SpecialNWaysAction } from '../complex_win_line_actions/special_nways_action';

export class CycledWinLineActionProvider extends MorphWinLineActionComponent {
  constructor(container: Container, repeatWinLineSound: boolean = true) {
    super(container, repeatWinLineSound);
    console.log('load ' + this.constructor.name);
    this._strategyProvider = container.forceResolve<IWinLineStrategyProvider>(
      T_IWinLineStrategyProvider
    );
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
    const shortWinLineAction = new SequenceAction([
      new ShortWinLinesWithIconsAction(
        this.container,
        lineNode,
        lineModel,
        spinConfig,
        winLines,
        winPositions,
        iconSoundModel,
        reelsSoundModel
      ) /*,
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
