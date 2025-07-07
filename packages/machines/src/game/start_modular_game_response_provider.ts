// import { Container } from 'inversify';
// import { BaseSlotResponseProvider } from 'machines';
// import { ISlotMachineInfo } from 'machines';
// import { IGameParams } from 'machines';
// import { ISlotsApiService } from 'network';
// import { ResponseConverter } from 'common';
// import { AdditionalDataConverterComponent } from 'common';
// import { SpecialSymbolGroupResponseConverterComponent } from 'common';
// import { WinLineResponseConverterComponent } from 'common';
// import { WinPositionResponseConverterComponent } from 'common';
// import { FakeMultireelReplacerConverterComponent } from 'common';
// import { StartMachineRequest } from 'machines';
// import { ModularMachineInfoDTO } from 'machines';
// import { ModularSlotMachineInfo } from 'machines';
// import { createBets } from 'machines';
// import { InternalBet } from 'machines';
// import { ReelState } from 'machines';
// import { BonusConverterExtention } from 'machines';
// import { SpinResponseConverterExtensions } from 'machines';
// import { Line } from 'machines';
// import { ReelWinPosition } from 'machines';
// import { SlotMachineModuleInfo } from 'machines';
// import { ModularSpinResultResponse } from 'machines';
// import { ModularSpinResponse } from 'machines';
// import { MachineSymbol } from 'machines';
// import { NetworkSymbol } from 'network';
//
// export class StartModularGameResponseProvider extends BaseSlotResponseProvider<ISlotMachineInfo> {
//   private _gameParams: IGameParams;
//   private _slotService: ISlotsApiService;
//   private _additionalDataConverter: ResponseConverter;
//   private _winLinesResponseConverter: ResponseConverter;
//   private _specialSymbolGroupsConverter: ResponseConverter;
//   private _initialReelsProvider: IInitialReelsProvider;
//   private _winPositionsResponseConverter: ResponseConverter;
//   private _fakeMultireelReplacerConverter: ResponseConverter;
//
//   constructor(container: Container, gameParams: IGameParams) {
//     super(container);
//     this._gameParams = gameParams;
//     this._additionalDataConverter = .forceResolve<AdditionalDataConverterComponent>(T_AdditionalDataConverterComponent).converter;
//     this._specialSymbolGroupsConverter = container.forceResolve<SpecialSymbolGroupResponseConverterComponent>(T_SpecialSymbolGroupResponseConverterComponent).converter;
//     this._winLinesResponseConverter = container.forceResolve<WinLineResponseConverterComponent>(T_WinLineResponseConverterComponent).converter;
//     this._winPositionsResponseConverter = container.forceResolve<WinPositionResponseConverterComponent>(T_WinPositionResponseConverterComponent).converter;
//     this._fakeMultireelReplacerConverter = container.resolve(FakeMultireelReplacerConverterComponent).converter;
//     this._slotService = container.forceResolve<ISlotsApiService>(T_ISlotsApiService);
//     this._initialReelsProvider = container.resolve(IInitialReelsProvider);
//   }
//
//   public async doRequest(isFreeSpins: boolean = true): Promise<ISlotMachineInfo> {
//     const request: StartMachineRequest = new StartMachineRequest();
//     request.machineId = this._gameParams.gameId;
//
//     const result: ModularMachineInfoDTO = await this._slotService.startModularMachine(request);
//
//     const lines: number[] = [];
//     for (let i = 1; i <= result.maxLines; i++) {
//       lines.push(i);
//     }
//     const startResponse: ModularSlotMachineInfo = new ModularSlotMachineInfo();
//
//     startResponse.bets = createBets(this._gameParams.gameId, result.bets, result.extraBets, result.savedBets);
//     startResponse.maxLines = result.maxLines;
//     startResponse.lines = lines;
//     startResponse.volatilities = result.volatilities;
//     startResponse.cheatUser = result.cheatUser ?? false;
//     startResponse.configs = result.configs ?? null;
//
//     const modularSpinResult: ModularSpinResultResponse = new ModularSpinResultResponse();
//     modularSpinResult.baseMachineState = result.machineState;
//     modularSpinResult.modulesMachineStates = new Map<string, MachineStateResponse>();
//
//     for (const key in result.modulesInfo.keys) {
//       const value = result.modulesInfo[key];
//       modularSpinResult.modulesMachineStates.set(key, value.machineState);
//     }
//
//     startResponse.spinResult = this.toInternalResponseFromModular(modularSpinResult);
//
//     startResponse.symbols = this.createSymbols(result.symbols);
//     startResponse.betMultiplier = result.betMultiplier ?? 1.0;
//     startResponse.defaultBet = result.defaultBet ?? 0.0;
//     startResponse.currentVolatility = result.machineState.volatility ?? 0.0;
//     startResponse.modulesInfo = new Map<string, SlotMachineModuleInfo>();
//
//     for (const key in result.modulesInfo.keys) {
//       const value = result.modulesInfo[key];
//       const slotMachineModule: SlotMachineModuleInfo = new SlotMachineModuleInfo();
//       slotMachineModule.symbols = this.createSymbols(value.symbols);
//       slotMachineModule.lines = new Array<number>(value.maxLines);
//       slotMachineModule.maxLines = value.maxLines;
//       startResponse.modulesInfo.set(key, slotMachineModule);
//     }
//
//     if (startResponse.spinResult && startResponse.spinResult.isBonus && startResponse.spinResult.winLines) {
//       startResponse.spinResult.winLines.clear();
//     }
//
//     return startResponse;
//   }
//
//   private toInternalResponseFromModular(spinResult: ModularSpinResultResponse): IModularSpinResponse {
//     const result: ModularSpinResponse = new ModularSpinResponse();
//     result.reelState = new ReelState();
//     result.bonusInfo = BonusConverterExtention.toInternalResponse(spinResult.baseMachineState.bonusInfo);
//     result.scatterInfo = BonusConverterExtention.toInternalResponse(spinResult.baseMachineState.scatterInfo);
//     result.freeSpinsInfo = SpinResponseConverterExtensions.toInternalResponse(spinResult.baseMachineState.freeSpinsInfo);
//     result.bets = !spinResult.bets || spinResult.bets.length == 0 ? new Array<InternalBet>() : createBets(this._gameParams.gameId, spinResult.bets, null, null);
//     result.defaultBet = spinResult.defaultBet ?? 0.0;
//     result.volatility = spinResult.baseMachineState.volatility;
//     result.viewReels = spinResult.baseMachineState.viewReels;
//     result.winLines = spinResult.baseMachineState.winLines ? this._winLinesResponseConverter.ConvertObject(spinResult.baseMachineState.winLines) : new Array<Line>();
//
//     // TODO: DART2 Check fix
//     result.winPositions = spinResult.baseMachineState.winPositions ? this._winPositionsResponseConverter.ConvertObject(spinResult.baseMachineState.winPositions) : new Array<ReelWinPosition>();
//
//     result.specialSymbolGroups = spinResult.baseMachineState.defaultSpecGroups ? this._specialSymbolGroupsConverter.ConvertObject(spinResult.baseMachineState.defaultSpecGroups) : null;
//
//     result.additionalData = spinResult.baseMachineState.additionalData ? this._additionalDataConverter.ConvertObject(spinResult.baseMachineState.additionalData) : null;
//
//     result.totalWin = spinResult.baseMachineState.totalWin;
//     result.totalLost = spinResult.baseMachineState.totalLost;
//     result.bigWinName = spinResult.winningName;
//     result.totalLostWithModules = spinResult.totalWin;
//     result.totalWinWithModules = spinResult.totalLost;
//     result.isFakeResponse = false;
//
//     result.moduleReelStates = new Map<string, ReelState>();
//
//     if (spinResult.modulesMachineStates) {
//       spinResult.modulesMachineStates.forEach((k, v) => {
//         const reelState: ReelState = new ReelState();
//         reelState.viewReels = v.viewReels;
//
//         reelState.winLines = v.winLines ? this._winLinesResponseConverter.ConvertObject(v.winLines) : new Array<Line>();
//         reelState.winPositions = v.winPositions ? this._winPositionsResponseConverter.ConvertObject(v.winPositions) : new Array<ReelWinPosition>();
//
//         reelState.specialSymbolGroups = v.defaultSpecGroups ? this._specialSymbolGroupsConverter.ConvertObject(v.defaultSpecGroups) : null;
//
//         reelState.additionalData = v.additionalData ? this._additionalDataConverter.ConvertObject(v.additionalData) : null;
//
//         reelState.substituteReelViews = v.substituteViews ? this._fakeMultireelReplacerConverter.ConvertObject(v.substituteViews) : null;
//
//         reelState.totalWin = v.totalWin ?? 0.0;
//         reelState.totalLost = v.totalLost ?? 0.0;
//         result.moduleReelStates.set(k, reelState);
//       });
//     }
//
//     spinResult.modulesMachineStates.forEach((k, v) => {
//       const reelState: ReelState = new ReelState();
//       reelState.viewReels = v.viewReels;
//
//       reelState.winLines = v.winLines ? this._winLinesResponseConverter.ConvertObject(v.winLines) : new Array<Line>();
//
//       // TODO: DART2 Check fix
//       reelState.winPositions = v.winPositions ? this._winPositionsResponseConverter.ConvertObject(v.winPositions) : new Array<ReelWinPosition>();
//
//       reelState.specialSymbolGroups = v.defaultSpecGroups ? this._specialSymbolGroupsConverter.ConvertObject(v.defaultSpecGroups) : null;
//
//       result.additionalData = v.additionalData ? this._additionalDataConverter.ConvertObject(v.additionalData) : null;
//
//       result.totalWin = v.totalWin ?? 0.0;
//       result.totalLost = v.totalLost ?? 0.0;
//     });
//
//     return result;
//   }
//
//   private createSymbols(symbols: NetworkSymbol[]): MachineSymbol[] {
//     const result: MachineSymbol[] = [];
//     for (const symbol of symbols) {
//       const machineSymbol: MachineSymbol = new MachineSymbol();
//       machineSymbol.id = symbol.id ?? 0;
//       machineSymbol.gains = symbol.gains.map((x) => x ?? 0.0);
//       machineSymbol.typeGains = symbol.typeGains ? symbol.typeGains.map((x) => x ?? 0.0) : null;
//       machineSymbol.stacked = symbol.stacked ?? 0;
//       machineSymbol.type = symbol.type;
//       result.push(machineSymbol);
//     }
//     return result;
//   }
// }
