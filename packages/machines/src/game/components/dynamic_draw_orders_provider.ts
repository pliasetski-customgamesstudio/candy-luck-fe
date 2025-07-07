import { Container, SceneObject } from '@cgs/syd';
import { GameStateMachineStates } from '../../reels_engine/state_machine/game_state_machine';
import { CharacterAnimationProvider } from './characters/character_animation_provider';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import { BonusGameProvider } from './mini_game/bonus_game_provider';
import { ScatterGameProvider } from './mini_game/scatter_game_provider';
import { ResourcesComponent } from './resources_component';
import {
  T_BonusGameProvider,
  T_CharacterAnimationProvider,
  T_GameStateMachineNotifierComponent,
  T_ResourcesComponent,
  T_ScatterGameProvider,
} from '../../type_definitions';

export class DynamicDrawOrdersProvider implements AbstractListener {
  private _container: Container;
  private _resourcesComponent: ResourcesComponent;

  private _savedDrawOrders: Map<SceneObject, number>;
  private _isHudUnderCharacter: boolean;
  private _isHudUnderBonus: boolean;
  private _isHudUnderScatter: boolean;
  private _isHudUnderGamble: boolean;
  private _isBonusUnderMachine: boolean;
  private _isBonusUnderContest: boolean;

  constructor(
    container: Container,
    {
      isHudUnderCharacter = false,
      isHudUnderBonus = false,
      isHudUnderScatter = false,
      isHudUnderGamble = false,
      isBonusUnderMachine = false,
      isBonusUnderContest = false,
    }: {
      isHudUnderCharacter?: boolean;
      isHudUnderBonus?: boolean;
      isHudUnderScatter?: boolean;
      isHudUnderGamble?: boolean;
      isBonusUnderMachine?: boolean;
      isBonusUnderContest?: boolean;
    } = {
      isHudUnderCharacter: false,
      isHudUnderBonus: false,
      isHudUnderScatter: false,
      isHudUnderGamble: false,
      isBonusUnderMachine: false,
      isBonusUnderContest: false,
    }
  ) {
    this._container = container;
    this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._isHudUnderCharacter = isHudUnderCharacter;
    this._isHudUnderBonus = isHudUnderBonus;
    this._isHudUnderScatter = isHudUnderScatter;
    this._isHudUnderGamble = isHudUnderGamble;
    this._savedDrawOrders = new Map<SceneObject, number>();
    this._isBonusUnderMachine = isBonusUnderMachine;
    this._isBonusUnderContest = isBonusUnderContest;

    const notifier = this._container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    ).notifier;
    notifier.AddListener(this);
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
      case GameStateMachineStates.Scatter:
      case GameStateMachineStates.Bonus:
        this.normalizeDrawOrders();
        break;
      default:
        break;
    }
  }

  normalizeDrawOrders(): void {
    this._savedDrawOrders.forEach((value, key) => {
      key.z = value;
    });
  }

  OnStateExited(slotState: string): void {}

  public changeDrawOrder(upperNode: SceneObject, bottomNode: SceneObject): void {
    if (!this._savedDrawOrders.has(upperNode)) {
      this._savedDrawOrders.set(upperNode, upperNode.z);
    }
    if (!this._savedDrawOrders.has(bottomNode)) {
      this._savedDrawOrders.set(bottomNode, bottomNode.z);
    }

    upperNode.z = bottomNode.z + 1;
  }

  showHudUnderCharacter(characterId: string): void {
    if (this._isHudUnderCharacter) {
      const bottomNode = this._resourcesComponent.footer;
      const upperNode = this._container
        .forceResolve<CharacterAnimationProvider>(T_CharacterAnimationProvider)
        .getTopCharacterScene(characterId);

      this.changeDrawOrder(upperNode, bottomNode);
    }
  }

  showHudUnderBonus(): void {
    if (this._isHudUnderBonus) {
      const bottomNode = this._resourcesComponent.footer;
      const upperNode =
        this._container.forceResolve<BonusGameProvider>(T_BonusGameProvider).bonusNode;

      this.changeDrawOrder(upperNode, bottomNode);
    }
  }

  showHudUnderScatter(): void {
    if (this._isHudUnderScatter) {
      const bottomNode = this._resourcesComponent.footer;
      const upperNode =
        this._container.forceResolve<ScatterGameProvider>(T_ScatterGameProvider).bonusNode;

      this.changeDrawOrder(upperNode, bottomNode);
    }
  }

  showHudUnderGamble(): void {}

  showBonusUnderMachine(): void {
    if (this._isBonusUnderMachine) {
      const bottomNode =
        this._container.forceResolve<BonusGameProvider>(T_BonusGameProvider).bonusNode;
      const upperNode = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).slot;
      this.changeDrawOrder(upperNode, bottomNode);
    }
  }

  showBonusUnderContests(): void {}

  showScatterUnderContests(): void {}
}
