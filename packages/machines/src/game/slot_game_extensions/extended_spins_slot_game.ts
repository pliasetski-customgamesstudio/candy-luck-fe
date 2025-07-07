import { BaseReelsSlotGame } from '../base_reels_slot_game';
import { ISlotExtension } from './i_slot_extension';
import { LobbyFacade } from '../../lobby_facade';
import { Platform } from '@cgs/syd';
import { ICoordinateSystemInfoProvider, ISplashManager, SceneCommon } from '@cgs/common';
import { ExtendedSlotGameParams } from './extended_slot_game_params';
import { OverridingComponentProvider } from '../base_slot_game';
import { DynamicDrawOrdersProvider } from '../components/dynamic_draw_orders_provider';
import { FakeReelReplacerComponent } from '../components/fake_reel_replacer_component';
import { IconModelComponent } from '../components/icon_model_component';
import { IconValuesSystems } from '../../reels_engine/game_components/icon_values_systems';
import { WinTextController } from '../common/footer/controllers/win_text_controller';
import { MultiSceneIconResourceProvider } from '../components/multi_scene_icon_resource_provider';
import { CustomLoader } from '../components/optional_loader';
import {
  T_AbstractIconResourceProvider,
  T_AnticipationAnimationProvider,
  T_DynamicDrawOrdersProvider,
  T_EpicWinPopupProvider,
  T_FakeMultireelReplacerComponent,
  T_FakeReelReplacerComponent,
  T_FooterWithPlaceholderComponent,
  T_IconEnumeratorComponent,
  T_IconModelComponent,
  T_IconsSoundModelComponent,
  T_IconValuesSystems,
  T_IDelayedActionHolder,
  T_IGameStateMachineProvider,
  T_IInitialReelsProvider,
  T_InitialReelsComponent,
  T_IReelsConfigProvider,
  T_ISlotGameEngineProvider,
  T_ISlotPrimaryAnimationProvider,
  T_IStopSlotActionProvider,
  T_IWinLineActionProvider,
  T_MultiSceneIconWithValuesProvider,
  T_OptionalLoader,
  T_SingleSceneIconStopBehaviourProvider,
  T_SoundConfigurationProvider,
  T_WinLineActionComponent,
  T_WinTextController,
} from '../../type_definitions';
import { CustomReelsConfigComponent } from '../components/custom_reels_config_component';
import { ExtendedNWaysLineActionProvider } from '../components/extended_components/extended_nways_win_line_action_component';
import { WinLineActionProvider } from '../components/win_lines/win_line_action_provider';
import { SoundConfigurationProvider } from '../common/sound_configuration_provider';
import { FooterWithPlaceholderComponent } from '../components/footer_with_placeholder_component';
import { MultiSceneReelsEngineComponentV2 } from '../components/multi_scene_reels_engine_component_v2';
import { SlotStopActionWithReplacedIconsProvider } from '../components/slot_stop_action_provider_with_replaced_icons_provider';
import { ResponseInitialReelsComponent } from '../components/reel_net_api/response_initial_reels_component';
import { ResponseInitialReelsProvider } from '../../response_initial_reels_provider';
import { FakeMultireelReplacerComponent } from '../components/fake_multireel_replacer_component';
import { LongStoppingIconEnumeratorProvider } from '../components/long_stopping_icons_enumerator_provider';
import { SlotPrimaryAnimationWOEndFSAnimationProvider } from '../components/slot_primary_actions_provider_wo_end_fs_animation_provider';
import { IconsSoundModelWithMappingComponent } from '../components/icon_sound_model_with_mapping_component';
import { ExtendedGameStateMachineComponent } from '../components/extended_components/extended_game_state_machine_component';
import { CustomEpicWinPopupProvider } from '../components/custom_epic_win_popup_provider';
import { DelayedActionsHolder } from '../components/extended_components/delayed_actions/delayed_actions_holder';
import { ExtendedMultiSceneIconWithValuesProvider } from '../components/extended_components/extended_multi_scene_icon_with_values_provider';
import { MultiSceneIconValuesSystems } from '../components/icon_with_values/systems/multi_scene_icon_values_systems';
import { NoStbAnticipationProviderWithFSSupport } from '../components/anticipation/no_stb_anticipation_provider_with_f_s_support';
import { SingleSceneIconStopBehaviourWithFSSupportProvider } from '../components/icon_stop_behaviors/single_scene_icon_stop_behaviour_with_f_s_support_provider';

