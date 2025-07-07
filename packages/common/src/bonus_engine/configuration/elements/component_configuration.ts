import { ComponentType, parseComponentTypeEnum } from '../../enums/componet_type';
import { ConfigConstants } from '../config_constants';

export class ComponentConfiguration {
  type: ComponentType;
  name: string;

  constructor(json: Record<string, any>) {
    this.type = parseComponentTypeEnum(json[ConfigConstants.componentType]);
    this.name = json[ConfigConstants.componentName];
  }
}
