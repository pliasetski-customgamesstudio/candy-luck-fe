import { ISpinResponse, SceneCommon } from '@cgs/common';
import { SceneObject, Container, CgsEvent, Vector2, Compatibility } from '@cgs/syd';
import { ResourcesComponent } from '../../resources_component';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGame } from '../../../../reels_engine/i_slot_game';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_ResourcesComponent,
  T_IGameStateMachineProvider,
  T_ISlotGame,
} from '../../../../type_definitions';

export class Game12OrientationHadler {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _root: SceneObject;
  private _gameNode: SceneObject;
  public isPortraitOrientation: boolean = true;
  private _portrait: SceneObject;
  private _landscape: SceneObject;

  constructor(container: Container, sceneCommon: SceneCommon) {
    const resourceComponent: ResourcesComponent = container.forceResolve<ResourcesComponent>(
      T_ResourcesComponent
    ) as ResourcesComponent;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._root = resourceComponent.root;
    this._gameNode = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    this._portrait = sceneCommon.sceneFactory.build('slot/featureVertical') as SceneObject;
    this._landscape = sceneCommon.sceneFactory.build('slot/featureHorizontal') as SceneObject;
    this.isPortraitOrientation = Compatibility.isPortrait;
    this._gameNode.findById('featureSceneHolder')?.addChild(this._portrait);
    this._gameNode.findById('featureSceneHolder')?.addChild(this._landscape);

    const resizeFunction = (_e: CgsEvent) => {
      const modesParent = this._root.findById('Modes')?.parent as SceneObject;

      if (Compatibility.isPortrait) {
        this._landscape.visible = false;
        this._portrait.visible = true;
        const hud_state =
          this._gameStateMachine &&
          this._gameStateMachine.curResponse &&
          this._gameStateMachine.curResponse.isFreeSpins &&
          this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
            FreeSpinsInfoConstants.FreeSpinsFinished
            ? 'portrait_freespins'
            : 'portrait';
        this._root.findById('hud_mode')?.stateMachine!.switchToState(hud_state);
        this._root.findById('Modes')?.stateMachine!.switchToState('vertical');
        const initialSizeX = this._root.findById('sizeNodeVertical')?.size.x as number;
        const initialPosX = this._root.findById('icons_holder')?.parent?.position.x as number;
        const initialPosY = this._root.findById('icons_holder')?.parent?.position.y as number;
        let windowWidth = window.innerWidth;

        const originalRatio = 1657 / 768;
        const windowRatio = window.innerHeight / window.innerWidth;
        if (windowRatio > originalRatio) {
          windowWidth = 768;
          const scale = windowWidth / initialSizeX;
          const offsetX = initialPosX * (1 - scale);
          const offsetY = initialPosY * (1 - scale);
          modesParent.position.add(new Vector2(offsetX, offsetY));
          modesParent.scale = new Vector2(scale, scale);
        } else {
          const newwindowWidth = windowWidth * (1657 / window.innerHeight);
          const scale = newwindowWidth / initialSizeX;
          const offsetX = initialPosX * (1 - scale);
          const offsetY = initialPosY * (1 - scale);
          modesParent.position.add(new Vector2(offsetX, offsetY));
          modesParent.scale = new Vector2(scale, scale);
        }
      } else {
        this._landscape.visible = true;
        this._portrait.visible = false;
        const hud_state =
          this._gameStateMachine &&
          this._gameStateMachine.curResponse &&
          this._gameStateMachine.curResponse.isFreeSpins &&
          this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
            FreeSpinsInfoConstants.FreeSpinsFinished
            ? 'landscape_freespins'
            : 'landscape';
        this._root.findById('hud_mode')?.stateMachine!.switchToState(hud_state);
        this._root.findById('Modes')?.stateMachine!.switchToState('horizontal');
        modesParent.position = new Vector2(0.0, 0.0);
        modesParent.scale = new Vector2(1.0, 1.0);
      }
    };

    const resizeWithDelay = async (_e: Event) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      resizeFunction(CgsEvent.Empty);
    };

    window.addEventListener('resize', resizeWithDelay);
    window.addEventListener('orientationchange', resizeWithDelay);
    document.addEventListener('fullscreenchange', resizeWithDelay);
    document.addEventListener('mozfullscreenchange', resizeWithDelay);
    document.addEventListener('msfullscreenchange', resizeWithDelay);
    document.addEventListener('webkitfullscreenchange', resizeWithDelay);

    this._gameStateMachine.init.entered.listen((_e) => resizeFunction(CgsEvent.Empty));
    this._gameStateMachine.beginFreeSpinsPopup.leaved.listen((_e) =>
      resizeFunction(CgsEvent.Empty)
    );
    this._gameStateMachine.endFreeSpinsPopup.leaved.listen((_e) => resizeFunction(CgsEvent.Empty));
    resizeFunction(CgsEvent.Empty);
  }
}
