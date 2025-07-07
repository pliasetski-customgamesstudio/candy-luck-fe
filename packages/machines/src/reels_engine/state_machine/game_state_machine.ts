import { Container, StateMachine } from '@cgs/syd';
import { ISpinParams } from '../game_components/i_spin_params';
import { ResponseProvider } from '../reel_net_api/response_provider';
import { BonusGameEvent } from './events/bonus_game_event';
import { SpinEvent } from './events/spin_event';
import { ResponseHolder } from './response_holder';
import { AccelerateToWaitAccelerationComplete } from './rules/accelerate_to_wait_acceleration_complete';
import { BeginRespinToAccelerate } from './rules/begin_respin_to_accelerate';
import { BonusToBeginFreeSpins } from './rules/bonus_to_begin_free_spins';
import { BonusToBeginScater } from './rules/bonus_to_begin_scatter';
import { BonusToEndFreeSpins } from './rules/bonus_to_end_free_spins';
import { BonusToFreeSpins } from './rules/bonus_to_free_spins';
import { EndFreeSpinsPopupPopupRule } from './rules/end_free_spins_popup_event_rule';
import { EndFreeSpinsToRegularSpins } from './rules/end_free_spins_to_regular_spins';
import { BaseGameRule } from './rules/infra/base_game_rule';
import { ResumeRule } from './rules/infra/resume_rule';
import { SpinRule } from './rules/infra/spin_rule';
import { InitToBonusRecovery } from './rules/init_to_bonus_recovery';
import { InitToFreeSpinsRecovery } from './rules/init_to_free_spins_recovery';
import { InitToIdle } from './rules/init_to_idle';
import { InitToScatter } from './rules/init_to_scatter';
import { RespinToBeginRespin } from './rules/respin_to_begin_respin';
import { ScatterToBonus } from './rules/scatter_to_bonus';
import { ScatterToEndFreeSpins } from './rules/scatter_to_end_free_spins';
import { ScatterToFreeSpins } from './rules/scatter_to_free_spins';
import { ScatterToRegularSpins } from './rules/scatter_to_regular_spins';
import { ShortWinLinesToRegularSpins } from './rules/short_win_lines_to_regular_spins';
import { StartGambleRule } from './rules/start_gamble_rule';
import { StartGambleToRegularSpins } from './rules/start_gamble_to_regular_spins';
import { StartGambleToScatter } from './rules/start_gamble_to_scatter';
import { StopToAutoSpin } from './rules/stop_to_auto_spin';
import { StopToBeginCustomFreeSpins } from './rules/stop_to_begin_custom_free_spins';
import { StopToBeginFreeSpins } from './rules/stop_to_begin_free_spins';
import { StopToBeginRespin } from './rules/stop_to_begin_respin';
import { StopToBeginScatter } from './rules/stop_to_begin_scatter';
import { StopToBonus } from './rules/stop_to_bonus';
import { StopToEndFreeSpins } from './rules/stop_to_end_free_spins';
import { StopToFreeSpins } from './rules/stop_to_free_spins';
import { StopToRegularSpin } from './rules/stop_to_regular_spin';
import { StopToRespin } from './rules/stop_to_respin';
import { WaitAccelerationCompleteRule } from './rules/wait_acceleration_complete_rule';
import { WaitResponseEventRule } from './rules/wait_response_event_rule';
import { AccelerateState } from './states/accelerate_state';
import { BaseGameState } from './states/base_game_state';
import { SuspendState } from './states/suspend_state';
import { ContextMarshaller, ISpinResponse } from '@cgs/common';
import { GambleEvent } from './events/gamble_event';
import { ResumeEvent } from './events/resume_event';
import { StartGambleEvent } from './events/start_gamble_event';
import { StopEvent } from './events/stop_event';
import { StopRule } from './rules/infra/stop_rule';
import { BonusGameRule } from './rules/infra/bonus_game_rule';
import { ResumeTransition } from './rules/infra/resume_transition';
import { T_ISpinParams } from '../../type_definitions';

