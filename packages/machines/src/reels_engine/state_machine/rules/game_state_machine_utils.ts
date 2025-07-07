import { ISpinResponse } from '@cgs/common';
import { FreeSpinsInfoConstants } from '../free_spins_info_constants';
import { ResponseHolder } from '../response_holder';

export class GameRulesUtils {
  static isFreeSpins(resp: ResponseHolder<ISpinResponse>): boolean {
    return !!resp.curResponse.freeSpinsInfo;
  }

  static isFreeSpinsFinishEventSkipped(resp: ResponseHolder<ISpinResponse>): boolean {
    return (
      !!resp.preResponse &&
      !!resp.preResponse.freeSpinsInfo &&
      resp.preResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsFinished &&
      !resp.curResponse.freeSpinsInfo
    );
  }

  static isFreeSpinsFinishing(resp: ResponseHolder<ISpinResponse>): boolean {
    return (
      !!resp.curResponse.freeSpinsInfo &&
      resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsFinished &&
      (resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
        FreeSpinsInfoConstants.FreeFreeSpinsGroupName ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.PurchasedFreeSpinsGroupName)
    );
  }

  static game59IsFreeSpinsFinishing(resp: ResponseHolder<ISpinResponse>): boolean {
    return (
      !!resp.curResponse.freeSpinsInfo &&
      resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsFinished &&
      (resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
        FreeSpinsInfoConstants.FreeFreeSpinsGroupName ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.PurchasedFreeSpinsGroupName ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.FreeRespinSpinsGroupName ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.FreeFrozenSpinsGroupName)
    );
  }

  static isFreeSpinsFinishingWithTypes(resp: ResponseHolder<ISpinResponse>): boolean {
    return (
      !!resp.curResponse.freeSpinsInfo &&
      resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsFinished &&
      // TODO: бессмысленные сравнения
      (!!resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.PurchasedFreeSpinsGroupName ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.FreeRespinSpinsGroupName ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.FreeFrozenSpinsGroupName)
    );
  }

  static game103IsFreeSpinsFinishingWithTypes(
    resp: ResponseHolder<ISpinResponse>,
    types: string[]
  ): boolean {
    return (
      !!resp.curResponse.freeSpinsInfo &&
      (resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsFinished ||
        (resp.curResponse.freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
          resp.curResponse.freeSpinsInfo.name.includes('Game'))) &&
      (types.some((x) => resp.curResponse.freeSpinsInfo?.currentFreeSpinsGroup?.name == x) ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.PurchasedFreeSpinsGroupName ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.FreeRespinSpinsGroupName ||
        resp.curResponse.freeSpinsInfo.currentFreeSpinsGroup?.name ===
          FreeSpinsInfoConstants.FreeFrozenSpinsGroupName)
    );
  }
}
