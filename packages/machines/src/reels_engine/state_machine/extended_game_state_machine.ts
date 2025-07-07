import { Container } from '@cgs/syd';
import { GameStateMachine } from './game_state_machine';
import { AccelerateToWaitAccelerationComplete } from './rules/accelerate_to_wait_acceleration_complete';
import { BeginRespinToAccelerate } from './rules/begin_respin_to_accelerate';
import { BonusToBeginCustomFreeSpins } from './rules/bonus_to_begin_custom_free_spins';
import { BonusToBeginScater } from './rules/bonus_to_begin_scatter';
import { BonusToCustomFreeSpins } from './rules/bonus_to_custom_free_spins';
import { BonusToEndCustomFreeSpins } from './rules/bonus_to_end_custom_free_spins';
import { BaseGameRule } from './rules/infra/base_game_rule';
import { ResumeRule } from './rules/infra/resume_rule';
import { SpinRule } from './rules/infra/spin_rule';
import { InitToBonusRecovery } from './rules/init_to_bonus_recovery';
import { InitToCustomFreeSpinsRecovery } from './rules/init_to_custom_free_spins_recovery';
import { InitToIdle } from './rules/init_to_idle';
import { InitToScatter } from './rules/init_to_scatter';
import { RespinToBeginRespin } from './rules/respin_to_begin_respin';
import { ScatterToBeginCustomFreeSpins } from './rules/scatter_to_begin_custom_free_spins';
import { ScatterToBonus } from './rules/scatter_to_bonus';
import { ScatterToCustomFreeSpins } from './rules/scatter_to_custom_free_spins';
import { ScatterToEndCustomFreeSpins } from './rules/scatter_to_end_custom_free_spins';
import { ScatterToRegularSpins } from './rules/scatter_to_regular_spins';
import { ShortWinLinesToRegularSpins } from './rules/short_win_lines_to_regular_spins';
import { StopToAutoSpin } from './rules/stop_to_auto_spin';
import { StopToBeginCustomFreeSpins } from './rules/stop_to_begin_custom_free_spins';
import { StopToBeginRespin } from './rules/stop_to_begin_respin';
import { StopToBeginScatter } from './rules/stop_to_begin_scatter';
import { StopToBonus } from './rules/stop_to_bonus';
import { StopToCustomFreeSpins } from './rules/stop_to_custom_free_spins';
import { StopToEndCustomFreeSpins } from './rules/stop_to_end_custom_free_spins';
import { ISpinResponse } from '@cgs/common';
import { BonusGameRule } from './rules/infra/bonus_game_rule';
import { ResumeTransition } from './rules/infra/resume_transition';
import { StopRule } from './rules/infra/stop_rule';
import { StopToRegularSpin } from './rules/stop_to_regular_spin';
import { StopToRespin } from './rules/stop_to_respin';
import { WaitAccelerationCompleteRule } from './rules/wait_acceleration_complete_rule';
import { WaitResponseEventRule } from './rules/wait_response_event_rule';
import { BaseGameState } from './states/base_game_state';
import { ResponseProvider } from '../reel_net_api/response_provider';
import { ExtendedSpinsSlotGame } from '../../game/slot_game_extensions/extended_spins_slot_game';
import { f_iSlotExtensionWithStateMachine } from '../../game/slot_game_extensions/i_slot_extension_with_state_machine';
import { ISpinParams } from '../game_components/i_spin_params';
import { SpecConditionStopToRegularSpin } from '../../game/components/extended_components/extended_transitions/spec_condition_stop_to_regular_spin';
import { ISlotGame } from '../i_slot_game';
import { T_ISlotGame, T_ISpinParams } from '../../type_definitions';

export class ExtendedGameStateMachine<
  TResponse extends ISpinResponse,
