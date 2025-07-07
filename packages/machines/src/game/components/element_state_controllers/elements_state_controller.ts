import { SceneObject, Container, IntervalAction, IDisposable, IStreamSubscription } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../reels_engine/state_machine/game_state_machine';
import { T_IGameStateMachineProvider, T_ResourcesComponent } from '../../../type_definitions';
import { ResourcesComponent } from '../resources_component';
import { ISpinResponse } from '@cgs/common';

export class ElementsStateController implements IDisposable {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _streamSubscriptions: IStreamSubscription[] = [];
  private _root: SceneObject;
  private _container: Container;

  private _entries: ElementControllingEntry[];
  private _entryStateDelays: Map<string, ItemGameStateDelay> | null;

  constructor(
    container: Container,
    entries: ElementControllingEntry[],
    entryStateDelays: Map<string, ItemGameStateDelay> | null = null
  ) {
    this._container = container;
    this._entries = entries;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._entryStateDelays = entryStateDelays;

    this._gameStateMachine.init.entering.listen((_e) => this.init());
  }

  get Root(): SceneObject {
    if (!this._root) {
      this._root = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
    }
    return this._root;
  }

  private init(): void {
    for (const entry of this._entries) {
      for (const gameStateId of entry.gameStateMachineStates) {
        const gameState = this._gameStateMachine.findById(gameStateId)!;

        if (entry.enteredStates) {
          this._streamSubscriptions.push(
            gameState.entered.listen((_event) => {
              const elements = entry.elements as string[];
              for (const elementId of elements) {
                const elms = this.Root.findAllById(elementId);
                elms.forEach((el) => {
                  const enteredStates = entry.enteredStates as string[];
                  for (const stateId of enteredStates) {
                    if (el.stateMachine && el.stateMachine.findById(stateId)) {
                      console.log(`Changed state of ${elementId} to ${stateId}`);
                      const delay = this.calculateStateDelay(
                        el,
                        entry.enteredStates as string[],
                        stateId,
                        gameStateId,
                        true,
                        this._entryStateDelays,
                        entry._stateDurations,
                        entry.useStatesDuration
                      );
                      this._runActionInSeparateTask(el, stateId, delay, entry._condition);
                    }
                  }
                });
              }
            })
          );
        }

        if (entry.exitedStates) {
          if (!entry.elements) {
            throw new Error('Elements must be defined for exited states');
          }

          this._streamSubscriptions.push(
            gameState.leaved.listen((_event) => {
              const elements = entry.elements as string[];
              for (const elementId of elements) {
                const elms = this.Root.findAllById(elementId);
                elms.forEach((el) => {
                  const exitedStates = entry.exitedStates as string[];
                  for (const stateId of exitedStates) {
                    if (el.stateMachine && el.stateMachine.findById(stateId)) {
                      console.log(`Changed state of ${elementId} to ${stateId}`);
                      const delay = this.calculateStateDelay(
                        el,
                        entry.exitedStates as string[],
                        stateId,
                        gameStateId,
                        false,
                        this._entryStateDelays,
                        entry._stateDurations,
                        entry.useStatesDuration
                      );
                      this._runActionInSeparateTask(el, stateId, delay, entry._condition);
                    }
                  }
                });
              }
            })
          );
        }
      }
    }
  }

  private calculateStateDelay(
    el: SceneObject,
    states: string[],
    stateId: string,
    gameStateId: string,
    entered: boolean,
    entryStatesDelays: Map<string, ItemGameStateDelay> | null,
    entryStateDurations: Map<string, number> | null,
    useStatesDuration: boolean
  ): number {
    let delay = 0.0;

    if (
      entryStatesDelays &&
      entryStatesDelays.has(el.id) &&
      entryStatesDelays.get(el.id)!.gameState == gameStateId &&
      entryStatesDelays.get(el.id)!.enteredState == entered
    ) {
      delay += entryStatesDelays.get(el.id)!.delay;
    } else if (useStatesDuration) {
      for (let i = 0; i < states.indexOf(stateId); i++) {
        if (entryStateDurations && entryStateDurations.has(states[i])) {
          delay += entryStateDurations.get(states[i])!;
        } else {
          const state = el.stateMachine ? el.stateMachine.findById(stateId) : null;
          if (state) {
            delay += (state.enterAction as IntervalAction).duration;
          }
        }
      }
    }

    return delay;
  }

