// class TriggerConstants {
//
// }
//
// class TriggerConstantsClientProperties {
//   static handlersConfig(triggerName: string): string {
//     return `triggers.handlersConfig.${triggerName}`;
//   }
//
//   static conditions(handlerName: string, triggerName: string): TriggerConditionParams {
//     return new TriggerConditionParams.ctor1(handlerName, triggerName);
//   }
//
//   static defaultConditions(handlerName: string): TriggerConditionParams {
//     return new TriggerConditionParams(handlerName);
//   }
// }
//
// class TriggerConstantsLevelUpParameters {
//   static readonly LevelNumber: string = "levelNumber";
// }
//
// class TriggerConstantsParameters {
//   static readonly SharingTask: string = "sharingTask";
//   static readonly Counters: string = "counters";
//   static readonly SubTrigger: string = "subTrigger";
// }
//
// class TriggerConstantsSubTypes {
//   static readonly BigWin: string = "big_win";
//   static readonly LevelUp: string = "level_up";
//   static readonly FreeSpins: string = "free_spins";
//   static readonly BonusGame: string = "bonus_game";
// }
//
// class TriggerConstantsActions {
//   static readonly InvokeTrigger: string = "invoke_trigger";
//   static readonly InvokeLoginTrigger: string = "invoke_login_trigger";
//   static readonly Trigger: string = "Trigger";
//   static readonly IncrementTriggerCounter: string = "IncrementTriggerCounter";
// }
//
// class TriggerConstantsFlows {
//   static readonly Trigger: string = "Trigger";
// }
//
// class TriggerConstantsHandlerNames {
//   static readonly Universal: string = "universal";
//   static readonly InApp: string = "inapp";
//   static readonly PersonalOffer: string = "personalOffer";
//   static readonly FConnect: string = "fconnect";
//   static readonly RateUs: string = "rateUs";
//   static readonly AdvancedRateUs: string = "advancedRateUs";
//   static readonly Compensations: string = "compensation";
// }
//
// class TriggerConditionParams {
//   private _list: string;
//   private _min: string;
//   private _each: string;
//   private _minLevel: string;
//
//   constructor(handlerName: string) {
//     this._list = `triggers.conditions.${handlerName}.list`;
//     this._min = `triggers.conditions.${handlerName}.min`;
//     this._each = `triggers.conditions.${handlerName}.each`;
//     this._minLevel = `triggers.conditions.${handlerName}.minLevel`;
//   }
//
//   constructor1(handlerName: string, triggerName: string) {
//     this._list = `triggers.conditions.${handlerName}.${triggerName}.list`;
//     this._min = `triggers.conditions.${handlerName}.${triggerName}.min`;
//     this._each = `triggers.conditions.${handlerName}.${triggerName}.each`;
//     this._minLevel = `triggers.conditions.${handlerName}.${triggerName}.minLevel`;
//   }
//
//   get list(): string {
//     return this._list;
//   }
//
//   set list(value: string) {
//     this._list = value;
//   }
//
//   get min(): string {
//     return this._min;
//   }
//
//   set min(value: string) {
//     this._min = value;
//   }
//
//   get each(): string {
//     return this._each;
//   }
//
//   set each(value: string) {
//     this._each = value;
//   }
//
//   get minLevel(): string {
//     return this._minLevel;
//   }
//
//   set minLevel(value: string) {
//     this._minLevel = value;
//   }
// }
