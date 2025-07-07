import { ComponentConfiguration } from './component_configuration';
import { parseSelectActionEnum, SelectAction } from '../../enums/select_action';
import { ConfigConstants } from '../config_constants';

export class SenderSetConfiguration extends ComponentConfiguration {
  static fromJson(json: Record<string, any>): SenderSetConfiguration {
    const config = new SenderSetConfiguration(json);
    config.selectAction = json[ConfigConstants.selectAction]
      ? parseSelectActionEnum(json[ConfigConstants.selectAction])
      : null;
    return config;
  }

  public selectAction: SelectAction | null;
}
