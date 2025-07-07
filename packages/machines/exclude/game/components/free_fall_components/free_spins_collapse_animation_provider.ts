import { SceneObject } from 'machines';
import { Container } from 'syd';
import { CollapseGameStateMachine } from 'machines/src/reels_engine_library';
import { IGameStateMachineProvider } from 'common';

class FreeSpinsCollapseProvider {
  private _progressHolder: SceneObject;
  private _stepsCount: number;

  constructor(container: Container, progressHolderId: string, stepsCount: number) {
    const gameStateMachine: CollapseGameStateMachine =
      container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider)
        .gameStateMachine as CollapseGameStateMachine;
    const slot = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).slot;
    this._progressHolder = slot.findById(progressHolderId);

    gameStateMachine.scatter.entered.subscribe((e) => this.checkProgressState());
    gameStateMachine.beginCollapseState.addLazyAnimationToBegin(() => this.setState('next'));
    gameStateMachine.accelerate.addLazyAnimationToBegin(() => {
      const group = gameStateMachine.curResponse.additionalData
        ? (gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup)
        : null;
      if (group) {
        return this.setState('back');
      } else {
        return new EmptyAction();
      }
    });
    gameStateMachine.beginFreeSpins.addLazyAnimationToBegin(() => this.setState('back'));
  }

  private setState(state: string): Action {
    return new SequenceAction([
      new FunctionAction(() => {
        this._progressHolder.stateMachine.switchToState(state);
      }),
      new EmptyAction().withDuration(0.6),
    ]);
  }

  private checkProgressState(): void {
    for (let i = 0; i < this._stepsCount; i++) {
      this._progressHolder.stateMachine.switchToState('next');
    }
  }
}
