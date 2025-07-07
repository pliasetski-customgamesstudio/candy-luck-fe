import {
  SceneCommon,
  ISlotsApiService,
  T_ISlotsApiService,
  IBonusResponse,
  IResourceManager,
} from '@cgs/common';
import { Container, JSONResource, IResourceCache } from '@cgs/syd';
import { ISlotSessionProvider } from '../interfaces/i_slot_session_provider';
import { BaseMiniGameProvider } from './base_mini_game_provider';
import { BonusResourceManager, IMiniGameService } from '@cgs/features';
import { GameStateMachineStates } from '../../../reels_engine/state_machine/game_state_machine';
import { BonusService } from '../../../bonus/bonus_service';
import { T_ISlotSessionProvider } from '../../../type_definitions';
import { IBonusSharer, T_IBonusSharer } from '../../../i_bonus_sharer';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';

export class BonusGameProvider extends BaseMiniGameProvider {
  private static readonly NewBonusConfigTemplate: string = 'bonus.json';
  private static readonly NewSeveralBonusConfigTemplate: string = 'bonus_{0}.json';

  private static readonly BonusConfigTemplate: string = 'bonus{0}.json';
  private static readonly SeveralBonusConfigTemplate: string = 'bonus{0}_{1}.json';

  private _miniGameService: IMiniGameService;
  private _isSharingEnabled: boolean;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    hideSlot: boolean = true,
    hideHud: boolean = true,
    gameTypes: string[] | null = null,
    externalScenesIds: string[] | null = null,
    gameTypeToBonusId: Map<string, string> | null = null,
    isSharingEnabled: boolean = true
  ) {
    super(
      container,
      sceneCommon,
      GameStateMachineStates.Bonus,
      hideSlot,
      hideHud,
      gameTypes,
      externalScenesIds,
      gameTypeToBonusId
    );
    this._miniGameService = new BonusService(
      container,
      container.forceResolve<ISlotsApiService>(T_ISlotsApiService)
    );
    this._isSharingEnabled = isSharingEnabled;
  }

  get bonusResponse(): IBonusResponse | null {
    return this.stateMachine.curResponse.bonusInfo;
  }

  get resourceManager(): IResourceManager {
    return new BonusResourceManager(this.sceneCommon.sceneFactory);
  }

  get miniGameService(): IMiniGameService {
    return this._miniGameService;
  }
  set miniGameService(value: IMiniGameService) {
    this._miniGameService = value;
  }

  getConfigTemplateWithFallback(resourceCache: IResourceCache, miniGameId: string = ''): string {
    const baseConfigPath: string =
      miniGameId === ''
        ? BonusGameProvider.NewBonusConfigTemplate
        : BonusGameProvider.NewSeveralBonusConfigTemplate.replace('{0}', miniGameId);
    const config = resourceCache.getResource<JSONResource>(
      JSONResource.TypeId,
      `config/${baseConfigPath}`
    );
    if (config?.data) {
      return baseConfigPath;
    }
    return this.getConfigTemplate(miniGameId);
  }

  getConfigTemplate(miniGameId: string = ''): string {
    if (miniGameId !== '') {
      const config = BonusGameProvider.SeveralBonusConfigTemplate.replace(
        '{0}',
        this.container
          .forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider)
          .slotSession.GameId.toString()
      );
      return config.replace('{1}', miniGameId);
    }

    return BonusGameProvider.BonusConfigTemplate.replace(
      '{0}',
      this.container
        .forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider)
        .slotSession.GameId.toString()
    );
  }

  onMiniGameStarted(): void {
    if (this.dynamicDrawOrdersProvider) {
      this.dynamicDrawOrdersProvider.showHudUnderBonus();
      this.dynamicDrawOrdersProvider.showBonusUnderMachine();
      this.dynamicDrawOrdersProvider.showBonusUnderContests();
    }
  }

  async onMiniGameFinished(): Promise<void> {
    this.stateMachine.resume();
  }

  async onMiniGameFinishing(): Promise<void> {
    if (this._isSharingEnabled) {
      this.container.forceResolve<IBonusSharer>(T_IBonusSharer).shareBonus();
    }
    if (
      this.stateMachine.curResponse.isFreeSpins &&
      this.stateMachine.curResponse.freeSpinsInfo &&
      this.stateMachine.curResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsStarted
    ) {
      this.stateMachine.curResponse.freeSpinsInfo.totalWin +=
        this.bonusGame!.bonusResponse.result!.totalWin;
      this.stateMachine.curResponse.totalWin = this.bonusGame!.bonusResponse.result!.totalWin;
    }
    this.stateMachine.curResponse.bonusInfo = null;
    if (this.stateMachine.curResponse.winPositions) {
      this.stateMachine.curResponse.winPositions = this.removeWinIcons(
        this.stateMachine.curResponse.winPositions,
        ['bonus', 'bonusWild']
      );
    }

    if (this.bonusGame?.bonusResponse.freeSpinsInfo) {
      this.stateMachine.curResponse.freeSpinsInfo = this.bonusGame.bonusResponse.freeSpinsInfo;
    }
    if (this.bonusGame?.bonusResponse.freeSpinReBuyInfo) {
      this.stateMachine.curResponse.freeSpinReBuyInfo =
        this.bonusGame.bonusResponse.freeSpinReBuyInfo;
    }

    // await tryActivateParleyProgress();

    this.dynamicDrawOrdersProvider?.normalizeDrawOrders();
  }
}
