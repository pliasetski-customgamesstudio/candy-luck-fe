// import { Container } from '@cgs/syd';
// import { SpinResponseProvider, IModularSpinResponse, ErrorLevel, ModularSpinResponse, ReelState, Line, ReelWinPosition, InternalBet } from 'machines';
// import { SpinParams, SpinRequest, SpinPerMinuteLimitExceededException, NoInternetException, RestartInitiatedException, AuthorizationKeyNotFoundException, ServerException, PaymentPageMissingException, NotEnoughBalanceException, InvalidSequenceNumberException } from 'network';
// import { GameOperation } from 'common';
// import { FastSpinsController } from '../reels_engine_library';
//
// export class ModularSpinResponseProvider extends SpinResponseProvider {
//   private _gameOperation: GameOperation;
//   private _fastSpinController: FastSpinsController;
//   get fastSpinController(): FastSpinsController {
//     return this._fastSpinController ?? (this._fastSpinController = container.resolve(FastSpinsController));
//   }
//
//   constructor(private container: Container, private gameParams: IGameParams) {
//     super(container, gameParams);
//     this._gameOperation = container.forceResolve<GameOperation>(T_GameOperation);
//   }
//
//   async doRequest(isFreeSpin: boolean = true): Promise<IModularSpinResponse> {
//     if (!cheatComponent) {
//       cheatComponent = container.forceResolve<CheatComponent>(T_CheatComponent);
//     }
//     const completer = new Completer();
//     const spinParams = new SpinParams();
//     spinParams.betType = session.slotSession.BetType;
//     spinParams.bet = session.slotSession.currentBet.bet;
//     spinParams.lines = session.slotSession.lines;
//     spinParams.volatility = session.slotSession.currentVolatility;
//     spinParams.machineId = session.slotSession.GameId.toString();
//     spinParams.cheat = cheatComponent.getSpinCheat();
//     spinParams.freeSpin = isFreeSpin;
//     spinParams.fastSpin = fastSpinController.isFastSpinsEnable;
//
//     const request = new SpinRequest();
//     request.spinParams = spinParams;
//
//     let result: ModularSpinResultResponse = null;
//     let exception: NotEnoughBalanceException = null;
//
//     try {
//       result = await slotService.modularSpin(request);
//
//       if (!session.slotSession) {
//         //Got server response after user leaved a slot
//         throw new FutureCancelledError("SpinRequest");
//       }
//
//       session.slotSession.tutorial = null;
//     } catch (e) {
//       if (e instanceof SpinPerMinuteLimitExceededException) {
//         return this.initialResponse(ErrorLevel.SpinLimitExceeded);
//       } else if (e instanceof NoInternetException) {
//         return this.initialResponse(ErrorLevel.Handled);
//       } else if (e instanceof RestartInitiatedException) {
//         container.forceResolve<GameOperation>(T_GameOperation).completeWithError(e);
//         return this.initialResponse(ErrorLevel.Critical);
//       } else if (e instanceof AuthorizationKeyNotFoundException) {
//         container.forceResolve<GameOperation>(T_GameOperation).completeWithError(e);
//         return this.initialResponse(ErrorLevel.Critical);
//       } else if (e instanceof ServerException) {
//         if (
//           e.Message == "E_TUTORIAL_ALREADY_FINISHED" ||
//           e.Message == "E_TUTORIAL_CONFIG_DONT_CORRECTLY" ||
//           e.Message == "E_TUTORIAL_DISABLED"
//         ) {
//           session.slotSession.tutorial = null;
//         } else {
//           return this.initialResponse(ErrorLevel.Handled);
//         }
//       } else if (e instanceof PaymentPageMissingException) {
//         return this.initialResponse(ErrorLevel.Critical);
//       } else if (e instanceof NotEnoughBalanceException) {
//         exception = e;
//       } else if (e instanceof InvalidSequenceNumberException) {
//         return this.initialResponse(ErrorLevel.Handled);
//       }
//     }
//
//     if (exception) {
//       try {
//       } catch (e) {}
//       const notEnoughCoinsResult = this.initialResponse(ErrorLevel.Handled);
//       notEnoughCoinsResult.isFakeResponse = false;
//       return notEnoughCoinsResult;
//     }
//
//     if (!result) {
//       return await this.doRequest(isFreeSpin);
//     }
//     return this.toInternalResponseFromModular(result);
//   }
//
//   toInternalResponseFromModular(spinResult: ModularSpinResultResponse): IModularSpinResponse {
//     const result = new ModularSpinResponse();
//     result.reelState = new ReelState();
//     result.bonusInfo = BonusConverterExtention.toInternalResponse(spinResult.baseMachineState.bonusInfo);
//     result.scatterInfo = BonusConverterExtention.toInternalResponse(spinResult.baseMachineState.scatterInfo);
//     result.freeSpinsInfo = SpinResponseConverterExtensions.toInternalResponse(spinResult.baseMachineState.freeSpinsInfo);
//     result.bets = !spinResult.bets || spinResult.bets.length == 0 ? new Array<InternalBet>() : createBets(slotParams.gameId, spinResult.bets, null, null);
//     result.defaultBet = spinResult.defaultBet ?? 0.0;
//     result.volatility = spinResult.baseMachineState.volatility;
//     result.viewReels = spinResult.baseMachineState.viewReels;
//     result.winLines = spinResult.baseMachineState.winLines
//       ? winLinesResponseConverter.ConvertObject(spinResult.baseMachineState.winLines)
//       : new Array<Line>();
//
//     result.winPositions = spinResult.baseMachineState.winPositions
//       ? winPositionsResponseConverter.ConvertObject(spinResult.baseMachineState.winPositions)
//       : new Array<ReelWinPosition>();
//     result.specialSymbolGroups = spinResult.baseMachineState.defaultSpecGroups
//       ? specialSymbolGroupsConverter.ConvertObject(spinResult.baseMachineState.defaultSpecGroups)
//       : null;
//
//     result.additionalData = spinResult.baseMachineState.additionalData
//       ? additionalDataConverter.ConvertObject(spinResult.baseMachineState.additionalData)
//       : null;
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
//         const reelState = new ReelState();
//         reelState.viewReels = v.viewReels;
//
//         reelState.winLines = v.winLines
//           ? winLinesResponseConverter.ConvertObject(v.winLines)
//           : new Array<Line>();
//         reelState.winPositions = v.winPositions
//           ? winPositionsResponseConverter.ConvertObject(v.winPositions)
//           : new Array<ReelWinPosition>();
//
//         reelState.specialSymbolGroups = v.defaultSpecGroups
//           ? specialSymbolGroupsConverter.ConvertObject(v.defaultSpecGroups)
//           : null;
//
//         reelState.additionalData = v.additionalData
//           ? additionalDataConverter.ConvertObject(v.additionalData)
//           : null;
//
//         reelState.totalWin = v.totalWin ?? 0.0;
//         reelState.totalLost = v.totalLost ?? 0.0;
//         result.moduleReelStates.set(k, reelState);
//       });
//     }
//
//     return result;
//   }
//
//   initialViewReels(): Array<Array<number>> {
//     const initialIcons = new Array<Array<number>>();
//     const reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
//     if (reelsEngine) {
//       initialIcons = initialReelsProvider.getInitialReelsForFakeResponse(
//         slotParams.groupsCount,
//         slotParams.maxIconsPerGroup,
//         reelsEngine.internalConfig
//       );
//     } else {
//       const initialIconsProvider = container.resolve(IInitialIconsProvider);
//       const animationEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider);
//       const initialIconsList = initialIconsProvider.getInitialIcons(
//         animationEngine.GameConfig.GroupsCount * animationEngine.GameConfig.MaxIconsPerGroup
//       );
//
//       for (let i = 0; i < animationEngine.GameConfig.GroupsCount; i++) {
//         initialIcons.push(new Array<number>());
//         for (let j = 0; j < animationEngine.GameConfig.MaxIconsPerGroup; j++) {
//           initialIcons[i].push(initialIconsList[animationEngine.GameConfig.MaxIconsPerGroup * i + j]);
//         }
//       }
//     }
//     return initialIcons;
//   }
//
//   initialResponse(errorLevel: ErrorLevel, errorMessage: string = ""): IModularSpinResponse {
//     const initialIcons = this.initialViewReels();
//     const modules = (container.forceResolve<ISlotGame>(T_ISlotGame) as BaseModularSlotGame).modules;
//     const result = new ModularSpinResponse();
//     result.viewReels = initialIcons;
//     result.bonusInfo = null;
//     result.scatterInfo = null;
//     result.freeSpinsInfo = null;
//     result.winLines = new Array<Line>();
//     result.winPositions = null;
//     result.specialSymbolGroups = null;
//     result.totalWin = 0.0;
//     result.totalLost = 0.0;
//     result.bigWinName = null;
//     result.isFakeResponse = true;
//     result.errorLevel = errorLevel;
//     result.moduleReelStates = new Map<string, ReelState>();
//
//     for (const module of modules) {
//       result.moduleReelStates.set(module.moduleParams.gameId, this.createInitialModuleState(module));
//     }
//
//     return result;
//   }
//
//   createInitialModuleState(slotGameModule: ISlotGameModule): ReelState {
//     const result = new ReelState();
//     result.viewReels = this.initialViewReels();
//     result.winLines = new Array<Line>();
//     result.winPositions = null;
//     result.specialSymbolGroups = null;
//     result.totalWin = 0.0;
//     result.totalLost = 0.0;
//     return result;
//   }
// }
