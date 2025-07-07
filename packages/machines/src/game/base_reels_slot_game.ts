import { ISplashManager, ICoordinateSystemInfoProvider, SceneCommon } from '@cgs/common';
import { IDisposable, Platform, SoundState } from '@cgs/syd';
import { BaseSlotGame, OverridingComponentProvider } from './base_slot_game';
import { ReelsEngineSlotSoundController } from './common/reels_engine_slot_sound_controller';
import { SlotSoundConfigEntry, SlotSoundType } from './common/slot_sound_config_entry';
import { CheatSceneObjectProvider } from './components/cheat_scene_object';
import { DisableBluredIconsComponent } from './components/disable_blured_icons_component';
import { FakeMultireelReplacerComponent } from './components/fake_multireel_replacer_component';
import { FakeReelReplacerComponent } from './components/fake_reel_replacer_component';
import { GameConfigController } from './components/game_config_controller';
import { IconEnumeratorComponent } from './components/icon_enumerator_component';
import { InitialReelsComponent } from './components/reel_net_api/initial_reels_component';
import { ReelsConfigComponent } from './components/reels_config_component';
import { ReelsEngineComponent } from './components/reels_engine_component';
import { ReelsEngineSlotPrimaryActionsProvider } from './components/reels_engine_slot_primary_actions_provider';
import { SingleSceneIconResourceProvider } from './components/single_scene_icon_resource_provider';
import { SpinActionComponent } from './components/spin_action_component';
import { StopActionComponent } from './components/stop_action_component';
import { FadeReelsProvider } from './components/win_lines/fade_reels_provider';
import { WinLineActionProvider } from './components/win_lines/win_line_action_provider';
import {
  T_AbstractIconResourceProvider,
  T_BaseSlotSoundController,
  T_CheatSceneObjectProvider,
  T_DisableBluredIconsComponent,
  T_FakeMultireelReplacerComponent,
  T_FakeReelReplacerComponent,
  T_GameConfigController,
  T_IFadeReelsProvider,
  T_IIconDrawOrderCalculator,
  T_IReelsConfigProvider,
  T_ISlotGameEngineProvider,
  T_ISlotPrimaryActionsProvider,
  T_IStartSlotActionProvider,
  T_IStopSlotActionProvider,
  T_IWinLineActionProvider,
  T_IconEnumeratorComponent,
  T_InitialReelsComponent,
} from '../type_definitions';
import { ReelsEngine } from '../reels_engine/reels_engine';
import { LobbyFacade } from '../lobby_facade';
import { IGameParams } from '../reels_engine/interfaces/i_game_params';
import { IconDrawOrderCalculator } from '../reels_engine/icon_draw_order_calculator';

export class BaseReelsSlotGame extends BaseSlotGame implements IDisposable {
  private _reelsEngine: ReelsEngine;

  constructor(
    lobbyFacade: LobbyFacade,
    platform: Platform,
    progress: ISplashManager,
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
    gameParams: IGameParams,
    requiredComponents: symbol[],
    overridedComponents: OverridingComponentProvider[],
    sceneCommon: SceneCommon,
    loadCustomHud: boolean = false
  ) {
    super(
      lobbyFacade,
      platform,
      progress,
      coordinateSystemInfoProvider,
      gameParams,
      requiredComponents,
      overridedComponents,
      sceneCommon,
      loadCustomHud
    );

    this._requiredComponents.push(T_GameConfigController);
    this._requiredComponents.push(T_FakeMultireelReplacerComponent);
    this._requiredComponents.push(T_FakeReelReplacerComponent);
    this._requiredComponents.push(T_DisableBluredIconsComponent);
  }

