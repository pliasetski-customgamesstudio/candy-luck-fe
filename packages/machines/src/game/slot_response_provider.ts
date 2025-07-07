import { BaseSlotResponseProvider } from './base_slot_response_provider';
import {
  AuthorizationKeyNotFoundException,
  ErrorLevel,
  FutureCancelledError,
  InternalBaseSpecGroup,
  InvalidSequenceNumberException,
  ISimpleUserInfoHolder,
  ISpinResponse,
  Line,
  NoInternetException,
  NotEnoughBalanceException,
  ReelState,
  ReelWinPosition,
  RestartInitiatedException,
  SpecialSymbolGroup,
  SpinPerMinuteLimitExceededException,
  SpinResponse,
  T_GameOperation,
  T_ISimpleUserInfoHolder,
  T_ISlotsApiService,
} from '@cgs/common';
import { Container, Random } from '@cgs/syd';
import { ResponseConverter } from '../reels_engine/reel_net_api/response_converter';
import { IInitialReelsProvider } from '../reels_engine/game_components_providers/i_icons_enumerator_provider';
import { ISlotsApiService } from '@cgs/common';
import { ISlotSessionProvider } from './components/interfaces/i_slot_session_provider';
import { CheatComponent } from './components/cheat_component';
import { NotEnoughBalanceController } from './components/not_enough_balance_controller';
import { NotEnoughBalanceProvider } from './components/not_enough_balance_provider';
import {
  T_AdditionalDataConverterComponent,
  T_CheatComponent,
  T_FastSpinsController,
  T_IInitialReelsProvider,
  T_ISlotGameEngineProvider,
  T_ISlotSessionProvider,
  T_NotEnoughBalanceProvider,
  T_SpecialSymbolGroupResponseConverterComponent,
  T_WinLineResponseConverterComponent,
  T_WinPositionResponseConverterComponent,
} from '../type_definitions';
import { IGameParams } from '../reels_engine/interfaces/i_game_params';
import { GameOperation } from '../game_operation';
import { FastSpinsController } from './common/footer/controllers/fast_spins_controller';
import { AdditionalDataConverterComponent } from './components/reel_net_api/additional_data_converter_component';
import { SpecialSymbolGroupResponseConverterComponent } from './components/reel_net_api/special_symbol_group_response_converter_component';
import { WinLineResponseConverterComponent } from './components/reel_net_api/win_line_response_converter_component';
import { WinPositionResponseConverterComponent } from './components/reel_net_api/win_position_response_converter_component';
import {
  DefaultSpecGroupDTO,
  ParseException,
  ServerException,
  SpinParams,
  SpinRequest,
  SpinResultResponse,
  WinLineDTO,
  WinPositionDTO,
} from '@cgs/network';
import { BonusConverterExtention } from '../bonus/bonus_converter_extention';
import { SpinResponseConverterExtensions } from './components/reel_net_api/converters/spin_response_converter_extensions';
import { ISlotGameEngineProvider } from '../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../reels_engine/reels_engine';
import { FreeSpinsInfoConstants } from '../reels_engine/state_machine/free_spins_info_constants';

export class SpinResponseProvider<
  TResponse extends ISpinResponse,