export class GameStateMachineStates {
  static readonly Accelerate = 'accelerate';
  static readonly WaitRequest = 'waitRequest';
  static readonly WaitAccelerationComplete = 'waitAccelerationComplete';
  static readonly Bonus = 'bonus';
  static readonly EndBonus = 'endBonus';
  static readonly BonusRecovery = 'bonusRecovery';
  static readonly FreeSpin = 'freeSpin';
  static readonly FreeSpinRecovery = 'freeSpinRecovery';
  static readonly FreeSpinsCompletion = 'freeSpinsCompletion';
  static readonly Idle = 'idle';
  static readonly InitGame = 'initGame';
  static readonly MakeRequest = 'makeRequest';
  static readonly RegularSpin = 'regularSpin';
  static readonly AutoSpin = 'AutoSpin';
  static readonly BeginRespin = 'BeginRespin';
  static readonly Respin = 'Respin';
  static readonly Stop = 'stop';
  static readonly Animation = 'animation';
  static readonly EndAnimation = 'endAnimation';
  static readonly ShortWinLines = 'ShortWinLines';
  static readonly Stopping = 'stopping';
  static readonly ImmediatelyStop = 'immediatelyStop';
  static readonly BeginFreeSpins = 'beginFreeSpins';
  static readonly EndOfFreeSpins = 'endOfFreeSpins';
  static readonly BeginScatter = 'beginScatter';
  static readonly Scatter = 'scatter';
  static readonly BeginGiftSpins = 'beginGiftSpins';
  static readonly GiftSpin = 'giftSpin';
  static readonly GiftSpinRecovery = 'giftSpinRecovery';
  static readonly EndOfFreeSpinsPopup = 'endFreeSpinsPopup';
  static readonly ReBuyFreeSpinsPopup = 'reBuyFreeSpinsPopup';
  static readonly BeginFreeSpinsPopup = 'beginFreeSpinsPopup';
  static readonly BeginBonus = 'beginBonus';
  static readonly EndScatter = 'endScatter';
  static readonly VerifyBalance = 'verifyBalance';
  static readonly BeginCollapse = 'beginCollapseState';
  static readonly Collapse = 'collapseState';
  static readonly EndCollapse = 'endCollapseState';
  static readonly StartGamble = 'startGamble';
}

export type RuleFactory<T extends ISpinResponse> = (
  from: BaseGameState<T>,
  r: ResponseHolder<T>
) => BaseGameRule<T>;

export class GameStateMachine<TResponse extends ISpinResponse> {
  private _container: Container;
  private _responseHolder: ResponseHolder<TResponse>;
  private _stm: StateMachine;
  private _responseProvider: ResponseProvider<TResponse>;
  private _spinParams: ISpinParams;
  private _shortWinLinesGroupNames: string[] | null;

  public get container(): Container {
    return this._container;
  }
  public responseProvider: ResponseProvider<TResponse>;
  public shortWinLinesGroupNames: string[];

  public get curResponse(): TResponse {
    return this._responseHolder.curResponse;
  }
  public set curResponse(value: TResponse) {
    this._responseHolder.curResponse = value;
  }

  public get prevResponse(): TResponse {
    return this._responseHolder.preResponse;
  }

  public set prevResponse(value: TResponse) {
    this._responseHolder.preResponse = value;
  }

  public get rootState(): StateMachine {
    return this._stm;
  }

