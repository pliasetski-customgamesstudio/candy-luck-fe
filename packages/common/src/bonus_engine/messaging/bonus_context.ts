import { IStorageRepositoryProvider } from '../components/i_storage_repository_provider';

export class BonusContext {
  private _roundProperties: Map<number, Map<string, any>[]> = new Map();
  storageRepositoryProvider: IStorageRepositoryProvider;

  add(roundIndex: number, properties: Map<string, any>): void {
    let roundList: Map<string, any>[];
    if (this._roundProperties.has(roundIndex)) {
      roundList = this._roundProperties.get(roundIndex)!;
    } else {
      roundList = [];
      this._roundProperties.set(roundIndex, roundList);
    }
    roundList.push(properties);
  }

  getProperties(roundIndex: number, propertiesIndex: number): Map<string, any> | null {
    let properties: Map<string, any> | null = null;

    if (this._roundProperties.has(roundIndex)) {
      const roundProperties = this._roundProperties.get(roundIndex)!;
      if (propertiesIndex < roundProperties.length) {
        properties = roundProperties[propertiesIndex];
      }
    }

    return properties;
  }

  getRoundProperties(roundIndex: number): Map<string, any>[] {
    let roundProperties: Map<string, any>[] = [];
    if (this._roundProperties.has(roundIndex)) {
      roundProperties = this._roundProperties.get(roundIndex)!;
    }
    return roundProperties;
  }

  getLast(): Map<string, any> | null {
    let maxRound: number = -1;
    this._roundProperties.forEach((_, key) => {
      if (key > maxRound) {
        maxRound = key;
      }
    });

    const max = this._roundProperties.get(maxRound) || [];
    return max[max.length - 1] || null;
  }
}
