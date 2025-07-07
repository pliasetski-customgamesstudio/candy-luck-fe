// import { KeyValueActionParam_Double } from 'network';
// import { SpotGroupDTO } from 'shared';
// import { MapEntryStringValueDTO } from 'shared';
// import { ExtraBetDTO } from 'shared';
// import { JsonMap } from 'shared';
// import { SpinTaskStateDTO } from 'shared';
// import { ReSpinRoundDTO } from 'shared';
// import { BonusButtonDTO } from 'shared';
// import { MachineInfoDTO } from 'shared';
// import { FreeSpinGameCompletionDataDTO } from 'shared';
// import { PokerWinLineDTO } from 'shared';
// import { ProgressiveJPShortInfoDTO } from 'shared';
// import { MachineStateResponse } from 'shared';
// import { PolicyContentStateDTO } from 'shared';
// import { Pair } from 'shared';
// import { ProgressiveJPShortInfoDTO } from 'shared';
// import { UserLocalStatusDTO } from 'shared';
// import { Volatility } from 'shared';
// import { FreeSpinsGroupDTO } from 'shared';
// import { WinLine } from 'shared';
// import { PolicyContentState } from 'shared';
// import { AdvertisementProviderTrackableDataInfo } from 'shared';
// import { MiniGameBonusWinningDTO } from 'shared';
// import { KeyValuePair } from 'shared';
// import { ClientPropertyDTO } from 'shared';
// import { TStaticButtonDTO } from 'shared';
// import { UnfinishedFsBonusDTO } from 'shared';
// import { WinPositionDTO } from 'shared';
// import { ClientConfigPropertyDTO } from 'shared';
// import { CollapsingRoundDTO } from 'shared';
// import { MultiSpinRoundDTO } from 'shared';
// import { UserLocalMediaDTO } from 'shared';
// import { KeyValueActionParam_String } from 'shared';
// import { WinLineDTO } from 'shared';
// import { MovingPositionDTO } from 'shared';
// import { PolicyContent } from 'shared';
// import { UpgradeGroup } from 'shared';
// import { RoundPaytableItemDTO } from 'shared';
// import { ProgressiveJPPromotionDTO } from 'shared';
// import { TStaticModuleDTO } from 'shared';
// import { SubstituteViewDTO } from 'shared';
// import { JPMachineConfigDTO } from 'shared';
// import { UserDTO } from 'shared';
// import { ActionExtraParamsDTO } from 'shared';
// import { CountryDTO } from 'shared';
// import { MiniGameButtonDto } from 'shared';
// import { ExtraGainsDTO } from 'shared';
// import { BonusRoundDTO } from 'shared';
// import { MapEntryStringValue } from 'shared';
// import { DefaultSpecGroupDTO } from 'shared';
// import { Machine } from 'shared';
// import { PolicyContentDTO } from 'shared';
// import { NetworkSymbol } from 'shared';
// import { RoomDTO } from 'shared';
//
// interface IGenericInitializer {
//   [key: string]: any;
// }
//
// type GenericInitFunc = () => any;
// type GenericInitFuncWithArg = (arg: any) => any;
//
// class ServerGenericInitializers implements IGenericInitializer {
//   private _initializers: { [key: string]: GenericInitFunc } = {
//     'List<KeyValueActionParam_Double>': () => <KeyValueActionParam_Double>[],
//     'List<SpotGroupDTO>': () => <SpotGroupDTO>[],
//     'List<MapEntryStringValueDTO>': () => <MapEntryStringValueDTO>[],
//     'List<ExtraBetDTO>': () => <ExtraBetDTO>[],
//     'List<JsonMap>': () => <JsonMap>[],
//     'List<SpinTaskStateDTO>': () => <SpinTaskStateDTO>[],
//     'List<List<double>>': () => <List<double>>[],
//     'List<ReSpinRoundDTO>': () => <ReSpinRoundDTO>[],
//     'List<BonusButtonDTO>': () => <BonusButtonDTO>[],
//     'Map<String, MachineInfoDTO>': () => <String, MachineInfoDTO>{},
//     'List<FreeSpinGameCompletionDataDTO>': () => <FreeSpinGameCompletionDataDTO>[],
//     'List<PokerWinLineDTO>': () => <PokerWinLineDTO>[],
//     'Map<String, int>': () => <String, int>{},
//     'Map<String, Map<String, Map<double, List<double>>>>': () => <String, Map<String, Map<double, List<double>>>>{},
//     'Map<String, MachineStateResponse>': () => <String, MachineStateResponse>{},
//     'Map<String, String>': () => <String, String>{},
//     'List<PolicyContentStateDTO>': () => <PolicyContentStateDTO>[],
//     'List<Pair>': () => <Pair>[],
//     'Map<int, double>': () => <int, double>{},
//     'List<ProgressiveJPShortInfoDTO>': () => <ProgressiveJPShortInfoDTO>[],
//     'List<UserLocalStatusDTO>': () => <UserLocalStatusDTO>[],
//     'List<List<int>>': () => <List<int>>[],
//     'Map<int, List<int>>': () => <int, List<int>>{},
//     'List<Volatility>': () => <Volatility>[],
//     'List<FreeSpinsGroupDTO>': () => <FreeSpinsGroupDTO>[],
//     'List<WinLine>': () => <WinLine>[],
//     'List<PolicyContentState>': () => <PolicyContentState>[],
//     'Map<double, String>': () => <double, String>{},
//     'List<AdvertisementProviderTrackableDataInfo>': () => <AdvertisementProviderTrackableDataInfo>[],
//     'List<MiniGameBonusWinningDTO>': () => <MiniGameBonusWinningDTO>[],
//     'List<KeyValuePair>': () => <KeyValuePair>[],
//     'Map<String, Map<String, dynamic>>': () => <String, Map<String, dynamic>>{},
//     'List<ClientPropertyDTO>': () => <ClientPropertyDTO>[],
//     'List<TStaticButtonDTO>': () => <TStaticButtonDTO>[],
//     'Map<String, dynamic>': () => <String, dynamic>{},
//     'List<UnfinishedFsBonusDTO>': () => <UnfinishedFsBonusDTO>[],
//     'List<WinPositionDTO>': () => <WinPositionDTO>[],
//     'List<ClientConfigPropertyDTO>': () => <ClientConfigPropertyDTO>[],
//     'List<CollapsingRoundDTO>': () => <CollapsingRoundDTO>[],
//     'List<MultiSpinRoundDTO>': () => <MultiSpinRoundDTO>[],
//     'List<UserLocalMediaDTO>': () => <UserLocalMediaDTO>[],
//     'List<KeyValueActionParam_String>': () => <KeyValueActionParam_String>[],
//     'List<WinLineDTO>': () => <WinLineDTO>[],
//     'List<MovingPositionDTO>': () => <MovingPositionDTO>[],
//     'Map<String, Map<double, List<double>>>>': () => <String, Map<double, List<double>>>{},
//     'List<PolicyContent>': () => <PolicyContent>[],
//     'List<UpgradeGroup>': () => <UpgradeGroup>[],
//     'List<RoundPaytableItemDTO>': () => <RoundPaytableItemDTO>[],
//     'List<ProgressiveJPPromotionDTO>': () => <ProgressiveJPPromotionDTO>[],
//     'List<TStaticModuleDTO>': () => <TStaticModuleDTO>[],
//     'Map<double, List<double>>': () => <double, List<double>>{},
//     'List<TStaticResultDTO>': () => <TStaticResultDTO>[],
//     'List<SubstituteViewDTO>': () => <SubstituteViewDTO>[],
//     'List<JPMachineConfigDTO>': () => <JPMachineConfigDTO>[],
//     'List<UserDTO>': () => <UserDTO>[],
//     'List<ActionExtraParamsDTO>': () => <ActionExtraParamsDTO>[],
//     'Map<String, double>': () => <String, double>{},
//     'Map<int, int>': () => <int, int>{},
//     'List<String>': () => <String>[],
//     'List<MapEntryStringValue>': () => <MapEntryStringValue>[],
//     'List<DefaultSpecGroupDTO>': () => <DefaultSpecGroupDTO>[],
//     'List<Machine>': () => <Machine>[],
//     'List<PolicyContentDTO>': () => <PolicyContentDTO>[],
//     'List<NetworkSymbol>': () => <NetworkSymbol>[],
//     'List<RoomDTO>': () => <RoomDTO>[],
//     'List<double>': () => <double>[],
//     'List<ProgressiveJackPotDTO>': () => <ProgressiveJackPotDTO>[],
//     'List<CountryDTO>': () => <CountryDTO>[],
//     'List<MiniGameButtonDto>': () => <MiniGameButtonDto>[],
//     'List<ExtraGainsDTO>': () => <ExtraGainsDTO>[],
//     'List<BonusRoundDTO>': () => <BonusRoundDTO>[],
//     'List<int>': () => <int>[],
//   };
//
//   private _innerTypes: { [key: string]: any[] } = {
//     'List<int>': [int],
//     'List<TStaticButtonDTO>': [TStaticButtonDTO],
//     'List<String>': [String],
//     'List<ClientConfigPropertyDTO>': [ClientConfigPropertyDTO],
//     'Map<int, List<int>>': [int, List<int>],
//     'List<ProgressiveJPPromotionDTO>': [ProgressiveJPPromotionDTO],
//     'List<PolicyContent>': [PolicyContent],
//     'Map<String, MachineInfoDTO>': [String, MachineInfoDTO],
//     'List<PolicyContentState>': [PolicyContentState],
//     'List<Pair>': [Pair],
//     'List<DefaultSpecGroupDTO>': [DefaultSpecGroupDTO],
//     'Map<double, List<double>>': [double, List<double>],
//     'List<MiniGameBonusWinningDTO>': [MiniGameBonusWinningDTO],
//     'Map<String, int>': [String, int],
//     'Map<String, MachineStateResponse>': [String, MachineStateResponse],
//     'List<ActionExtraParamsDTO>': [ActionExtraParamsDTO],
//     'List<WinLineDTO>': [WinLineDTO],
//     'List<MultiSpinRoundDTO>': [MultiSpinRoundDTO],
//     'List<RoundPaytableItemDTO>': [RoundPaytableItemDTO],
//     'List<PokerWinLineDTO>': [PokerWinLineDTO],
//     'List<ExtraBetDTO>': [ExtraBetDTO],
//     'List<TStaticModuleDTO>': [TStaticModuleDTO],
//     'List<BonusRoundDTO>': [BonusRoundDTO],
//     'List<TStaticResultDTO>': [TStaticResultDTO],
//     'Map<int, int>': [int, int],
//     'List<BonusButtonDTO>': [BonusButtonDTO],
//     'List<ClientPropertyDTO>': [ClientPropertyDTO],
//     'List<JsonMap>': [JsonMap],
//     'List<CollapsingRoundDTO>': [CollapsingRoundDTO],
//     'List<CountryDTO>': [CountryDTO],
//     'List<MiniGameButtonDto>': [MiniGameButtonDto],
//     'List<WinPositionDTO>': [WinPositionDTO],
//     'List<SpotGroupDTO>': [SpotGroupDTO],
//     'List<UserLocalStatusDTO>': [UserLocalStatusDTO],
//     'List<KeyValuePair>': [KeyValuePair],
//     'List<Machine>': [Machine],
//     'List<UnfinishedFsBonusDTO>': [UnfinishedFsBonusDTO],
//     'List<MapEntryStringValue>': [MapEntryStringValue],
//     'List<PolicyContentDTO>': [PolicyContentDTO],
//     'List<JPMachineConfigDTO>': [JPMachineConfigDTO],
//     'List<MapEntryStringValueDTO>': [MapEntryStringValueDTO],
//     'List<Volatility>': [Volatility],
//     'List<ProgressiveJackPotDTO>': [ProgressiveJackPotDTO],
//     'Map<String,Map<String, dynamic>>': [String, Map<String, dynamic>],
//     'List<SubstituteViewDTO>': [SubstituteViewDTO],
//     'Map<String, dynamic>': [String, dynamic],
//     'List<UserDTO>': [UserDTO],
//     'Map<String, double>': [String, double],
//     'List<ReSpinRoundDTO>': [ReSpinRoundDTO],
//     'List<SpinTaskStateDTO>': [SpinTaskStateDTO],
//     'List<AdvertisementProviderTrackableDataInfo>': [AdvertisementProviderTrackableDataInfo],
//     'List<PolicyContentStateDTO>': [PolicyContentStateDTO],
//     'List<ProgressiveJPShortInfoDTO>': [ProgressiveJPShortInfoDTO],
//     'List<FreeSpinsGroupDTO>': [FreeSpinsGroupDTO],
//     'List<KeyValueActionParam_Double>': [KeyValueActionParam_Double],
//     'Map<String, Map<double, List<double>>>>': [String, Map<double, List<double>>],
//     'List<MovingPositionDTO>': [MovingPositionDTO],
//     'List<List<int>>': [List<int>],
//     'List<UserLocalMediaDTO>': [UserLocalMediaDTO],
//     'List<FreeSpinGameCompletionDataDTO>': [FreeSpinGameCompletionDataDTO],
//     'List<KeyValueActionParam_String>': [KeyValueActionParam_String],
//     'List<UpgradeGroup>': [UpgradeGroup],
//     'List<WinLine>': [WinLine],
//     'List<List<double>>': [List<double>],
//     'List<RoomDTO>': [RoomDTO],
//     'List<double>': [double],
//     'List<ExtraGainsDTO>': [ExtraGainsDTO],
//     'List<NetworkSymbol>': [NetworkSymbol],
//     'Map<String, int>': [String, int],
//     'List<PolicyContentState>': [PolicyContentState],
//     'Map<double, String>': [double, String],
//     'List<AdvertisementProviderTrackableDataInfo>': [AdvertisementProviderTrackableDataInfo],
//     'List<MiniGameBonusWinningDTO>': [MiniGameBonusWinningDTO],
//     'List<KeyValuePair>': [KeyValuePair],
//     'Map<String,Map<String, dynamic>>': [String, Map<String, dynamic>],
//     'List<ClientPropertyDTO>': [ClientPropertyDTO],
//     'List<TStaticButtonDTO>': [TStaticButtonDTO],
//     'Map<String, dynamic>': [String, dynamic],
//     'List<UnfinishedFsBonusDTO>': [UnfinishedFsBonusDTO],
//     'List<WinPositionDTO>': [WinPositionDTO],
//     'List<ClientConfigPropertyDTO>': [ClientConfigPropertyDTO],
//     'List<CollapsingRoundDTO>': [CollapsingRoundDTO],
//     'List<MultiSpinRoundDTO>': [MultiSpinRoundDTO],
//     'List<UserLocalMediaDTO>': [UserLocalMediaDTO],
//     'List<KeyValueActionParam_String>': [KeyValueActionParam_String],
//     'List<WinLineDTO>': [WinLineDTO],
//     'List<MovingPositionDTO>': [MovingPositionDTO],
//     'Map<String, Map<double, List<double>>>>': [String, Map<double, List<double>>],
//     'List<PolicyContent>': [PolicyContent],
//     'List<UpgradeGroup>': [UpgradeGroup],
//     'List<RoundPaytableItemDTO>': [RoundPaytableItemDTO],
//     'List<ProgressiveJPPromotionDTO>': [ProgressiveJPPromotionDTO],
//     'List<TStaticModuleDTO>': [TStaticModuleDTO],
//     'Map<double, List<double>>': [double, List<double>],
//     'List<TStaticResultDTO>': [TStaticResultDTO],
//     'List<SubstituteViewDTO>': [SubstituteViewDTO],
//     'List<JPMachineConfigDTO>': [JPMachineConfigDTO],
//     'List<UserDTO>': [UserDTO],
//     'List<ActionExtraParamsDTO>': [ActionExtraParamsDTO],
//     'Map<String, double>': [String, double],
//     'Map<int, int>': [int, int],
//     'List<String>': [String],
//     'List<MapEntryStringValue>': [MapEntryStringValue],
//     'List<DefaultSpecGroupDTO>': [DefaultSpecGroupDTO],
//     'List<Machine>': [Machine],
//     'List<PolicyContentDTO>': [PolicyContentDTO],
//     'List<NetworkSymbol>': [NetworkSymbol],
//     'List<RoomDTO>': [RoomDTO],
//   };
//
//   get initializers(): { [key: string]: GenericInitFunc } {
//     return this._initializers;
//   }
//
//   get argInitializers(): { [key: string]: GenericInitFuncWithArg } {
//     return null;
//   }
//
//   get innerTypes(): { [key: string]: any[] } {
//     return this._innerTypes;
//   }
// }