  initComponentContainer(): void {
    this.registerAsSingleInstance((_c) => {
      console.log('load IconDrawOrderCalculator');
      const result = new IconDrawOrderCalculator();
      return result;
    }, T_IIconDrawOrderCalculator);

    this.registerAsSingleInstance((c) => {
      console.log('load IconEnumeratorComponent');
      const result = new IconEnumeratorComponent(c);
      return result;
    }, T_IconEnumeratorComponent);

    this.registerAsSingleInstance((c) => {
      console.log('load ReelsConfigComponent');
      const result = new ReelsConfigComponent(c);
      return result;
    }, T_IReelsConfigProvider);

    this.registerAsSingleInstance((c) => {
      console.log('load GameConfigController');
      const result = new GameConfigController(c);
      return result;
    }, T_GameConfigController);

    this.registerAsSingleInstance((c) => {
      console.log('load ReelsEngineComponent');
      const result = new ReelsEngineComponent(c);
      return result;
    }, T_ISlotGameEngineProvider);

    this.registerAsSingleInstance((c) => {
      console.log('load SlotAnimationComponent');
      const result = new ReelsEngineSlotPrimaryActionsProvider(c);
      return result;
    }, T_ISlotPrimaryActionsProvider);

    this.registerAsSingleInstance((c) => {
      console.log('load CheatSceneObjectProvider');
      const result = new CheatSceneObjectProvider(c, false);
      return result;
    }, T_CheatSceneObjectProvider);

    this.registerAsSingleInstance((c) => {
      console.log('load SpinActionProvider');
      const result = new SpinActionComponent(c);
      return result;
    }, T_IStartSlotActionProvider);

    this.registerAsSingleInstance((c) => {
      console.log('load StopActionProvider');
      const result = new StopActionComponent(c, false);
      return result;
    }, T_IStopSlotActionProvider);

    const iconsLimit: Map<number, number> = new Map<number, number>();
    iconsLimit.set(0, 2);
    iconsLimit.set(1, 2);
    iconsLimit.set(2, 0);

    this.registerAsSingleInstance((c) => {
      console.log('load InitialReelsComponent');
      const result = new InitialReelsComponent(c, iconsLimit);
      return result;
    }, T_InitialReelsComponent);

    this.registerAsSingleInstance((c) => {
      console.log('load WinLineActionProvider');
      const result = new WinLineActionProvider(c);
      return result;
    }, T_IWinLineActionProvider);

    this.registerAsSingleInstance((c) => {
      console.log('load FadeReelsProvider');
      const result = new FadeReelsProvider(c);
      return result;
    }, T_IFadeReelsProvider);

    this.registerAsSingleInstance((_c) => {
      console.log('load IconResourceProvider');
      const result = new SingleSceneIconResourceProvider(this.sceneCommon);
      return result;
    }, T_AbstractIconResourceProvider);

    this.registerAsSingleInstance((c) => {
      console.log('load SlotSoundController');
      const result = new ReelsEngineSlotSoundController(c, [
        new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Playing, 'show'),
        new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Stopped, 'hide'),
        new SlotSoundConfigEntry(SlotSoundType.Background, SoundState.Paused, 'pause'),
      ]);
      return result;
    }, T_BaseSlotSoundController);

    this.registerAsSingleInstance((c) => {
      console.log('load FakeReelReplacerComponent');
      const result = new FakeReelReplacerComponent(c);
      return result;
    }, T_FakeReelReplacerComponent);

    this.registerAsSingleInstance((c) => {
      console.log('load DisableBluredIconsComponent');
      const result = new DisableBluredIconsComponent(c);
      return result;
    }, T_DisableBluredIconsComponent);

    this.registerAsSingleInstance((c) => {
      console.log('load FakeMultireelReplacerComponent');
      const result = new FakeMultireelReplacerComponent(c);
      return result;
    }, T_FakeMultireelReplacerComponent);

    super.initComponentContainer();
  }

  initSlotFinished(): void {
    super.initSlotFinished();
    this.container.forceResolve<CheatSceneObjectProvider>(T_CheatSceneObjectProvider);
  }
}
