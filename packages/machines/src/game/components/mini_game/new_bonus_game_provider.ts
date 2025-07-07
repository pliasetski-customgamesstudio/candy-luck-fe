import {
  SceneCommon,
  CancellationTokenSource,
  BonusConfiguration,
  BonusContext,
  BonusScene,
  InternalFreeSpinsInfo,
  CustomGamesResourceCache,
} from '@cgs/common';
import { Container } from '@cgs/syd';
import { T_IStorageRepositoryProvider, T_ResourcesComponent } from '../../../type_definitions';
import { ResourcesComponent } from '../resources_component';
import { BonusGameProvider } from './bonus_game_provider';
import { NewBonusGame } from '@cgs/features';
import { IBonusSharer, T_IBonusSharer } from '../../../i_bonus_sharer';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { BonusGameConfigManager } from './BonusGameConfigManager';
import { ApplicationGameConfig } from '@cgs/shared';

export class NewBonusGameProvider extends BonusGameProvider {
  private _hasFreeSpins: boolean = false;
  private _fsTypes: string[];
  get fsTypes(): string[] {
    return this._fsTypes;
  }
  private _needSharing: boolean = true;
  private _configManager: BonusGameConfigManager;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    {
      hideSlot = true,
      hideHud = true,
      gameTypes = null,
      externalScenesIds = null,
      gameTypeToBonusId = null,
      hasFreeSpins = false,
      fsTypes = null,
      needSharing = true,
    }: {
      hideSlot: boolean;
      hideHud: boolean;
      gameTypes: string[] | null;
      externalScenesIds: string[] | null;
      gameTypeToBonusId: Map<string, string> | null;
      hasFreeSpins: boolean;
      fsTypes: string[] | null;
      needSharing: boolean;
    }
  ) {
    super(
      container,
      sceneCommon,
      hideSlot,
      hideHud,
      gameTypes,
      externalScenesIds,
      gameTypeToBonusId
    );
    this._hasFreeSpins = hasFreeSpins;
    this._fsTypes = fsTypes ?? [];
    this._needSharing = needSharing;

    this._configManager = new BonusGameConfigManager(
      (sceneCommon.resourceCache as CustomGamesResourceCache)?.getUrl(
        `games/${ApplicationGameConfig.gameId}`
      ) || '',
      gameTypes || []
    );
  }

  async startBonus(): Promise<void> {
    if (
      this.bonusResponse &&
      (!this.gameTypes || this.gameTypes.includes(this.bonusResponse.type))
    ) {
      this.cancellationTokenSource = new CancellationTokenSource();
      super.bonusHolder =
        this.container.forceResolve<ResourcesComponent>(T_ResourcesComponent).bonusHolder;
      const bonusId = this.gameTypeToBonusId.has(this.bonusResponse.type)
        ? this.gameTypeToBonusId.get(this.bonusResponse.type)!
        : '';
      const config = await this._configManager.getConfig(bonusId);

      const configuration = BonusConfiguration.fromJson(config!);
      const bonusContext = new BonusContext();
      bonusContext.storageRepositoryProvider = this.container.forceResolve(
        T_IStorageRepositoryProvider
      );
      const root = this.container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
      const externalScenes = this.externalScenesIds
        ? this.externalScenesIds.map((id) => root.findById(id)!)
        : null;
      this.bonusScene = new BonusScene(
        this.bonusNode,
        configuration,
        this.resourceManager,
        bonusContext,
        externalScenes,
        this.cancellationTokenSource.token,
        this
      );
      this.bonusGame = new NewBonusGame(
        this.bonusScene,
        this.miniGameService,
        configuration,
        bonusContext,
        this.updateBonusFinishPropertiesWithCurrent(),
        this.bonusResponse.type,
        this.cancellationTokenSource.token
      );
      this.miniGameCreatedDispatcher.dispatchEvent(this.bonusGame);

      this.serverException = this.bonusGame.onServerException.listen(() => {
        this.serverException.cancel();
        this.onServerExceptionInternal();
      });
      this.finishingSub = this.bonusScene.bonusFinishing.listen(() => {
        this.finishingSub.cancel();
        this.onMiniGameFinishingInternal();
      });
      this.shownSub = this.bonusScene.bonusShown.listen(() => {
        this.shownSub.cancel();
        this.miniGameShownDispatcher.dispatchEvent();
        this.onMiniGameStartedInternal();
      });
      this.finishedSub = this.bonusScene.bonusFinished.listen(() => {
        this.finishedSub.cancel();
        this.onMiniGameFinishedInternal();
      });
      this.updatedSub = this.bonusScene.bonusUpdated.listen(() => {
        this.updatedSub.cancel();
        this.onMiniGameUpdatedInternal();
      });

      this.bonusGame.start(this.bonusResponse);
    }
  }

  async onMiniGameFinishing(): Promise<void> {
    this.processBonusResults();
    const selectedButtons = this.bonusGame!.bonusResponse.currentRound!.selectedButtons;
    if (selectedButtons) {
      const fsButton = selectedButtons.find(
        (button) => this._fsTypes && this._fsTypes.includes(button.type)
      );
      if (!fsButton && this._needSharing) {
        this.container.forceResolve<IBonusSharer>(T_IBonusSharer).shareBonus();
      }
    }
    // Accoring to the 10b6825e072516d042921590e6156c2cdd4b16b8 change in mobile
    /*if (gameStateMachine.curResponse.isFreeSpins &&
        gameStateMachine.curResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsFinished) {
      if(gameStateMachine.curResponse.freeSpinsInfo.totalWin === 'number'){
        gameStateMachine.curResponse.freeSpinsInfo.totalWin += bonusGame.bonusResponse.result.totalWin;
      }else{
        gameStateMachine.curResponse.freeSpinsInfo.totalWin = bonusGame.bonusResponse.result.totalWin;
      }
      if(typeof gameStateMachine.curResponse.totalWin === 'number'){
        gameStateMachine.curResponse.totalWin = bonusGame.bonusResponse.result.totalWin;
      }
    }*/
    if (this.stateMachine.curResponse.winPositions) {
      this.stateMachine.curResponse.winPositions = this.removeWinIcons(
        this.stateMachine.curResponse.winPositions,
        ['bonus', 'bonusWild']
      );
    }

    if (this.bonusGame?.bonusResponse.freeSpinsInfo) {
      this.stateMachine.curResponse.freeSpinsInfo = this.bonusGame.bonusResponse.freeSpinsInfo;
    }
    if (this.bonusGame?.bonusResponse.bonusInfo) {
      this.stateMachine.curResponse.bonusInfo = this.bonusGame.bonusResponse.bonusInfo;
    }
    if (this.bonusGame?.bonusResponse.scatterInfo) {
      this.stateMachine.curResponse.scatterInfo = this.bonusGame.bonusResponse.scatterInfo;
    }

    //    await tryActivateParleyProgress();
    //
    //    if(_dynamicDrawOrdersProvider) {
    //      _dynamicDrawOrdersProvider.normalizeDrawOrders();
    //    }
  }

  private processBonusResults(): void {
    const selectedButtons = this.bonusGame!.bonusResponse.currentRound!.selectedButtons;
    if (selectedButtons) {
      const fsButton = selectedButtons.find((button) => this._fsTypes?.includes(button.type));
      if (fsButton) {
        if (!this.stateMachine.curResponse.freeSpinsInfo) {
          this.stateMachine.curResponse.freeSpinsInfo = new InternalFreeSpinsInfo();
          this.stateMachine.curResponse.freeSpinsInfo.event =
            FreeSpinsInfoConstants.FreeSpinsStarted;
        } else {
          this.stateMachine.curResponse.freeSpinsInfo.event = FreeSpinsInfoConstants.FreeSpinsAdded;
        }

        const fsInfo = this.bonusGame!.bonusResponse.freeSpinsInfo;

        if (!this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup) {
          this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup =
            fsInfo?.currentFreeSpinsGroup || null;
        }
        const configuredBetsInfo = this.bonusGame!.bonusResponse.configuredBets;
        if (configuredBetsInfo?.['DividedProgressiveCollector']?.['configuredBets']) {
          this.stateMachine.curResponse.configuredBets = configuredBetsInfo;
        }

        this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup!.bet =
          this.bonusGame!.bonusResponse.result!.bet;
        this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup!.lines =
          this.bonusGame!.bonusResponse.result!.lines;
        this.stateMachine.curResponse.freeSpinsInfo.freeSpinsAdded = fsInfo!.freeSpinsAdded;
        this.stateMachine.curResponse.freeSpinsInfo.name = fsInfo!.name;

        if (this.bonusGame?.bonusResponse.freeSpinsInfo) {
          this.stateMachine.curResponse.freeSpinsInfo = this.bonusGame.bonusResponse.freeSpinsInfo;
        }
      }

      if (this.bonusGame?.bonusResponse.result?.specGroups) {
        if (!this.stateMachine.curResponse.specialSymbolGroups) {
          this.stateMachine.curResponse.specialSymbolGroups = [];
        }

        for (const specGroup of this.bonusGame.bonusResponse.result.specGroups) {
          this.stateMachine.curResponse.specialSymbolGroups.push(specGroup);
        }
      }
    }
    if (this.bonusGame?.bonusResponse.freeSpinsInfo) {
      this.stateMachine.curResponse.freeSpinsInfo = this.bonusGame.bonusResponse.freeSpinsInfo;
      this.stateMachine.curResponse.totalWin = this.bonusGame.bonusResponse.freeSpinsInfo.totalWin;
    }
    if (this.bonusGame?.bonusResponse.freeSpinReBuyInfo) {
      this.stateMachine.curResponse.freeSpinReBuyInfo =
        this.bonusGame.bonusResponse.freeSpinReBuyInfo;
    }
  }
}
