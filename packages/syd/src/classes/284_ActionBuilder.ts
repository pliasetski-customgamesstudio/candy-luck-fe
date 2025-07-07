import { ParallelAction } from './134_ParallelAction';
import { RepeatAction } from './136_RepeatAction';
import { BuildedNode } from './138_BuildedNode';
import { PropertyBinding, PropertyInfo, PropertyType } from './14_PropertyInfo';
import { InterpolateAction } from './24_InterpolateAction';
import { ActionFactory } from './263_ActionFactory';
import { SceneObjectMirror } from './289_SceneObjectMirror';
import { MethodBinding } from './2_MethodInfo';
import { TimeFunctionBuilder } from './33_TimeFunctionBuilder';
import { DiscreteAction } from './34_DiscreteAction';
import { FunctionAction } from './47_FunctionAction';
import { ParamEvent } from './48_ParamEvent';
import { IntervalAction } from './50_IntervalAction';
import { TimedAction } from './60_TimedAction';
import { EmptyAction } from './67_EmptyAction';
import { parseValue } from './globalFunctions';
import { SequenceAction } from './171_SequenceAction';
import { Log } from './81_Log';
import { SceneObjectType } from './SceneObjectType';

export class ActionBuilder {
  static BuildAction(
    objects: BuildedNode[],
    object: BuildedNode,
    actionsDescriptions: Record<string, any>[],
    description: Record<string, any>
  ): IntervalAction {
    const type: string = description['type'];
    if (type == 'parallel') {
      return ActionBuilder._BuildParallelAction(objects, object, actionsDescriptions, description);
    } else if (type == 'reference') {
      return ActionBuilder._BuildReferenceAction(objects, object, actionsDescriptions, description);
    } else if (type == 'repeat') {
      return ActionBuilder._BuildRepeatAction(objects, object, actionsDescriptions, description);
    } else if (type == 'interpolate') {
      return ActionBuilder._BuildInterpolateAction(object, description);
    } else if (type == 'discrete') {
      return ActionBuilder._BuildDiscreteAction(object, description);
    } else if (type == 'sequence') {
      return ActionBuilder._BuildSequenceAction(objects, object, actionsDescriptions, description);
    } else if (type == 'empty') {
      return ActionBuilder._BuildEmptyAction(object, description);
    } else if (type == 'method') {
      return ActionBuilder._BuildMethodAction(object, description);
    } else if (type == 'timed') {
      return ActionBuilder._BuildTimedAction(objects, object, actionsDescriptions, description);
    }
    throw new Error('Unknown action type: ' + type);
  }

  static _ApplyParams(action: IntervalAction, description: Record<string, any>): void {
    const d = description['duration'];
    let duration = 0.0;
    if (d !== undefined) {
      duration = d * 0.001;
    }
    action.withDuration(duration);
  }

  static _BuildEmptyAction(object: BuildedNode, desc: Record<string, any>): IntervalAction {
    const result = new EmptyAction();
    ActionBuilder._ApplyParams(result, desc);
    return result;
  }

  static _BuildReferenceAction(
    objects: BuildedNode[],
    object: BuildedNode,
    actionsDescriptions: Record<string, any>[],
    description: Record<string, any>
  ): IntervalAction {
    const targetIndex = description['target'];
    const actionIndex = description['action'];
    const targetObject = objects[targetIndex];
    if (!targetObject.actions) {
      const targetActionsDescriptions: number[] = targetObject.description['actions'] as number[];
      targetObject.actions = new Array(targetActionsDescriptions.length);
      for (let i = 0; i < targetActionsDescriptions.length; ++i) {
        targetObject.actions[i] = ActionBuilder.BuildAction(
          objects,
          targetObject,
          actionsDescriptions,
          actionsDescriptions[targetActionsDescriptions[i]]
        );
      }
    }
    return targetObject.actions[actionIndex] as IntervalAction;
  }

  static _BuildTimedAction(
    objects: BuildedNode[],
    object: BuildedNode,
    actionsDescriptions: Record<string, any>[],
    description: Record<string, any>
  ): IntervalAction {
    const action = description['action'];
    const childDesc = actionsDescriptions[action];
    const child = ActionBuilder.BuildAction(objects, object, actionsDescriptions, childDesc);
    const result = new TimedAction(child);
    ActionBuilder._ApplyParams(result, description);
    return result;
  }

  static _BuildParallelAction(
    objects: BuildedNode[],
    object: BuildedNode,
    actionsDescriptions: Record<string, any>[],
    description: Record<string, any>
  ): IntervalAction {
    const childIndices = description['actions'];
    const childs: IntervalAction[] = new Array(childIndices.length);
    for (let i = 0; i < childIndices.length; ++i) {
      const desc = actionsDescriptions[childIndices[i]];
      childs[i] = ActionBuilder.BuildAction(objects, object, actionsDescriptions, desc);
    }
    return new ParallelAction(childs);
  }

