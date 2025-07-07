import { BetCalculationType, NumberFormatter } from '@cgs/common';
import { NodeUtils } from '@cgs/shared';
import { TextSceneObject, SceneObject, Button } from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { TotalBetController } from '../controllers/total_bet_controller';

export class TotalBetView extends BaseSlotView<TotalBetController> {
  private _totalBetText: TextSceneObject[];
  private _FS_count: TextSceneObject;
  private _betMultiplierText: TextSceneObject;
  private _betLabel: SceneObject;
  get betLabel(): SceneObject {
    return this._betLabel;
  }
  private _extraBetPanel: SceneObject;
  get extraBetPanel(): SceneObject {
    return this._extraBetPanel;
  }
  private _extraBetInfo: Button;
  get extraBetInfo(): Button {
    return this._extraBetInfo;
  }
  private _overallBetText: TextSceneObject;

  // private _extraBetInfoClickedDispatcher: EventDispatcher = new EventDispatcher();
  // get extraBetInfoClicked(): Stream {
  //   return this._extraBetInfoClickedDispatcher.eventStream;
  // }

  constructor(root: SceneObject) {
    super(root);
    this._totalBetText = root.parent!.findAllById<TextSceneObject>('ValueBetText');
    if (!this._totalBetText.length) {
      this._totalBetText = root.parent!.findAllById<TextSceneObject>('BetBtn');
    }
    this._FS_count = root.parent!.findById<TextSceneObject>('FS_count')!;
    // this._betMultiplierText = root.findById<TextSceneObject>('MultiplierText')!;
  }

  setRespinsMode(
    isMaxBet: boolean,
    extremeBet: boolean,
    totalBet: number,
    betCalculationType: BetCalculationType
  ): void {}

  setTotalBetOnly(totalBet: number): void {
    this._totalBetText.forEach((textScene) => {
      textScene.text = NumberFormatter.formatMoney(totalBet);
    });
  }

  setTotalBet(totalBet: number, isMaxBet: boolean, isXtremeBet: boolean): void {
    this._totalBetText.forEach((textScene) => {
      textScene.text = NumberFormatter.formatMoney(totalBet);
    });
    //NodeUtils.sendEventIfNeeded(_betLabel,isMaxBet ? "max_bet" : isXtremeBet ? "xtreme_bet" : "total_bet");
  }

  hideExtraBet(): void {
    /*if (_extraBetPanel) {
      NodeUtils.sendEventIfNeeded(_extraBetPanel, "extraBetHide");
      NodeUtils.sendEventIfNeeded(_extraBetInfo, "hide");
    }*/
  }

  showExtraBet(): void {
    /* if (_extraBetPanel) {
      NodeUtils.sendEventIfNeeded(_extraBetPanel, "extraBetShow");
      NodeUtils.sendEventIfNeeded(_betLabel, "extraBet");
      NodeUtils.sendEventIfNeeded(_extraBetInfo, "up");
    }*/
  }

  setExtraBet(bet: number, effectiveBet: number): void {
    /*if (_extraBetPanel) {
      _totalBetText.text = NumberFormatter.format(effectiveBet);
      _overallBetText.text = NumberFormatter.format(bet);
    }
    else {
      _totalBetText.text = NumberFormatter.format(bet);
    }*/
  }

  enableExtraBetPanelAlpha(): void {
    /* if (_extraBetPanel &&
        _extraBetPanel.stateMachine.isActive("extraBetShow")) {
      NodeUtils.sendEventIfNeeded(_extraBetInfo, "dis");
      NodeUtils.sendEventIfNeeded(_betLabel, "extraBetAlpha");
      NodeUtils.sendEventIfNeeded(_extraBetPanel, "extraBetShowAlpha");
    }*/
  }

  setBetMultiplier(multiplier: number): void {
    /*if (_betMultiplierText) {
      _betMultiplierText.text = NumberFormatter.format(multiplier);
    }*/
  }

  setTotalBetFreeSpinsState(
    isMaxBet: boolean,
    extremeBet: boolean,
    totalBet: number,
    betCalculationType: BetCalculationType,
    freeSpinsName: string = 'free_spins'
  ): void {
    /*if (_extraBetPanel) {
      NodeUtils.sendEventIfNeeded(_extraBetPanel, "extraBetHide");
      NodeUtils.sendEventIfNeeded(_extraBetInfo, "hide");
    }*/
    this._totalBetText.forEach((textScene) => {
      textScene.text = '';
    });
  }

  setFreeSpinsMode(
    fsCount: number,
    totalFsCount: number,
    isMaxBet: boolean,
    extremeBet: boolean,
    totalBet: number,
    betCalculationType: BetCalculationType,
    freeSpinsName: string = 'free_spins',
    isNeedAllFsCount: boolean = true
  ): void {
    if (this._extraBetPanel) {
      NodeUtils.sendEventIfNeeded(this._extraBetPanel, 'extraBetHide');
      NodeUtils.sendEventIfNeeded(this._extraBetInfo, 'hide');
    }
    this._FS_count.text = fsCount.toString();
  }

  disableFreeSpinsMode(totalBet: number, isMaxBet: boolean, isXtremeBet: boolean): void {
    this.setTotalBet(totalBet, isMaxBet, isXtremeBet);
  }
}
