import { ComponentConfiguration } from './component_configuration';
import { IExecuteData } from '../../execute/executers/i_execute_data';
import { ConfigConstants } from '../config_constants';
import { ExecuteDataFactory } from '../../execute/execute_data_factory';

export class TutorialConfiguration extends ComponentConfiguration {
  public delay: number;
  public startExecute: IExecuteData[];
  public stopExecute: IExecuteData[];

  constructor(json: Record<string, any>) {
    super(json);
    this.delay = json[ConfigConstants.tutorialDelay];
    this.startExecute = json[ConfigConstants.tutorialStartExecute].map((j: any) =>
      ExecuteDataFactory.Create(j)
    );
    this.stopExecute = json[ConfigConstants.tutorialStopExecute].map((j: any) =>
      ExecuteDataFactory.Create(j)
    );
  }
}
