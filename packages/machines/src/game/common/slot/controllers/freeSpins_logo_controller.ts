import { InternalRespinSpecGroup, SceneCommon } from '@cgs/common';
import { SceneObject, Button, ResourcePackage, Container } from '@cgs/syd';
import { SlotSession } from '../../slot_session';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../../../components/game_state_machine_notifier_component';
import { ResourcesComponent } from '../../../components/resources_component';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
import { DrawOrderConstants } from '../views/base_popup_view';
import { FreeSpinsLogoView } from '../views/freeSpins_logo_view';
import { T_ResourcesComponent } from '../../../../type_definitions';

export class FreeSpinsLogoController implements AbstractListener {
  private _notifier: GameStateMachineNotifierComponent;
  get notifier(): GameStateMachineNotifierComponent {
    return this._notifier;
  }
  private _scene: SceneObject;
  get scene(): SceneObject {
    return this._scene;
  }
  private _closeButton: Button;
  private _package: ResourcePackage;
  private close: Promise<void>;
  private _viewComponent: FreeSpinsLogoView;
  get viewComponent(): FreeSpinsLogoView {
    return this._viewComponent;
  }
  set viewComponent(value: FreeSpinsLogoView) {
    this._viewComponent = value;
  }

  get logoNode(): SceneObject {
    return this._scene;
  }
  get logoTable(): SceneObject {
    return this._scene.findById('table')!;
  }

  constructor(
    container: Container,
    notifier: GameStateMachineNotifierComponent,
    slotSession: SlotSession,
    sceneCommon: SceneCommon,
    embededLogo: boolean
  ) {
    this._scene = sceneCommon.sceneFactory.build('logo/scene')!;
    this._scene.z = DrawOrderConstants.SlotLogoViewDrawOrder;
    notifier.notifier.AddListener(this);
    this._scene.initialize();
    this._viewComponent = new FreeSpinsLogoView(container, this._scene, embededLogo);
    container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root.addChild(this._scene);
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case 'accelerate':
        if (
          this._notifier.gameStateMachine.curResponse.isFreeSpins &&
          this._notifier.gameStateMachine.curResponse.freeSpinsInfo!.event !=
            FreeSpinsInfoConstants.FreeSpinsFinished
        ) {
          const respinGroup =
            this._notifier.gameStateMachine.curResponse.additionalData instanceof
            InternalRespinSpecGroup
              ? this._notifier.gameStateMachine.curResponse.additionalData
              : null;
          if (
            !respinGroup ||
            (respinGroup.respinStarted && respinGroup.respinCounter == respinGroup.groups.length)
          ) {
            this._viewComponent.setFreeSpinsCounter(
              this._notifier.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!
                .count! - 1
            );
          }
        }
        break;
      case 'freeSpinRecovery':
        this._viewComponent.setFreeSpinsCounter(
          this._notifier.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! -
            1
        );
        break;
      default:
        break;
    }
  }

  OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.BeginFreeSpinsPopup:
        this._viewComponent.setFreeSpinsCounter(
          this._notifier.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count!
        );
        break;
      default:
        break;
    }
  }
}
