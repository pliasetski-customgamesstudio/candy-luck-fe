// import { Future } from 'dart:async';
// import { TriggerConstantsClientProperties } from "@cgs/common";
//
// abstract class TriggerHandlerBase implements IPredictableTriggerHandler {
//   private _userInfoHolder: IUserInfoHolder;
//   private _clientProperties: IClientProperties;
//
//   constructor(userInfoHolder: IUserInfoHolder, clientProperties: IClientProperties) {
//     this._userInfoHolder = userInfoHolder;
//     this._clientProperties = clientProperties;
//   }
//
//   async willBeTriggered(trigger: Trigger, triggerParams: { [key: string]: any } = null, environment: IExecutionEnvironment = null): Promise<boolean> {
//     trigger = this.getTriggerToHandle(trigger, triggerParams);
//
//     if (!this.isEnabled(trigger, triggerParams)) {
//       return Promise.resolve(false);
//     }
//
//     const counter = this.getCounter(trigger, triggerParams);
//     return Promise.resolve(this.checkCounterConditions(trigger, counter));
//   }
//
//   getTriggerToHandle(trigger: Trigger, triggerParams: { [key: string]: any }): Trigger {
//     return trigger;
//   }
//
//   async handleTrigger(trigger: Trigger, triggerParams: { [key: string]: any } = null, environment: IExecutionEnvironment = null): Promise<boolean> {
//     if (!(await this.willBeTriggered(trigger, triggerParams, environment))) {
//       return false;
//     }
//
//     return this.handleInner(trigger, triggerParams, environment);
//   }
//
//   abstract handleInner(trigger: Trigger, triggerParams: { [key: string]: any }, environment: IExecutionEnvironment): Promise<boolean>;
//
//   abstract get handlerName(): string;
//
//   abstract isEnabled(trigger: Trigger, triggerParams: { [key: string]: any }): boolean;
//
//   checkCounterConditions(trigger: Trigger, counter: number): boolean {
//     const conditionKeys = TriggerConstantsClientProperties.conditions(this.handlerName, trigger.value);
//     const defaultKeys = TriggerConstantsClientProperties.defaultConditions(this.handlerName);
//
//     const minLevel = this._clientProperties.getBackTracking([conditionKeys.minLevel, defaultKeys.minLevel], this.defaultMinLevel);
//     if (minLevel > this._userInfoHolder.user.level) {
//       return false;
//     }
//
//     const list = this._clientProperties.getBackTracking([conditionKeys.list, defaultKeys.list], this.defaultList(trigger));
//     const min = this._clientProperties.getBackTracking([conditionKeys.min, defaultKeys.min], this.defaultMin);
//     const each = this._clientProperties.getBackTracking([conditionKeys.each, defaultKeys.each], this.defaultEach);
//
//     return TriggerHelper.checkCondition(counter, list, min, each);
//   }
//
//   defaultList(trigger: Trigger): string {
//     return "";
//   }
//
//   get defaultMinLevel(): number {
//     return 0;
//   }
//
//   get defaultMin(): number {
//     return 0;
//   }
//
//   get defaultEach(): number {
//     return 0;
//   }
//
//   getCounter(trigger: Trigger, triggerParams: { [key: string]: any }): number {
//     return -1;
//   }
// }