  static _BuildSequenceAction(
    objects: BuildedNode[],
    object: BuildedNode,
    actionsDescriptions: Record<string, any>[],
    description: Record<string, any>
  ): IntervalAction {
    const childIndices = description['actions'];
    const childs = new Array(childIndices.length);
    for (let i = 0; i < childIndices.length; ++i) {
      const desc = actionsDescriptions[childIndices[i]];
      childs[i] = ActionBuilder.BuildAction(objects, object, actionsDescriptions, desc);
    }
    return new SequenceAction(childs);
  }

  static _BuildRepeatAction(
    objects: BuildedNode[],
    object: BuildedNode,
    actionsDescriptions: Record<string, any>[],
    description: Record<string, any>
  ): IntervalAction {
    const action = description['action'];
    const desc = actionsDescriptions[action];
    const child = ActionBuilder.BuildAction(objects, object, actionsDescriptions, desc);
    return new RepeatAction(child);
  }

  static _BuildMethodAction(object: BuildedNode, desc: Record<string, any>): IntervalAction {
    const methodName: string = desc['method'];
    const doOnEnd: boolean = desc['doOnEnd'];
    const params = desc['params'] ?? null;
    const method = SceneObjectMirror.GetMethodInfo(methodName);
    if (!method) {
      Log.Error('ActionBuilder unresolved method ' + methodName + ' in ' + object);
      throw new Error('ActionBuilder unresolved method ' + methodName + ' in ' + object);
    }
    let binding: MethodBinding;
    if (params) {
      const event = new ParamEvent<string>(params[0]);
      binding = method.bind(object.object, event);
    } else {
      binding = method.bind(object.object);
    }
    const result = new FunctionAction(binding, doOnEnd);
    ActionBuilder._ApplyParams(result, desc);
    return result;
  }

  static _GetPropertyInfo(
    objectType: SceneObjectType,
    propertyName: string
  ): PropertyInfo<any, any> {
    const property = SceneObjectMirror.GetPropertyInfo(objectType, propertyName);
    if (!property) {
      throw new Error(
        `ActionBuilder unknown property objectType=${objectType}; propertyName=${propertyName}`
      );
    }
    return property;
  }

  static _BuildDiscreteAction(
    object: BuildedNode,
    description: Record<string, any>
  ): IntervalAction {
    const propertyName: string = description['property'];
    const property = ActionBuilder._GetPropertyInfo(object.objectType, propertyName);
    const binding = property.bind(object.object);
    const v = description['value'];
    const value = parseValue(property.parseType, v, property.defaultValue);
    const discrete: DiscreteAction<any> = ActionBuilder._CreateDiscreteAction(property.type);
    discrete.withValue(value);
    discrete.valueChange.listen((v) => binding(v));
    ActionBuilder._ApplyParams(discrete, description);
    return discrete;
  }

  static _BuildInterpolateAction(
    object: BuildedNode,
    description: Record<string, any>
  ): IntervalAction {
    const propertyName: string = description['property'];
    const property: PropertyInfo<any, any> = ActionBuilder._GetPropertyInfo(
      object.objectType,
      propertyName
    );
    const binding: PropertyBinding<any> = property.bind(object.object);
    const fv = description['start'];
    const tv = description['end'];
    const from = parseValue(property.parseType, fv, property.defaultValue);
    const to = parseValue(property.parseType, tv, property.defaultValue);
    const interpolate: InterpolateAction<any> = ActionBuilder._CreateInterpolateAction(
      property.type
    );
    interpolate.withValues(from, to);
    interpolate.valueChange.listen((v) => binding(v));
    ActionBuilder._ApplyParams(interpolate, description);
    const timeFunction = description['timeFunction'];
    if (timeFunction) {
      const params: number[] = !description['timeParameters']
        ? []
        : (description['timeParameters'] as number[]);
      const func = TimeFunctionBuilder.BuildTimeFunction(timeFunction, params);
      interpolate.withTimeFunction(func);
    }
    return interpolate;
  }

  static _CreateInterpolateAction(type: PropertyType): InterpolateAction<any> {
    const result = ActionFactory.CreateInterpolate(type);
    if (!result) {
      throw new Error(`ActionBuilder can't create InterpolateAction<${type}>`);
    }
    return result;
  }

  static _CreateDiscreteAction(type: PropertyType): DiscreteAction<any> {
    const result = ActionFactory.CreateDiscrete(type);
    if (!result) {
      throw new Error(`ActionBuilder can't create DiscreteAction<${type}>`);
    }
    return result;
  }
}
