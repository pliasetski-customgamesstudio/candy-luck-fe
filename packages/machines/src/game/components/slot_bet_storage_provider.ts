import { IClientProperties, T_IClientProperties } from '@cgs/common';
import { Container } from '@cgs/syd';
import { CommonClientDataRepositoryProvider } from './common_client_data_repository_provider';
import { GameComponentProvider } from './game_component_provider';
import { T_CommonClientDataRepositoryProvider } from '../../type_definitions';

export class SlotBetStorageProvider extends GameComponentProvider {
  private static readonly SLOT_BET_STORAGE_KEY: string = 'SlotBetStorageKey';

  private _clientDataRepositoryProvider: CommonClientDataRepositoryProvider;
  private _clientProperties: IClientProperties;

  constructor(container: Container) {
    super();
    this._clientDataRepositoryProvider = container.forceResolve<CommonClientDataRepositoryProvider>(
      T_CommonClientDataRepositoryProvider
    );
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
  }

  public getSavedBet(): number {
    const isFeatureEnabled: boolean = false;

    let bet: number = 0.0;
    if (isFeatureEnabled) {
      const betString: string | null = this._clientDataRepositoryProvider.readItem(
        SlotBetStorageProvider.SLOT_BET_STORAGE_KEY
      );
      bet = betString ? parseFloat(betString) : 0.0;
    }

    return bet;
  }

  public saveBet(bet: number, lines: number): void {
    this._clientDataRepositoryProvider.createItem(
      SlotBetStorageProvider.SLOT_BET_STORAGE_KEY,
      (bet * lines).toString()
    );
  }
}
