import { BetCalculationType } from '@cgs/common';
import { NodeUtils } from '@cgs/shared';
import { TextSceneObject, SceneObject } from '@cgs/syd';
import { TotalBetView } from './total_bet_view';

export class NewTotalBetView extends TotalBetView {
  private _fSCountBitmapTextNode: TextSceneObject[];
  private _freeSpinsTextScene: TextSceneObject[];
  private _valueBetSwitch: SceneObject;
  private _panelModes: SceneObject;
  private _playButton: SceneObject;

  constructor(root: SceneObject) {
    super(root);
    this._fSCountBitmapTextNode = root.parent!.findAllById<TextSceneObject>('FS_count');
    this._valueBetSwitch = root.parent!.findById('ValueBetSwitch')!;
    this._panelModes = root.findById('Modes')!;
    this._playButton = root.findById('PlayBtn')!;
  }

  setRespinsMode(
    isMaxBet: boolean,
    extremeBet: boolean,
    totalBet: number,
    betCalculationType: BetCalculationType
  ): void {
    this._panelModes.stateMachine!.switchToState('respins_mode');
    this.setTotalBetOnly(totalBet);
    switch (betCalculationType) {
      case BetCalculationType.AVERAGE:
        this._valueBetSwitch.stateMachine!.switchToState('Average');
        break;
      case BetCalculationType.FREESPINS:
        this._valueBetSwitch.stateMachine!.switchToState('FreeSpinsBet');
        break;
      case BetCalculationType.DEFAULT:
      default:
        this._valueBetSwitch.stateMachine!.switchToState('TotalBet');
        break;
    }
    this.setDefaultFSMode(betCalculationType, isMaxBet, extremeBet);
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
    if (!this._fSCountBitmapTextNode) {
      super.setFreeSpinsMode(
        fsCount,
        totalFsCount,
        isMaxBet,
        extremeBet,
        totalBet,
        betCalculationType,
        freeSpinsName
      );
      return;
    }

    if (this.extraBetPanel) {
      NodeUtils.sendEventIfNeeded(this.extraBetPanel, 'extraBetHide');
      NodeUtils.sendEventIfNeeded(this.extraBetInfo, 'hide');
    }

    this.setTotalBetOnly(totalBet);

    this.setDefaultFSMode(betCalculationType, isMaxBet, extremeBet);
    // const text = isNeedAllFsCount
    //   ? Math.max(fsCount, 0).toString() + '/' + totalFsCount.toString()
    //   : totalFsCount.toString();
    // this._fSCountBitmapTextNode.forEach((node) => (node.text = text));

    if (!this._freeSpinsTextScene) {
      this._freeSpinsTextScene = this._root.parent!.findAllById<TextSceneObject>('fsText');
    }

    const freeSpinsText = `FREE SPINS LEFT: ${Math.max(fsCount, 0)}`;
    this._freeSpinsTextScene.forEach((node) => (node.text = freeSpinsText));
  }

  setTotalBetFreeSpinsState(
    isMaxBet: boolean,
    extremeBet: boolean,
    totalBet: number,
    betCalculationType: BetCalculationType,
    freeSpinsName: string = 'free_spins'
  ): void {
    if (
      !this._fSCountBitmapTextNode ||
      !this._valueBetSwitch ||
      !this._valueBetSwitch.stateMachine
    ) {
      super.setTotalBetFreeSpinsState(
        isMaxBet,
        extremeBet,
        totalBet,
        betCalculationType,
        freeSpinsName
      );
      return;
    }

    this._panelModes.stateMachine!.switchToState('freespins');

    if (this.extraBetPanel) {
      NodeUtils.sendEventIfNeeded(this.extraBetPanel, 'extraBetHide');
      NodeUtils.sendEventIfNeeded(this.extraBetInfo, 'hide');
    }

    this.setTotalBetOnly(totalBet);

    switch (betCalculationType) {
      case BetCalculationType.AVERAGE:
        this._valueBetSwitch.stateMachine.switchToState('Average');
        break;
      case BetCalculationType.FREESPINS:
        this._valueBetSwitch.stateMachine.switchToState('FreeSpinsBet');
        break;
      case BetCalculationType.DEFAULT:
      default:
        this._valueBetSwitch.stateMachine.switchToState('TotalBet');
        break;
    }
    this.setDefaultFSMode(betCalculationType, isMaxBet, extremeBet);
    this._fSCountBitmapTextNode.forEach((node) => (node.text = ''));
    this.betLabel.stateMachine!.switchToState(freeSpinsName);
  }

  private setDefaultFSMode(
    betcalculation: BetCalculationType,
    isMaxBet: boolean,
    isExtremeBet: boolean
  ): void {
    if (betcalculation != BetCalculationType.DEFAULT) {
      return;
    }
    if (isExtremeBet) {
      this._valueBetSwitch.stateMachine!.switchToState('XtremeBet');
    } else if (isMaxBet) {
      this._valueBetSwitch.stateMachine!.switchToState('MaxBet');
    }
  }

  disableFreeSpinsMode(totalBet: number, isMaxBet: boolean, isXtremeBet: boolean): void {
    if (!this._valueBetSwitch || !this._valueBetSwitch.stateMachine || !this._panelModes) {
      super.disableFreeSpinsMode(totalBet, isMaxBet, isXtremeBet);
      return;
    }
    this._valueBetSwitch.stateMachine.switchToState('ValueBet');
    this._panelModes.stateMachine!.switchToState('default');
    this._playButton.stateMachine!.switchToState('up');
    super.disableFreeSpinsMode(totalBet, isMaxBet, isXtremeBet);
  }
}
