import { Rule } from './125_Rule';
import { CgsEvent } from './12_Event';
import { StateEntry } from './145_StateEntry';
import { State } from './208_State';
import { Action } from './84_Action';
import { CompositeState } from './99_CompositeState';

export class StateMachine extends CompositeState {
  private _states: StateEntry[] = [];
  private _initial: State | null = null;
  private _current: StateEntry | null = null;

  get states(): StateEntry[] {
    return this._states;
  }

  getChild(index: number): State {
    return this._states[index].state;
  }

  get isFinished(): boolean {
    return !!this._current?.state && this._current.state.isFinished;
  }

  isActive(stateId: string): boolean {
    return !!(this._current?.state?.name === stateId || this._current?.state?.isActive(stateId));
  }

  findById(id: string): State | null {
    let result: State | null = null;
    result = super.findById(id);
    if (result) {
      return result;
    }

    for (let i = 0; i < this._states.length; ++i) {
      const child = this._states[i].state;
      result = child.findById(id);
      if (result) {
        return result;
      }
    }

    return null;
  }

  dispatchEvent(event: CgsEvent): void {
    if (this._current) {
      const cnt = this._current.rules.length;
      for (let i = 0; i < cnt; ++i) {
        const rule = this._current.rules[i];
        rule.rule.dispatchEvent(event);
      }

      this._current.state.dispatchEvent(event);

      this._checkRules();
    }
  }

  addState(state: State): void {
    const e = new StateEntry(state);
    this._states.push(e);
  }

  addRule(from: State, to: State, rule: Rule): void {
    const e = this._states.find((e) => e.state === from);
    if (e) {
      e.rules.push({ rule, state: to });
    }
  }

  setInitialState(state: State): void {
    this._initial = state;
  }

  private _startTransition(state: State, transition: Action | null): void {
    if (this._current) {
      const rules = this._current.rules;
      for (let i = 0; i < rules.length; ++i) {
        rules[i].rule.setActive(false);
      }

      this._current.state.onLeave();
    }

    const current = this._states.find((e) => e.state === state);
    if (current) {
      current.state.onEntering(transition);

      this._current = current;

      const rules = current.rules;
      for (let i = 0; i < rules.length; ++i) {
        rules[i].rule.setActive(true);
      }
    }
  }

  private _switchToState(state: State, transition: Action): void {
    this._startTransition(state, transition);
    state.doEnter();
  }

  onEnteringImpl(): void {
    if (this._initial) {
      this._startTransition(this._initial, null);
    }
  }

  onEnterImpl(): void {
    if (this._current) {
      this._current.state.doEnter();
    }
  }

  onLeaveImpl(): void {
    if (this._current) {
      const rules = this._current.rules;
      for (let i = 0; i < rules.length; ++i) {
        rules[i].rule.setActive(false);
      }

      this._current.state.onLeave();

      this._current = null;
    }
  }

  updateImpl(dt: number): void {
    if (this._current) {
      this._current.state.update(dt);

      const rules = this._current.rules;
      for (let i = 0; i < rules.length; ++i) {
        rules[i].rule.update(dt);
      }

      this._checkRules();
    }
  }

  private _checkRules(): void {
    if (this._current) {
      for (let i = 0; i < this._current.rules.length; ++i) {
        const rule = this._current.rules[i];
        if (rule.rule.isTriggered) {
          this._switchToState(rule.state, rule.rule.transition);
          break;
        }
      }
    }
  }
}
