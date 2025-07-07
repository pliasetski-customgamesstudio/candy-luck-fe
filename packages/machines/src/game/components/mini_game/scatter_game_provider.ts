import {
  SceneCommon,
  IBonusResponse,
  IResourceManager,
  InternalFreeSpinsInfo,
  InternalFreeSpinsGroup,
} from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import { Container } from '@cgs/syd';
import { ScatterResourceManager } from '../../scatter/scatter_resource_manager';
import { ScatterService } from '../../scatter/scatter_service';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachineStates } from '../../../reels_engine/state_machine/game_state_machine';
import { BaseMiniGameProvider } from './base_mini_game_provider';
import { IMiniGameService } from '@cgs/features';
import { T_IFreeSpinsModeProvider } from '../../../type_definitions';
import { IFreeSpinsModeProvider } from '../free_spins/i_free_spins_mode_provider';

export class ScatterGameProvider extends BaseMiniGameProvider {
  private readonly _scenePrefix: string;
  private readonly _freeSpinTypes: string[] | null;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    hideSlot: boolean = true,
    hideHud: boolean = true,
    gameTypes: string[] | null = null,
    freeSpinTypes: string[] | null = null,
    externalScenesIds: string[] | null = null,
    scenePrefix: string = 'slot/popups/',
    gameTypeToBonusId: Map<string, string> | null = null
  ) {
    super(
      container,
      sceneCommon,
      GameStateMachineStates.Scatter,
      hideSlot,
      hideHud,
      gameTypes,
      externalScenesIds,
      gameTypeToBonusId
    );
    this._scenePrefix = scenePrefix;
    this._freeSpinTypes = freeSpinTypes;
  }

  get freeSpinTypes(): string[] | null {
    return this._freeSpinTypes;
  }

  get bonusResponse(): IBonusResponse | null {
    return this.stateMachine?.curResponse?.scatterInfo;
  }

  getConfigTemplate(miniGameId: string = ''): string {
    return StringUtils.format('scatter{0}.json', [miniGameId]);
  }

  get resourceManager(): IResourceManager {
    return new ScatterResourceManager(this.sceneCommon.sceneFactory, this._scenePrefix);
  }

  get miniGameService(): IMiniGameService {
    return new ScatterService(this.container);
  }

  onMiniGameStarted(): void {
    if (this.dynamicDrawOrdersProvider) {
      this.dynamicDrawOrdersProvider.showHudUnderScatter();
      this.dynamicDrawOrdersProvider.showScatterUnderContests();
    }
  }

  async onMiniGameFinishing(): Promise<void> {
    const selectedButtons = this.bonusGame!.bonusResponse.currentRound!.selectedButtons;
    if (!this._freeSpinTypes) {
      this.addFreeSpinInfo();
    } else if (selectedButtons) {
      const fsButton = selectedButtons.find((button) => this._freeSpinTypes!.includes(button.type));
      if (fsButton) {
        this.addFreeSpinInfo();
      }
    }

    if (this.bonusGame!.bonusResponse.freeSpinsInfo) {
      this.stateMachine.curResponse.freeSpinsInfo = this.bonusGame!.bonusResponse.freeSpinsInfo;
    }

    // await tryActivateParleyProgress();

    this.stateMachine.curResponse.scatterInfo = null;
  }

  async onMiniGameFinished(): Promise<void> {
    this.stateMachine.resume();
  }

  private addFreeSpinInfo(): void {
    const finishArgs = this.bonusGame!.finishArgs;
    let previousFreeSpinsInfo: InternalFreeSpinsInfo | null = null;
    if (this.stateMachine.curResponse.freeSpinsInfo) {
      previousFreeSpinsInfo = this.stateMachine.curResponse.freeSpinsInfo;
    }
    this.stateMachine.curResponse.freeSpinsInfo = new InternalFreeSpinsInfo();
    this.stateMachine.curResponse.freeSpinsInfo.event = FreeSpinsInfoConstants.FreeSpinsStarted;
    this.stateMachine.curResponse.freeSpinsInfo.name = finishArgs.lastSelectedView!;
    this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup =
      new InternalFreeSpinsGroup();
    this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.name =
      FreeSpinsInfoConstants.FreeFreeSpinsGroupName;
    this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.count =
      finishArgs.lastSelectedValue;
    this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.usedCount = 0;
    if (previousFreeSpinsInfo) {
      this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.usedCount =
        previousFreeSpinsInfo.currentFreeSpinsGroup!.usedCount;
      this.stateMachine.curResponse.freeSpinsInfo.totalFreeSpins =
        previousFreeSpinsInfo.totalFreeSpins;
    }
    this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.marker =
      finishArgs.lastSelectedView;
    this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.bet =
      this.bonusGame!.bonusResponse.result!.bet;
    this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.lines =
      this.bonusGame!.bonusResponse.result!.lines;
    if (finishArgs.lastSelectedView) {
      const freeSpinsModeProvider =
        this.container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);
      if (freeSpinsModeProvider) {
        freeSpinsModeProvider.setMode(finishArgs.lastSelectedView);
      }
    }

    if (this.bonusGame!.bonusResponse.freeSpinsInfo) {
      this.stateMachine.curResponse.freeSpinsInfo = this.bonusGame!.bonusResponse.freeSpinsInfo;
    }
    if (this.bonusGame!.bonusResponse.freeSpinReBuyInfo) {
      this.stateMachine.curResponse.freeSpinReBuyInfo =
        this.bonusGame!.bonusResponse.freeSpinReBuyInfo;
    }
  }
}
