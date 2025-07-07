import { IConfiguration } from './i_configuration';
import { RoundConfiguration } from './round_configuration';
import { ResourcesConfiguration } from './resources_configuration';
import { TemplateConfiguration } from './template_configuration';
import { ConfigConstants } from '../config_constants';

export class BonusConfiguration implements IConfiguration {
  static fromJson(json: Record<string, any>): BonusConfiguration {
    const rounds = json[ConfigConstants.rounds].map((x: any) => RoundConfiguration.fromJson(x));

    const sharedResources = json[ConfigConstants.sharedResources]
      ? json[ConfigConstants.sharedResources].map((x: any) => ResourcesConfiguration.fromJson(x))
      : [];

    return new BonusConfiguration(null, rounds, sharedResources, null);
  }

  private readonly _rounds: RoundConfiguration[];
  private readonly _sharedResources: ResourcesConfiguration[];
  public name: string | null;
  public templateConfig: TemplateConfiguration | null;

  constructor(
    name: string | null,
    screens: RoundConfiguration[],
    sharedResources: ResourcesConfiguration[],
    templateConfiguration: TemplateConfiguration | null
  ) {
    this.name = name;
    this.templateConfig = templateConfiguration;
    this._rounds = screens;
    this._sharedResources = sharedResources;
  }

  get rounds(): RoundConfiguration[] {
    return this._rounds;
  }

  get sharedResources(): ResourcesConfiguration[] {
    return this._sharedResources;
  }
}