> extends GameStateMachine<TResponse> {
  static readonly EndShortWinLines: string = 'EndShortWinLines';

  endShortWinLines: BaseGameState<TResponse>;

  constructor(
    container: Container,
    responseProvider: ResponseProvider<TResponse>,
    shortWinLinesGroupNames: string[] | null = null
  ) {
    super(container, responseProvider, shortWinLinesGroupNames);
  }

  registerCustomStateMachineTransitions(): void {
    const currentGame = this.container.forceResolve<ISlotGame>(T_ISlotGame);
    if (currentGame instanceof ExtendedSpinsSlotGame) {
      const extensions = currentGame?.getSlotExtensions();

      extensions?.forEach((slotExtension) => {
        if (f_iSlotExtensionWithStateMachine(slotExtension)) {
          const customStates = slotExtension.registerStateMachineExtensionTransitions(this);

          customStates.forEach((customState) =>
            this.createRule(
              customState.from as BaseGameState<TResponse>,
              customState.to as BaseGameState<TResponse>,
              // @ts-ignore TODO: check types
              customState.factory
            )
          );
        }
      });
    }
  }

  createStates(): void {
    this.endShortWinLines = this.createBaseState('endShortWinLines');
    super.createStates();
  }

  protected createRules(): void {
    this.registerCustomStateMachineTransitions();

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
      (s, r) => new WaitAccelerationCompleteRule<TResponse>(this.container, s, r)
    );
    this.createRule(
      this.accelerate,
      this.waitaccelerationComplete,
      (s, r) => new AccelerateToWaitAccelerationComplete<TResponse>(s, r)
    );
    this.createRule(
      this.waitaccelerationComplete,
      this.verifyBalance,
      (s, r) => new WaitAccelerationCompleteRule<TResponse>(this.container, s, r)
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
      this.shortWinLines,
      this.endShortWinLines,
      (s, r) => new BaseGameRule<TResponse>(s, r)
    );

    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) => new StopToBeginScatter<TResponse>(s, r)
    );
    this.createRule(
      this.endShortWinLines,
      this.beginScatter,
      (s, r) => new StopToBeginScatter<TResponse>(s, r)
    );
    this.createRule(this.animation, this.shortWinLines, (s, r) => new StopToBonus<TResponse>(s, r));
    this.createRule(
      this.endShortWinLines,
      this.beginBonus,
      (s, r) => new StopToBonus<TResponse>(s, r)
    );
    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) => new StopToEndCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endShortWinLines,
      this.endFreeSpins,
      (s, r) => new StopToEndCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) => new StopToBeginCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endShortWinLines,
      this.beginFreeSpins,
      (s, r) => new StopToBeginCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) => new StopToCustomFreeSpins<TResponse>(s, r)
    );

    this.createRule(this.stop, this.animation, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) =>
        new StopToAutoSpin<TResponse>(s, r, this.container.forceResolve<ISpinParams>(T_ISpinParams))
    );
    this.createRule(
      this.endShortWinLines,
      this.beginRespin,
      (s, r) => new StopToBeginRespin<TResponse>(s, r)
    );
    this.createRule(
      this.endShortWinLines,
      this.autoSpins,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this.container.forceResolve<ISpinParams>(T_ISpinParams) as ISpinParams
        )
    );
    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) => new SpecConditionStopToRegularSpin<TResponse>(s, r, this.shortWinLinesGroupNames)
    );
    this.createRule(
      this.animation,
      this.regularSpins,
      (s, r) => new StopToRegularSpin<TResponse>(s, r)
    );
    this.createRule(
      this.endShortWinLines,
      this.regularSpins,
      (s, r) => new StopToRegularSpin<TResponse>(s, r)
    );
    this.createRule(
      this.endFreeSpinsPopup,
      this.reBuyFreeSpinsPopup,
      (s, r) => new ResumeRule<TResponse>(s, r)
    );
    this.createRule(this.regularSpins, this.accelerate, (s, r) => new SpinRule<TResponse>(s, r));
    this.createRule(this.autoSpins, this.accelerate, (s, r) => new BaseGameRule<TResponse>(s, r));
    this.createRule(this.regularSpins, this.bonus, (s, r) => new BonusGameRule<TResponse>(s, r));
    this.createRule(this.init, this.bonus, (s, r) => new InitToBonusRecovery<TResponse>(s, r));
    this.createRule(
      this.init,
      this.freeSpinsRecovery,
      (s, r) => new InitToCustomFreeSpinsRecovery<TResponse>(s, r)
    );
    this.createRule(
      this.endShortWinLines,
      this.freeSpins,
      (s, r) => new StopToCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endShortWinLines,
      this.regularSpins,
      (s, r) =>
        new ShortWinLinesToRegularSpins<TResponse>(
          s,
          r,
          this.container.forceResolve<ISpinParams>(T_ISpinParams) as ISpinParams
        )
    );
    this.createRule(this.scatter, this.endScatter, (s, r) => new ResumeRule<TResponse>(s, r));
    this.createRule(
      this.endScatter,
      this.endFreeSpins,
      (s, r) => new ScatterToEndCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endScatter,
      this.beginBonus,
      (s, r) => new ScatterToBonus<TResponse>(s, r)
    );
    this.createRule(
      this.endScatter,
      this.beginFreeSpins,
      (s, r) => new ScatterToBeginCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endScatter,
      this.freeSpins,
      (s, r) => new ScatterToCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endScatter,
      this.autoSpins,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this.container.forceResolve<ISpinParams>(T_ISpinParams) as ISpinParams
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
      (s, r) => new BonusToBeginCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endBonus,
      this.endFreeSpins,
      (s, r) => new BonusToEndCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endBonus,
      this.freeSpins,
      (s, r) => new BonusToCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endBonus,
      this.autoSpins,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this.container.forceResolve<ISpinParams>(T_ISpinParams) as ISpinParams
        )
    );
    this.createRule(this.endBonus, this.regularSpins, (s, r) => new ResumeRule<TResponse>(s, r));
    this.createRule(this.freeSpins, this.accelerate, (s, r) => new SpinRule<TResponse>(s, r));
    this.createRule(
      this.endFreeSpins,
      this.endFreeSpinsPopup,
      (s, r) => new BaseGameRule<TResponse>(s, r)
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
      this.bonus,
      (t, r) => new InitToBonusRecovery<TResponse>(t, r)
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
      this.beginFreeSpins,
      (s, r) => new StopToBeginCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.reBuyFreeSpinsPopup,
      this.autoSpins,
      (s, r) =>
        new StopToAutoSpin<TResponse>(
          s,
          r,
          this.container.forceResolve<ISpinParams>(T_ISpinParams) as ISpinParams
        )
    );
    this.createRule(
      this.reBuyFreeSpinsPopup,
      this.regularSpins,
      (s, r) => new ResumeTransition<TResponse>(s, r)
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
      (s, r) => new StopToBeginCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.respin,
      this.animation,
      (s, r) => new StopToCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.respin,
      this.animation,
      (s, r) => new StopToEndCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(this.respin, this.animation, (s, r) => new StopToRegularSpin<TResponse>(s, r));
  }
}