export class ExtendedSpinsSlotGame extends BaseReelsSlotGame {
  private _slotExtensions: ISlotExtension[];

  constructor(
    lobbyFacade: LobbyFacade,
    platform: Platform,
    progress: ISplashManager,
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
    gameParams: ExtendedSlotGameParams,
    sceneCommon: SceneCommon,
    extensions: ISlotExtension[],
    requiredComponents: symbol[],
    overridedComponents: OverridingComponentProvider[]
  ) {
    super(
      lobbyFacade,
      platform,
      progress,
      coordinateSystemInfoProvider,
      gameParams,
      requiredComponents,
      overridedComponents,
      sceneCommon
    );
    this._slotExtensions = extensions;
  }

  getSlotExtensions(): ISlotExtension[] {
    return this._slotExtensions;
  }

  addSlotExtension(extension: ISlotExtension): void {
    if (!this._slotExtensions) {
      this._slotExtensions = [];
    }
    this._slotExtensions.push(extension);
  }

  getRequiredComponents(): symbol[] {
    const extendedSlotParams = this.gameParams as ExtendedSlotGameParams;
    const defaultTypes = [
      T_DynamicDrawOrdersProvider,
      T_FakeReelReplacerComponent,
      T_EpicWinPopupProvider,
    ];
    if (extendedSlotParams.anticipationEnabled) {
      defaultTypes.push(T_AnticipationAnimationProvider);
    }
    if (extendedSlotParams.stbEnbled) {
      defaultTypes.push(T_SingleSceneIconStopBehaviourProvider);
    }
    if (extendedSlotParams.iconsWithValuesEnabled) {
      defaultTypes.push(T_MultiSceneIconWithValuesProvider);
    }

    return defaultTypes;
  }

  initCustomComponents(): void {
    this.initSlotPlugins();
    this._requiredComponents.push(...this.getRequiredComponents());
    super.initCustomComponents();
  }

