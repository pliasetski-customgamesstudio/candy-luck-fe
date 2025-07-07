import { CgsEvent } from './12_Event';
import { ParamEvent } from './48_ParamEvent';
import { IntervalAction } from './50_IntervalAction';
import { EventDispatcher } from './78_EventDispatcher';
import { Action } from './84_Action';
import { EventStream } from './22_EventStreamSubscription';

export class State {
  name: string;
  readonly m_entering: EventDispatcher<State> = new EventDispatcher<State>();
  readonly m_entered: EventDispatcher<State> = new EventDispatcher<State>();
  readonly m_leaved: EventDispatcher<State> = new EventDispatcher<State>();
  readonly m_leaving: EventDispatcher<State> = new EventDispatcher<State>();
  readonly m_finishedEvent: EventDispatcher<State> = new EventDispatcher<State>();

  get entering(): EventStream<State> {
    return this.m_entering.eventStream;
  }

  get entered(): EventStream<State> {
    return this.m_entered.eventStream;
  }

  get leaved(): EventStream<State> {
    return this.m_leaved.eventStream;
  }

  get leaving(): EventStream<State> {
    return this.m_leaving.eventStream;
  }

  get finished(): EventStream<State> {
    return this.m_finishedEvent.eventStream;
  }

  transitionAction: Action | null = null;
  enterAction: Action;
  m_finished: boolean = false;

  get isFinished(): boolean {
    return this.isFinal && !this.transitionAction;
  }

  isFinal: boolean = false;

  switchToState(state: string): void {
    this.dispatchEvent(new ParamEvent<string>(state));
  }

  getStateDuration(state: string): number {
    return this.findById(state)?.enterAction instanceof IntervalAction
      ? (this.findById(state)?.enterAction as IntervalAction).duration
      : 0.0;
  }

  sendEvent(event: CgsEvent): void {
    this.dispatchEvent(event);
  }

  isActive(_stateId: string): boolean {
    return false;
  }

  findById(id: string): State | null {
    if (this.name === id) {
      return this;
    }
    return null;
  }

  dispatchEvent(_event: CgsEvent): void {}

  update(dt: number): void {
    if (this.transitionAction !== null) {
      this.transitionAction.update(dt);
      if (this.transitionAction.isDone) {
        this.transitionAction = null;
        this.doEnter();
      }
    } else if (this.enterAction) {
      this.enterAction.update(dt);
    }
    this.updateImpl(dt);
    if (!this.m_finished && this.isFinished) {
      this.m_finished = true;
      this.m_finishedEvent.dispatchEvent(this);
    }
  }

  onEntering(transition: Action | null = null): void {
    this.m_finished = false;
    this.transitionAction = transition;
    if (this.transitionAction) {
      this.transitionAction.begin();
    }
    this.onEnteringImpl();
    this.m_entering.dispatchEvent(this);
  }

  doEnter(): void {
    if (!this.transitionAction) {
      this.onEnter();
    }
  }

  onEnter(): void {
    if (this.enterAction) {
      this.enterAction.begin();
    }
    this.onEnterImpl();
    this.m_entered.dispatchEvent(this);
  }

  onLeave(): void {
    this.m_leaving.dispatchEvent(this);
    this.onLeaveImpl();
    if (this.transitionAction) {
      this.transitionAction.end();
    } else if (this.enterAction) {
      this.enterAction.end();
    }
    this.m_leaved.dispatchEvent(this);
  }

  restart(): void {
    this.onLeave();
    this.start();
  }

  start(): void {
    this.onEntering();
    this.doEnter();
  }

  stop(): void {
    this.onLeave();
  }

  onEnteringImpl(): void {}

  onEnterImpl(): void {}

  onLeaveImpl(): void {}

  updateImpl(_dt: number): void {}
}