> extends BaseSlotResponseProvider<TResponse> {
  private _random: Random = new Random();
  private _additionalDataConverter: ResponseConverter<Record<string, any>, InternalBaseSpecGroup>;
  get additionalDataConverter(): ResponseConverter<Record<string, any>, InternalBaseSpecGroup> {
    return this._additionalDataConverter;
  }
  private _winLinesResponseConverter: ResponseConverter<WinLineDTO[], Line[]>;
  get winLinesResponseConverter(): ResponseConverter<WinLineDTO[], Line[]> {
    return this._winLinesResponseConverter;
  }
  private _winPositionsResponseConverter: ResponseConverter<WinPositionDTO[], ReelWinPosition[]>;
  get winPositionsResponseConverter(): ResponseConverter<WinPositionDTO[], ReelWinPosition[]> {
    return this._winPositionsResponseConverter;
  }
  private _specialSymbolGroupsConverter: ResponseConverter<
    DefaultSpecGroupDTO[],
    SpecialSymbolGroup[]
  >;
  get specialSymbolGroupsConverter(): ResponseConverter<
    DefaultSpecGroupDTO[],
    SpecialSymbolGroup[]
  > {
    return this._specialSymbolGroupsConverter;
  }
  // private _fakeMultireelReplacerConverter: ResponseConverter;
  // get fakeMultireelReplacerConverter(): ResponseConverter { return this._fakeMultireelReplacerConverter; }
  private _initialReelsProvider: IInitialReelsProvider;
  get initialReelsProvider(): IInitialReelsProvider {
    return this._initialReelsProvider;
  }

  get slotService(): ISlotsApiService {
    return this._slotService;
  }
  private _slotService: ISlotsApiService;
  protected _session: ISlotSessionProvider;
  get session(): ISlotSessionProvider {
    return this._session;
  }
  private _cheatComponent: CheatComponent;
  get cheatComponent(): CheatComponent {
    return this._cheatComponent;
  }
  set cheatComponent(value: CheatComponent) {
    this._cheatComponent = value;
  }
  private cheat: any;
  private _notEnoughBalanceController: NotEnoughBalanceController;
  get notEnoughBalanceController(): NotEnoughBalanceController {
    if (!this._notEnoughBalanceController) {
      this._notEnoughBalanceController = this.container.forceResolve<NotEnoughBalanceProvider>(
        T_NotEnoughBalanceProvider
      ).popupController as NotEnoughBalanceController;
    }
    return this._notEnoughBalanceController;
  }

  get gameParams(): IGameParams {
    return this._slotParams;
  }
  private _slotParams: IGameParams;
  get slotParams(): IGameParams {
    return this._slotParams;
  }
  private _userInfoHolder: ISimpleUserInfoHolder;
  get userInfoHolder(): ISimpleUserInfoHolder {
    return this._userInfoHolder;
  }
  private _gameOperation: GameOperation;

  private _fastSpinController: FastSpinsController;
  get fastSpinController(): FastSpinsController {
    return (
      this._fastSpinController ??
      (this._fastSpinController = this.container.resolve(
        T_FastSpinsController
      ) as FastSpinsController)
    );
  }

  constructor(container: Container, slotParams: IGameParams) {
    super(container);
    this._slotParams = slotParams;
    this._session = container.forceResolve<ISlotSessionProvider>(
      T_ISlotSessionProvider
    ) as ISlotSessionProvider;
    this._additionalDataConverter = container.forceResolve<AdditionalDataConverterComponent>(
      T_AdditionalDataConverterComponent
    ).converter as ResponseConverter<Record<string, any>, InternalBaseSpecGroup>;
    this._specialSymbolGroupsConverter =
      container.forceResolve<SpecialSymbolGroupResponseConverterComponent>(
        T_SpecialSymbolGroupResponseConverterComponent
      ).converter as ResponseConverter<DefaultSpecGroupDTO[], SpecialSymbolGroup[]>;
    this._winLinesResponseConverter = container.forceResolve<WinLineResponseConverterComponent>(
      T_WinLineResponseConverterComponent
    ).converter as ResponseConverter<WinLineDTO[], Line[]>;
    this._winPositionsResponseConverter =
      container.forceResolve<WinPositionResponseConverterComponent>(
        T_WinPositionResponseConverterComponent
      ).converter as ResponseConverter<WinPositionDTO[], ReelWinPosition[]>;
    // this._fakeMultireelReplacerConverter = container.resolve<FakeMultireelReplacerConverterComponent>(T_FakeMultireelReplacerConverterComponent).converter as ResponseConverter;

    this._slotService = container.forceResolve<ISlotsApiService>(
      T_ISlotsApiService
    ) as ISlotsApiService;
    this._initialReelsProvider = container.resolve(
      T_IInitialReelsProvider
    ) as IInitialReelsProvider;
    this._userInfoHolder = container.forceResolve<ISimpleUserInfoHolder>(
      T_ISimpleUserInfoHolder
    ) as ISimpleUserInfoHolder;
    this._gameOperation = container.forceResolve<GameOperation>(T_GameOperation) as GameOperation;
  }

  async doRequest(isFreeSpin: boolean = true): Promise<TResponse> {
    if (!this._cheatComponent) {
      this._cheatComponent = this.container.forceResolve<CheatComponent>(
        T_CheatComponent
      ) as CheatComponent;
    }
    const spinParams = new SpinParams();
    spinParams.betType = this._session.slotSession.BetType;
    spinParams.bet = this._session.slotSession.currentBet.bet;
    spinParams.lines = this._session.slotSession.currentLine;
    spinParams.volatility = this._session.slotSession.currentVolatility;
    spinParams.machineId = this._session.slotSession.GameId.toString();
    spinParams.cheat = this._cheatComponent.getSpinCheat();
    spinParams.freeSpin = isFreeSpin;
    spinParams.fastSpin = this.fastSpinController.isFastSpinsEnable;

    if (this._session.slotSession.gameStateMachine.curResponse.bonusInfo?.bonusFinished) {
      spinParams.spinMode = 2;
    } else if (this._session.slotSession.gameStateMachine.curResponse.freeSpinsInfo) {
      let isFreeSpins = !!this._session.slotSession.gameStateMachine.curResponse.freeSpinsInfo;
      // TODO: FIX freeSpinsInfo spinMode
      if (isFreeSpins) {
        isFreeSpins =
          this._session.slotSession.gameStateMachine.curResponse.freeSpinsInfo?.event !==
          FreeSpinsInfoConstants.FreeSpinsFinished;
      }
      spinParams.spinMode = isFreeSpin ? 1 : 0;
    } else {
      spinParams.spinMode = 0;
    }

    // this._session.slotSession.gameStateMachine.prevResponse

    const request = new SpinRequest();
    request.spinParams = spinParams;
    request.userId = this._session.slotSession.userInfoHolder.user.userId;

    let result: SpinResultResponse | null = null;
    let exception: NotEnoughBalanceException | null = null;

    try {
      // if (this._session.slotSession.isTutorial) {
      //   result = await this._slotService.tutorialSpin(request);
      // } else if (this._session.slotSession.currentBet.isExtraBet) {
      //   result = await this._slotService.extraBetSpin(request);
      // } else {
      result = await this._slotService.spin(request);
      // }

      if (!this._session.slotSession) {
        //Got server response after user leaved a slot
        throw new FutureCancelledError('SpinRequest');
      }
    } catch (e) {
      if (e instanceof SpinPerMinuteLimitExceededException) {
        return this.initialResponse(ErrorLevel.SpinLimitExceeded);
      } else if (e instanceof NoInternetException) {
        return this.initialResponse(ErrorLevel.Handled, 'NoInternetException');
      } else if (e instanceof RestartInitiatedException) {
        this.container.forceResolve<GameOperation>(T_GameOperation).completeWithError(e);
        return this.initialResponse(ErrorLevel.Critical);
      } else if (e instanceof AuthorizationKeyNotFoundException) {
        this.container.forceResolve<GameOperation>(T_GameOperation).completeWithError(e);
        return this.initialResponse(ErrorLevel.Critical);
      } else if (e instanceof ServerException || e instanceof ParseException) {
        return this.initialResponse(ErrorLevel.Handled, e.message);
      } else if (e instanceof NotEnoughBalanceException) {
        exception = e;
      } else if (e instanceof InvalidSequenceNumberException) {
        return this.initialResponse(ErrorLevel.Handled);
      }
    }

    if (exception) {
      try {
        this.notEnoughBalanceController.show();
      } catch (e) {
        //
      }
      const notEnoughCoinsResult = this.initialResponse(ErrorLevel.None);
      notEnoughCoinsResult.isFakeResponse = true;
      return notEnoughCoinsResult;
    }

    if (!result) {
      return await this.doRequest(isFreeSpin);
    }

    return this.toInternalResponse(result) as TResponse;
  }

  initialResponse(errorLevel: ErrorLevel, errorMessage: string = ''): TResponse {
    let initialIcons: number[][] = [];
    const reelsEngine =
      this.container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
    if (reelsEngine instanceof ReelsEngine) {
      initialIcons = this._initialReelsProvider.getInitialReelsForFakeResponse(
        this._slotParams.groupsCount,
        this._slotParams.maxIconsPerGroup,
        reelsEngine.internalConfig
      );
    } else {
      // const initialIconsProvider = this.container.forceResolve<IInitialIconsProvider>(T_IInitialIconsProvider) as IInitialIconsProvider;
      // const animationEngine = this.container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine as AnimationBasedGameEngine;
      // const initialIconsList = initialIconsProvider.getInitialIcons(
      //   animationEngine.gameConfig.groupsCount * animationEngine.gameConfig.maxIconsPerGroup);
      // for (let i = 0; i < animationEngine.gameConfig.groupsCount; i++) {
      //   initialIcons.push([]);
      //   for (let j = 0; j < animationEngine.gameConfig.maxIconsPerGroup; j++) {
      //     initialIcons[i].push(initialIconsList[animationEngine.gameConfig.maxIconsPerGroup * i + j]);
      //   }
      // }
    }

    const result = new SpinResponse();
    result.viewReels = initialIcons;
    result.bonusInfo = null;
    result.scatterInfo = null;
    result.freeSpinsInfo = null;
    result.winLines = [];
    result.winPositions = [];
    result.specialSymbolGroups = null;
    result.totalWin = 0.0;
    result.totalLost = 0.0;
    result.bigWinName = '';
    result.isFakeResponse = true;
    result.errorLevel = errorLevel;
    result.errorMessage = errorMessage;

    return result as TResponse;
  }

  toInternalResponse(spinResult: SpinResultResponse): ISpinResponse {
    const machineState = spinResult.machineState!;
    const result = new SpinResponse();
    result.reelState = new ReelState();

    result.bonusInfo = BonusConverterExtention.toInternalResponse(machineState.bonusInfo);
    result.scatterInfo = BonusConverterExtention.toInternalResponse(machineState.scatterInfo);
    result.freeSpinsInfo = machineState.freeSpinsInfo
      ? SpinResponseConverterExtensions.toInternalResponse(machineState.freeSpinsInfo)
      : null;

    result.bets = this.createBets(
      this._slotParams.machineId,
      spinResult.bets!,
      [],
      spinResult.savedBets ?? []
    );
    result.defaultBet = spinResult.defaultBet!;
    result.configuredBets = spinResult.configuredBets!;
    result.volatility = spinResult.machineState!.volatility!;
    //result.freeSpinGameCompletionData = SpinResponseConverterExtensions.toInternalFreeSpinGameCompletionData(spinResult.machineState.freeSpinGameCompletionData);
    result.viewReels = machineState!.viewReels!;
    result.spinningReelId = machineState!.spinningReelId!;
    result.winLines = machineState.winLines
      ? this._winLinesResponseConverter.ConvertObject(machineState.winLines)
      : [];
    result.winPositions = machineState.winPositions
      ? this._winPositionsResponseConverter.ConvertObject(machineState.winPositions)
      : [];
    result.specialSymbolGroups = machineState.defaultSpecGroups
      ? this._specialSymbolGroupsConverter.ConvertObject(machineState.defaultSpecGroups)
      : null;
    result.additionalData = machineState.additionalData
      ? this._additionalDataConverter.ConvertObject(machineState.additionalData)
      : null;
    // result.substituteReelViews = machineState.substituteViews
    //   ? this._fakeMultireelReplacerConverter.ConvertObject(machineState.substituteViews) as List<SubstituteReelViews>
    //   : null;
    result.totalWin = machineState.totalWin ?? 0.0;
    result.totalLost = machineState.totalLost ?? 0.0;
    result.progressWin = machineState.progressWin ?? 0;
    result.bigWinName = machineState.winningName!;
    result.isFakeResponse = false;
    return result;
  }
}

