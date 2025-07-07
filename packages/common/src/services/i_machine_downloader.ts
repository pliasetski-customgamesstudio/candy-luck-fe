import { Machine } from '@cgs/network';
import { MachineDownloadState } from '../utils/machine_downloader_ex';

export enum DownloadPriority {
  Low,
  Medium,
  Height,
}

class MachineStatus {
  private _state: MachineDownloadState;
  private _machineSize: number;
  private _downloadedSize: number;

  constructor(state: MachineDownloadState, size: number = 1, downloadedSize: number = 0) {
    this._state = state;
    this._machineSize = size;
    this._downloadedSize = downloadedSize;
  }

  get state(): MachineDownloadState {
    return this._state;
  }

  get machineSize(): number {
    return this._machineSize;
  }

  get downloadedSize(): number {
    return this._downloadedSize;
  }
}

export interface IMachineDownloader {
  initialize(): void;

  downloadMachine(machine: Machine, priority: DownloadPriority): void;

  removeMachine(machine: Machine): void;

  pauseMachine(machine: Machine): void;

  isDownloading(machine: Machine): boolean;

  getMachineStatus(machine: Machine): MachineStatus;

  chekMachinePack(machine: Machine): boolean;
}

export class MachineDownloader implements IMachineDownloader {
  chekMachinePack(_machine: Machine): boolean {
    return true;
  }

  downloadMachine(_machine: Machine, _priority: DownloadPriority = DownloadPriority.Medium): void {
    // TODO: implement downloadMachine
  }

  getMachineStatus(_machine: Machine): MachineStatus {
    return new MachineStatus(MachineDownloadState.Downloaded);
  }

  initialize(): void {
    // TODO: implement initialize
  }

  isDownloading(_machine: Machine): boolean {
    return false;
  }

  pauseMachine(_machine: Machine): void {
    // TODO: implement pauseMachine
  }

  removeMachine(_machine: Machine): void {
    // TODO: implement removeMachine
  }
}
