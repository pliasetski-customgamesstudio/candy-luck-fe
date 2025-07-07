import {
  ISplashManager,
  ICoordinateSystemInfoProvider,
  SceneCommon,
  IClientProperties,
  T_SceneCommon,
  T_ICoordinateSystemInfoProvider,
} from '@cgs/common';
import { Platform, Container, T_Platform, Vector2 } from '@cgs/syd';
import { ICustomSlotGameFactory } from './custom_slot_factory/i_custom_slot_game_factory';
import { SlotGameFactoryWithSlotExtensions } from './custom_slot_factory/slot_game_factory_with_slot_extensions';
import {
  T_AbstractIconResourceProvider,
  T_AbstractIconStopbehaviorProvider,
  T_AdditionalDataConverterComponent,
  T_AnticipationAnimationProvider,
  T_BonusGameProvider,
  T_DynamicDrawOrdersProvider,
  T_ElementsStateController,
  T_EndFreeSpinsPopupComponent,
  T_EpicWinPopupProvider,
  T_Game112EndFreeSpinsPopupComponent,
  T_Game112IconStopbehaviorProvider,
  T_Game112IconsSoundModelComponent,
  T_Game112PayTablePopupProvider,
  T_Game112StartBonusPopupProvider,
  T_Game112StartFreeSpinsPopupController,
  T_Game112SuperSpinsProgressComponent,
  T_GameConfigController,
  T_IFreeSpinsModeProvider,
  T_IGameStateMachineProvider,
  T_IReelsConfigProvider,
  T_ISlotGameEngineProvider,
  T_ISlotPrimaryAnimationProvider,
  T_IStopSlotActionProvider,
  T_IconEnumeratorComponent,
  T_IconsSoundModelComponent,
  T_JackPotWinPopupComponent,
  T_JackpotConfiguredBetsController,
  T_OptionalLoader,
  T_PaytablePopupComponent,
  T_PersonalJackpotCounterProvider,
  T_StartFreeSpinsPopupComponent,
  T_WinLineActionComponent,
  T_ShopPopup,
  T_ResourcesComponent,
} from '../../type_definitions';
import { BaseSlotGame, OverridingComponentProvider } from '../base_slot_game';
import { LobbyFacade } from '../../lobby_facade';
import { MultiSceneIconResourceProvider } from '../components/multi_scene_icon_resource_provider';
import { MultiSceneReelsEngineComponentV2 } from '../components/multi_scene_reels_engine_component_v2';
import { CustomReelsConfigComponent } from '../components/custom_reels_config_component';
import { GameConfigController } from '../components/game_config_controller';
import { JackpotConfiguredBetsController } from '../components/jackpot_configured_bets_provider';
import { JackpotsResponseConverterComponent } from '../components/reel_net_api/jackpots_response_converter_component';
import { PersonalJackpotCounterProvider } from '../components/personal_jackpot_counter_provider';
import { LongStoppingIconEnumeratorProvider } from '../components/long_stopping_icons_enumerator_provider';
import { Game112ExtendedGameStateMachineProvider } from '../components/game_specific_components/game112/game112_extended_game_state_machine_provider';
import { DynamicDrawOrdersProvider } from '../components/dynamic_draw_orders_provider';
import { SlotStopActionWithReplacedIconsProvider } from '../components/slot_stop_action_provider_with_replaced_icons_provider';
import { ElementsStateController } from '../components/element_state_controllers/elements_state_controller';
import { SlotPrimaryAnimationWOEndFSAnimationProvider } from '../components/slot_primary_actions_provider_wo_end_fs_animation_provider';
import { SingleSceneIconStopBehaviourWithFSSupportProvider } from '../components/icon_stop_behaviors/single_scene_icon_stop_behaviour_with_f_s_support_provider';
import { Game112FreeSpinsModeProvider } from '../components/game_specific_components/game112/game112_free_spins_mode_provider';
import { AdditionalLoader } from '../components/optional_loader';
import { Game112PayTablePopupProvider } from '../components/game_specific_components/game112/game112_paytable_popup_provider';
import { Game112SelectiveJackpotPopupProvider } from '../components/game_specific_components/game112/game112_selective_jackpot_popup_component';
import { Game112AnticipationAnimationProvider } from '../components/game_specific_components/game112/game112_anticipation_animation_provider';
import { Game112SuperSpinsProgressComponent } from '../components/game_specific_components/game112/game112_super_spins_progress_component';
import { Game112StartBonusPopupProvider } from '../components/game_specific_components/game112/game112_start_bonus_popup_provider';
import { Game112StartFreeSpinsPopupProvider } from '../components/game_specific_components/game112/game112_start_free_spins_popup_provider';
import { Game112EndFreeSpinsPopupComponent } from '../components/game_specific_components/game112/game112_end_free_spins_popup_provider';
import { Game112IconsSoundModelComponent } from '../components/game_specific_components/game112/game112_icon_sound_model_component';
import { SlotParams } from '../../reels_engine/slot_params';
import { BaseReelsSlotGame } from '../base_reels_slot_game';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { NewBonusGameProvider } from '../components/mini_game/new_bonus_game_provider';
import { ApplicationGameConfig } from '@cgs/shared';
import { CandyLuckEpicWinPopupProvider } from '../components/game_specific_components/candy_luck/epic_win_popup/CandyLuckEpicWinPopupProvider';
import { ArkadiumGemsShopPopup } from '../components/game_specific_components/candy_luck/arkadium_shop_popup/arkadium_shop_popup';
import { ExpandedWinLineActionComponent } from '../components/win_lines/complex_win_line_action_providers/expanded_winline_action_component';
import { ResourcesComponent } from '../components/resources_component';
import {
  CandyLuckBackgroundComponent,
  T_CandyLuckBackgroundComponent,
} from '../components/game_specific_components/candy_luck/CandyLuckBackgroundComponent';
import {
  CandyLuckMaskComponent,
  T_CandyLuckMaskComponent,
} from '../components/game_specific_components/candy_luck/CandyLuckMaskComponent';
import {
  CandyLuckProgressComponent,
  T_CandyLuckProgressComponent,
} from '../components/game_specific_components/candy_luck/CandyLuckProgressComponent';
import {
  CandyLuckOrientationHandler,
  T_CandyLuckOrientationHandler,
} from '../components/game_specific_components/candy_luck/CandyLuckOrientationHandler';
import {
  CandyLuckBackgroundModeComponent,
  T_CandyLuckBackgroundModeComponent,
} from '../components/game_specific_components/candy_luck/CandyLuckBackgroundModeComponent';
import {
  CandyLuckLoginFormComponent,
  T_CandyLuckLoginFormComponent,
} from '../components/game_specific_components/candy_luck/CandyLuckLoginFormComponent';
import {
  CandyLuckCoinBuySelect,
  T_CandyLuckCoinBuySelect,
} from '../components/game_specific_components/candy_luck/CandyLuckCoinBuySelect';

