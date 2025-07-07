import { ConfigConstants } from '../config_constants';

export class ResourcesConfiguration {
  static fromJson(json: Record<string, any>): ResourcesConfiguration {
    const config = new ResourcesConfiguration();
    config.sceneName = json[ConfigConstants.sceneName];
    config.name = json[ConfigConstants.resourceName];
    return config;
  }

  public sceneName: string;
  public name: string;
}
