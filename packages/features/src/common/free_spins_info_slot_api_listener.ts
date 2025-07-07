// import { SlotsApiListenerBase } from "@cgs/common";
// import { SpinRequest, SpinResultResponse, ModularSpinResultResponse, StartMachineRequest, MachineInfoDTO, ModularMachineInfoDTO } from "@cgs/network";
//
// class FreeSpinsInfoSlotApiListener extends SlotsApiListenerBase {
//   private _freeSpinsInfo: FreeSpinsInfoDTO;
//
//   get freeSpinsInfo(): FreeSpinsInfoDTO {
//     return this._freeSpinsInfo;
//   }
//
//   set freeSpinsInfo(value: FreeSpinsInfoDTO) {
//     this._freeSpinsInfo = value;
//   }
//
//   async onSpin(request: SpinRequest, result: SpinResultResponse): Promise<any> {
//     this.freeSpinsInfo = result.machineState.freeSpinsInfo;
//     return super.onSpin(request, result);
//   }
//
//   async onTutorialSpin(request: SpinRequest, result: SpinResultResponse): Promise<any> {
//     this.freeSpinsInfo = result.machineState.freeSpinsInfo;
//     return super.onTutorialSpin(request, result);
//   }
//
//   async onModularSpin(request: SpinRequest, result: ModularSpinResultResponse): Promise<any> {
//     this.freeSpinsInfo = result.baseMachineState.freeSpinsInfo;
//     return super.onModularSpin(request, result);
//   }
//
//   async onStartMachine(request: StartMachineRequest, result: MachineInfoDTO): Promise<any> {
//     this.freeSpinsInfo = result.machineState.freeSpinsInfo;
//     return super.onStartMachine(request, result);
//   }
//
//   async onStartModularMachine(request: StartMachineRequest, result: ModularMachineInfoDTO): Promise<any> {
//     this.freeSpinsInfo = result.machineState.freeSpinsInfo;
//     return super.onStartModularMachine(request, result);
//   }
// }
