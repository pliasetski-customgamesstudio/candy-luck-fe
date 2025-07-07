import { ComponentConfiguration } from './component_configuration';
import { TemplateConfiguration } from './template_configuration';
import { ConfigConstants } from '../config_constants';

export class HistoryItemsConfiguration extends ComponentConfiguration {
  templateConfiguration: TemplateConfiguration;
  historyMessageProperty: string;

  constructor(json: Record<string, any>) {
    super(json);
    this.templateConfiguration = TemplateConfiguration.fromJson(json[ConfigConstants.template]);
    this.historyMessageProperty = json[ConfigConstants.historyMessageProperty];
  }
}
