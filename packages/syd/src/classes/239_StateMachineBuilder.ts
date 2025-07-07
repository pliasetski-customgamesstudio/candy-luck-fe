import { CompositeState } from './99_CompositeState';
import { SceneObject } from './288_SceneObject';
import { Action } from './84_Action';
import { State } from './208_State';
import { ParallelState } from './193_ParallelState';
import { StateMachine } from './237_StateMachine';
import { RuleBuilder } from './272_RuleBuilder';

export class StateMachineBuilder {
  static Build(
    sceneObject: SceneObject,
    actions: Action[],
    statesDesciptions: Record<string, any>[],
    description: Record<string, any>
  ): State {
    let result: State;

    const childrens = description['children'];
    if (childrens) {
      const mode = description['mode'];
      if (mode === 'Parallel') {
        const states: State[] = new Array<State>(childrens.length);
        for (let i = 0; i < childrens.length; ++i) {
          const childDesc = statesDesciptions[childrens[i]];
          states[i] = StateMachineBuilder.Build(sceneObject, actions, statesDesciptions, childDesc);
        }
        result = new ParallelState(states);
      } else {
        const stateMachine = new StateMachine();
        for (let i = 0; i < childrens.length; ++i) {
          const childDesc = statesDesciptions[childrens[i]];

          const child = StateMachineBuilder.Build(
            sceneObject,
            actions,
            statesDesciptions,
            childDesc
          );

          stateMachine.addState(child);
          if (i === 0) {
            stateMachine.setInitialState(child);
          }
        }
        result = stateMachine;
      }
    } else {
      result = new State();
    }

    result.name = description['id'];
    const type = description['type'];
    if (type === 'final') {
      result.isFinal = true;
    }

    const enter = description['onEnter'];
    if (enter !== null && enter !== undefined) {
      result.enterAction = actions[enter];
    }

    return result;
  }

  static BuildTransitions(
    state: State,
    statesDesciptions: Record<string, any>[],
    description: Record<string, any>,
    actions: Action[],
    ruleBuilder: RuleBuilder
  ): void {
    const childrens = description['children'];
    if (childrens) {
      const composite = state as CompositeState;

      for (let i = 0; i < childrens.length; ++i) {
        const childDesc = statesDesciptions[childrens[i]];
        const from = composite.getChild(i);

        const transitions = childDesc['transitions'] as number[];
        if (transitions) {
          const stateMachine = state as StateMachine;
          const targets = childDesc['targets'];

          for (let j = 0; j < transitions.length; ++j) {
            const rule = ruleBuilder.build(transitions[j], actions);

            const to = stateMachine.getChild(targets[j]);
            stateMachine.addRule(from, to, rule);
          }
        }
        StateMachineBuilder.BuildTransitions(
          from,
          statesDesciptions,
          childDesc,
          actions,
          ruleBuilder
        );
      }
    }
  }
}

//-----------------------------------------------------------------------------
