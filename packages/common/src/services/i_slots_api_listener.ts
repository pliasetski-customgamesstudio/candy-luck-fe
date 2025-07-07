import {
  BonusPickRequest,
  BonusInfoDTO,
  TStaticActionParams,
  TStaticGamesInfoDTO,
  ScatterPickRequest,
  SpinRequest,
  SpinResultResponse,
  StartMachineRequest,
  MachineInfoDTO,
  ModularMachineInfoDTO,
  ModularSpinResultResponse,
} from '@cgs/network';

export interface ISlotsApiListener {
  onPickBonus(request: BonusPickRequest, result: BonusInfoDTO): Promise<void>;
  onPickStatic(request: TStaticActionParams, result: TStaticGamesInfoDTO): Promise<void>;
  onPickScatter(request: ScatterPickRequest, result: BonusInfoDTO): Promise<void>;
  onSpin(request: SpinRequest, result: SpinResultResponse): Promise<void>;
  onTutorialSpin(request: SpinRequest, result: SpinResultResponse): Promise<void>;
  onStartMachine(request: StartMachineRequest, result: MachineInfoDTO): Promise<void>;
  onStartGamble(request: StartMachineRequest, result: BonusInfoDTO): Promise<void>;
  onStartModularMachine(request: StartMachineRequest, result: ModularMachineInfoDTO): Promise<void>;
  onModularSpin(request: SpinRequest, result: ModularSpinResultResponse): Promise<void>;
}
