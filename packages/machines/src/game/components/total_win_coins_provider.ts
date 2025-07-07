import {
  CgsEvent,
  Container,
  IComponent,
  InterpolateInplaceAction,
  IntervalAction,
  ParallelAction,
  SceneObject,
  SpriteBatch,
  Vector2,
} from '@cgs/syd';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ResourcesComponent } from './resources_component';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse, SceneCommon } from '@cgs/common';
import { T_GameStateMachineNotifierComponent, T_ResourcesComponent } from '../../type_definitions';
import { GameStateMachineNotifierComponent } from './game_state_machine_notifier_component';
import { DrawOrderConstants } from '../common/slot/views/base_popup_view';

export class TotalWinCoinsProvider implements IComponent {
  private _reelsEngine: ReelsEngine;
  private _resourceComponent: ResourcesComponent;
  private _reelsSoundModel: ReelsSoundModel;
  private _iconsSoundModel: IconsSoundModel;
  private _stateMachine: GameStateMachine<ISpinResponse>;

  private _webCoins: SceneObject;
  private _movingScene: SceneObject;
  private _explosionScene: SceneObject;
  private _balanceScene: SceneObject;
  private _winTextScene: SceneObject;

  private _originalAction: IntervalAction;

  constructor(container: Container, sceneCommon: SceneCommon) {
    this._resourceComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);

    const notifierComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    this._stateMachine = notifierComponent.gameStateMachine;

    this._webCoins = sceneCommon.sceneFactory.build('TotalWinWebCoins/scene')!;
    this._webCoins.z = DrawOrderConstants.BasePopupViewDrawOrder;
    this._webCoins.initialize();

    this._movingScene = this._webCoins.findById('coins')!;
    this._explosionScene = this._webCoins.findById('explosion')!;

    this._winTextScene = this._resourceComponent.root.findById('coins_start')!;

    const endState = this._movingScene.stateMachine!.findById('move')!;
    endState.enterAction.done.listen(() => {
      this.hideMovingScene();
    });

    const moveState = this._movingScene.stateMachine!.findById('move')!;
    this._originalAction = moveState.enterAction as IntervalAction;
    this._updateActionAtMoveState();
  }

  private _getMoveAction(): IntervalAction {
    const moveToObject = new InterpolateInplaceAction<Vector2>((v) => v.clone())
      .withInterpolateFunction(Vector2.lerpInplace)
      .withValues(
        new Vector2(this._winTextScene.worldTransform.tx, this._winTextScene.worldTransform.ty),
        new Vector2(this._balanceScene.worldTransform.tx, this._balanceScene.worldTransform.ty)
      )
      .withTimeFunction((time) => time)
      .withDuration(0.5);

    moveToObject.valueChange.listen((e) => {
      this._movingScene.position = e;
    });

    return moveToObject;
  }

  public update(dt: number): void {
    this._webCoins.update(dt);
  }

  public dispatchEvent(event: CgsEvent): void {
    this._webCoins.dispatchEvent(event);
  }

  public draw(spriteBatch: SpriteBatch): void {
    this._webCoins.draw(spriteBatch);
  }

  public showMovingScene(): void {
    if (this._movingScene.stateMachine) {
      this._webCoins.visible = true;
      this._movingScene.position = new Vector2(
        this._winTextScene.worldTransform.tx,
        this._winTextScene.worldTransform.ty
      );
      this._movingScene.stateMachine.switchToState('default');
      this._movingScene.stateMachine.switchToState('rotate');

      this._explosionScene.position = new Vector2(
        this._winTextScene.worldTransform.tx,
        this._winTextScene.worldTransform.ty
      );
      this._explosionScene.stateMachine!.switchToState('default');
      this._explosionScene.stateMachine!.switchToState('rotate');
    }
  }

  private _updateScale(): void {
    if (this._webCoins.visible) {
      this.hideMovingScene();
    }

    this._updateActionAtMoveState();
  }

  private _updateActionAtMoveState(): void {
    const moveState = this._movingScene.stateMachine!.findById('move')!;
    moveState.enterAction = new ParallelAction([this._originalAction, this._getMoveAction()]);
  }

  public hideMovingScene(): void {
    this._webCoins.visible = false;
  }
}
