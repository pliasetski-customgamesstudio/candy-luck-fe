import {
  ISlotMachineInfo,
  ISlotsApiService,
  ISimpleUserInfoHolder,
  SlotMachineInfo,
  MachineSymbol,
  ISpinResponse,
  SpinResponse,
  ReelState,
  Line,
  ReelWinPosition,
  SpecialSymbolGroup,
  T_ISlotsApiService,
  InternalBaseSpecGroup,
} from '@cgs/common';
import {
  StartMachineRequest,
  NetworkSymbol,
  MachineStateResponse,
  MachineInfoDTO,
  DefaultSpecGroupDTO,
  WinLineDTO,
  WinPositionDTO,
} from '@cgs/network';
import { Container } from '@cgs/syd';
import { BonusConverterExtention } from '../bonus/bonus_converter_extention';
import { IGameParams } from '../reels_engine/interfaces/i_game_params';
import { ResponseConverter } from '../reels_engine/reel_net_api/response_converter';
import { BaseSlotResponseProvider } from './base_slot_response_provider';
import { AdditionalDataConverterComponent } from './components/reel_net_api/additional_data_converter_component';
import { SpinResponseConverterExtensions } from './components/reel_net_api/converters/spin_response_converter_extensions';
// import { FakeMultireelReplacerConverterComponent } from "./components/reel_net_api/fake_multireel_replacer_converter_component";
import { SpecialSymbolGroupResponseConverterComponent } from './components/reel_net_api/special_symbol_group_response_converter_component';
import { WinLineResponseConverterComponent } from './components/reel_net_api/win_line_response_converter_component';
import { WinPositionResponseConverterComponent } from './components/reel_net_api/win_position_response_converter_component';
import {
  T_AdditionalDataConverterComponent,
  T_SpecialSymbolGroupResponseConverterComponent,
  T_WinLineResponseConverterComponent,
  T_WinPositionResponseConverterComponent,
} from '../type_definitions';

export class StartGameResponseProvider extends BaseSlotResponseProvider<ISlotMachineInfo> {
  private _gameParams: IGameParams;
  private _slotsApiService: ISlotsApiService;
  private _additionalDataConverter: ResponseConverter<Record<string, any>, InternalBaseSpecGroup>; // WTF???ResponseConverter<MachineInfoDTO, ISlotMachineInfo>;
  private _winLinesResponseConverter: ResponseConverter<WinLineDTO[], Line[]>;
  private _winPositionsResponseConverter: ResponseConverter<WinPositionDTO[], ReelWinPosition[]>;
  private _specialSymbolGroupsConverter: ResponseConverter<
    DefaultSpecGroupDTO[],
    SpecialSymbolGroup[]
  >;
  private _fakeMultireelReplacerConverter: ResponseConverter<MachineInfoDTO, ISlotMachineInfo>;
  public startMachineInfo: ISlotMachineInfo;
  private _userInfoHolder: ISimpleUserInfoHolder;

  constructor(
    container: Container,
    gameParams: IGameParams,
    userInfoHolder: ISimpleUserInfoHolder
  ) {
    super(container);
    this._gameParams = gameParams;
    this._userInfoHolder = userInfoHolder;

    this._slotsApiService = container.forceResolve<ISlotsApiService>(T_ISlotsApiService);
    this._additionalDataConverter = container.forceResolve<AdditionalDataConverterComponent>(
      T_AdditionalDataConverterComponent
    ).converter;
    this._specialSymbolGroupsConverter =
      container.forceResolve<SpecialSymbolGroupResponseConverterComponent>(
        T_SpecialSymbolGroupResponseConverterComponent
      ).converter;
    this._winLinesResponseConverter = container.forceResolve<WinLineResponseConverterComponent>(
      T_WinLineResponseConverterComponent
    ).converter;
    this._winPositionsResponseConverter =
      container.forceResolve<WinPositionResponseConverterComponent>(
        T_WinPositionResponseConverterComponent
      ).converter;
    // this._fakeMultireelReplacerConverter = container.forceResolve<FakeMultireelReplacerConverterComponent>(T_FakeMultireelReplacerConverterComponent).converter;
  }

  public async doRequest(): Promise<ISlotMachineInfo> {
    const request: StartMachineRequest = new StartMachineRequest();
    request.machineId = this._gameParams.machineId;
    request.userId = this._userInfoHolder.user.userId;

    const result = await this._slotsApiService.startMachine(request);

    const lines: number[] = [];
    for (let i = 1; i <= result.maxLines!; i++) {
      lines.push(i);
    }

    const startResponse: SlotMachineInfo = new SlotMachineInfo();

    startResponse.bets = this.createBets(
      this._gameParams.machineId,
      result.bets as number[],
      [],
      []
    );
    startResponse.configuredBets = result.configuredBets!;
    startResponse.maxLines = result.maxLines ?? 0;
    startResponse.lines = lines;
    startResponse.freeSpinGameCompletionData =
      SpinResponseConverterExtensions.toInternalFreeSpinGameCompletionData(
        result.machineState?.freeSpinGameCompletionData
      );
    startResponse.volatilities = [];

    startResponse.spinResult = this.toInternalResponse(result.machineState as MachineStateResponse);
    startResponse.symbols = this.createSymbols(result.symbols!);
    startResponse.betMultiplier = result.betMultiplier!;
    startResponse.defaultBet = result.defaultBet!;
    startResponse.currentVolatility = result.machineState!.volatility!;
    startResponse.cheatUser = result.cheatUser ?? false;
    startResponse.configs = result.configs || [];
    startResponse.cheatCommands = result.cheatCommands || [];
    startResponse.cheatReels = result.cheatReels;
    startResponse.customCheatInput = result.customCheatInput;
    // startResponse.staticModulesShopInfo = this.createInGameShopModulesInfo(result.machineState!.tstaticGamesInfo);

    if (
      startResponse.spinResult &&
      startResponse.spinResult.isBonus &&
      startResponse.spinResult.winLines
    ) {
      startResponse.spinResult.winLines.length = 0;
    }

    startResponse.shopGemConfig = result.shopGemConfig;
    startResponse.shopAdsConfig = result.shopAdsConfig;
    startResponse.shopGemAndAdsConfig = result.shopGemAndAdsConfig;
    startResponse.loginFormConfig = result.loginFormConfig;

    this.startMachineInfo = startResponse;
    return startResponse;
  }

