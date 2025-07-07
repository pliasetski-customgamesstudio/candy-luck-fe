import { IExecuteData } from './executers/i_execute_data';
import { ConfigConstants } from '../configuration/config_constants';
import { StateExecutor } from './executers/state_executor';
import { SenderExecutor } from './executers/sender_executor';
import { LoadSceneExecutor } from './executers/load_scene_executor';
import { VariablesExecutor } from './executers/variables_executor';
import { TutorialExecutor } from './executers/tutorial_executor';
import { NodeExecutor } from './executers/node_executor';
import { ComponentExecutor } from './executers/component_executor';
import { InterpolatePropertyExecutor } from './executers/interpolate_property_executor';
import { PropertyExecute } from './executers/property_execute';
import { GestureExecutor } from './executers/gesture_executor';
import { EmptyExecute } from './executers/empty_execute';

export class ExecuteDataFactory {
  static Create(json: Record<any, any>): IExecuteData {
    if (
      json[ConfigConstants.stateId] !== undefined ||
      json[ConfigConstants.targetStateId] !== undefined ||
      json[ConfigConstants.targetEvent] !== undefined ||
      json[ConfigConstants.listenerId] !== undefined
    ) {
      return StateExecutor.fromJson(json);
    }

    if (
      json[ConfigConstants.executeSend] !== undefined ||
      json[ConfigConstants.executeSendSelectedIndex] !== undefined ||
      json[ConfigConstants.executeSendSelectedValue] !== undefined
    ) {
      return SenderExecutor.fromJson(json);
    }

    if (json[ConfigConstants.sceneName] !== undefined) {
      return LoadSceneExecutor.fromJson(json);
    }

    if (json[ConfigConstants.variableName] !== undefined) {
      return VariablesExecutor.fromJson(json);
    }

    if (json[ConfigConstants.tutorialState] !== undefined) {
      return TutorialExecutor.fromJson(json);
    }

    if (json[ConfigConstants.nodeOperation] !== undefined) {
      return NodeExecutor.fromJson(json);
    }

    if (json[ConfigConstants.targetComponentName] !== undefined) {
      return ComponentExecutor.fromJson(json);
    }

    if (json[ConfigConstants.propertyStartValue] !== undefined) {
      return InterpolatePropertyExecutor.fromJson(json);
    }

    if (json[ConfigConstants.property] !== undefined) {
      return PropertyExecute.fromJson(json);
    }

    if (json[ConfigConstants.targetGesture] !== undefined) {
      return GestureExecutor.fromJson(json);
    }

    if (json[ConfigConstants.duration] !== undefined) {
      return EmptyExecute.fromJson(json);
    }

    throw new Error('No executor was created');
  }
}