  initComponentContainer(): void {
    super.initComponentContainer();
    const extendedSlotParams = this.gameParams as ExtendedSlotGameParams;
    this.registerAsSingleInstance(() => new IconValuesSystems(), T_IconValuesSystems);
    this.registerAsSingleInstance(
      (c) => new IconModelComponent(c, { maxIconId: extendedSlotParams.maxSlotIconId }),
      T_IconModelComponent
    );
    this.registerAsSingleInstance(
      (c) => new WinTextController(c, extendedSlotParams.waysCount),
      T_WinTextController
    );
    this.registerAsSingleInstance(
      () => new MultiSceneIconResourceProvider(this.sceneCommon, 'icons'),
      T_AbstractIconResourceProvider
    );
    this.registerAsSingleInstance(
      () => new CustomLoader(this.sceneCommon, extendedSlotParams.additionalLoaderFiles),
      T_OptionalLoader
    );
    this.registerAsSingleInstance((c) => new CustomReelsConfigComponent(c), T_IReelsConfigProvider);
    this.registerAsSingleInstance(
      (c) => new DynamicDrawOrdersProvider(c, { isHudUnderBonus: true }),
      T_DynamicDrawOrdersProvider
    );
    this.registerAsSingleInstance(
      (c) =>
        new ExtendedNWaysLineActionProvider(
          c,
          false,
          extendedSlotParams.shortWinLinesSpecificSpecGroup
        ),
      T_WinLineActionComponent
    );
    this.registerAsSingleInstance(
      (c) => new WinLineActionProvider(c, { pauseBackSoundOnWinLines: false }),
      T_IWinLineActionProvider
    );
    this.registerAsSingleInstance(
      () =>
        new SoundConfigurationProvider({
          stopBackgroundSoundOnAddFreeSpins: false,
          stopBackgroundSoundOnEndScatter: true,
          stopBackgroundSoundOnBonus: true,
          stopBackgroundSoundOnStartFreeSpins: true,
        }),
      T_SoundConfigurationProvider
    );
    this.registerAsSingleInstance(
      (c) => new FooterWithPlaceholderComponent(c),
      T_FooterWithPlaceholderComponent
    );
    this.registerAsSingleInstance(
      (c) => new MultiSceneReelsEngineComponentV2(c, true),
      T_ISlotGameEngineProvider
    );
    this.registerAsSingleInstance(
      (c) =>
        new SlotStopActionWithReplacedIconsProvider(
          c,
          this.sceneCommon,
          true,
          false,
          extendedSlotParams.uniqueSymbolOnReels
        ),
      T_IStopSlotActionProvider
    );
    this.registerAsSingleInstance(
      (c) => new ResponseInitialReelsComponent(c),
      T_InitialReelsComponent
    );
    this.registerAsSingleInstance(
      (c) => new ResponseInitialReelsProvider(c),
      T_IInitialReelsProvider
    );
    this.registerAsSingleInstance(
      (c) => new FakeReelReplacerComponent(c),
      T_FakeReelReplacerComponent
    );
    this.registerAsSingleInstance(
      (c) => new FakeMultireelReplacerComponent(c),
      T_FakeMultireelReplacerComponent
    );
    this.registerAsSingleInstance(
      (c) =>
        new LongStoppingIconEnumeratorProvider(
          c,
          extendedSlotParams.symbolsThatNotAppearNearSameSymbols,
          extendedSlotParams.replaceIconId
        ),
      T_IconEnumeratorComponent
    );
    this.registerAsSingleInstance(
      (c) => new SlotPrimaryAnimationWOEndFSAnimationProvider(c),
      T_ISlotPrimaryAnimationProvider
    );
    this.registerAsSingleInstance(
      (c) =>
        new IconsSoundModelWithMappingComponent(c, {
          maxIconId: extendedSlotParams.maxSlotIconId,
          soundMapping: extendedSlotParams.soundMap,
        }),
      T_IconsSoundModelComponent
    );
    this.registerAsSingleInstance(
      (c) =>
        new ExtendedGameStateMachineComponent(c, extendedSlotParams.shortWinLinesSpecificSpecGroup),
      T_IGameStateMachineProvider
    );
    this.registerAsSingleInstance(
      (c) =>
        new CustomEpicWinPopupProvider(
          c,
          this.sceneCommon,
          'big_win_new/scene_mobile',
          'big_win_new/sound',
          extendedSlotParams.epicWinAfterShortWinLines,
          extendedSlotParams.shortWinLinesSpecificSpecGroup
        ),
      T_EpicWinPopupProvider
    );
    this.registerAsSingleInstance((c) => new DelayedActionsHolder(c), T_IDelayedActionHolder);

    if (extendedSlotParams.iconsWithValuesEnabled) {
      this.registerAsSingleInstance(
        (c) => new ExtendedMultiSceneIconWithValuesProvider(c),
        T_MultiSceneIconWithValuesProvider
      );
      this.registerAsSingleInstance((c) => new MultiSceneIconValuesSystems(c), T_IconValuesSystems);
    }
    if (extendedSlotParams.anticipationEnabled) {
      this.registerAsSingleInstance(
        (c) => new NoStbAnticipationProviderWithFSSupport(c, this.sceneCommon),
        T_AnticipationAnimationProvider
      );
    }
    if (extendedSlotParams.stbEnbled) {
      this.registerAsSingleInstance(
        (c) =>
          new SingleSceneIconStopBehaviourWithFSSupportProvider(
            c,
            extendedSlotParams.disableScissorDuringSTB
          ),
        T_SingleSceneIconStopBehaviourProvider
      );
    }
  }

  private initSlotPlugins(): void {
    if (this._slotExtensions && this._slotExtensions.some(() => true)) {
      for (const plugin of this._slotExtensions) {
        this._requiredComponents.push(...plugin.getInitialRequiredTypes());
        for (const pluginComponent of plugin.getExtensionComponents()) {
          this.registerAsSingleInstance(pluginComponent.factory, pluginComponent.type);
        }
      }
    }
  }
}
