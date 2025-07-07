import { ISpinResponse } from '@cgs/common';
import {
  SceneObject,
  Container,
  ActionActivator,
  Action,
  FunctionAction,
  SequenceSimpleAction,
} from '@cgs/syd';
import { StopEvent } from './events/stop_event';
import { FreeSpinsInfoConstants } from './free_spins_info_constants';
import { GameStateMachine } from './game_state_machine';
import { BonusToBeginCustomFreeSpins } from './rules/bonus_to_begin_custom_free_spins';
import { BonusToCustomFreeSpins } from './rules/bonus_to_custom_free_spins';
import { BonusToEndCustomFreeSpins } from './rules/bonus_to_end_custom_free_spins';
import { EndFreeSpinsPopupPopupRuleWithTypes } from './rules/end_free_spins_popup_event_rule_with_types';
import { ResumeRule } from './rules/infra/resume_rule';
import { InitToCustomFreeSpinsRecovery } from './rules/init_to_custom_free_spins_recovery';
import { ScatterToBeginCustomFreeSpins } from './rules/scatter_to_begin_custom_free_spins';
import { ScatterToCustomFreeSpins } from './rules/scatter_to_custom_free_spins';
import { ScatterToEndCustomFreeSpins } from './rules/scatter_to_end_custom_free_spins';
import { StopToBeginCustomFreeSpins } from './rules/stop_to_begin_custom_free_spins';
import { StopToBonus } from './rules/stop_to_bonus';
import { StopToCustomFreeSpins } from './rules/stop_to_custom_free_spins';
import { StopToEndCustomFreeSpins } from './rules/stop_to_end_custom_free_spins';
import { LongSpinningIconEnumerator } from '../long_spinning_icon_enumerator';
import { ISlotGameEngineProvider } from '../game_components_providers/i_slot_game_engine_provider';
import { T_ISlotGame, T_ISlotGameEngineProvider } from '../../type_definitions';
import { ReelsEngine } from '../reels_engine';
import { ResponseProvider } from '../reel_net_api/response_provider';
import { ISlotGame } from '../i_slot_game';
import { ConditionAction } from '../../game/components/win_lines/complex_win_line_actions/condition_action';

export class GameStateMachineWithCustomFreeSpins<
  TResponse extends ISpinResponse,
> extends GameStateMachine<TResponse> {
  private _game: SceneObject;
  private _iconEnumerator: LongSpinningIconEnumerator | null;
  get IconEnumerator(): LongSpinningIconEnumerator | null {
    if (!this._iconEnumerator) {
      this._iconEnumerator = (
        this.container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
          .gameEngine as ReelsEngine
      ).iconEnumerator as LongSpinningIconEnumerator;
    }
    return this._iconEnumerator;
  }

  constructor(container: Container, responseProvider: ResponseProvider<TResponse>) {
    super(container, responseProvider);
    const root = container.forceResolve<ISlotGame>(T_ISlotGame);
    this._game = root.gameNode;
  }

  createRules(): void {
    this.createRule(
      this.init,
      this.freeSpinsCompletion,
      (s, r) => new InitToCustomFreeSpinsRecovery<TResponse>(s, r)
    );
    this.createRule(this.animation, this.beginBonus, (s, r) => new StopToBonus<TResponse>(s, r));
    this.createRule(this.bonus, this.endBonus, (s, r) => new ResumeRule<TResponse>(s, r));
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
      this.animation,
      this.beginFreeSpins,
      (s, r) => new StopToBeginCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.shortWinLines,
      this.freeSpins,
      (s, r) => new StopToCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.animation,
      this.endFreeSpins,
      (s, r) => new StopToEndCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endFreeSpins,
      this.endFreeSpinsPopup,
      (s, r) => new EndFreeSpinsPopupPopupRuleWithTypes<TResponse>(s, r)
    );
    this.createRule(
      this.animation,
      this.shortWinLines,
      (s, r) => new StopToCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.reBuyFreeSpinsPopup,
      this.beginFreeSpins,
      (s, r) => new StopToBeginCustomFreeSpins<TResponse>(s, r)
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
      this.endFreeSpins,
      (s, r) => new ScatterToEndCustomFreeSpins<TResponse>(s, r)
    );
    this.createRule(
      this.endFreeSpinsPopup,
      this.freeSpins,
      (s, r) => new ScatterToEndCustomFreeSpins<TResponse>(s, r)
    );
    super.createRules();
  }

  doStop(): void {
    const activator = new ActionActivator(this._game);
    const actions: Action[] = [];
    actions.push(
      new ConditionAction(() => {
        if (
          this.curResponse.isFreeSpins &&
          this.curResponse.freeSpinsInfo?.name === 'free' &&
          this.curResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
          this.curResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsStarted &&
          this._iconEnumerator
        ) {
          return this._iconEnumerator.isLongOnTop;
        }
        return true;
      })
    );

    actions.push(new FunctionAction(() => this.rootState.dispatchEvent(new StopEvent())));
    actions.push(
      new FunctionAction(() => {
        if (activator) {
          activator.stop();
        }
      })
    );
    activator.action = new SequenceSimpleAction(actions);

    activator.start();
  }
}
