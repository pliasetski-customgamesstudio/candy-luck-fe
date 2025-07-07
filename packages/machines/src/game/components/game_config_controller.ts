import { ISpinResponse, InternalRespinSpecGroup } from '@cgs/common';
import { Func1 } from '@cgs/shared';
import { Container } from '@cgs/syd';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../reels_engine/state_machine/game_state_machine';
import {
  T_GameStateMachineNotifierComponent,
  T_IGameConfigProvider,
  T_IconEnumeratorComponent,
  T_InitialReelsComponent,
} from '../../type_definitions';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import { IconEnumeratorComponent } from './icon_enumerator_component';
import { InitialReelsComponent } from './reel_net_api/initial_reels_component';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';

export class GameConfigController implements AbstractListener {
  private _responsePostProcessor: Func1<string, number[][]> | null;
  get responsePostProcessor(): Func1<string, number[][]> | null {
    return this._responsePostProcessor;
  }
  set responsePostProcessor(value: Func1<string, number[][]>) {
    this._responsePostProcessor = value;
  }
  private _iconEnumerator: IconEnumerator;
  get iconEnumerator(): IconEnumerator {
    return this._iconEnumerator;
  }
  private _initialReelsProvider: InitialReelsComponent;
  private _gameConfig: AbstractGameConfig;
  get gameConfig(): AbstractGameConfig {
    return this._gameConfig;
  }
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _triggerOnRespins: boolean;

  get hasRegistredExternalReelsFromName(): boolean {
    return !!this._responsePostProcessor;
  }

  constructor(
    container: Container,
    postProcessor: Func1<string, number[][]> | null = null,
    triggerOnRespins: boolean = false
  ) {
    this._triggerOnRespins = triggerOnRespins;
    this._iconEnumerator =
      container.forceResolve<IconEnumeratorComponent>(T_IconEnumeratorComponent).iconsEnumerator;
    this._initialReelsProvider =
      container.forceResolve<InitialReelsComponent>(T_InitialReelsComponent);
    this._gameConfig =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._responsePostProcessor = postProcessor;
    const stComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    this._gameStateMachine = stComponent.gameStateMachine;
    const notifier = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    ).notifier;
    notifier.AddListener(this);
  }

  OnStateEntered(slotState: string): void {
    let setFsReelsFunc : () => void = () => this.setFreeSpinViewReels();
    if (this.hasRegistredExternalReelsFromName) {
      setFsReelsFunc = () =>  this.processReels();
    }

    switch (slotState) {
      case GameStateMachineStates.BeginRespin:
        this.processRespinsReels();
        break;
      case GameStateMachineStates.BeginFreeSpins:
        setFsReelsFunc();
        break;
      case GameStateMachineStates.FreeSpin:
        setFsReelsFunc();
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        setFsReelsFunc();
        break;
    }
  }

  OnStateExited(slotState: string): void {
    let setFsReelsFunc = () => this.setFreeSpinViewReels();
    if (this.hasRegistredExternalReelsFromName) {
      setFsReelsFunc = () =>  this.processReels();
    }

    switch (slotState) {
      case GameStateMachineStates.Scatter:
        setFsReelsFunc();
        break;
      case GameStateMachineStates.Stop:
        this.disableRespinReels();
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.setRegularSpinViewReels();
        break;
    }
  }

  getReelsByFreeSpinsName(name: string): number[][] | null {
    if (this.hasRegistredExternalReelsFromName) {
      if (this.responsePostProcessor) {
        return this.responsePostProcessor(name);
      } else {
        return this.gameConfig.getNamedConfig(name)?.spinedReels ?? null;
      }
    }

    if (
      this.gameConfig.freeSpinConfig &&
      this.gameConfig.freeSpinConfig.spinedReels &&
      this.gameConfig.freeSpinConfig.spinedReels.some(() => true)
    ) {
      return this._initialReelsProvider.getSpinnedReels(this.gameConfig.freeSpinConfig.spinedReels);
    }
    return this._initialReelsProvider.getSpinnedReels(this.gameConfig.staticConfig.spinedReels);
  }

  disableRespinReels(): void {
    if (!this._triggerOnRespins) return;
    if (!this._gameStateMachine.curResponse.additionalData) {
      return;
    }
    const respinData =
      this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
        : null;
    if (!respinData) {
      return;
    }

    if (!this._gameStateMachine.curResponse.isRespin && respinData.respinStarted) {
      if (this._gameStateMachine.curResponse.isFreeSpins) {
        if (!this.hasRegistredExternalReelsFromName) {
          this.setFreeSpinViewReels();
        } else {
          this.processReels();
        }
      } else {
        this.setRegularSpinViewReels();
      }
    }
  }

  processRespinsReels(): void {
    const respinData = this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup;
    if (!this._triggerOnRespins || !respinData) {
      return;
    }
    if (!this.responsePostProcessor) {
      return;
    }
    const viewReels = this.responsePostProcessor('InternalRespin') as number[][];
    this._iconEnumerator.setSpinedReels(viewReels);
  }

  processReels(): void {
    if (this._gameStateMachine.curResponse.freeSpinsInfo) {
      if (!this.responsePostProcessor) return;
      const viewReels = this.responsePostProcessor(
        this._gameStateMachine.curResponse.freeSpinsInfo.name
      );
      this._iconEnumerator.setSpinedReels(viewReels);
    }
  }

  setRegularSpinViewReels(): void {
    this._iconEnumerator.setSpinedReels(
      this._initialReelsProvider.getSpinnedReels(this._gameConfig.staticConfig.spinedReels)
    );
  }

  setFreeSpinViewReels(): void {
    if (this._gameConfig.freeSpinConfig && this._gameConfig.freeSpinConfig.spinedReels) {
      this._iconEnumerator.setSpinedReels(
        this._initialReelsProvider.getSpinnedReels(this._gameConfig.freeSpinConfig.spinedReels)
      );
    }
  }
}
