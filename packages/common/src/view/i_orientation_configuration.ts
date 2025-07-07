interface IOrientationConfiguration {
  isPortrait: boolean;
  needRotate(resourcePath: string, sceneName: string): boolean;
}

export class EmptyOrientationConfiguration implements IOrientationConfiguration {
  isPortrait: boolean = false;

  needRotate(_resourcePath: string, _sceneName: string): boolean {
    return false;
  }
}