  endAnimation: BaseGameState<TResponse>;
  init: BaseGameState<TResponse>;
  bonusRecovery: BaseGameState<TResponse>;
  freeSpinsRecovery: BaseGameState<TResponse>;
  freeSpinsCompletion: BaseGameState<TResponse>;
  idle: BaseGameState<TResponse>;
  accelerate: BaseGameState<TResponse>;
  waitRequest: BaseGameState<TResponse>;
  waitaccelerationComplete: BaseGameState<TResponse>;
  makeRequest: BaseGameState<TResponse>;
  verifyBalance: BaseGameState<TResponse>;
  stop: BaseGameState<TResponse>;
  animation: BaseGameState<TResponse>;
  shortWinLines: BaseGameState<TResponse>;
  stopping: BaseGameState<TResponse>;
  immediatelyStop: BaseGameState<TResponse>;
  beginFreeSpins: BaseGameState<TResponse>;
  beginFreeSpinsPopup: BaseGameState<TResponse>;
  endFreeSpins: BaseGameState<TResponse>;
  endFreeSpinsPopup: BaseGameState<TResponse>;
  reBuyFreeSpinsPopup: BaseGameState<TResponse>;
  beginBonus: BaseGameState<TResponse>;
  bonus: BaseGameState<TResponse>;
  endBonus: BaseGameState<TResponse>;
  endScatter: BaseGameState<TResponse>;
  regularSpins: BaseGameState<TResponse>;
  autoSpins: BaseGameState<TResponse>;
  beginRespin: BaseGameState<TResponse>;
  respin: BaseGameState<TResponse>;
  freeSpins: BaseGameState<TResponse>;
  beginScatter: BaseGameState<TResponse>;
  scatter: BaseGameState<TResponse>;
  startGamble: BaseGameState<TResponse>;

  constructor(
    container: Container,
    responseProvider: ResponseProvider<TResponse>,
    shortWinLinesGroupNames: string[] | null = null
  ) {
    this._container = container;
    this._responseHolder = new ResponseHolder<TResponse>();
    this._responseProvider = responseProvider;
    this._stm = new StateMachine();
    this._shortWinLinesGroupNames = shortWinLinesGroupNames;
    this.createStates();
    this.createRules();
    this._spinParams = this._container.forceResolve<ISpinParams>(T_ISpinParams);
  }

  protected createStates(): void {
    this.init = this.createBaseState('initGame');
    this.accelerate = this.createRequestState('accelerate');
    this.waitRequest = this.createBaseState(GameStateMachineStates.WaitRequest);
    this.waitaccelerationComplete = this.createBaseState(
      GameStateMachineStates.WaitAccelerationComplete
    );
    this.freeSpinsRecovery = this.createBaseState('freeSpinRecovery');
    this.freeSpinsCompletion = this._createSuspendState('freeSpinsCompletion');
    this.idle = this._createSuspendState('idle');
    this.makeRequest = this.createBaseState('makeRequest');
    this.stopping = this.createBaseState('stopping');
    this.immediatelyStop = this.createBaseState('immediatelyStop');
    this.verifyBalance = this.createBaseState(GameStateMachineStates.VerifyBalance);
    this.stop = this.createBaseState('stop');
    this.animation = this.createBaseState(GameStateMachineStates.Animation);
    this.endAnimation = this.createBaseState(GameStateMachineStates.EndAnimation);
    this.shortWinLines = this.createBaseState(GameStateMachineStates.ShortWinLines);
    this.beginFreeSpins = this.createBaseState('beginFreeSpins');
    this.beginFreeSpinsPopup = this._createSuspendState('beginFreeSpinsPopup');
    this.endFreeSpins = this.createBaseState('endOfFreeSpins');
    this.endFreeSpinsPopup = this._createSuspendState('endFreeSpinsPopup');
    this.reBuyFreeSpinsPopup = this.createBaseState('reBuyFreeSpinsPopup');
    this.beginBonus = this.createBaseState('beginBonus');
    this.bonus = this._createSuspendState('bonus');
    this.endBonus = this._createSuspendState('endBonus');
    this.endScatter = this._createSuspendState('endScatter');
    this.regularSpins = this._createSuspendState('regularSpin');
    this.autoSpins = this.createBaseState(GameStateMachineStates.AutoSpin);
    this.beginRespin = this.createBaseState(GameStateMachineStates.BeginRespin);
    this.respin = this.createBaseState(GameStateMachineStates.Respin);
    this.freeSpins = this.createBaseState('freeSpin');
    this.beginScatter = this.createBaseState('beginScatter');
    this.bonusRecovery = this.createBaseState('bonusRecovery');
    this.scatter = this._createSuspendState('scatter');
    this.startGamble = this._createSuspendState('startGamble');
    this._stm.setInitialState(this.init);
  }

