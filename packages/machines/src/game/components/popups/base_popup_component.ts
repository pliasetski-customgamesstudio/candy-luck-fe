import { Container, SceneObject } from '@cgs/syd';
import { SlotSession } from '../../common/slot_session';
import { BaseSlotPopupController } from '../../common/slot/controllers/base_popup_controller';
import { GameStateMachineNotifierComponent } from '../game_state_machine_notifier_component';
import { ISlotPopupView } from '../../common/base_slot_view';
import { SceneCommon } from '@cgs/common';
import {
  T_GameStateMachineNotifierComponent,
  T_ISlotSessionProvider,
  T_ResourcesComponent,
} from '../../../type_definitions';
import { ResourcesComponent } from '../resources_component';
import { ISlotSessionProvider } from '../interfaces/i_slot_session_provider';

export class BasePopupComponent<T extends ISlotPopupView> {
  static withExistinScene<T extends ISlotPopupView>(
    container: Container,
    sceneCommon: SceneCommon,
    sceneName: string
  ): BasePopupComponent<T> {
    return new BasePopupComponent<T>(container, sceneCommon, sceneName, true);
  }

  static withSound<T extends ISlotPopupView>(
    container: Container,
    sceneCommon: SceneCommon,
    sceneName: string,
    soundSceneName: string
  ): BasePopupComponent<T> {
    return new BasePopupComponent<T>(container, sceneCommon, sceneName, false, soundSceneName);
  }

  private _popupController: BaseSlotPopupController<T>;
  private _notifier: GameStateMachineNotifierComponent;
  private _slotSession: SlotSession;

  private _popupScene: SceneObject;
  private _popupSoundScene: SceneObject | null;
  private _rootScene: SceneObject;
  protected controllers: BaseSlotPopupController<T>[] = [];

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    sceneName: string,
    existingScene?: boolean,
    soundSceneName?: string
  ) {
    this._notifier = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    this._rootScene = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
    this._popupScene = (
      existingScene ?? false
        ? this._rootScene.findById(sceneName)
        : sceneCommon.sceneFactory.build(sceneName)
    )!;
    this._popupSoundScene = soundSceneName ? sceneCommon.sceneFactory.build(soundSceneName) : null;
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
  }

  get slotSession(): SlotSession {
    return this._slotSession;
  }

  get notifier(): GameStateMachineNotifierComponent {
    return this._notifier;
  }

  get popupScene(): SceneObject {
    return this._popupScene;
  }

  get popupSoundScene(): SceneObject | null {
    return this._popupSoundScene;
  }

  get rootScene(): SceneObject {
    return this._rootScene;
  }

  get popupController(): BaseSlotPopupController<T> {
    return this._popupController;
  }

  set popupController(value: BaseSlotPopupController<T>) {
    this._popupController = value;
  }

  public show(): void {
    this.popupController.view.show();
  }

  public hide(): void {
    this.popupController.view.hide();
  }
}
