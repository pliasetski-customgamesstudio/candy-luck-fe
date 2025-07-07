import { ISpinResponse, SceneCommon } from "@cgs/common";
import { OverridingComponentProvider } from "game/base_slot_game";
import { TotalBetController } from "game/common/footer/controllers/total_bet_controller";
import { CustomSpinActionProvider } from "game/components/custom_spin_action_provider";
import { CustomTotalBetController } from "game/components/custom_total_bet_controller";
import { ExtendedEndFreeSpinsPopupProvider } from "game/components/extended_components/free_spins_popups/extended_end_free_spins_popup_provider";
import { ExtendedStartFreeSpinsPopupProvider } from "game/components/extended_components/free_spins_popups/extended_start_free_spins_popup_provider";
import { RespinsEndFreeSpinsToFreeSpins } from "game/components/extended_components/respins_state_machine_transitions/respins_end_free_spins_to_free_spins";
import { RespinsStopToBeginCustomFreeSpins } from "game/components/extended_components/respins_state_machine_transitions/respins_stop_to_begin_custom_free_spins";
import { RespinsStopToEndCustomFreeSpin } from "game/components/extended_components/respins_state_machine_transitions/respins_stop_to_end_custom_free_spin";
import { StateMachineTransition } from "game/components/extended_components/state_machine_transition";
import { IconsSceneObjectComponent } from "game/components/icons_scene_object_component";
import { IconsSceneObjectWithScissorComponent } from "game/components/icons_scene_object_with_scissor_component";
import { EndFreeSpinsPopupComponent } from "game/components/popups/end_freeSpins_popup_component";
import { StartFreeSpinsPopupComponent } from "game/components/popups/start_freeSpins_popup_component";
import { RebuyFreespinsCleaner } from "game/components/rebuy_freespins_cleaner";
import { RespinResetIndexesProvider } from "game/components/respins/respin_reset_index_provider";
import { SpinViewConditionComponent } from "game/components/spin_view_condition_component";
import { LobbyFacade } from "lobby_facade";
import { ExtendedGameStateMachine } from "reels_engine/state_machine/extended_game_state_machine";
import { ISlotExtensionWithStateMachine } from "../i_slot_extension_with_state_machine";
import { T_EndFreeSpinsPopupComponent, T_ISpinViewConditionComponent, T_IStartSlotActionProvider, T_IconsSceneObjectComponent, T_StartFreeSpinsPopupComponent, T_TotalBetController } from "type_definitions";

export class RespinsExtension implements ISlotExtensionWithStateMachine<ISpinResponse> {
  private _fsName: string[];
  private _respinsFsName: string;
  private _freeSpinsWithRespins: string[];
  private _lobbyFacade: LobbyFacade;
  private _sceneCommon: SceneCommon;

  constructor(
    lobbyFacade: LobbyFacade,
    sceneCommon: SceneCommon,
    respinsFsName: string,
    fsNames: string[],
    freeSpinsWithRespins: string[]
  ) {
    this._respinsFsName = respinsFsName;
    this._fsName = fsNames;
    this._lobbyFacade = lobbyFacade;
    this._sceneCommon = sceneCommon;
    this._freeSpinsWithRespins = freeSpinsWithRespins;
  }

  getInitialRequiredTypes(): symbol[] {
    return [
    //   RebuyFreespinsCleaner,
    //   RespinResetIndexesProvider,
        T_EndFreeSpinsPopupComponent,
      T_StartFreeSpinsPopupComponent,
    ];
  }

  getExtensionComponents(): OverridingComponentProvider[] {
    const components: OverridingComponentProvider[] = [
    //   new OverridingComponentProvider(
    //     (c) => new RebuyFreespinsCleaner(c, this._respinsFsName),
    //     T_RebuyFreespinsCleaner
    //   ),
    //   new OverridingComponentProvider(
    //     (c) => new RespinResetIndexesProvider(c, { fsNames: [this._respinsFsName] }),
    //     T_RespinResetIndexesProvider
    //   ),
      new OverridingComponentProvider(
        (c) => new IconsSceneObjectWithScissorComponent(c, this._lobbyFacade),
        T_IconsSceneObjectComponent
      ),
      new OverridingComponentProvider(
        (c) =>
          new ExtendedStartFreeSpinsPopupProvider(c, this._sceneCommon, 
            true,
            true,
            false,
            true,
            false,
            true,
          ),
        T_StartFreeSpinsPopupComponent
      ),
      new OverridingComponentProvider(
        (c) =>
          new ExtendedEndFreeSpinsPopupProvider(c, this._sceneCommon, 
    
            true,
            true,
            true,
            false,

            [this._respinsFsName],
            this._fsName,
          ),
        T_EndFreeSpinsPopupComponent
      ),
      new OverridingComponentProvider(
        (c) => new CustomTotalBetController(c, this._respinsFsName, this._fsName),
        T_TotalBetController
      ),
      new OverridingComponentProvider(
        (c) => new SpinViewConditionComponent(c, this._respinsFsName, this._freeSpinsWithRespins),
        T_ISpinViewConditionComponent
      ),
      new OverridingComponentProvider(
        (c) => new CustomSpinActionProvider(c),
        T_IStartSlotActionProvider
      ),
    ];

    return components;
  }

  registerStateMachineExtensionTransitions(
    stateMachine: ExtendedGameStateMachine<ISpinResponse>
  ): StateMachineTransition[] {
    return [
      new StateMachineTransition(
        stateMachine.shortWinLines,
        stateMachine.beginFreeSpins,
        (s, r) => new RespinsStopToBeginCustomFreeSpins<ISpinResponse>(s, r, [this._respinsFsName])
      ),
      new StateMachineTransition(
        stateMachine.shortWinLines,
        stateMachine.endFreeSpins,
        (s, r) => new RespinsStopToEndCustomFreeSpin<ISpinResponse>(s, r, this._fsName)
      ),
      new StateMachineTransition(
        stateMachine.endFreeSpinsPopup,
        stateMachine.freeSpins,
        (s, r) => new RespinsEndFreeSpinsToFreeSpins<ISpinResponse>(s, r, this._fsName)
      ),
    ];
  }
}
