import { FreeSpinsGroupDTO } from './FreeSpinsGroupDTO';

export class FreeSpinsInfoDTO {
  currentFreeSpinsGroup: FreeSpinsGroupDTO | null;
  event: string | null;
  extraEvents: string[] | null;
  freeSpinGroups: FreeSpinsGroupDTO[] | null;
  freeSpinsAdded: number | null;
  ignoreRebuy: boolean | null;
  machineVolatility: number | null;
  name: string | null;
  parameter: number | null;
  parentSpinId: number | null;
  totalFreeSpins: number | null;
  totalWin: number | null;

  constructor(
    currentFreeSpinsGroup: FreeSpinsGroupDTO | null,
    event: string | null,
    extraEvents: string[] | null,
    freeSpinGroups: FreeSpinsGroupDTO[] | null,
    freeSpinsAdded: number | null,
    ignoreRebuy: boolean | null,
    machineVolatility: number | null,
    name: string | null,
    parameter: number | null,
    parentSpinId: number | null,
    totalFreeSpins: number | null,
    totalWin: number | null
  ) {
    this.currentFreeSpinsGroup = currentFreeSpinsGroup;
    this.event = event;
    this.extraEvents = extraEvents;
    this.freeSpinGroups = freeSpinGroups;
    this.freeSpinsAdded = freeSpinsAdded;
    this.ignoreRebuy = ignoreRebuy;
    this.machineVolatility = machineVolatility;
    this.name = name;
    this.parameter = parameter;
    this.parentSpinId = parentSpinId;
    this.totalFreeSpins = totalFreeSpins;
    this.totalWin = totalWin;
  }

  static fromJson(json: { [key: string]: any }): FreeSpinsInfoDTO {
    return new FreeSpinsInfoDTO(
      json.currentFreeSpinsGroup ? FreeSpinsGroupDTO.fromJson(json.currentFreeSpinsGroup) : null,
      json.event ?? null,
      json.extraEvents ? Array.from(json.extraEvents) : null,
      json.freeSpinGroups
        ? json.freeSpinGroups.map((x: any) => FreeSpinsGroupDTO.fromJson(x))
        : null,
      json.freeSpinsAdded ?? null,
      json.ignoreRebuy ?? null,
      json.machineVolatility ?? null,
      json.name ?? null,
      json.parameter ?? null,
      json.parentSpinId ?? null,
      json.totalFreeSpins ?? null,
      json.totalWin ?? null
    );
  }
}