  protected createRules(): void {
    this.createRule(
      this.regularSpins,
      this.beginFreeSpins,
      (s, r) => new StopToBeginCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.idle,
      this.beginFreeSpins,
      (s, r) => new StopToBeginCustomFreeSpins<TResponse>(s, r)
    );
    // this.createRule(this.stop, this.shortWinLines, (s, r) => new StopToShiftingCollapse<TResponse>(s, r));
    this.createRule(this.init, this.scatter, (s, r) => new InitToScatter<TResponse>(s, r));
    this.createRule(this.init, this.idle, (s, r) => new InitToIdle<TResponse>(s, r));
    this.createRule(this.idle, this.accelerate, (s, r) => new SpinRule<TResponse>(s, r));
    this.createRule(
      this.beginRespin,
      this.accelerate,
      (s, r) => new BeginRespinToAccelerate<TResponse>(s, r)
    );
    this.createRule(
      this.accelerate,
      this.waitRequest,
      (s, r) => new WaitResponseEventRule<TResponse>(s, r)
    );
    this.createRule(
      this.waitRequest,
      this.waitaccelerationComplete,
      (s, r) => new WaitAccelerationCompleteRule<TResponse>(this._container, s, r)
    );
    this.createRule(
      this.accelerate,
      this.waitaccelerationComplete,
      (s, r) => new AccelerateToWaitAccelerationComplete<TResponse>(s, r)
    );
    this.createRule(
      this.waitaccelerationComplete,
      this.verifyBalance,
      (s, r) => new WaitAccelerationCompleteRule<TResponse>(this._container, s, r)
    );
    this.createRule(this.verifyBalance, this.stopping, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(this.stopping, this.immediatelyStop, (s, r) => new StopRule<TResponse>(s, r));
    this.createRule(this.immediatelyStop, this.stop, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(this.stopping, this.stop, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(this.stop, this.respin, (s, r) => new StopToRespin<TResponse>(s, r));
    this.createRule(
      this.stop,
      this.shortWinLines,
      (s, r) => new StopToBeginRespin<TResponse>(s, r)
    );
    this.createRule(
      this.animation,
      this.beginScatter,
      (s, r) => new StopToBeginScatter<TResponse>(s, r)
    );
    this.createRule(this.animation, this.beginBonus, (s, r) => new StopToBonus<TResponse>(s, r));
    this.createRule(
      this.animation,
      this.endFreeSpins,
      (s, r) => new StopToEndFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.animation,
      this.beginFreeSpins,
      (s, r) => new StopToBeginFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) => new StopToFreeSpins<TResponse>(s, r)
    );
    this.createRule(this.stop, this.animation, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this._container.forceResolve<ISpinParams>(T_ISpinParams)
        )
    );
    this.createRule(
      this.shortWinLines,
      this.beginRespin,
      (s, r) => new StopToBeginRespin<TResponse>(s, r)
    );
    this.createRule(
      this.shortWinLines,
      this.autoSpins,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this._container.forceResolve<ISpinParams>(T_ISpinParams)
        )
    );
    this.createRule(
      this.animation,
      this.regularSpins,
      (s, r) => new StopToRegularSpin<TResponse>(s, r)
    );
    this.createRule(
      this.regularSpins,
      this.startGamble,
      (s, r) => new StartGambleRule<TResponse>(s, r)
    );
    this.createRule(
      this.endFreeSpinsPopup,
      this.reBuyFreeSpinsPopup,
      (s, r) => new ResumeRule<TResponse>(s, r)
    );
    this.createRule(
      this.endFreeSpinsPopup,
      this.startGamble,
      (s, r) => new StartGambleRule<TResponse>(s, r)
    );
    this.createRule(
      this.reBuyFreeSpinsPopup,
      this.beginFreeSpins,
      (s, r) => new StopToBeginFreeSpins<TResponse>(s, r)
    );
    this.createRule(this.regularSpins, this.accelerate, (s, r) => new SpinRule<TResponse>(s, r));
    this.createRule(this.autoSpins, this.accelerate, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(this.regularSpins, this.bonus, (s, r) => new BonusGameRule<TResponse>(s, r));
    this.createRule(
      this.startGamble,
      this.scatter,
      (s, r) => new StartGambleToScatter<TResponse>(s, r)
    );
    this.createRule(
      this.startGamble,
      this.regularSpins,
      (s, r) => new StartGambleToRegularSpins<TResponse>(s, r)
    );
    this.createRule(this.init, this.bonus, (s, r) => new InitToBonusRecovery<TResponse>(s, r));
    this.createRule(
      this.init,
      this.freeSpinsCompletion,
      (s, r) => new InitToFreeSpinsRecovery<TResponse>(s, r)
    );
    this.createRule(
      this.freeSpinsCompletion,
      this.freeSpinsRecovery,
      (s, r) => new ResumeRule<TResponse>(s, r)
    );
    this.createRule(
      this.shortWinLines,
      this.freeSpins,
      (s, r) => new StopToFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.shortWinLines,
      this.regularSpins,
      (s, r) =>
        new ShortWinLinesToRegularSpins<TResponse>(
          s,
          r,
          this._container.forceResolve<ISpinParams>(T_ISpinParams)
        )
    );
    this.createRule(this.scatter, this.endScatter, (s, r) => new ResumeRule<TResponse>(s, r));
    this.createRule(
      this.endScatter,
      this.endFreeSpins,
      (s, r) => new ScatterToEndFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endScatter,
      this.beginBonus,
      (s, r) => new ScatterToBonus<TResponse>(s, r)
    );
    this.createRule(
      this.endScatter,
      this.freeSpins,
      (s, r) => new ScatterToFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endScatter,
      this.autoSpins,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this._container.forceResolve<ISpinParams>(T_ISpinParams)
        )
    );
    this.createRule(
      this.endScatter,
      this.regularSpins,
      (s, r) => new ScatterToRegularSpins<TResponse>(s, r)
    );
    this.createRule(this.bonus, this.endBonus, (s, r) => new ResumeRule<TResponse>(s, r));
    this.createRule(
      this.endBonus,
      this.beginScatter,
      (s, r) => new BonusToBeginScater<TResponse>(s, r)
    );
    this.createRule(
      this.endBonus,
      this.beginFreeSpins,
      (s, r) => new BonusToBeginFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endBonus,
      this.endFreeSpins,
      (s, r) => new BonusToEndFreeSpins<TResponse>(s, r)
    );
    this.createRule(this.endBonus, this.freeSpins, (s, r) => new BonusToFreeSpins<TResponse>(s, r));
    this.createRule(
      this.endBonus,
      this.autoSpins,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this._container.forceResolve<ISpinParams>(T_ISpinParams)
        )
    );
    this.createRule(this.endBonus, this.regularSpins, (s, r) => new ResumeRule<TResponse>(s, r));
    this.createRule(this.freeSpins, this.accelerate, (s, r) => new SpinRule<TResponse>(s, r));
    this.createRule(
      this.endFreeSpins,
      this.endFreeSpinsPopup,
      (s, r) => new EndFreeSpinsPopupPopupRule<TResponse>(s, r)
    );
    this.createRule(
      this.endFreeSpins,
      this.regularSpins,
      (s, r) => new EndFreeSpinsToRegularSpins<TResponse>(s, r)
    );
    this.createRule(
      this.beginFreeSpins,
      this.beginFreeSpinsPopup,
      (s, r) => new BaseGameRule<TResponse>(s, r)
    );
    this.createRule(
      this.beginFreeSpinsPopup,
      this.freeSpins,
      (s, r) => new SpinRule<TResponse>(s, r)
    );
    this.createRule(
      this.freeSpinsRecovery,
      this.accelerate,
      (s, r) => new BaseGameRule<TResponse>(s, r)
    );
    this.createRule(this.idle, this.bonus, (s, r) => new BonusGameRule<TResponse>(s, r));
    this.createRule(this.beginBonus, this.bonus, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(
      this.reBuyFreeSpinsPopup,
      this.autoSpins,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this._container.forceResolve<ISpinParams>(T_ISpinParams)
        )
    );
    this.createRule(
      this.reBuyFreeSpinsPopup,
      this.regularSpins,
      (s, r) => new ResumeTransition<TResponse>(s, r)
    );
    this.createRule(
      this.reBuyFreeSpinsPopup,
      this.beginFreeSpins,
      (s, r) => new StopToBeginFreeSpins<TResponse>(s, r)
    );
    this.createRule(this.beginScatter, this.scatter, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(
      this.respin,
      this.beginRespin,
      (s, r) => new RespinToBeginRespin<TResponse>(s, r)
    );
    this.createRule(this.respin, this.animation, (s, r) => new StopToBonus<TResponse>(s, r));
    this.createRule(this.respin, this.animation, (s, r) => new StopToBeginScatter<TResponse>(s, r));
    this.createRule(
      this.respin,
      this.animation,
      (s, r) => new StopToBeginFreeSpins<TResponse>(s, r)
    );
    this.createRule(this.respin, this.animation, (s, r) => new StopToFreeSpins<TResponse>(s, r));
    this.createRule(this.respin, this.animation, (s, r) => new StopToEndFreeSpins<TResponse>(s, r));
    this.createRule(this.respin, this.animation, (s, r) => new StopToRegularSpin<TResponse>(s, r));
  }

