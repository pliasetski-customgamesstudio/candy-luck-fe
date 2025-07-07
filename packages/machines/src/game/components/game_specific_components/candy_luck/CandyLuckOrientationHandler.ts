import { ISpinResponse, SceneCommon } from '@cgs/common';
import { SceneObject, Container, CgsEvent, Vector2, Compatibility, debounce } from '@cgs/syd';
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
import {
  CandyLuckProgressComponent,
  T_CandyLuckProgressComponent,
} from './CandyLuckProgressComponent';

export const T_CandyLuckOrientationHandler = Symbol('CandyLuckOrientationHandler');

const ASPECT_RATION_SCALE_FPR_PORT_CONFIG: { aspect: number; scale: Vector2 }[] = [
  { aspect: 1.1, scale: new Vector2(0.75, 0.75) },
  { aspect: 1.2, scale: new Vector2(0.8, 0.8) },
  { aspect: 1.3, scale: new Vector2(0.9, 0.9) },
  { aspect: 1.7, scale: new Vector2(1, 1) },
];

export class CandyLuckOrientationHandler {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _root: SceneObject;
  private _gameNode: SceneObject;
  public isPortraitOrientation: boolean = true;
  private _portrait: SceneObject;
  private _landscape: SceneObject;

  private readonly _progressComponent: CandyLuckProgressComponent;

  constructor(container: Container, sceneCommon: SceneCommon) {
    const resourceComponent: ResourcesComponent = container.forceResolve<ResourcesComponent>(
      T_ResourcesComponent
    ) as ResourcesComponent;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    this._progressComponent = container.forceResolve<CandyLuckProgressComponent>(
      T_CandyLuckProgressComponent
    );

    this._root = resourceComponent.root;
    this._gameNode = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    this._portrait = sceneCommon.sceneFactory.build('slot/featureVertical') as SceneObject;
    this._landscape = sceneCommon.sceneFactory.build('slot/featureHorizontal') as SceneObject;
    this.isPortraitOrientation = Compatibility.isPortrait;
    this._gameNode.findById('featureSceneHolder')?.addChild(this._portrait);
    this._gameNode.findById('featureSceneHolder')?.addChild(this._landscape);

    const resizeFunction = (_e: CgsEvent) => {
      const modesParent = this._root.findById('Modes')?.parent as SceneObject;

      const aspectRatio = window.innerHeight / window.innerWidth;
      console.log('Aspect Ratio:', aspectRatio);

      if (Compatibility.isPortrait) {
        this._landscape.visible = false;
        this._portrait.visible = true;
        // const hud_state =
        //   this._gameStateMachine &&
        //   this._gameStateMachine.curResponse &&
        //   this._gameStateMachine.curResponse.isFreeSpins &&
        //   this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
        //     FreeSpinsInfoConstants.FreeSpinsFinished
        //     ? 'portrait_freespins'
        //     : 'portrait';
        const hud_state = 'portrait';
        this._root.findById('hud_mode')?.stateMachine!.switchToState(hud_state);
        this._root.findById('Modes')?.stateMachine!.switchToState('vertical');
        const initialSizeX = this._root.findById('sizeNodeVertical')?.size.x as number;
        const initialPosX = this._root.findById('icons_holder')?.parent?.position.x as number;
        const initialPosY = this._root.findById('icons_holder')?.parent?.position.y as number;
        let windowWidth = window.innerWidth;

        const originalRatio = 1657 / 768;
        const windowRatio = window.innerHeight / window.innerWidth;

        const config = ASPECT_RATION_SCALE_FPR_PORT_CONFIG.find(
          (item) => item.aspect >= windowRatio
        );

        const scaleMultiplier = config?.scale || new Vector2(1, 1);

        this.adjustPortraitProgress(!!config);

        if (windowRatio > originalRatio) {
          windowWidth = 768;
          const scale = windowWidth / initialSizeX;
          const offsetX = initialPosX * (1 - scale);
          const offsetY = initialPosY * (1 - scale);
          modesParent.position.add(new Vector2(offsetX, offsetY));
          modesParent.scale = new Vector2(scale, scale).multiply(scaleMultiplier);
        } else {
          const newwindowWidth = windowWidth * (1657 / window.innerHeight);
          const scale = newwindowWidth / initialSizeX;
          const offsetX = initialPosX * (1 - scale);
          const offsetY = initialPosY * (1 - scale);
          modesParent.position.add(new Vector2(offsetX, offsetY));
          modesParent.scale = new Vector2(scale, scale).multiply(scaleMultiplier);
        }
      } else {
        this.adjustPortraitProgress(false);

        this._landscape.visible = true;
        this._portrait.visible = false;
        // const hud_state =
        //   this._gameStateMachine &&
        //   this._gameStateMachine.curResponse &&
        //   this._gameStateMachine.curResponse.isFreeSpins &&
        //   this._gameStateMachine.curResponse.freeSpinsInfo!.event !=
        //     FreeSpinsInfoConstants.FreeSpinsFinished
        //     ? 'landscape_freespins'
        //     : 'landscape';
        const hud_state = 'landscape';
        this._root.findById('hud_mode')?.stateMachine!.switchToState(hud_state);
        this._root.findById('Modes')?.stateMachine!.switchToState('horizontal');
        modesParent.position = new Vector2(0.0, 0.0);
        modesParent.scale = new Vector2(1.0, 1.0);
      }
    };

    const debounceResize = debounce(() => resizeFunction(CgsEvent.Empty), 100);

    window.addEventListener('resize', debounceResize);
    window.addEventListener('orientationchange', debounceResize);
    document.addEventListener('fullscreenchange', debounceResize);
    document.addEventListener('mozfullscreenchange', debounceResize);
    document.addEventListener('msfullscreenchange', debounceResize);
    document.addEventListener('webkitfullscreenchange', debounceResize);

    this._gameStateMachine.init.entered.listen((_e) => resizeFunction(CgsEvent.Empty));
    this._gameStateMachine.beginFreeSpinsPopup.leaved.listen((_e) =>
      resizeFunction(CgsEvent.Empty)
    );
    this._gameStateMachine.endFreeSpinsPopup.leaved.listen((_e) => resizeFunction(CgsEvent.Empty));
    resizeFunction(CgsEvent.Empty);
  }

  private _originalPortParams: {
    position: Vector2;
    z: number;
  };

  public adjustPortraitProgress(needToScale: boolean): void {
    const progressScene = this._progressComponent.dailyTaskPortScene;

    if (!this._originalPortParams) {
      this._originalPortParams = {
        position: progressScene.position.clone(),
        z: progressScene.z,
      };
    }

    if (needToScale) {
      progressScene.position = this._originalPortParams.position.add(new Vector2(0, 200));
      progressScene.z = 6;
    } else {
      progressScene.position = this._originalPortParams.position;
      progressScene.z = this._originalPortParams.z;
    }
  }
}