  // private createInGameShopModulesInfo(staticModulesInfo: TStaticGamesInfoDTO): StaticModulesShopInfo {
  //   const result: StaticModulesShopInfo = new StaticModulesShopInfo();
  //   if (staticModulesInfo) {
  //     result.crystals = staticModulesInfo.crystals;
  //     result.selected = staticModulesInfo.selected;
  //     result.modules = [];
  //     if (staticModulesInfo.modules) {
  //       for (const module of staticModulesInfo.modules) {
  //         const convertedModule: StaticModule = new StaticModule();
  //         convertedModule.buttons = [];
  //         for (const button of module.buttons) {
  //           const convertedButton: StaticButton = new StaticButton();
  //           convertedButton.cost = button.cost;
  //           convertedButton.index = button.index;
  //           convertedButton.status = button.status;
  //           convertedButton.type = button.type;
  //           convertedButton.value = button.value;
  //           convertedModule.buttons.push(convertedButton);
  //         }
  //         convertedModule.attributes = module.attributes;
  //         convertedModule.status = module.status;
  //         convertedModule.name = module.name;
  //         convertedModule.level = module.level;

  //         result.modules.push(convertedModule);
  //       }
  //     }
  //     result.nextModules = [];
  //     if (staticModulesInfo.nextModules) {
  //       for (const module of staticModulesInfo.nextModules) {
  //         const convertedModule: StaticModule = new StaticModule();
  //         convertedModule.buttons = [];
  //         for (const button of module.buttons) {
  //           const convertedButton: StaticButton = new StaticButton();
  //           convertedButton.cost = button.cost;
  //           convertedButton.index = button.index;
  //           convertedButton.status = button.status;
  //           convertedButton.type = button.type;
  //           convertedButton.value = button.value;
  //           convertedModule.buttons.push(convertedButton);
  //         }
  //         convertedModule.attributes = module.attributes;
  //         convertedModule.status = module.status;
  //         convertedModule.name = module.name;
  //         convertedModule.level = module.level;
  //         result.nextModules.push(convertedModule);
  //       }
  //     }
  //     result.actResult = [];
  //     if (staticModulesInfo.actResult) {
  //       for (const actResult of staticModulesInfo.actResult) {
  //         const convertedResult: StaticResult = new StaticResult();
  //         convertedResult.name = actResult.name;
  //         convertedResult.dValue = actResult.dValue;
  //         convertedResult.bet = actResult.bet;
  //         convertedResult.type = actResult.type;
  //         convertedResult.value = actResult.value;
  //         result.actResult.push(convertedResult);
  //       }
  //     }
  //   }
  //   return result;
  // }

  private createSymbols(symbols: NetworkSymbol[]): MachineSymbol[] {
    const result: MachineSymbol[] = [];
    for (const symbol of symbols) {
      const machineSymbol: MachineSymbol = new MachineSymbol();
      machineSymbol.id = symbol.id ?? 0;
      machineSymbol.typeGains = symbol.typeGains ? symbol.typeGains.map((x) => x ?? 0) : null;
      machineSymbol.gains = symbol.gains ? symbol.gains.map((x) => x ?? 0) : null;
      machineSymbol.stacked = symbol.stacked ?? 0;
      machineSymbol.type = symbol.type!;
      result.push(machineSymbol);
    }
    return result;
  }

  private toInternalResponse(machineState: MachineStateResponse): ISpinResponse {
    const result: SpinResponse = new SpinResponse();
    result.reelState = new ReelState();

    result.viewReels = machineState.viewReels as number[][];
    result.reelState.freeSpinGameCompletionData =
      SpinResponseConverterExtensions.toInternalFreeSpinGameCompletionData(
        machineState.freeSpinGameCompletionData
      );
    result.bonusInfo = BonusConverterExtention.toInternalResponse(machineState.bonusInfo);
    result.scatterInfo = BonusConverterExtention.toInternalResponse(machineState.scatterInfo);
    result.totalWin = machineState.totalWin ?? 0.0;
    result.totalLost = machineState.totalLost ?? 0.0;
    result.bigWinName = machineState.winningName ?? '';
    result.freeSpinsInfo = machineState.freeSpinsInfo
      ? SpinResponseConverterExtensions.toInternalResponse(machineState.freeSpinsInfo)
      : null;
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
    // result.substituteReelViews = machineState.substituteViews ? this._fakeMultireelReplacerConverter.ConvertObject(machineState.substituteViews) : null;
    return result;
  }
}