  public isStateActive(id: string): boolean {
    return this._stm.isActive(id);
  }

  public doStart(response: TResponse): void {
    this._responseHolder.curResponse = response;
    this._stm.start();
  }

  public doSpin(): void {
    this._stm.dispatchEvent(new SpinEvent());
  }

  public doStop(): void {
    this._stm.dispatchEvent(new StopEvent());
  }

  public doStartGamble(): void {
    this._stm.dispatchEvent(new StartGambleEvent());
  }

  public doGamble(success: boolean): void {
    this._stm.dispatchEvent(new GambleEvent(success));
  }

  public toBonus(): void {
    this._stm.dispatchEvent(new BonusGameEvent());
  }

  public resume(): void {
    ContextMarshaller.marshalAsync(() => this._stm.dispatchEvent(new ResumeEvent()));
  }

  public update(dt: number): void {
    this._stm.update(dt);
  }

  public interrupt(): void {
    this._stm.stop();
  }

  get isAutoSpins(): boolean {
    return this._spinParams ? this._spinParams.autoSpin : false;
  }

  protected createRule(
    from: BaseGameState<TResponse>,
    to: BaseGameState<TResponse>,
    factory: RuleFactory<TResponse>
  ): BaseGameRule<TResponse> {
    const rule = factory(from, this._responseHolder);
    rule.targetState = to;
    this._stm.addRule(from, to, rule);
    return rule;
  }

  protected createBaseState(stateId: string): BaseGameState<TResponse> {
    const result = new BaseGameState<TResponse>(this._responseHolder, stateId);
    this._stm.addState(result);
    return result;
  }

  private _createSuspendState(stateId: string): SuspendState<TResponse> {
    const result = new SuspendState<TResponse>(this._responseHolder, stateId);
    this._stm.addState(result);
    return result;
  }

  private createRequestState(stateId: string): AccelerateState<TResponse> {
    const result = new AccelerateState<TResponse>(
      this._responseHolder,
      this._responseProvider,
      stateId
    );
    this._stm.addState(result);
    return result;
  }

  public findById(id: string): BaseGameState<TResponse> | null {
    return this._stm.findById(id) as BaseGameState<TResponse>;
  }

  public isActive(stateId: string): boolean {
    return this._stm.isActive(stateId);
  }
}
