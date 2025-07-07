// import { Logger } from "@cgs/shared";
// import { IPredictableTriggerHandler } from "@cgs/common";
//
// class UniversalTriggerHandler implements IPredictableTriggerHandler {
//
//   private _config: ITriggerConfiguration;
//   private _scope: IocContainer;
//   private _triggerActions: TriggerAction[];
//   private static readonly TriggerStore: string = "TriggerCounters";
//
//   constructor(config: ITriggerConfiguration, scope: IocContainer) {
//     this._config = config;
//     this._scope = scope;
//     this._triggerActions = [];
//   }
//
//   public getTriggerActions(trigger: Trigger): TriggerAction[] {
//     const triggerActions = this._config.getActionsForTrigger(trigger)
//       .map((actName) => this._triggerActions.find((act) => act.name === actName))
//       .filter((act) => act !== null);
//
//     return triggerActions;
//   }
//
//   public async willBeTriggered(trigger: Trigger, triggerParams: Map<string, Object> = new Map<string, Object>(), environment: IExecutionEnvironment = null): Promise<boolean> {
//     triggerParams = triggerParams || new Map<string, Object>();
//
//     // If called without specified counters param, add parameter with temporarily incremented counters
//     // actual increment will be made in HandleTrigger call
//     if (!triggerParams.has(TriggerConstantsParameters.Counters)) {
//     }
//
//     const actions = this.getTriggerActions(trigger);
//     for (const action of actions) {
//       try {
//         const handler = this._scope.resolve(action.actionType) as ITriggerHandler;
//         const predictableHandler = handler instanceof IPredictableTriggerHandler
//           ? handler
//           : null;
//         if (predictableHandler !== null && await predictableHandler.willBeTriggered(trigger, triggerParams, environment)) {
//           return true;
//         }
//       } catch (e) {
//         Logger.Error(`Exception on trigger processing ${e} \n${st}`);
//         throw e;
//       }
//     }
//     return false;
//   }
//
//   public async handleTrigger(trigger: Trigger, triggerParams: Map<string, Object> = new Map<string, Object>(), environment: IExecutionEnvironment = null): Promise<boolean> {
//     triggerParams = triggerParams || new Map<string, Object>();
//
//     // If called without specified counters param, add parameter with temporarily incremented counters
//     // actual increment will be made in HandleTrigger call
//     if (!triggerParams.has(TriggerConstantsParameters.Counters)) {
//
// //      Logger.Info("Incremented counter for trigger ${0}; Current value is PerUser={1}, PerSession={2}",
// //          [ trigger, triggerCounter.perUser, triggerCounter.perSession ]);
//     }
//
//     const actions = this.getTriggerActions(trigger);
//     for (const action of actions) {
//       try {
//         const handler = this._scope.resolve(action.actionType) as ITriggerHandler;
//         if (await handler.handleTrigger(trigger, triggerParams, environment)) {
//           return true;
//         }
//       } catch (e) {
//         Logger.Error(`Exception on trigger processing ${e} \n${st}`);
//         throw e;
//       }
//     }
//     return false;
//   }
// }