export class NWaysResponseProvider extends SpinResponseProvider<ISpinResponse> {
  constructor(container: Container, slotParams: IGameParams) {
    super(container, slotParams);
  }

  async getSpinTask(spinParams: SpinParams): Promise<SpinResultResponse> {
    spinParams.bet = this._session.slotSession.totalBet;
    throw new Error('Implement this');
    //    return _service.spin(spinParams);
  }
}

export class WildRavengersResponseProvider extends NWaysResponseProvider {
  constructor(container: Container, slotParams: IGameParams) {
    super(container, slotParams);
  }

  toInternalResponse(spinResult: SpinResultResponse): ISpinResponse {
    const response = super.toInternalResponse(spinResult);

    const positions: number[] = [];
    positions.push(5);
    positions.push(6);
    positions.push(7);
    positions.push(8);
    positions.push(9);
    positions.push(10);
    positions.push(11);
    positions.push(12);
    positions.push(13);
    positions.push(14);

    const _groupsForRemove: SpecialSymbolGroup[] = [];

    if (response.freeSpinsInfo) {
      if (response.specialSymbolGroups) {
        for (const specialSymbolGroup of response.specialSymbolGroups) {
          if (specialSymbolGroup && specialSymbolGroup.type == 'MovingWild') {
            if (!positions.includes(specialSymbolGroup.previousPositions![0])) {
              _groupsForRemove.push(specialSymbolGroup);
            }
          }
        }
        for (const specialSymbolGroup of _groupsForRemove) {
          // response.specialSymbolGroups.remove(specialSymbolGroup);
          response.specialSymbolGroups = response.specialSymbolGroups?.filter(
            (x) => x && x !== specialSymbolGroup
          );
          for (const position of specialSymbolGroup.positions!) {
            const line = this.GetLineIndex(position);

            const reel = this.GetReelIndex(position);

            response.viewReels[reel][line] = specialSymbolGroup.symbolId! * 100 + line;
          }
        }
      }
    }
    return response;
  }

  GetReelIndex(icon: number): number {
    return icon % 5;
  }

  GetLineIndex(icon: number): number {
    const result: number = Math.ceil(icon / 5);
    return result;
  }
}

export class AliceResponseProvider extends SpinResponseProvider<ISpinResponse> {
  constructor(container: Container, slotParams: IGameParams) {
    super(container, slotParams);
  }

  toInternalResponse(spinResult: SpinResultResponse): ISpinResponse {
    const response = super.toInternalResponse(spinResult);

    if (response.viewReels) {
      let allAlicesCount = 0;
      let alicesOnFirstLineCount = 0;
      for (let i = 0; i < response.viewReels.length; ++i) {
        for (let j = 0; j < response.viewReels[i].length; ++j) {
          if (response.viewReels[i][j] == 11) {
            allAlicesCount++;
            if (j == 0) {
              alicesOnFirstLineCount++;
            }
          }
        }
      }

      if (allAlicesCount == 1 && alicesOnFirstLineCount == 1) {
        response.specialSymbolGroups = null;
      }
    }
    return response;
  }
}
