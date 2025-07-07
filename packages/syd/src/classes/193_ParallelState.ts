import { CgsEvent } from './12_Event';
import { State } from './208_State';
import { CompositeState } from './99_CompositeState';

export class ParallelState extends CompositeState {
  private _states: State[];

  constructor(states: State[]) {
    super();
    this._states = states;
  }

  get states(): State[] {
    return this._states;
  }

  isActive(stateId: string): boolean {
    return this._states.some((state) => state.isActive(stateId));
  }

  getChild(index: number): State {
    return this._states[index];
  }

  findById(id: string): State | null {
    let result: State | null = this.findById(id);
    if (result) {
      return result;
    }

    for (let i = 0; i < this._states.length; ++i) {
      const child = this._states[i];
      result = child.findById(id);
      if (result) {
        return result;
      }
    }

    return null;
  }

  get isFinished(): boolean {
    for (let i = 0; i < this._states.length; ++i) {
      const state = this._states[i];
      if (!state.isFinished) {
        return false;
      }
    }

    return true;
  }

  dispatchEvent(event: CgsEvent): void {
    const states = this._states;
    for (let i = 0; i < states.length; ++i) {
      states[i].dispatchEvent(event);
    }
  }

  updateImpl(dt: number): void {
    const states = this._states;
    for (let i = 0; i < states.length; ++i) {
      states[i].update(dt);
    }
  }

  onEnteringImpl(): void {
    const states = this._states;
    for (let i = 0; i < states.length; ++i) {
      states[i].onEntering();
    }
  }

  onEnterImpl(): void {
    const states = this._states;
    for (let i = 0; i < states.length; ++i) {
      states[i].doEnter();
    }
  }

  onLeaveImpl(): void {
    const states = this._states;
    for (let i = 0; i < states.length; ++i) {
      states[i].onLeave();
    }
  }
}
