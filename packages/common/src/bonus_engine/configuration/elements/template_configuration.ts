import { ConfigConstants } from '../config_constants';

export class TemplateConfiguration {
  static fromJson(json: Record<string, string | number>): TemplateConfiguration {
    const format = json[ConfigConstants.templateFormat].toString();
    const count =
      json[ConfigConstants.templateCount] !== undefined
        ? (json[ConfigConstants.templateCount] as number)
        : 1;

    return new TemplateConfiguration(format, count);
  }

  public format: string;
  public count: number;

  constructor(format: string, count: number) {
    this.format = format;
    this.count = count;
  }
}
