/*
import { ISlotExtensionWithStateMachine } from '../i_slot_extension_with_state_machine';
import { ISpinResponse, SceneCommon } from '@cgs/common';
import { StateMachineTransition } from '../../components/extended_components/state_machine_transition';
import { ExtendedGameStateMachine } from '../../../reels_engine/state_machine/extended_game_state_machine';
import { BonusToCustomFreeSpins } from '../../../reels_engine/state_machine/rules/bonus_to_custom_free_spins';
import { ScatterToCustomFreeSpins } from '../../../reels_engine/state_machine/rules/scatter_to_custom_free_spins';
import { OverridingComponentProvider } from '../../base_slot_game';
import { BonusFreeSpinsPopupProcessor } from '../../components/extended_components/bonus_components/bonus_free_spins_popup_processor';
import { NewBonusGameProvider } from '../../components/mini_game/new_bonus_game_provider';

export class BonusWithFreeSpinsExtension implements ISlotExtensionWithStateMachine<ISpinResponse> {
  private _sceneCommon: SceneCommon;
  private _possibleFreeSpinsStates: string[];
  private _hideSlot: boolean;
  private _hideHud: boolean;
  private _needSharing: boolean;

  constructor(
    sceneCommon: SceneCommon,
    possibleFreeSpinsStates: string[],
    hideSlot = false,
    hideHud = false,
    needSharing = false
  ) {
    this._sceneCommon = sceneCommon;
    this._possibleFreeSpinsStates = possibleFreeSpinsStates;
    this._hideSlot = hideSlot;
    this._hideHud = hideHud;
    this._needSharing = needSharing;
  }

  getInitialRequiredTypes(): Type[] {
    return [IBonusExternalEventAsyncProcessor, BonusGameProvider];
  }

  getExtensionComponents(): OverridingComponentProvider[] {
    return [
      new OverridingComponentProvider(
        (c) => new BonusFreeSpinsPopupProcessor(c),
        IBonusExternalEventAsyncProcessor
      ),
      new OverridingComponentProvider(
        (c) =>
          new NewBonusGameProvider(c, this._sceneCommon, {
            hideSlot: this._hideSlot,
            hideHud: this._hideHud,
            hasFreeSpins: true,
            fsTypes: this._possibleFreeSpinsStates,
            needSharing: this._needSharing,
          }),
        BonusGameProvider
      ),
    ];
  }

  registerStateMachineExtensionTransitions(
    stateMachine: ExtendedGameStateMachine<ISpinResponse>
  ): StateMachineTransition[] {
    return [
      new StateMachineTransition(
        stateMachine.endBonus,
        stateMachine.freeSpins,
        (s, r) => new BonusToCustomFreeSpins<ISpinResponse>(s, r)
      ),
      new StateMachineTransition(
        stateMachine.endScatter,
        stateMachine.freeSpins,
        (s, r) => new ScatterToCustomFreeSpins<ISpinResponse>(s, r)
      ),
    ];
  }
}
*/
