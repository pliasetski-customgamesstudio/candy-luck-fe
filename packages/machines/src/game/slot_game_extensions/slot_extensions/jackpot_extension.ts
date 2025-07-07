import { SceneCommon } from '@cgs/common';
import { ExtendedSlotGameParams } from '../extended_slot_game_params';
import { ISlotExtension } from '../i_slot_extension';
import {
  T_PersonalJackpotCounterProvider,
  T_JackpotConfiguredBetsController,
  T_AdditionalDataConverterComponent,
  T_JackPotWinPopupComponent,
} from '../../../type_definitions';
import { OverridingComponentProvider } from '../../base_slot_game';
import { SpinningPersonalJackpotCounterProvider } from '../../components/spinning_personal_jackpot_counter_provider';
import { JackpotConfiguredBetsController } from '../../components/jackpot_configured_bets_provider';
import { JackpotsResponseConverterComponent } from '../../components/reel_net_api/jackpots_response_converter_component';
import { SelectiveJackpotPopupProvider } from '../../components/popups/selective_jackpot_popup_provider';

export class JackpotExtension implements ISlotExtension {
  private _slotGameParams: ExtendedSlotGameParams;
  private _sceneCommon: SceneCommon;
  private _spinningJackpotIndexes: number[] | null;
  private _jackpotWinPositionSymbol: number;
  private _needCenterJackpots: boolean;
  private _hasJackpotPopup: boolean;
  private _winPositionsToRemove: string[] | null;
  private _updateJackpotAtClose: boolean;
  private _closeWithButton: boolean;

  constructor(
    slotGameParams: ExtendedSlotGameParams,
    sceneCommon: SceneCommon,
    spinningJackpotIndexes: number[] | null = null,
    jackpotWinPositionSymbol: number = 15,
    needCenterJackpots: boolean = true,
    hasJackpotPopup: boolean = false,
    winPositionsToRemove: string[] | null = null,
    updateJackpotAtClose: boolean = true,
    closeWithButton: boolean = true
  ) {
    this._spinningJackpotIndexes = spinningJackpotIndexes;
    this._jackpotWinPositionSymbol = jackpotWinPositionSymbol;
    this._needCenterJackpots = needCenterJackpots;
    this._slotGameParams = slotGameParams;
    this._hasJackpotPopup = hasJackpotPopup;
    this._sceneCommon = sceneCommon;
    this._winPositionsToRemove = winPositionsToRemove;
    this._updateJackpotAtClose = updateJackpotAtClose;
    this._closeWithButton = closeWithButton;
  }

  getInitialRequiredTypes(): symbol[] {
    const componentsTypes: symbol[] = [
      T_JackpotConfiguredBetsController,
      T_PersonalJackpotCounterProvider,
    ];

    if (this._hasJackpotPopup) {
      componentsTypes.push(T_JackPotWinPopupComponent);
    }

    return componentsTypes;
  }

  getExtensionComponents(): OverridingComponentProvider[] {
    const components: OverridingComponentProvider[] = [
      new OverridingComponentProvider(
        (c) =>
          new SpinningPersonalJackpotCounterProvider(
            c,
            'jackpot_val_{0}',
            'jackpot_icon_{0}',
            'item_d+',
            1.0,
            this._sceneCommon,
            false,
            this._spinningJackpotIndexes,
            this._jackpotWinPositionSymbol,
            this._needCenterJackpots
          ),
        T_PersonalJackpotCounterProvider
      ),
      new OverridingComponentProvider(
        (c) => new JackpotConfiguredBetsController(c),
        T_JackpotConfiguredBetsController
      ),
      new OverridingComponentProvider(
        (_c) => new JackpotsResponseConverterComponent(),
        T_AdditionalDataConverterComponent
      ),
      new OverridingComponentProvider(
        (c) =>
          new SelectiveJackpotPopupProvider(c, this._sceneCommon, {
            sceneName: 'slot/jackpot/scene',
            stopBackgroundSound: false,
            useTextAnimation: true,
            textAnimDuration: 0.0,
            incrementDuration: 2.0,
            winPositionsSymbolId: this._jackpotWinPositionSymbol,
            soundName: 'jackpot',
            closeWithButton: true,
            updateJackpotAtClose: true,
            winPositionsToRemove: this._winPositionsToRemove as string[],
            shortWinLineGroups: this._slotGameParams.shortWinLinesSpecificSpecGroup,
          }),
        T_JackPotWinPopupComponent
      ),
    ];

    if (this._hasJackpotPopup) {
      components.push(
        new OverridingComponentProvider(
          (c) =>
            new SelectiveJackpotPopupProvider(c, this._sceneCommon, {
              sceneName: 'slot/jackpot/scene',
              stopBackgroundSound: false,
              useTextAnimation: true,
              textAnimDuration: 0.0,
              incrementDuration: 2.0,
              soundName: 'jackpot',
              winPositionsSymbolId: this._jackpotWinPositionSymbol,
              closeWithButton: this._closeWithButton,
              updateJackpotAtClose: this._updateJackpotAtClose,
              winPositionsToRemove: this._winPositionsToRemove as string[],
              shortWinLineGroups: this._slotGameParams.shortWinLinesSpecificSpecGroup,
            }),
          T_JackPotWinPopupComponent
        )
      );
    }

    return components;
  }
}
