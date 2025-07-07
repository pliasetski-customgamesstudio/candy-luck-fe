import {
  SpinRequest,
  ModularSpinResultResponse,
  BonusPickRequest,
  BonusInfoDTO,
  TStaticActionParams,
  TStaticGamesInfoDTO,
  ScatterPickRequest,
  SpinResultResponse,
  StartMachineRequest,
  MachineInfoDTO,
  ModularMachineInfoDTO,
} from '@cgs/network';
import { ISlotsApiListener } from './i_slots_api_listener';

export class SlotsApiListenerBase implements ISlotsApiListener {
  onModularSpin(_request: SpinRequest, _result: ModularSpinResultResponse): Promise<void> {
    return Promise.resolve();
  }

  onPickBonus(_request: BonusPickRequest, _result: BonusInfoDTO): Promise<void> {
    return Promise.resolve();
  }

  onPickStatic(_request: TStaticActionParams, _result: TStaticGamesInfoDTO): Promise<void> {
    return Promise.resolve();
  }

  onPickScatter(_request: ScatterPickRequest, _result: BonusInfoDTO): Promise<void> {
    return Promise.resolve();
  }

  onSpin(_request: SpinRequest, _result: SpinResultResponse): Promise<void> {
    return Promise.resolve();
  }

  onStartGamble(_request: StartMachineRequest, _result: BonusInfoDTO): Promise<void> {
    return Promise.resolve();
  }

  onStartMachine(_request: StartMachineRequest, _result: MachineInfoDTO): Promise<void> {
    return Promise.resolve();
  }

  onStartModularMachine(
    _request: StartMachineRequest,
    _result: ModularMachineInfoDTO
  ): Promise<void> {
    return Promise.resolve();
  }

  onTutorialSpin(_request: SpinRequest, _result: SpinResultResponse): Promise<void> {
    return Promise.resolve();
  }
}
