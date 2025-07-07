import { GameStateMachine, ISpinResponse } from 'machines';
import { AnimationBasedGameEngine } from 'syd';
import { InternalRespinSpecGroup } from 'machines/src/reels_engine_library';
import { Container } from 'common';

class AnimationEngineRespinAction extends BuildAction {
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
        new FunctionAction(() => {
          this._gameEngine.switchRespinPlaceholderToIdle();
          this.prepareRespinIcons(respinGroup);
        }),
        this._gameEngine.respinAnimationAction,
      ]);
    }

    return new EmptyAction();
  }

  private prepareRespinIcons(respinGroup: InternalRespinSpecGroup): void {
    this._gameEngine.clearRespinIcons();
    const respinnedPositions = this.getRespinnedPositions(respinGroup);
    for (const position of respinnedPositions) {
      const iconId = this._gameEngine.getIconIdByPosition(position);
      const icon = this._gameEngine.getIconByPosition(position);
      this._gameEngine.removeItemIcon(position);
      if (icon) {
        this._gameEngine.setExistingRespinItemIcon(position, iconId, icon);
      } else {
        this._gameEngine.setRespinItemIcon(position, iconId);
      }
    }
  }

  private getRespinnedPositions(respinGroup: InternalRespinSpecGroup): number[] {
    return Array.from({ length: this._gameEngine.gameConfig.iconsCount }, (_, pos) => pos).filter(
      (pos) => !respinGroup.currentRound.fixedPositions.includes(pos)
    );
  }
}
