import { ISpinResponse } from '@cgs/common';
import { SceneObject, Container, AbstractMouseEvent, MouseDownEvent, MouseUpEvent } from '@cgs/syd';
import { IReelsConfigProvider } from '../../interfaces/i_reels_config_provider';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ISlotGameEngine } from '../../../../reels_engine/i_slot_game_engine';
import { IGameParams } from '../../../../reels_engine/interfaces/i_game_params';
import { ReelsEngine } from '../../../../reels_engine/reels_engine';
import { SlotParams } from '../../../../reels_engine/slot_params';
import { IconActionContext } from '../contexts/icon_action_context';
import { IActionNodeStrategy } from '../strategies/i_action_node_strategy';
import {
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_IReelsConfigProvider,
  T_ISlotGameEngineProvider,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';

export enum ActionNodeMouseState {
  Normal = 0,
  Click = 1,
  Hover = 2,
  Swipe = 3,
  Down = 4,
  LongClick = 5,
}

export class BaseSlotActionNode<TContext> extends SceneObject {
  private _reelIndex: number;
  private _lineIndex: number;
  private _ignoreList: number[];
  private _uniqueList: number[];
  private _container: Container;
  private _actions: Map<ActionNodeMouseState, IActionNodeStrategy<TContext>[]>;

  private static _currentState: ActionNodeMouseState;
  private static _currentStateIsStarted: boolean;
  private _lastTouchDuration: number;

  constructor(
    container: Container,
    reelIndex: number,
    lineIndex: number,
    actions: Map<ActionNodeMouseState, IActionNodeStrategy<TContext>[]>,
    uniqueList: number[] | null = null,
    ignoreList: number[] | null = null
  ) {
    super();
    this._container = container;
    this._reelIndex = reelIndex;
    this._lineIndex = lineIndex;
    this._actions = actions;
    BaseSlotActionNode._currentState = ActionNodeMouseState.Normal;
    BaseSlotActionNode._currentStateIsStarted = false;
    this._ignoreList = ignoreList ? ignoreList : [];
    this._lastTouchDuration = 0.0;
    this._uniqueList = uniqueList ? uniqueList : [];
  }

  public update(dt: number): void {
    if (BaseSlotActionNode._currentState == ActionNodeMouseState.Down) {
      this._lastTouchDuration += dt;
    }
    super.update(dt);
  }

  public onTouch(event: AbstractMouseEvent): void {
    this._captureMouseState(event);

    this._actions.forEach((strategies, key) => {
      if (BaseSlotActionNode._currentState == key && !BaseSlotActionNode._currentStateIsStarted) {
        strategies.forEach((s) => s.performStrategy(this.buildActionContext() as TContext));
        BaseSlotActionNode._currentStateIsStarted = true;
      }
    });

    if (event instanceof MouseEvent) {
      event.accept();
    }
  }

  private _captureMouseState(event: AbstractMouseEvent): void {
    if (event instanceof MouseDownEvent) {
      this._lastTouchDuration = 0.0;
      BaseSlotActionNode._currentState = ActionNodeMouseState.Down;
      BaseSlotActionNode._currentStateIsStarted = false;
    }
    if (event instanceof MouseUpEvent) {
      if (
        Math.abs(event.event.location.x - event.upEvent.location.x) > 0.1 ||
        Math.abs(event.event.location.y - event.event.location.y) > 0.1
      ) {
        BaseSlotActionNode._currentState = ActionNodeMouseState.Swipe;
        BaseSlotActionNode._currentStateIsStarted = false;
      } else {
        if (this._lastTouchDuration > 1.0) {
          BaseSlotActionNode._currentState = ActionNodeMouseState.LongClick;
        } else {
          BaseSlotActionNode._currentState = ActionNodeMouseState.Click;
        }
        BaseSlotActionNode._currentStateIsStarted = false;
      }
    }
  }

  protected buildActionContext(): any {
    const iconId = this._getIconId(this._reelIndex, this._lineIndex);
    const iconLength = this._getIconLength(iconId);
    const drawId = this._getDrawId(this._reelIndex, this._lineIndex);

    const actionContext = new IconActionContext();
    actionContext.reelIndex = this._reelIndex;
    actionContext.lineIndex = this._lineIndex;
    actionContext.reelsCount = this._getGameParams().groupsCount;
    actionContext.drawId = drawId;
    actionContext.iconId = iconId;
    actionContext.iconLength = iconLength;
    actionContext.position = this.position;
    actionContext.ignoreIconList = this._ignoreList;
    actionContext.uniqueList = this._uniqueList;
    return actionContext;
  }

  private _getCurrentResponse(): ISpinResponse {
    return this._container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider)
      .gameStateMachine.curResponse;
  }

  private _getGameParams(): IGameParams {
    return this._container.forceResolve<IGameParams>(T_IGameParams);
  }

  private _getIconId(reelIndex: number, lineIndex: number): number {
    const engine: ISlotGameEngine =
      this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
    return engine.getAnimationIconIds(this._getGameParams().groupsCount * lineIndex + reelIndex)[0];
  }

  private _getIconLength(iconId: number): number {
    const gameParams: IGameParams | null = this._container.resolve<IGameParams>(T_IGameParams);
    // if (!gameParams && !(gameParams instanceof SlotParams)) {
    if (!gameParams) {
      return 1;
    }

    const longIcons = (gameParams as SlotParams).longIcons;
    const longIcon = longIcons ? longIcons.find((x) => x.iconIndex == iconId) : null;
    return longIcon ? longIcon.length : 1;
  }

  private _getPosition(reelIndex: number, lineIndex: number): number {
    return (
      this._container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig
        .reelCount *
        lineIndex +
      reelIndex
    );
  }

  private _getDrawId(reelIndex: number, lineIndex: number): number {
    if (
      !(
        this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
          .gameEngine instanceof ReelsEngine
      )
    ) {
      return this._getIconId(reelIndex, lineIndex);
    }
    const engine = this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    const iconHelper = engine.iconAnimationHelper;
    const position = this._getPosition(reelIndex, lineIndex);
    return iconHelper.getDrawIndexes(position)[0];
  }
}
