// import { IDisposable, SceneObject } from '@cgs/syd';
// import { Machine } from '@cgs/network';

// interface IGameIconProvider extends IDisposable {
//   getMachineIconNode(machineInfo: Machine, useDefault?: boolean): Promise<SceneObject>;
//   getMachineIconNodeBySize(
//     machineInfo: Machine,
//     sizeType: string,
//     noMaskScene?: boolean
//   ): Promise<SceneObject>;
//   getMachineIconNodeSpecial(machineInfo: Machine): Promise<SceneObject>;
//   getMachineItems(machineInfo: Machine, sceneName: string): Promise<SceneObject>;
//   tryGetMachineIconNode(machineInfo: Machine, useDefault?: boolean, masked?: boolean): SceneObject;
//   tryGetMachineIconNode1X1(machineInfo: Machine): SceneObject;
//   tryGetMachineIconNodeBySize(
//     machineInfo: Machine,
//     sizeType: string,
//     noMaskScene?: boolean
//   ): SceneObject;
//   tryGetMachineItem(machineInfo: Machine, sceneName: string): SceneObject;
//   tryGetMachineIconNodeSpecial(machineInfo: Machine, masked?: boolean): SceneObject;
//   isMachineIconReady(slot: Machine, useDefault?: boolean): boolean;
//   isMachineIconReadySpecial(slot: Machine): boolean;

//   startIconDownloads(games: Machine[]): void;
//   startIconDownload(machineId: string, sizeType: string): void;
//   downloadFinished(machineInfo: Machine, useDefault?: boolean): boolean;
//   download1X1Finished(machineInfo: Machine): boolean;
//   specialDownloadFinished(machineInfo: Machine): boolean;
//   // createDownloadTask(machineInfo: Machine, useDefault: boolean): DownloadTask;
//   // createDownloadTaskSpecial(machineInfo: Machine): DownloadTask;

//   iconEquals(machine1: Machine, machine2: Machine, useDefault: boolean): boolean;
//   specialIconEquals(machine1: Machine, machine2: Machine, useDefault: boolean): boolean;

//   tryGetVideo(machine: Machine): SceneObject;
//   startVideoDownloads(games: Machine[]): void;
//   isVideoDownloadFinished(machine: Machine): boolean;
//   videoFileExists(machine: Machine): boolean;
// }

// export class StubGameIconProvider implements IGameIconProvider {
//   getMachineIconNode(machineInfo: Machine, useDefault: boolean = false): Promise<SceneObject> {
//     return Promise.resolve(new SceneObject());
//   }
//   getMachineIconNodeBySize(
//     machineInfo: Machine,
//     sizeType: string,
//     noMaskScene: boolean = false
//   ): Promise<SceneObject> {
//     return Promise.resolve(new SceneObject());
//   }
//   getMachineIconNodeSpecial(machineInfo: Machine): Promise<SceneObject> {
//     return Promise.resolve(new SceneObject());
//   }
//   getMachineItems(machineInfo: Machine, sceneName: string): Promise<SceneObject> {
//     return Promise.resolve(new SceneObject());
//   }
//   tryGetMachineIconNode(
//     machineInfo: Machine,
//     useDefault: boolean = false,
//     masked: boolean = false
//   ): SceneObject {
//     return new SceneObject();
//   }
//   tryGetMachineIconNode1X1(machineInfo: Machine): SceneObject {
//     return new SceneObject();
//   }
//   tryGetMachineIconNodeBySize(
//     machineInfo: Machine,
//     sizeType: string,
//     noMaskScene: boolean = false
//   ): SceneObject {
//     return new SceneObject();
//   }
//   tryGetMachineItem(machineInfo: Machine, sceneName: string): SceneObject {
//     return new SceneObject();
//   }
//   tryGetMachineIconNodeSpecial(machineInfo: Machine, masked: boolean = false): SceneObject {
//     return new SceneObject();
//   }
//   isMachineIconReady(slot: Machine, useDefault: boolean = false): boolean {
//     return true;
//   }
//   isMachineIconReadySpecial(slot: Machine): boolean {
//     return true;
//   }

//   startIconDownloads(games: Machine[]): void {}
//   startIconDownload(machineId: string, sizeType: string): void {}
//   downloadFinished(machineInfo: Machine, useDefault: boolean = false): boolean {
//     return true;
//   }
//   download1X1Finished(machineInfo: Machine): boolean {
//     return true;
//   }
//   specialDownloadFinished(machineInfo: Machine): boolean {
//     return true;
//   }
//   // createDownloadTask(machineInfo: Machine, useDefault: boolean): DownloadTask {
//   //   return null;
//   // }
//   // createDownloadTaskSpecial(machineInfo: Machine): DownloadTask {
//   //   return null;
//   // }

//   iconEquals(machine1: Machine, machine2: Machine, useDefault: boolean): boolean {
//     return false;
//   }
//   specialIconEquals(machine1: Machine, machine2: Machine, useDefault: boolean): boolean {
//     return false;
//   }

//   tryGetVideo(machine: Machine): SceneObject {
//     return new SceneObject();
//   }
//   startVideoDownloads(games: Machine[]): void {}
//   isVideoDownloadFinished(machine: Machine): boolean {
//     return true;
//   }
//   videoFileExists(machine: Machine): boolean {
//     return true;
//   }
//   dispose(): void {}
// }
