import { IMachineDownloader } from '../services/i_machine_downloader';
import { Machine } from '@cgs/network';

export enum MachineDownloadState {
  NeedDownload,
  Downloading,
  Downloaded,
  Paused,
  NeedUpdate,
  Broken,
  NotEnoughStorage,
}

export class MachineDownloaderEx {
  static isGameReady(downloader: IMachineDownloader, machine: Machine): boolean {
    return downloader.getMachineStatus(machine).state === MachineDownloadState.Downloaded;
  }

  static isGamePaused(downloader: IMachineDownloader, machine: Machine): boolean {
    return downloader.getMachineStatus(machine).state === MachineDownloadState.Paused;
  }

  static isGameDownloading(downloader: IMachineDownloader, machine: Machine): boolean {
    return downloader.isDownloading(machine);
  }

  static isGameNeedDownload(downloader: IMachineDownloader, machine: Machine): boolean {
    return downloader.getMachineStatus(machine).state === MachineDownloadState.NeedDownload;
  }

  static isGameNeedUpdate(downloader: IMachineDownloader, machine: Machine): boolean {
    return downloader.getMachineStatus(machine).state === MachineDownloadState.NeedUpdate;
  }
}
