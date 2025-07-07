import { Container, SceneObject, State } from '@cgs/syd';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse, Line } from '@cgs/common';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IFreeSpinsModeProvider,
  T_IGameStateMachineProvider,
  T_ResourcesComponent,
} from '../../type_definitions';
import { IFreeSpinsModeProvider } from './free_spins/i_free_spins_mode_provider';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { ResourcesComponent } from './resources_component';

export class WinLinePersonalMultiplierAnimationProvider {
  private static readonly BTN_SEARCH_ENTRY: string = 'NUMBER';

  private _container: Container;
  private _specialModeMark: string;
  private _btnTemplate: string;
  private _multStateName: string;
  private _defaultStateName: string;

  private _currentRoundNodesStateMachines: State[] = [];

  constructor(
    container: Container,
    specialModeMark: string,
    {
      btnTemplate = 'line_btn_NUMBER',
      multStateName = 'x5',
      defaultStateName = 'up',
    }: { btnTemplate?: string; multStateName?: string; defaultStateName?: string }
  ) {
    this._container = container;
    this._specialModeMark = specialModeMark;
    this._btnTemplate = btnTemplate;
    this._multStateName = multStateName;
    this._defaultStateName = defaultStateName;
    const gmStMachine: GameStateMachine<ISpinResponse> =
      container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ).gameStateMachine;
    gmStMachine.shortWinLines.entered.listen((e) =>
      this._onShortWinLineEntered(gmStMachine.curResponse)
    );
    gmStMachine.shortWinLines.leaved.listen((e) =>
      this._onShortWinLineLeaved(gmStMachine.curResponse)
    );
  }

  private _onShortWinLineEntered(resp: ISpinResponse): void {
    if (resp.freeSpinsInfo && resp.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsStarted) {
      const fsModeProvider =
        this._container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);
      if (fsModeProvider.currentMode == this._specialModeMark) {
        const slotNode =
          this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).slot;
        const suitableNodes: SceneObject[] = [];

        const winLines: Line[] = resp.winLines || [];

        winLines.forEach((line) => {
          const nodes = slotNode.findAllById(
            this._btnTemplate.replaceAll(
              WinLinePersonalMultiplierAnimationProvider.BTN_SEARCH_ENTRY,
              (line.lineIndex + 1).toString()
            )
          );
          if (nodes) {
            suitableNodes.push(...nodes);
          }
        });

        suitableNodes.forEach((node) => {
          if (node.stateMachine) {
            this._currentRoundNodesStateMachines.push(node.stateMachine);
            node.stateMachine.switchToState(this._multStateName);
          }
        });
      }
    }
  }

  private _onShortWinLineLeaved(resp: ISpinResponse): void {
    this._currentRoundNodesStateMachines.forEach((stMach) => {
      stMach.switchToState(this._defaultStateName);
    });
  }
}
