import {
  BonusInfoDTO,
  BonusPickRequest,
  MachineInfoDTO,
  ModularMachineInfoDTO,
  ModularSpinResultResponse,
  ScatterPickRequest,
  SpinRequest,
  SpinResultResponse,
  StartMachineRequest,
  TStaticActionParams,
  TStaticGamesInfoDTO,
} from '@cgs/network';

export interface ISlotsApiService {
  pickBonus(request: BonusPickRequest): Promise<BonusInfoDTO>;
  pickStatic(request: TStaticActionParams): Promise<TStaticGamesInfoDTO>;
  pickScatter(request: ScatterPickRequest): Promise<BonusInfoDTO>;
  spin(request: SpinRequest): Promise<SpinResultResponse>;
  extraBetSpin(request: SpinRequest): Promise<SpinResultResponse>;
  modularSpin(request: SpinRequest): Promise<ModularSpinResultResponse>;
  tutorialSpin(request: SpinRequest): Promise<SpinResultResponse>;
  startMachine(request: StartMachineRequest): Promise<MachineInfoDTO>;
  startModularMachine(request: StartMachineRequest): Promise<ModularMachineInfoDTO>;
  startGamble(request: StartMachineRequest): Promise<BonusInfoDTO>;
  // won: Stream;
}
