import { SceneCommon } from '@cgs/common';
import { Container, SceneObject } from '@cgs/syd';
import { DrawOrderConstants } from '../common/slot/views/base_popup_view';
import { GameStateMachineStates } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_ResourcesComponent,
  T_GameStateMachineNotifierComponent,
  T_IFreeSpinsModeProvider,
} from '../../type_definitions';
import { IFreeSpinsModeProvider } from './free_spins/i_free_spins_mode_provider';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import { ResourcesComponent } from './resources_component';

export class FreeSpinsModeBackgroundProvider implements AbstractListener {
  private static readonly FsSceneNameTemplate: string = 'scene_freespinsSCENE_NUMBER';
  private static readonly FsSearchEntry: string = 'SCENE_NUMBER';
  private static readonly InitialBackGround: string = 'scene';

  private _container: Container;
  private _sceneCommon: SceneCommon;
  private _gameResProvider: ResourcesComponent;
  private _gameNode: SceneObject;

  constructor(container: Container, sceneCommon: SceneCommon) {
    this._container = container;
    this._sceneCommon = sceneCommon;
    this._gameResProvider = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._gameNode = this._gameResProvider.root;
    this._container
      .forceResolve<GameStateMachineNotifierComponent>(T_GameStateMachineNotifierComponent)
      .notifier.AddListener(this);
  }

  private get _currentMode(): string {
    return this._container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider)
      .currentMode!;
  }

  public get currentMode(): string {
    return this._currentMode || '';
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.FreeSpinRecovery:
        this.setNewBackground(
          FreeSpinsModeBackgroundProvider.FsSceneNameTemplate.replace(
            FreeSpinsModeBackgroundProvider.FsSearchEntry,
            this.currentMode
          )
        );
        break;

      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.setNewBackground(FreeSpinsModeBackgroundProvider.InitialBackGround);
        break;
    }
  }

  public OnStateExited(slotState: string): void {
    if (slotState == GameStateMachineStates.Scatter) {
      this.setNewBackground(
        FreeSpinsModeBackgroundProvider.FsSceneNameTemplate.replace(
          FreeSpinsModeBackgroundProvider.FsSearchEntry,
          this.currentMode
        )
      );
    }
  }

  private setNewBackground(sceneName: string): void {
    const node = this._sceneCommon.sceneFactory.build('slot_bg/' + sceneName);
    if (node) {
      node.z = DrawOrderConstants.BackGroundDrawOrder;
      node.initialize();
      this._gameNode.removeChild(this._gameResProvider.bg);
      this._gameResProvider.bg.deinitialize();
      this._gameNode.addChild(node);
      this._gameResProvider.bg = node;
    }
  }
}
