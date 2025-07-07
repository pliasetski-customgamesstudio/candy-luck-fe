import { IRoundMessageResolver } from '../../interfaces/i_round_message_resolver';
import { PickUntilFailRoundResolver } from './pick_until_fail_round_resolver';
import { FreeSpinsWrapperResolver } from './free_spins_wrapper_resolver';
import { CollectSymbolsRoundResolver } from './collect_symbols_round_resolver';
import { InfiniteRoundResolver } from './infinite_round_resolver';
import { PaytableRoundResolver } from './paytable_round_resolver';
import { CollectSymbolsRoundWithPaytableResolver } from './collect_symbols_round_with_paytable_resolver';
import { DefaultRoundResolver } from './default_round_resolver';

export class RoundResolverFactory {
  private _resolvers: Map<string, IRoundMessageResolver> = new Map();

  public resolver(type: string = 'default'): IRoundMessageResolver {
    if (this._resolvers.has(type)) {
      return this._resolvers.get(type)!;
    }

    let resolver: IRoundMessageResolver | null = null;
    switch (type) {
      case 'T4':
        resolver = new PickUntilFailRoundResolver();
        break;
      case 'T4FS':
        resolver = new FreeSpinsWrapperResolver();
        break;
      case 'C':
        resolver = new CollectSymbolsRoundResolver();
        break;
      case 'infinite':
        resolver = new InfiniteRoundResolver();
        break;
      case 'WOF':
        resolver = new PaytableRoundResolver();
        break;
      case 'CWOF':
        resolver = new CollectSymbolsRoundWithPaytableResolver();
        break;
      default:
        resolver = new DefaultRoundResolver();
        break;
    }
    this._resolvers.set(type, resolver);
    return resolver;
  }
}
