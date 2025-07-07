import { Action, Container, SceneObject } from '@cgs/syd';
import { IStopSlotActionProvider } from '../i_stop_slot_action_provider';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse, SceneCommon } from '@cgs/common';
import { AbstractGameConfig } from '../../../reels_engine/game_config/abstract_game_config';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameConfigProvider,
  T_IGameStateMachineProvider,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
} from '../../../type_definitions';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { DrawOrderConstants } from '../../common/slot/views/base_popup_view';
import { ResourcesComponent } from '../resources_component';
import { StackedReelsStopSlotAction } from './stacked_reels_stop_slot_action';
import { SpinMode } from '../i_start_slot_action_provider';

export class StackedReelsStopSlotActionProvider implements IStopSlotActionProvider {
  private _container: Container;
  private _regularSpinSoundModel: ReelsSoundModel;
  private _stateMachine: GameStateMachine<ISpinResponse>;
  private _config: AbstractGameConfig;
  private readonly _stopReelsSoundImmediately: boolean;
  private readonly _useSounds: boolean;
  private _featureScene: SceneObject;
  private _selectIconSceneObject: SceneObject[];
  private _setIconsSceneObject: SceneObject | null;
  private _straightStatePattern: string;
  private _backStatePattern: string;
  private _featureSound: string;
  private _slowDownReelsSound: string;
  private _setIconSound: string;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    featureSceneName: string,
    selectIconSceneObjectId: string,
    setIconsSceneObjectId: string,
    straightStatePattern: string,
    backStatePattern: string,
    featureSound: string,
    slowDownReelsSound: string,
    setIconSound: string,
    stopReelsSoundImmediately = false,
    useSounds = true
  ) {
    this._container = container;
    this._regularSpinSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._stateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._config =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;

    this._featureScene = sceneCommon.sceneFactory.build(featureSceneName)!;
    if (this._featureScene) {
      this._featureScene.initialize();
      this._featureScene.active = this._featureScene.visible = true;
      this._featureScene.z = DrawOrderConstants.SlotLogoViewDrawOrder + 1;
      const resourcesComponent =
        this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
      resourcesComponent.root.addChild(this._featureScene);
      this._selectIconSceneObject = this._featureScene.findAllById(selectIconSceneObjectId);
      this._setIconsSceneObject = this._featureScene.findById(setIconsSceneObjectId);
    }

    this._straightStatePattern = straightStatePattern;
    this._backStatePattern = backStatePattern;
    this._featureSound = featureSound;
    this._slowDownReelsSound = slowDownReelsSound;
    this._setIconSound = setIconSound;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
  }

  getStopSlotAction(_spinMode: SpinMode): Action {
    return new StackedReelsStopSlotAction(
      this._container,
      this._stateMachine.curResponse.viewReels,
      this._stateMachine.curResponse.winLines,
      this._stateMachine.curResponse.winPositions,
      this._featureScene,
      this._selectIconSceneObject,
      this._setIconsSceneObject,
      this._straightStatePattern,
      this._backStatePattern,
      this._featureSound,
      this._slowDownReelsSound,
      this._setIconSound,
      this._config.regularSpinConfig.spinStopDelay,
      this._regularSpinSoundModel,
      this._stopReelsSoundImmediately,
      this._useSounds
    );
  }
}
