import {
  ISpinPauseTaskResolutionStrategy,
  ISpinPauseProcessor,
  ISpinResponse,
  T_GameOperation,
  SpinPauseTaskResolutionStrategy,
  f_isISpinPauseProcessor,
} from '@cgs/common';
import { LazyAction } from '@cgs/shared';
import { Container } from '@cgs/syd';
import { CompositeGameController } from '../../composite_game_controller';
import { GameComponentProvider } from '../components/game_component_provider';
import { GameOperation } from '../../game_operation';
import { AwaitableAction } from '../../reels_engine/actions/awaitable_action';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { T_IGameStateMachineProvider } from '../../type_definitions';

export class SpinPauseProcessorService extends GameComponentProvider {
  private _spinPauseTaskResolutionStrategy: ISpinPauseTaskResolutionStrategy<ISpinPauseProcessor>;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _container: Container;
  private _controller: CompositeGameController;

  constructor(container: Container) {
    super();
    this._container = container;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._spinPauseTaskResolutionStrategy =
      new SpinPauseTaskResolutionStrategy<ISpinPauseProcessor>();
    this._gameStateMachine.animation.appendLazyAnimation(
      () => new LazyAction(() => new AwaitableAction(this.processSpinPauseTasks()))
    );
    this._gameStateMachine.stopping.appendLazyAnimation(
      () => new LazyAction(() => new AwaitableAction(this.processPreSpinPauseTasks()))
    );
  }

  public Controller(): CompositeGameController {
    if (!this._controller) {
      this._controller = this._container.forceResolve<GameOperation>(T_GameOperation).controller;
    }
    return this._controller;
  }

  public async processPreSpinPauseTasks(): Promise<void> {
    const prs = this.Controller()
      .getChildren()
      .filter((c) => c instanceof ISpinPauseProcessor);

    const processors: ISpinPauseProcessor[] = [];
    for (const pr of prs) {
      if (f_isISpinPauseProcessor(pr)) {
        processors.push(pr);
      } else {
        throw new Error(
          'SpinPauseProcessorService: processPreSpinPauseTasks: ' +
            // @ts-expect-error
            pr.constructor.name +
            ' is not ISpinPauseProcessor'
        );
      }
    }
    await this._spinPauseTaskResolutionStrategy.addAndExecuteValidationTaskList(processors);
  }

  public processSpinPauseTasks(): Promise<void> {
    return this._spinPauseTaskResolutionStrategy.executePostEventTasks();
  }
}
