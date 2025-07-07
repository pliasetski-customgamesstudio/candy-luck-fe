// import { QuestCollection, QuestInfoGroup, QuestStepType } from 'machines';
// import { Syd } from '@cgs/syd';
// import { Shared } from 'shared';
// import { Common } from 'common';

// @iocReflector
// export abstract class IQuestInfoApi {
//   getCurrentSpinCollections(): QuestCollection[];
//   getCurrentQuestInfo(): QuestInfoGroup;
//   getNextQuestInfo(): QuestInfoGroup;
//   isQuestCompleted: boolean;
//   hasPendingCollections: boolean;
// }

// export class QuestInfoGroup {
//   private _type: string;
//   private _questStep: QuestStepType;
//   private _itemsToCollect: number;
//   private _itemsToAlreadyCollected: number;
//   private _stepNumber: number;

//   get type(): string { return this._type; }
//   get questStep(): QuestStepType { return this._questStep; }
//   get itemsToCollect(): number { return this._itemsToCollect; }
//   get itemsToAlreadyCollected(): number { return this._itemsToAlreadyCollected; }
//   get stepNumber(): number { return this._stepNumber; }

//   constructor(type: string, questStepType: QuestStepType, itemsToCollect: number, itemsToAlreadyCollected: number, stepNumber: number) {
//     this._type = type;
//     this._questStep = questStepType;
//     this._itemsToCollect = itemsToCollect;
//     this._itemsToAlreadyCollected = itemsToAlreadyCollected;
//     this._stepNumber = stepNumber;
//   }
// }

// export class QuestCollection {
//   private _position: number;

//   get position(): number { return this._position; }

//   constructor(position: number) {
//     this._position = position;
//   }
// }

// export class CollectionWithIconReplaceGroup {
//   private _collectPositions: number[];
//   private _replaceIconIds: number[];
//   private _collectCount: number;
//   private _symbolId: number;

//   get collectPositions(): number[] { return this._collectPositions; }
//   get replaceIconIds(): number[] { return this._replaceIconIds; }
//   get collectCount(): number { return this._collectCount; }
//   get symbolId(): number { return this._symbolId; }

//   constructor(collectPositions: number[], replaceIconIds: number[], collectCount: number, symbolId: number) {
//     this._collectPositions = collectPositions;
//     this._replaceIconIds = replaceIconIds;
//     this._collectCount = collectCount;
//     this._symbolId = symbolId;
//   }
// }

// enum QuestStepType {
//   smallStep,
//   bigStep
// }
