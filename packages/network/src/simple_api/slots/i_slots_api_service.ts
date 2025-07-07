import {
  MachineInfoDTO,
  ModularMachineInfoDTO,
  SpinRequest,
  SpinResultResponse,
} from '@cgs/network';

export interface IResponseBuilder {
  buildSpinResultResponse(
    json: Record<string, any>,
    prevSpinResultResponse?: SpinResultResponse | null,
    request?: SpinRequest
  ): SpinResultResponse;
  buildMachineInfo(json: Record<string, any>, request?: SpinRequest): MachineInfoDTO;
  buildModularMachineInfo(json: Record<string, any>, request?: SpinRequest): ModularMachineInfoDTO;
}
