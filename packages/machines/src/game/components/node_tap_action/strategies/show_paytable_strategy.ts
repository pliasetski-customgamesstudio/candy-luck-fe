import {
  SceneCommon,
  ISpinResponse,
  MachineSymbol,
  SceneFactory,
  T_SceneFactory,
  NumberFormatter,
} from '@cgs/common';
import { Container, SceneObject, TextSceneObject } from '@cgs/syd';
import { ISlotPopupCoordinator } from '../../../common/slot_popup_coordinator';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import { ResourcesComponent } from '../../resources_component';
import { IconWinLinesProvider } from '../../win_lines/icon_win_lines_provider';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_IconWinLinesProvider,
  T_IGameStateMachineProvider,
  T_ISlotPopupCoordinator,
  T_ResourcesComponent,
  T_ISlotSessionProvider,
} from '../../../../type_definitions';
import { IconActionContext } from '../contexts/icon_action_context';
import { IActionNodeStrategy } from './i_action_node_strategy';

export class ShowPaytableStrategy implements IActionNodeStrategy<IconActionContext> {
  private _container: Container;
  private _sceneCommon: SceneCommon;
  private _iconWinLinesProvider: IconWinLinesProvider;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _popupCoordinator: ISlotPopupCoordinator;

  private _rightName: string;
  private _leftName: string;
  private _isNullPriceStateMachine: boolean;
  private _startActionStateName: string;
  private _symbols: MachineSymbol[];
  private _iconsHolder: SceneObject | null;
  private _sceneFactory: SceneFactory;
  private _scene: SceneObject | null;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    {
      rightShowSceneName = 'paytable_right',
      leftShowSceneName = 'paytable_left',
      startAnimStateName = 'show',
      isNullPriceStateMachine = false,
    }: {
      rightShowSceneName?: string;
      leftShowSceneName?: string;
      startAnimStateName?: string;
      isNullPriceStateMachine?: boolean;
    }
  ) {
    this._container = container;
    this._sceneCommon = sceneCommon;
    this._iconWinLinesProvider = this._container.forceResolve(T_IconWinLinesProvider);
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._popupCoordinator =
      this._container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    this._iconsHolder = this._container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .slot.findById('anim_icons_holder');
    if (!this._iconsHolder) {
      this._iconsHolder = this._container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .slot.findById('icons_holder');
    }
    this._sceneFactory = this._container.forceResolve(T_SceneFactory);

    this._leftName = leftShowSceneName;
    this._rightName = rightShowSceneName;
    this._isNullPriceStateMachine = isNullPriceStateMachine;
    this._startActionStateName = startAnimStateName;
    this._symbols =
      this._container.forceResolve<ISlotSessionProvider>(
        T_ISlotSessionProvider
      ).slotSession.machineInfo.symbols;

    this._gameStateMachine.accelerate.entered.listen(() => {
      this.goToDefault();
    });

    // if (
    //   this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
    //     .gameEngine instanceof AnimationBasedGameEngine
    // ) {
    //   this._iconsHolder!.z = 999;
    // }
  }

  performStrategy(context: IconActionContext): void {
    if (
      [GameStateMachineStates.Idle, GameStateMachineStates.RegularSpin].some((state) =>
        this._gameStateMachine.isActive(state)
      ) &&
      !this._popupCoordinator.isPopupShown() &&
      (!this._gameStateMachine.curResponse.winLines ||
        this._gameStateMachine.curResponse.winLines.length == 0) &&
      (!this._gameStateMachine.curResponse.winPositions ||
        this._gameStateMachine.curResponse.winPositions.length == 0) &&
      this._gameStateMachine.curResponse.isScatter == false &&
      this._gameStateMachine.curResponse.isBonus == false &&
      (!this._gameStateMachine.curResponse.freeSpinsInfo ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      this.goToDefault();
      if (context.ignoreIconList.includes(context.iconId)) {
        return;
      }

      const sceneName =
        context.reelIndex >= context.reelsCount - 2 ? this._leftName : this._rightName;
      this._scene = this._createFeatureNode(sceneName);
      const gains = this._getGainsList(context.iconId);
      const priceStateName = this._getStateNameByGains(gains);
      this._setTextNodes(gains);
      const finalStateName = context.uniqueList.includes(context.iconId)
        ? 'unique_' + context.iconId.toString()
        : priceStateName;

      if (!this._sendPriceNodeEvent(finalStateName)) {
        return;
      }

      this._scene.position = context.position;
      this._scene.stateMachine!.switchToState(this._startActionStateName);
    }
  }

  goToDefault(): void {
    if (this._scene) {
      this._iconsHolder!.removeChild(this._scene);
      this._scene = null;
    }
  }

  private _getGainsList(iconId: number): number[] {
    const symbol = this._symbols.find((x) => x.id == iconId);
    return symbol ? symbol.gains ?? [] : [];
  }

  private _getStateNameByGains(gains: number[]): string {
    const firstNonZeroElem = gains.find((x) => x > 0);
    const firstNonZero =
      typeof firstNonZeroElem === 'number' ? gains.indexOf(firstNonZeroElem) : -1;

    const lastNonZeroElem = gains.reverse().find((x) => x > 0);
    const lastNonZero = typeof lastNonZeroElem === 'number' ? gains.indexOf(lastNonZeroElem) : -1;

    return `price_${lastNonZero + 1}_${firstNonZero + 1}`;
  }

  private _setTextNodes(gains: number[]): void {
    for (let i = 0; i < gains.length; i++) {
      const textNode = this._scene!.findById(`price_${i + 1}`) as TextSceneObject;
      if (textNode) {
        textNode.text = NumberFormatter.format(gains[i]);
      }
    }
  }

  private _createFeatureNode(sceneName: string): SceneObject {
    const scene = this._sceneCommon.sceneFactory.build(`additional/${sceneName}`)!;
    scene.z = 100000;
    scene.id = sceneName;
    scene.initialize();
    this._iconsHolder!.addChild(scene);
    return scene;
  }

  private _sendPriceNodeEvent(stateName: string): boolean {
    if (this._isNullPriceStateMachine) {
      return true;
    }

    const priceNode = this._scene!.findById('price');
    if (priceNode && priceNode.stateMachine && priceNode.stateMachine.findById(stateName)) {
      priceNode.stateMachine.switchToState(stateName);
      return true;
    }
    return false;
  }
}
