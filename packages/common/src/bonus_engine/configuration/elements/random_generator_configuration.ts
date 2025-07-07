import { ComponentConfiguration } from './component_configuration';
import { TemplateConfiguration } from './template_configuration';
import {
  parseRandomGeneratorTypeEnum,
  RandomGeneratorType,
} from '../../enums/random_generator_type';
import {
  parseRandomGeneratorModeEnum,
  RandomGeneratorMode,
} from '../../enums/random_generator_mode';
import { ConfigConstants } from '../config_constants';

export class RandomGeneratorConfiguration extends ComponentConfiguration {
  templateConfiguration: TemplateConfiguration;
  generatorType: RandomGeneratorType;
  mode: RandomGeneratorMode;

  constructor(json: Record<string, any>) {
    super(json);
    this.templateConfiguration = TemplateConfiguration.fromJson(json[ConfigConstants.template]);
    this.generatorType = json[ConfigConstants.randomGeneratorType]
      ? parseRandomGeneratorTypeEnum(json[ConfigConstants.randomGeneratorType])
      : RandomGeneratorType.Default;
    this.mode = json[ConfigConstants.randomGeneratorMode]
      ? parseRandomGeneratorModeEnum(json[ConfigConstants.randomGeneratorMode])
      : RandomGeneratorMode.Auto;
  }
}
