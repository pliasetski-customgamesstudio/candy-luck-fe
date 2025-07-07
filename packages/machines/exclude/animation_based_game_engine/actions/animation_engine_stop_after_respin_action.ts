import { GameStateMachine, ISpinResponse } from 'machines';
import { AnimationBasedGameEngine } from 'syd';
import { InternalRespinSpecGroup } from 'machines/src/reels_engine_library';
import { Container } from 'common';

class AnimationEngineStopAfterRespinAction extends BuildAction {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _gameEngine: AnimationBasedGameEngine;

  constructor(container: Container) {
    super();
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as AnimationBasedGameEngine;
  }

  buildAction(): IntervalAction {
    const respinGroup = this._gameStateMachine.curResponse
      .additionalData as InternalRespinSpecGroup;
    if (respinGroup && respinGroup.respinCounter <= respinGroup.groups.length) {
      return new SequenceAction([
        new FunctionAction(() => this.prepareNewViewReels(respinGroup)),
        this._gameEngine.stopAfterRespinAnimationAction,
        new FunctionAction(() => this.copyNewViewReelsToMainSlotHolder(respinGroup)),
      ]);
    }

    return new EmptyAction();
  }

  private prepareNewViewReels(respinGroup: InternalRespinSpecGroup): void {
    this._gameEngine.clearRespinIcons();
    const respinnedPositions = this.getRespinnedPositions(respinGroup);
    for (const position of respinnedPositions) {
      const iconId = this.getNewIconIdByPosition(respinGroup, position);
      this._gameEngine.setRespinItemIcon(position, iconId);
    }
  }

  private copyNewViewReelsToMainSlotHolder(respinGroup: InternalRespinSpecGroup): void {
    const respinnedPositions = this.getRespinnedPositions(respinGroup);
    for (const position of respinnedPositions) {
      const iconId = this._gameEngine.getRespinIconIdByPosition(position);
      const icon = this._gameEngine.getRespinIconByPosition(position);

      this._gameEngine.removeRespinItemIcon(position);
      if (icon) {
        this._gameEngine.setExistingItemIcon(position, iconId, icon);
      } else {
        this._gameEngine.setItemIcon(position, iconId);
      }
    }
  }

  private getRespinnedPositions(respinGroup: InternalRespinSpecGroup): number[] {
    return Array.from({ length: this._gameEngine.gameConfig.iconsCount }, (_, pos) => pos).filter(
      (pos) => !respinGroup.currentRound.fixedPositions.includes(pos)
    );
  }

  private getNewIconIdByPosition(respinGroup: InternalRespinSpecGroup, position: number): number {
    return respinGroup.currentRound.newViewReels[
      position % this._gameEngine.gameConfig.groupsCount
    ][Math.floor(position / this._gameEngine.gameConfig.groupsCount)];
  }
}
