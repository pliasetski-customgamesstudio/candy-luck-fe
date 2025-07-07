import { NWaysLineActionProvider } from '../win_lines/complex_win_line_action_providers/win_line_action_component';
import { ISpinResponse, Line, ReelWinPosition } from '@cgs/common';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { Container, SequenceAction } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../../type_definitions';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { SpinConfig } from '../../../reels_engine/game_config/game_config';
import { ShortNWaysLinesAction } from '../win_lines/complex_win_line_actions/short_nways_lines_action';
import { NWaysLinesAction } from '../win_lines/complex_win_line_actions/nways_lines_action';
import { SpecialNWaysAction } from '../win_lines/complex_win_line_actions/special_nways_action';

export class ExtendedNWaysLineActionProvider extends NWaysLineActionProvider {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _skipShortWinLinesGroups: string[];

  constructor(
    container: Container,
    repeatWinLineSound: boolean = true,
    skipShortWinLinesGroups: string[] = []
  ) {
    super(container, repeatWinLineSound);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._skipShortWinLinesGroups = skipShortWinLinesGroups;
  }

  public Update(
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
    if (
      this._gameStateMachine.curResponse.specialSymbolGroups &&
      this._skipShortWinLinesGroups &&
      this._gameStateMachine.curResponse.specialSymbolGroups.some(
        (g) => g.type && this._skipShortWinLinesGroups.includes(g.type)
      )
    ) {
      this.WinLineAction = winLineAction;
    } else {
      this.WinLineAction = new SequenceAction([shortWinLineAction, winLineAction]);
    }

    this.ShortWinLineAction = shortWinLineAction;

    this.SpecialLineAction = specialLineAction;
  }
}