export type GameCreator = (
  machineId: string,
  platform: Platform,
  progress: ISplashManager,
  coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
  sceneCommon: SceneCommon
) => BaseSlotGame;

export class SlotGameFactory {
  private _lobbyFacade: LobbyFacade;
  private _clientProperties: IClientProperties;
  private _games: Map<string, GameCreator> = new Map<string, GameCreator>();
  private _customSlotFactories: ICustomSlotGameFactory[] = [];

  constructor(lobbyFacade: LobbyFacade, clientProperties: IClientProperties) {
    this._lobbyFacade = lobbyFacade;
    this._clientProperties = clientProperties;
    this._customSlotFactories.push(new SlotGameFactoryWithSlotExtensions());

    const sceneCommon = lobbyFacade.resolve(T_SceneCommon) as SceneCommon;

    const componetns = [
      T_CandyLuckOrientationHandler,
      T_StartFreeSpinsPopupComponent,
      T_EndFreeSpinsPopupComponent,
      // T_ElementsStateController,
      T_EpicWinPopupProvider,
      T_GameConfigController,
      T_JackPotWinPopupComponent,
      T_JackpotConfiguredBetsController,
      T_BonusGameProvider,
      T_PersonalJackpotCounterProvider,
      T_AnticipationAnimationProvider,
      T_IStopSlotActionProvider,
      T_Game112StartBonusPopupProvider,
      T_Game112SuperSpinsProgressComponent,
      T_Game112StartFreeSpinsPopupController,
      T_AbstractIconStopbehaviorProvider,
      T_Game112IconStopbehaviorProvider,
      T_Game112PayTablePopupProvider,
      T_Game112EndFreeSpinsPopupComponent,
      T_Game112IconsSoundModelComponent,
      T_ShopPopup,
      T_CandyLuckCoinBuySelect,
      T_CandyLuckBackgroundComponent,
      T_CandyLuckMaskComponent,
      T_CandyLuckProgressComponent,
      T_CandyLuckBackgroundModeComponent,
      T_CandyLuckLoginFormComponent,
    ];

    const soundMap112: Map<number, number> = new Map<number, number>();
    soundMap112.set(12, 11);
    soundMap112.set(13, 11);
    soundMap112.set(17, 11);
    soundMap112.set(5, 4);
    soundMap112.set(6, 4);
    soundMap112.set(16, 4);

    const overridingComponents: OverridingComponentProvider[] = [
      new OverridingComponentProvider(
        (_c) => new MultiSceneIconResourceProvider(sceneCommon, 'icons', 'icons'),
        T_AbstractIconResourceProvider
      ),
      new OverridingComponentProvider(
        (c) =>
          new MultiSceneReelsEngineComponentV2(
            c as Container,
            true,
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            'alpha'
          ),
        T_ISlotGameEngineProvider
      ),

      new OverridingComponentProvider(
        (c) => new CustomReelsConfigComponent(c as Container),
        T_IReelsConfigProvider
      ),

      new OverridingComponentProvider((c) => new GameConfigController(c), T_GameConfigController),
      new OverridingComponentProvider(
        (c) => new CandyLuckOrientationHandler(c, sceneCommon),
        T_CandyLuckOrientationHandler
      ),
      new OverridingComponentProvider(
        (c) => new JackpotConfiguredBetsController(c),
        T_JackpotConfiguredBetsController
      ),
      new OverridingComponentProvider(
        (c) =>
          new ExpandedWinLineActionComponent(c, {
            lineOptions: {
              lineColor: '#f7e4fb',
              lineWidth: 10,
              glowIntensity: 4,
              glowSize: 5,
              offset:
                c
                  .forceResolve<ResourcesComponent>(T_ResourcesComponent)
                  .slot.findById('slot_start_0')?.size || Vector2.Zero,
            },
            winlineHolderId: 'winline_holder',
          }),
        T_WinLineActionComponent
      ),
      new OverridingComponentProvider(
        (c) =>
          new NewBonusGameProvider(c, sceneCommon, {
            hideSlot: false,
            hideHud: true,
            gameTypes: ['0', '1', '2'],
            externalScenesIds: ['bonusBG', 'BonusBgSound'],
            gameTypeToBonusId: new Map<string, string>([
              ['0', '0'],
              ['1', '1'],
              ['2', '2'],
            ]),
            hasFreeSpins: true,
            fsTypes: ['3FG', '2FG', '5FG', 'MLT', 'MULT', 'RTG', 'CLT'],
            needSharing: false,
          }),
        T_BonusGameProvider
      ),
      new OverridingComponentProvider(
        (_c) => new JackpotsResponseConverterComponent(),
        T_AdditionalDataConverterComponent
      ),

      new OverridingComponentProvider(
        (c) =>
          new PersonalJackpotCounterProvider(
            c as Container,
            'jackpot_val_{0}',
            'jackpot_icons_{0}',
            'item_d+',
            1.0
          ),
        T_PersonalJackpotCounterProvider
      ),
      //new OverridingComponentProvider((c) => new SpinningPersonalJackpotCounterProvider(c, "jackpot_val_{0}", "jackpot_icon_{0}", r"item_\d+", 1.0, sceneCommon, false, [0, 1, 2, 3, 4], 6, false), PersonalJackpotCounterProvider),
      new OverridingComponentProvider(
        (c) => new LongStoppingIconEnumeratorProvider(c, [], 6),
        T_IconEnumeratorComponent
      ),
      new OverridingComponentProvider(
        (c) => new Game112ExtendedGameStateMachineProvider(c),
        T_IGameStateMachineProvider
      ),
      new OverridingComponentProvider(
        (c) => new DynamicDrawOrdersProvider(c),
        T_DynamicDrawOrdersProvider
      ),
      new OverridingComponentProvider(
        (c) => new SlotStopActionWithReplacedIconsProvider(c, sceneCommon, true, true, null),
        T_IStopSlotActionProvider
      ),
      new OverridingComponentProvider(
        (c) => new ElementsStateController(c, ElementsStateController.defaultStates('reel_bg')),
        T_ElementsStateController
      ),
      new OverridingComponentProvider(
        (c) => new SlotPrimaryAnimationWOEndFSAnimationProvider(c),
        T_ISlotPrimaryAnimationProvider
      ),

      new OverridingComponentProvider(
        (c) =>
          new CandyLuckEpicWinPopupProvider(
            c,
            sceneCommon,
            'slot/big_win/scene',
            'slot/big_win/sound'
          ),
        T_EpicWinPopupProvider
      ),
      new OverridingComponentProvider(
        (c) => new SingleSceneIconStopBehaviourWithFSSupportProvider(c as Container),
        T_AbstractIconStopbehaviorProvider
      ),
      new OverridingComponentProvider(
        (c) =>
          new Game112FreeSpinsModeProvider(c, 'reel_bg', '{0}', [
            'freeGame',
            'superGame',
            'grandGame',
          ]),
        T_IFreeSpinsModeProvider
      ),
      new OverridingComponentProvider(() => new AdditionalLoader(sceneCommon), T_OptionalLoader),

      // TODO: remove when HTML table
      new OverridingComponentProvider(
        (c) => new Game112PayTablePopupProvider(c, sceneCommon, false),
        T_PaytablePopupComponent
      ),

      //custom components
      new OverridingComponentProvider(
        (c) =>
          new Game112SelectiveJackpotPopupProvider(c, sceneCommon, {
            sceneName: 'slot/jackpot/scene',
            stopBackgroundSound: true,
            useTextAnimation: true,
            incrementDuration: 2.0,
            winPositionsSymbolId: null,
            soundName: 'jackpot',
            closeWithButton: true,
            updateJackpotAtClose: true,
          }),
        T_JackPotWinPopupComponent
      ),
      new OverridingComponentProvider(
        (c) =>
          new Game112AnticipationAnimationProvider(
            c,
            sceneCommon,
            new Map<number, number>(),
            true,
            true
          ),
        T_AnticipationAnimationProvider
      ),
      new OverridingComponentProvider(
        (c) => new Game112SuperSpinsProgressComponent(c, sceneCommon),
        T_Game112SuperSpinsProgressComponent
      ),
      new OverridingComponentProvider(
        (c) => new Game112StartBonusPopupProvider(c),
        T_Game112StartBonusPopupProvider
      ),
      new OverridingComponentProvider(
        (c) => new Game112StartFreeSpinsPopupProvider(c, sceneCommon, true, true, false),
        T_StartFreeSpinsPopupComponent
      ),
      new OverridingComponentProvider(
        (c) => new Game112EndFreeSpinsPopupComponent(c, sceneCommon, true, true),
        T_EndFreeSpinsPopupComponent
      ),
      new OverridingComponentProvider(
        (c) =>
          new Game112IconsSoundModelComponent(c, {
            maxIconId: 60,
            soundMapping: soundMap112,
          }),
        T_IconsSoundModelComponent
      ),
      new OverridingComponentProvider(
        (c) => new CandyLuckCoinBuySelect(c),
        T_CandyLuckCoinBuySelect
      ),
      new OverridingComponentProvider(
        (c) => new ArkadiumGemsShopPopup(c, sceneCommon),
        T_ShopPopup
      ),
      new OverridingComponentProvider(
        (c) => new CandyLuckBackgroundComponent(c),
        T_CandyLuckBackgroundComponent
      ),
      new OverridingComponentProvider(
        (c) => new CandyLuckMaskComponent(c),
        T_CandyLuckMaskComponent
      ),
      new OverridingComponentProvider(
        (c) => new CandyLuckProgressComponent(c, sceneCommon),
        T_CandyLuckProgressComponent
      ),
      new OverridingComponentProvider(
        (c) => new CandyLuckBackgroundModeComponent(c),
        T_CandyLuckBackgroundModeComponent
      ),
      new OverridingComponentProvider(
        (c) => new CandyLuckLoginFormComponent(c),
        T_CandyLuckLoginFormComponent
      ),
    ];

    this._games.set(
      ApplicationGameConfig.machineId,
      (id, platform, progress, coordinateSystemInfoProvider, sceneCommon) => {
        const slotParams = new SlotParams(id, 5, 3, []);
        return new BaseReelsSlotGame(
          this._lobbyFacade,
          platform,
          progress,
          coordinateSystemInfoProvider,
          slotParams,
          componetns,
          overridingComponents,
          sceneCommon,
          true
        );
      }
    );

    if (this._customSlotFactories && this._customSlotFactories.length > 0) {
      for (const slotFactory of this._customSlotFactories) {
        const newGames = slotFactory.registerGames(this._lobbyFacade);
        newGames.forEach((value, key) => this._games.set(key, value));
      }
    }
  }

  createGame(preloader: ISplashManager): ISlotGame {
    const sceneCommon = this._lobbyFacade.resolve(T_SceneCommon) as SceneCommon;
    const platform = this._lobbyFacade.resolve(T_Platform) as Platform;
    const coordinateSystemInfoProvider = this._lobbyFacade.resolve(
      T_ICoordinateSystemInfoProvider
    ) as ICoordinateSystemInfoProvider;

    const game = this._games.get(ApplicationGameConfig.machineId) as GameCreator;
    return game(
      ApplicationGameConfig.machineId,
      platform,
      preloader,
      coordinateSystemInfoProvider,
      sceneCommon
    ) as ISlotGame;
  }
}
