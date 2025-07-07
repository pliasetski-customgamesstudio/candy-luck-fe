// import { IClientProperties } from "@cgs/common";
// import { ITriggerConfiguration } from "@cgs/shared";
//
// class TriggerAction {
//   private _name: string;
//
//   get name(): string {
//     return this._name;
//   }
//   set name(value: string) {
//     this._name = value;
//   }
//
//   private _actionType: Function;
//
//   get actionType(): Function {
//     return this._actionType;
//   }
//   set actionType(value: Function) {
//     this._actionType = value;
//   }
//
//   constructor(name: string, actionType: Function) {
//     this.name = name;
//     this.actionType = actionType;
//   }
// }
//
// export interface ITriggerConfiguration {
//   abstract getActionsForTrigger(trigger: Trigger): string[];
// }
//
// class StubTriggerConfiguration implements ITriggerConfiguration {
//   getActionsForTrigger(trigger: Trigger): string[] {
//     return [];
//   }
// }
//
// class TriggerConfiguration implements ITriggerConfiguration {
//   private _clientProperties: IClientProperties;
//   private _defaultActions: Map<Trigger, string[]>;
//
//   constructor(clientProperties: IClientProperties) {
//     this._clientProperties = clientProperties;
//     this.initDefaultActions();
//   }
//
//   private initDefaultActions(): void {
//     const freeSpinHandlers = [
//       TriggerConstantsHandlerNames.FConnect,
//       TriggerConstantsHandlerNames.RateUs,
//       TriggerConstantsHandlerNames.AdvancedRateUs
//     ];
//     const challengeWinHandlers = [
//       TriggerConstantsHandlerNames.FConnect,
//       TriggerConstantsHandlerNames.InApp,
//       TriggerConstantsHandlerNames.AdvancedRateUs
//     ];
//     const megaHourlyBonusHandlers = [
//       TriggerConstantsHandlerNames.InApp,
//       TriggerConstantsHandlerNames.AdvancedRateUs
//     ];
//     const contestWinHandlers = [
//       TriggerConstantsHandlerNames.FConnect,
//       TriggerConstantsHandlerNames.AdvancedRateUs
//     ];
//     const bigWinHandlers = [
//       TriggerConstantsHandlerNames.Compensations,
//       TriggerConstantsHandlerNames.PersonalOffer,
//       TriggerConstantsHandlerNames.FConnect,
//       TriggerConstantsHandlerNames.RateUs,
//       TriggerConstantsHandlerNames.InApp,
//       TriggerConstantsHandlerNames.AdvancedRateUs
//     ];
//     const levelUpHandlers = [
//       TriggerConstantsHandlerNames.Compensations,
//       "сontestsLeaderboard",
//       TriggerConstantsHandlerNames.PersonalOffer,
//       TriggerConstantsHandlerNames.FConnect,
//       TriggerConstantsHandlerNames.RateUs,
//       TriggerConstantsHandlerNames.InApp,
//       TriggerConstantsHandlerNames.AdvancedRateUs
//     ];
//
//     const unlockHandlers = [
//       TriggerConstantsHandlerNames.PersonalOffer,
//       TriggerConstantsHandlerNames.FConnect,
//       TriggerConstantsHandlerNames.RateUs
//     ];
//
//     const finishPurchaseHandlers = [
//       TriggerConstantsHandlerNames.PersonalOffer,
//       TriggerConstantsHandlerNames.InApp
//     ];
//
//     const enterHighRollerHandlers = [
//       TriggerConstantsHandlerNames.PersonalOffer,
//       TriggerConstantsHandlerNames.InApp
//     ];
//
//     const vipTierUpHandlers = [
//       TriggerConstantsHandlerNames.Compensations,
//       TriggerConstantsHandlerNames.InApp
//     ];
//
//     const crmCampaignHandlers: string[] = [];
//
//     const compensationHandlers = [TriggerConstantsHandlerNames.Compensations];
//
//     const notEnoughCoinsHandlers = [TriggerConstantsHandlerNames.Compensations];
//
//     this._defaultActions = new Map<Trigger, string[]>([
//       [Trigger.BigWin, bigWinHandlers],
//       [Trigger.FreeSpinsBigWin, bigWinHandlers],
//       [Trigger.MegaWin, bigWinHandlers],
//       [Trigger.FreeSpinsMegaWin, bigWinHandlers],
//       [Trigger.EpicWin, bigWinHandlers],
//       [Trigger.FreeSpinsEpicWin, bigWinHandlers],
//       [Trigger.FreeSpins, freeSpinHandlers],
//       [Trigger.OnNotEnoughCoins, notEnoughCoinsHandlers]
//     ]);
//   }
//
//   getActionsForTrigger(trigger: Trigger): string[] {
//     return this.getDefaultAction(trigger);
//   }
//
//   getDefaultAction(trigger: Trigger): string[] {
//     if (this._defaultActions.has(trigger)) {
//       return this._defaultActions.get(trigger) || [];
//     }
//
//     return [];
//   }
// }
