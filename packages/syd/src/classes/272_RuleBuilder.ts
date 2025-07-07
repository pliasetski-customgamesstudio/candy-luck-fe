import { BuildedNode } from './138_BuildedNode';
import { Action } from './84_Action';
import { Rule } from './125_Rule';
import { ParamEventRule } from './153_ParamEventRule';
import { ButtonBase } from './271_ButtonBase';
import { PropertyRule } from './31_PropertyRule';
import { StreamRule } from './52_StreamRule';
import { FalseRule } from './71_FalseRule';
import { Button } from './260_Button';

export class RuleBuilder {
  signals: Array<Record<string, any>>;
  rules: Array<Record<string, any>>;
  transitions: Array<Record<string, any>>;
  sceneObjects: Array<BuildedNode>;

  constructor(
    signals: Array<Record<string, any>>,
    rules: Array<Record<string, any>>,
    transitions: Array<Record<string, any>>,
    sceneObjects: Array<BuildedNode>
  ) {
    this.signals = signals;
    this.rules = rules;
    this.transitions = transitions;
    this.sceneObjects = sceneObjects;
  }

  build(index: number, actions: Array<Action>): Rule {
    const transition = this.transitions[index];
    const rule = this.rules[transition['rule']];

    let result: Rule;

    const type = rule['type'];
    if (type === 'param') {
      const params = (rule['params'] as Array<any>)?.map((param: any) => param.toString());
      if (params.length > 1) {
        console.warn('[RuleBuilder] params contains more than one param');
      }
      result = new ParamEventRule<string>(params[0]);
    } else if (type === 'signal') {
      const signalIndex = rule['signal'];
      const signal = this.signals[signalIndex];

      const sourceIndex = signal['source'];
      const signalType = signal['signal'];

      const sourceObject = this.sceneObjects[sourceIndex].object;

      if (signalType === 'StateChanged') {
        const button = sourceObject as ButtonBase;
        const params = (rule['params'] as Array<any>)?.map((param: any) => parseInt(param));
        if (params.length > 1) {
          console.warn('[RuleBuilder] params contains more than one param');
        }

        if (typeof params[0] === 'boolean') {
          result = new PropertyRule<boolean>(() => true, false);
        } else {
          result = new PropertyRule<number>(() => button.state, params[0]);
        }
      } else if (signalType === 'Entered') {
        const stateId = signal['sourceState'];
        const state = sourceObject.stateMachine!.findById(stateId)!;
        result = new StreamRule(state.entered);
      } else if (signalType === 'Entering') {
        const stateId = signal['sourceState'];
        const state = sourceObject.stateMachine!.findById(stateId);
        if (state) {
          result = new StreamRule(state.entering);
        } else {
          console.error(`[RuleBuilder] can't find state ${stateId} in ${sourceObject}. ignoring.`);
          result = new FalseRule();
        }
      } else if (signalType === 'Clicked') {
        const button = sourceObject as Button;
        result = new StreamRule(button.clicked);
      } else if (signalType === 'Finished') {
        const stateId = signal['sourceState'];
        const state = sourceObject.stateMachine!.findById(stateId)!;
        result = new StreamRule(state.finished);
      } else {
        console.error(`[RuleBuilder] unknown signal type ${signalType}`);
        throw new Error('Unknown signal type');
      }
    } else {
      console.error(`[RuleBuilder] unknown rule type ${type}`);
      throw new Error(`Unknown rule type ${type}`);
    }

    const action = transition['action'];
    if (action) {
      result.transition = actions[action];
    }

    return result;
  }
}

//-----------------------------------------------------------------------------
