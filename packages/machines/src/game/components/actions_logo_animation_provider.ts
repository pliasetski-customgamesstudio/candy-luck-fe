import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  SequenceAction,
  VideoSceneObject,
} from '@cgs/syd';
import { LogoAnimationProvider } from './logo_animation_provider';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';
import { ISpinResponse } from '@cgs/common';

export class ActionsLogoAnimationProvider extends LogoAnimationProvider {
  private _loseCount: number;
  private _loseCountConfig: number;

  constructor(container: Container, logoNodeId: string) {
    super(container, logoNodeId);
    this._loseCount = 0;
    this._loseCountConfig = 3;

    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    gameStateMachine.stop.addLazyAnimationToBegin(() =>
      this._checkAnimationsAction(gameStateMachine.curResponse)
    );
    gameStateMachine.idle.addLazyAnimationToBegin(() => this.getAttentionAnimationAction());
  }

  private _checkAnimationsAction(response: ISpinResponse): IntervalAction {
    return new SequenceAction([this._checkLoseAnimationAction(response)]);
  }

  private _checkLoseAnimationAction(response: ISpinResponse): IntervalAction {
    if (response.totalWin === 0) {
      this._loseCount++;
      if (this._loseCount === this._loseCountConfig) {
        this._loseCount = 0;
        return this.getLoseAnimationAction();
      }
    } else {
      this._loseCount = 0;
    }
    return new EmptyAction();
  }

  getLogoAnimationAction(_symbolId: number): IntervalAction {
    return new EmptyAction();
  }

  getShortWinLineAction(): IntervalAction {
    return this.getWinAnimationAction();
  }

  getAttentionAnimationAction(): IntervalAction {
    return new FunctionAction(() => this._logoSwitchToState('wave'));
  }

  getLoseAnimationAction(): IntervalAction {
    return new FunctionAction(() => this._logoSwitchToState('mouse'));
  }

  getWinAnimationAction(): IntervalAction {
    return new FunctionAction(() => this._logoSwitchToState('dance'));
  }

  private _logoSwitchToState(state: string): void {
    this.logoNode.stateMachine!.switchToState('default');
    const videos = this.logoNode.findAllByType<VideoSceneObject>(VideoSceneObject);
    if (videos) {
      for (const video of videos) {
        video.stop();
      }
    }
    this.logoNode.stateMachine!.switchToState(state);
  }

  stopLogoAnimation(): void {}
}
