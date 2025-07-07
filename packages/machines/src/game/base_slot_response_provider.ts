import { Container } from '@cgs/syd';
import { ResponseProvider } from '../reels_engine/reel_net_api/response_provider';
import { ExtraBetDTO } from '@cgs/network';
import { InternalBet } from '@cgs/common';

export abstract class BaseSlotResponseProvider<TResponse> extends ResponseProvider<TResponse> {
  private _container: Container;
  public get container(): Container {
    return this._container;
  }

  constructor(container: Container) {
    super();
    this._container = container;
  }

  public createBets(
    gameId: string,
    responseBets: number[],
    extraBets: ExtraBetDTO[],
    savedBets: number[]
  ): InternalBet[] {
    const bets: InternalBet[] = [];
    if (!responseBets) {
      responseBets = [];
    }

    if (!extraBets) {
      extraBets = [];
    }

    for (const bet of responseBets) {
      const internalBet: InternalBet = new InternalBet();

      const value: number = bet;
      internalBet.bet = value;
      internalBet.effectiveBet = -1.0;

      bets.push(internalBet);
    }

    for (const bet of extraBets) {
      const internalBet: InternalBet = new InternalBet();

      const betValue: number = bet.bet!;
      const effectiveBetValue: number = bet.effectiveBet!;

      internalBet.bet = betValue;
      internalBet.effectiveBet = effectiveBetValue;

      // Sometimes bets can be equals after truncate.
      // We decide to use only one of equals bets.
      if (
        !bets.some((b) => b.bet === internalBet.bet && b.effectiveBet === internalBet.effectiveBet)
      ) {
        bets.push(internalBet);
      }
    }

    if (savedBets) {
      for (const bet of savedBets) {
        const internalBet: InternalBet = new InternalBet();

        const value: number = bet;
        internalBet.bet = value;
        internalBet.effectiveBet = -1.0;
        internalBet.isXtremeBet = bet > responseBets[responseBets.length - 1];
        if (
          !bets.some(
            (b) => b.bet === internalBet.bet && b.effectiveBet === internalBet.effectiveBet
          )
        ) {
          bets.push(internalBet);
        }
      }
    }
    bets.sort((x, y) => {
      if (x.bet > y.bet) {
        return 1;
      }
      if (x.bet === y.bet) {
        return 0;
      }
      return -1;
    });
    return bets;
  }
}
