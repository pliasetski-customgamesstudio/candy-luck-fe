export class GameConfigManager {
  private readonly _configUri: string = 'game-config.json';

  constructor(private readonly path: string) {}

  public async loadConfig(): Promise<Map<any, any> | null> {
    if (!this.path) {
      return null;
    }

    try {
      const response = await fetch(this.getUrl());
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }

  private getUrl(): string {
    return `${this.path}/${this._configUri}`;
  }
}
