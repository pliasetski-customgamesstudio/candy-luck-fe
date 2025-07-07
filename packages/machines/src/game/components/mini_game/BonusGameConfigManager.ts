export class BonusGameConfigManager {
  private readonly _configUri: string = 'config.json';
  private readonly _configs: Map<string, Promise<any>> = new Map();

  constructor(
    private readonly path: string,
    private readonly bonusGames: string[]
  ) {
    this.bonusGames.forEach((bonusGame) => {
      this._configs.set(bonusGame, this.loadConfig(bonusGame));
    });
  }

  public getConfig(bonusGame: string): Promise<any> {
    return this._configs.get(bonusGame) || Promise.resolve(null);
  }

  private async loadConfig(bonusGame: string): Promise<Map<any, any> | null> {
    if (!this.path) {
      return null;
    }

    try {
      const response = await fetch(this.getUrl(bonusGame));
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }

  private getUrl(bonusGame: string): string {
    return `${this.path}/bonus_${bonusGame}/${this._configUri}`;
  }
}
