import { IBetUpdaterProvider } from './i_bet_updater_provider';
import { StartGameResponseProvider } from '../start_game_response_provider';
import {
  InternalBet,
  ISimpleUserInfoHolder,
  ISpinResponse,
  T_ISimpleUserInfoHolder,
  XtremeBetInfo,
} from '@cgs/common';
import { Container, EventDispatcher, EventStream } from '@cgs/syd';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { T_IGameStateMachineProvider, T_StartGameResponseProvider } from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';

export class BetUpdaterProvider implements IBetUpdaterProvider {
  private _startGameResponseProvider: StartGameResponseProvider;
  private _bets: InternalBet[];
  private _configuredBets: { [key: string]: { [key: string]: { [key: number]: number[] } } };
  private _defaultBet: number;
  public xtremeBetInfo: XtremeBetInfo;
  private _betsUpdated: EventDispatcher<void> = new EventDispatcher<void>();
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _slotParams: IGameParams;
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _previousLevel: number = -1;

  constructor(container: Container, slotParams: IGameParams) {
    this._startGameResponseProvider = container.forceResolve(T_StartGameResponseProvider);
    this._userInfoHolder = container.forceResolve<ISimpleUserInfoHolder>(T_ISimpleUserInfoHolder);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._slotParams = slotParams;
  }

  get bets(): InternalBet[] {
    return this._bets;
  }

  get configuredBets(): { [key: string]: { [key: string]: { [key: number]: number[] } } } {
    return this._configuredBets;
  }

  get defaultBet(): number {
    return this._defaultBet;
  }

  get betsUpdated(): EventStream<void> {
    return this._betsUpdated.eventStream;
  }

  async updateBets(): Promise<void> {
    // if (this._previousLevel >= this._userInfoHolder.user.level) {
    //   return;
    // }
    //
    // this._previousLevel = this._userInfoHolder.user.level;

    try {
      if (this._gameStateMachine.curResponse.bets.length > 0) {
        this._bets = this._gameStateMachine.curResponse.bets;
        this._defaultBet = this._gameStateMachine.curResponse.defaultBet;
      } else {
        const result = await this._startGameResponseProvider.doRequest();
        this._bets = result.bets;
        this._defaultBet = result.defaultBet;
      }
      this.xtremeBetInfo = this._gameStateMachine.curResponse.xtremeBetInfo;
      if (this._betsUpdated && this._bets && typeof this._defaultBet === 'number') {
        this._betsUpdated.dispatchEvent();
      }
    } catch (ex) {
      //
    }
    await this.updateConfiguredBets();
  }

  async updateBetsWithoutLevelUp(): Promise<void> {
    try {
      if (this._gameStateMachine.curResponse.bets.length > 0) {
        this._bets = this._gameStateMachine.curResponse.bets;
      } else {
        const result = await this._startGameResponseProvider.doRequest();
        this._bets = result.bets;
        this._defaultBet = result.defaultBet;
      }
      this.xtremeBetInfo = this._gameStateMachine.curResponse.xtremeBetInfo;
      if (this._betsUpdated) {
        this._betsUpdated.dispatchEvent();
      }
    } catch (ex) {
      //
    }
    await this.updateConfiguredBets();
  }

  async updateConfiguredBets(): Promise<void> {
    try {
      if (
        this._gameStateMachine.curResponse.configuredBets &&
        Object.keys(this._gameStateMachine.curResponse.configuredBets).length > 0
      ) {
        this._configuredBets = this._gameStateMachine.curResponse.configuredBets;
      } else {
        const result = await this._startGameResponseProvider.doRequest();
        this._configuredBets = result.configuredBets;
      }
    } catch (ex) {
      //
    }
  }
}
