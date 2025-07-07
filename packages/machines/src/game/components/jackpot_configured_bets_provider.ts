import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { SlotSession, SlotSessionProperties } from '../common/slot_session';
import { Container } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider, T_ISlotSessionProvider } from '../../type_definitions';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';

export class JackpotConfiguredBetsController {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _slotSession: SlotSession;
  private _bets: Map<number, number[]>;

  constructor(container: Container) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameStateMachine.init.entering.listen(() => this.saveNewBets());
    this._gameStateMachine.regularSpins.entered.listen(() => this.saveNewBets());
    this._gameStateMachine.beginFreeSpins.entered.listen(() => this.saveNewBetsOnFreeSpins());
    this._gameStateMachine.beginBonus.entered.listen(() => this.saveNewBetsOnFreeSpins());
    this._gameStateMachine.beginScatter.entered.listen(() => this.saveNewBetsOnFreeSpins());
    this._gameStateMachine.endScatter.entered.listen(() => this.saveNewBetsOnFreeSpins());
    this._slotSession.propertyChanged.listen(() => this._onNewConfiguredBetsAvailable);
  }

  private _onNewConfiguredBetsAvailable(property: SlotSessionProperties): void {
    switch (property) {
      case SlotSessionProperties.NewConfiguredBetsAvailable:
        this.saveNewBets();
        break;
      case SlotSessionProperties.NewBetAvailable:
        this.saveNewBets();
        break;
    }
  }

  private saveNewBets(): void {
    if (
      this._slotSession.machineInfo.configuredBets?.['DividedProgressiveCollector']?.[
        'configuredBets'
      ]
    ) {
      const oldBets = this._bets;
      const newBets =
        this._slotSession.machineInfo.configuredBets['DividedProgressiveCollector'][
          'configuredBets'
        ];
      this._bets = new Map<number, number[]>();
      Object.keys(newBets).forEach((key: number | string) => {
        // @ts-ignore
        const value = newBets[key];
        if (typeof key === 'string') {
          const keyDouble = parseFloat(key);
          this._bets.set(keyDouble, value);
        } else {
          this._bets.set(key, value);
        }
      });
      oldBets?.forEach((value, key) => {
        if (!this._bets.has(key)) {
          this._bets.set(key, value);
        }
      });
    }
  }

  private saveNewBetsOnFreeSpins(): void {
    if (
      this._gameStateMachine.curResponse.configuredBets?.['DividedProgressiveCollector']?.[
        'configuredBets'
      ]
    ) {
      const oldBets = this._bets;
      const newBets =
        this._gameStateMachine.curResponse.configuredBets['DividedProgressiveCollector'][
          'configuredBets'
        ];
      this._bets = new Map<number, number[]>();

      Object.keys(newBets).forEach((key) => {
        // @ts-ignore
        const value = newBets[key];
        if (typeof key === 'string') {
          const keyDouble = parseFloat(key);
          this._bets.set(keyDouble, value);
        } else {
          this._bets.set(key, value);
        }
      });
      oldBets?.forEach((value, key) => {
        if (!this._bets.has(key)) {
          this._bets.set(key, value);
        }
      });
    }
  }

  get Bets(): Map<number, number[]> {
    return this._bets;
  }

  get CurrentJackpots(): number[] | null {
    if (!this._bets) {
      return null;
    }

    if (this._bets.has(this._slotSession.currentBet.bet)) {
      return this._bets.get(this._slotSession.currentBet.bet)!;
    } else if (
      this._slotSession.currentBet.bet >
      parseFloat([...this._bets.keys()][this._bets.size - 1].toString())
    ) {
      const values: number[] = [];
      for (const value of [...this._bets.values()][this._bets.size - 1]) {
        values.push(parseFloat(value.toString()));
      }
      return values;
    } else {
      const values: number[] = [];
      for (const value of [...this._bets.values()][0]) {
        values.push(parseFloat(value.toString()));
      }

      return values;
    }
  }
}