  public dispose(): void {
    // if (this._streamSubscriptions) {
    //   this._streamSubscriptions.forEach((sub) => sub.cancel());
    //   this._streamSubscriptions = null;
    // }
    throw new Error('Method not implemented.');
  }

  private _runActionInSeparateTask(
    el: SceneObject,
    stateId: string,
    delay: number,
    condition: any
  ): void {
    setTimeout(() => {
      if (!condition || condition()) {
        el.stateMachine!.switchToState(stateId);
      }
    }, delay * 1000);
  }

  static defaultStates(logoId: string, bg: string[] | null = null): ElementControllingEntry[] {
    if (!bg) {
      bg = [];
    }
    return [
      new ElementControllingEntry(
        [GameStateMachineStates.Bonus, GameStateMachineStates.Scatter],
        [logoId],
        ['regular', 'default'],
        null
      ),
      new ElementControllingEntry(
        [GameStateMachineStates.FreeSpinRecovery, GameStateMachineStates.FreeSpin],
        [logoId, ...bg],
        ['fs'],
        null
      ),
      new ElementControllingEntry([GameStateMachineStates.EndOfFreeSpins], [logoId, ...bg], null, [
        'regular',
        'default',
      ]),
      new ElementControllingEntry(
        [GameStateMachineStates.BeginFreeSpinsPopup],
        [logoId, ...bg],
        null,
        ['fs']
      ),
    ];
  }

  static defaultStatesReelsBgSwitchWithStart(
    logoId: string,
    bg: string[] | null = null
  ): ElementControllingEntry[] {
    const list = ElementsStateController.defaultStates(logoId, bg);
    list.push(
      new ElementControllingEntry([GameStateMachineStates.BeginFreeSpinsPopup], bg, ['fs'], null)
    );
    return list;
  }

  static defaultStatesNestedFade(
    logoId: string,
    bg: string[] | null = null
  ): ElementControllingEntry[] {
    const list = ElementsStateController.defaultStates(logoId, bg);
    list.push(
      new ElementControllingEntry([GameStateMachineStates.EndOfFreeSpins], bg, ['empty'], null)
    );
    return list;
  }

  static hideLogoOnMiniGame(logoId: string, bg: string[]): ElementControllingEntry[] {
    if (!bg) {
      bg = [];
    }
    return [
      new ElementControllingEntry(
        [GameStateMachineStates.Bonus, GameStateMachineStates.Scatter],
        [logoId],
        ['hide'],
        ['regular', 'default']
      ),
      new ElementControllingEntry(
        [GameStateMachineStates.FreeSpinRecovery, GameStateMachineStates.FreeSpin],
        [logoId, ...bg],
        ['fs'],
        null
      ),
      new ElementControllingEntry([GameStateMachineStates.EndOfFreeSpins], [logoId, ...bg], null, [
        'regular',
        'default',
      ]),
      new ElementControllingEntry(
        [GameStateMachineStates.BeginFreeSpinsPopup],
        [logoId, ...bg],
        null,
        ['fs']
      ),
    ];
  }
}

export class ElementControllingEntry {
  elements: string[] | null;
  gameStateMachineStates: string[];
  enteredStates: string[] | null;
  exitedStates: string[] | null;
  public _condition: (() => boolean) | null;
  useStatesDuration: boolean;
  public _stateDurations: Map<string, number> | null;

  constructor(
    gameStateMachineStates: string[],
    elements: string[] | null,
    enteredStates: string[] | null,
    exitedStates: string[] | null,
    condition: (() => boolean) | null = null,
    useStatesDuration: boolean = false,
    stateDurations: Map<string, number> | null = null
  ) {
    this.gameStateMachineStates = gameStateMachineStates;
    this.elements = elements;
    this.enteredStates = enteredStates;
    this.exitedStates = exitedStates;
    this._condition = condition;
    this.useStatesDuration = useStatesDuration;
    this._stateDurations = stateDurations;
  }
}

export class ItemGameStateDelay {
  delay: number;
  gameState: string;
  enteredState: boolean;

  constructor(delay: number, gameState: string, enteredState: boolean) {
    this.delay = delay;
    this.gameState = gameState;
    this.enteredState = enteredState;
  }
}
