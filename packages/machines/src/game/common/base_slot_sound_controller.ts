import { SceneObject, EventDispatcher, EventStream, Container, SoundState } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../components/game_state_machine_notifier_component';
import { IconsSoundModelComponent } from '../components/icons_sound_model_component';
import { ISlotSessionProvider } from '../components/interfaces/i_slot_session_provider';
import { RegularSpinsSoundModelComponent } from '../components/regular_spins_sound_model_component';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../reels_engine/state_machine/game_state_machine';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import {
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
  T_RegularSpinsSoundModelComponent,
  T_ISlotPopupCoordinator,
  T_ISlotGame,
  T_GameStateMachineNotifierComponent,
  T_IconsSoundModelComponent,
  T_SoundConfigurationProvider,
} from '../../type_definitions';
import { SlotPopups } from './slot/views/base_popup_view';
import { ISlotPopupCoordinator } from './slot_popup_coordinator';
import { SlotSession } from './slot_session';
import { SlotSoundConfigEntry, SlotSoundType } from './slot_sound_config_entry';
import { SoundConfigurationProvider } from './sound_configuration_provider';
import { ISpinResponse } from '@cgs/common';

export class TimeTrackingSceneObject extends SceneObject {
  private _threadhold: number;
  private _track: boolean = false;
  private _elapsed: number;

  private _elapsedDispatcher: EventDispatcher<number> = new EventDispatcher<number>();
  get elapsed(): EventStream<number> {
    return this._elapsedDispatcher.eventStream;
  }

  constructor(threadhold: number) {
    super();
    this._threadhold = threadhold;
  }

  update(dt: number): void {
    super.update(dt);

    if (this._track) {
      this._elapsed += dt;
      if (this._elapsed > this._threadhold) {
        this._elapsedDispatcher.dispatchEvent(dt);
      }
    }
  }

  startTracking(): void {
    this._track = true;
  }

  stopTracking(): void {
    this._track = false;
  }

  resetTimer(): void {
    this._elapsed = 0.0;
  }
}

export class BaseSlotSoundController implements AbstractListener {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _slotSession: SlotSession;
  protected _iconSoundModel: IconsSoundModel;
  private _reelsSoundModel: ReelsSoundModel;
  get reelsSoundModel(): ReelsSoundModel {
    return this._reelsSoundModel;
  }
  set reelsSoundModel(value: ReelsSoundModel) {
    this._reelsSoundModel = value;
  }
  private _soundConfigurationProvider: SoundConfigurationProvider | null;
  get soundConfigurationProvider(): SoundConfigurationProvider | null {
    return this._soundConfigurationProvider;
  }
  protected _iconAnimationHelper: IconAnimationHelper;
  private _popupCoordinator: ISlotPopupCoordinator;
  private _currentBackgroundSound: SceneObject;
  private _configEntries: SlotSoundConfigEntry[];
  private _timeTrackingNode: TimeTrackingSceneObject;
  get timeTrackingNode(): TimeTrackingSceneObject {
    return this._timeTrackingNode;
  }

  get currentBackgroundSound(): SceneObject {
    return this._currentBackgroundSound;
  }
  set currentBackgroundSound(value: SceneObject) {
    this._currentBackgroundSound = value;
  }

  constructor(container: Container, configEntries: SlotSoundConfigEntry[]) {
    this._configEntries = configEntries;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._iconSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._soundConfigurationProvider =
      container.resolve<SoundConfigurationProvider>(T_SoundConfigurationProvider) ?? null;
    this._popupCoordinator = container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);

    this._currentBackgroundSound = this._reelsSoundModel.backgroundSoundNode;

    if (this._reelsSoundModel.backgroundSpinSoundNode) {
      const gameNode = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
      const threadhold = this._soundConfigurationProvider?.stopSpinBackgroundSoundDelay || 0.0;

      this._timeTrackingNode = new TimeTrackingSceneObject(threadhold);
      gameNode.addChild(this._timeTrackingNode);

      this._popupCoordinator.popupShown.listen((popupId) => this.onPopupShown(popupId as string));
      this._popupCoordinator.popupHidden.listen((popupId) => this.onPopupHidden(popupId as string));

      this._timeTrackingNode.elapsed.listen((e) => {
        this._timeTrackingNode.stopTracking();
        this.pauseBackgroundSound();
        this._currentBackgroundSound = this._reelsSoundModel.backgroundSoundNode;
        this.playBackgroundSound();
      });
    }

    const notifierComponent: GameStateMachineNotifierComponent =
      container.forceResolve<GameStateMachineNotifierComponent>(
        T_GameStateMachineNotifierComponent
      );
    notifierComponent.notifier.AddListener(this);
  }

  stopTimeTracking(): void {
    this._timeTrackingNode?.stopTracking();
  }

  startTimeTracking(): void {
    this._timeTrackingNode?.resetTimer();
    this._timeTrackingNode?.startTracking();
  }

  onPopupShown(popupId: string): void {
    if (this._timeTrackingNode && popupId != SlotPopups.Paytable) {
      this._timeTrackingNode.stopTracking();
    }
  }

  onPopupHidden(popupId: string): void {
    if (
      this._timeTrackingNode &&
      popupId != SlotPopups.Paytable &&
      popupId != SlotPopups.BonusRecovery &&
      (!this._gameStateMachine.curResponse.freeSpinsInfo ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      this._timeTrackingNode.resetTimer();
      this._timeTrackingNode.startTracking();
    }
  }

  startSound(): boolean {
    if (
      (this._gameStateMachine.isStateActive('beginBonus') ||
        this._gameStateMachine.isStateActive('bonus')) &&
      (!this._soundConfigurationProvider ||
        this._soundConfigurationProvider.stopBackgroundSoundOnBonus)
    ) {
      return false;
    } else if (
      (this._gameStateMachine.isStateActive('beginScatter') ||
        this._gameStateMachine.isStateActive('scatter')) &&
      (!this._soundConfigurationProvider ||
        this._soundConfigurationProvider.stopBackgroundSoundOnScatter)
    ) {
      return false;
    } else if (
      (this._gameStateMachine.isStateActive('beginFreeSpinsPopup') ||
        this._gameStateMachine.isStateActive('beginFreeSpins')) &&
      (!this._soundConfigurationProvider ||
        this._soundConfigurationProvider.stopBackgroundSoundOnStartFreeSpins)
    ) {
      return false;
    } else {
      return true;
    }
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.InitGame:
        this.resetBackgroundSounds();
        this.playBackgroundSound();
        break;
      case GameStateMachineStates.Stop:
        if (
          this._reelsSoundModel.backgroundSpinSoundNode &&
          this._timeTrackingNode &&
          (!this._gameStateMachine.curResponse.freeSpinsInfo ||
            this._gameStateMachine.curResponse.freeSpinsInfo.event ==
              FreeSpinsInfoConstants.FreeSpinsFinished)
        ) {
          this._timeTrackingNode.resetTimer();
          this._timeTrackingNode.startTracking();
        }
        break;
      case GameStateMachineStates.Accelerate:
        this.OnAccelerateEntered();
        break;
      case GameStateMachineStates.Bonus:
        this._timeTrackingNode?.stopTracking();
        if (
          !this._soundConfigurationProvider ||
          this._soundConfigurationProvider.stopBackgroundSoundOnBonus
        ) {
          this.stopBackgroundSound();
        }
        break;
      case GameStateMachineStates.Scatter:
        this._timeTrackingNode?.stopTracking();
        if (
          !this._soundConfigurationProvider ||
          this._soundConfigurationProvider.stopBackgroundSoundOnScatter
        ) {
          this.stopBackgroundSound();
        }
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        if (this._reelsSoundModel.freeSpinsBackgroundSoundNode) {
          this.stopBackgroundSound();
          this._currentBackgroundSound = this._reelsSoundModel.freeSpinsBackgroundSoundNode;
          this.playBackgroundSound();
        }
        break;
    }
  }

  OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Bonus:
        if (
          this._gameStateMachine.curResponse.freeSpinsInfo &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event !==
            FreeSpinsInfoConstants.FreeSpinsFinished &&
          this._reelsSoundModel.freeSpinsBackgroundSoundNode
        ) {
          this.stopBackgroundSound();
          this._currentBackgroundSound = this._reelsSoundModel.freeSpinsBackgroundSoundNode;
          this.playBackgroundSound();
        }

        if (
          !this._soundConfigurationProvider ||
          this._soundConfigurationProvider.stopBackgroundSoundOnBonus
        ) {
          if (
            this._reelsSoundModel.backgroundSpinSoundNode &&
            !this._gameStateMachine.curResponse.freeSpinsInfo
          ) {
            this._currentBackgroundSound = this._reelsSoundModel.backgroundSoundNode;
          }
          this.playBackgroundSound();
        }
        break;
      case GameStateMachineStates.Scatter:
        if (
          this._gameStateMachine.curResponse.freeSpinsInfo &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event !==
            FreeSpinsInfoConstants.FreeSpinsFinished &&
          this._reelsSoundModel.freeSpinsBackgroundSoundNode
        ) {
          if (this._soundConfigurationProvider?.stopBackgroundSoundOnEndScatter) {
            this.stopBackgroundSound();
            this._currentBackgroundSound = this._reelsSoundModel.freeSpinsBackgroundSoundNode;
            this.playBackgroundSound();
          } else {
            this._currentBackgroundSound = this._reelsSoundModel.freeSpinsBackgroundSoundNode;
          }
        }
        if (
          !this._soundConfigurationProvider ||
          this._soundConfigurationProvider.stopBackgroundSoundOnScatter
        ) {
          if (
            this._reelsSoundModel.backgroundSpinSoundNode &&
            !this._gameStateMachine.curResponse.freeSpinsInfo
          ) {
            this._currentBackgroundSound = this._reelsSoundModel.backgroundSoundNode;
          }
          this.playBackgroundSound();
        }
        break;
      case GameStateMachineStates.BeginFreeSpinsPopup:
        if (
          (!this._soundConfigurationProvider ||
            (this._gameStateMachine.curResponse.freeSpinsInfo &&
              ((this._gameStateMachine.curResponse.freeSpinsInfo.event ===
                FreeSpinsInfoConstants.FreeSpinsStarted &&
                this._soundConfigurationProvider.stopBackgroundSoundOnStartFreeSpins) ||
                (this._gameStateMachine.curResponse.freeSpinsInfo.event ===
                  FreeSpinsInfoConstants.FreeSpinsAdded &&
                  this._soundConfigurationProvider.stopBackgroundSoundOnAddFreeSpins) ||
                this._soundConfigurationProvider.startFreeSpinsBackgroundOnEndFreeSpinsPopup))) &&
          this._reelsSoundModel.freeSpinsBackgroundSoundNode
        ) {
          this.stopBackgroundSound();
          this._currentBackgroundSound = this._reelsSoundModel.freeSpinsBackgroundSoundNode;
          this.playBackgroundSound();
        }
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        if (
          this._reelsSoundModel.freeSpinsBackgroundSoundNode &&
          this._gameStateMachine.curResponse.isFreeSpins &&
          this._gameStateMachine.curResponse.freeSpinsInfo!.event ===
            FreeSpinsInfoConstants.FreeSpinsFinished
        ) {
          this.stopBackgroundSound();
          this._currentBackgroundSound = this._reelsSoundModel.backgroundSoundNode;
          this.playBackgroundSound();
        }
        break;
    }
  }

  OnAccelerateEntered(): void {
    this._timeTrackingNode?.stopTracking();

    if (
      this._reelsSoundModel.backgroundSpinSoundNode &&
      this._currentBackgroundSound != this._reelsSoundModel.backgroundSpinSoundNode &&
      (!this._gameStateMachine.curResponse.freeSpinsInfo ||
        this._gameStateMachine.curResponse.freeSpinsInfo.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished ||
        !this._reelsSoundModel.freeSpinsBackgroundSoundNode)
    ) {
      this.pauseBackgroundSound();
      this._currentBackgroundSound = this._reelsSoundModel.backgroundSpinSoundNode;
    }

    this.stopWinSounds();
    this.playBackgroundSound();
  }

  stopWinSounds(): void {
    this.stopIconsSound();
    this._reelsSoundModel.winSound.stop();
  }

  playBackgroundSound(): void {
    const configEntry = this._configEntries.find(
      (e) => e.soundType == SlotSoundType.Background && e.soundState == SoundState.Playing
    );

    if (configEntry) {
      this.sendBackGroundSoundEvent(configEntry.trigger);
    }
  }

  stopBackgroundSound(): void {
    const configEntry = this._configEntries.find(
      (e) => e.soundType == SlotSoundType.Background && e.soundState == SoundState.Stopped
    );

    if (configEntry) {
      this.sendBackGroundSoundEvent(configEntry.trigger);
    }
  }

  pauseBackgroundSound(): void {
    if (this._currentBackgroundSound && this._currentBackgroundSound.stateMachine) {
      //if resources don't contains paused state for background sound, then stop the sound
      // TODO: remove this check when all user will have latest resources for game 40
      if (this._currentBackgroundSound.stateMachine.findById('paused')) {
        const configEntry = this._configEntries.find(
          (e) => e.soundType == SlotSoundType.Background && e.soundState == SoundState.Paused
        );

        if (configEntry) {
          this.sendBackGroundSoundEvent(configEntry.trigger);
        }
      } else {
        this.stopBackgroundSound();
      }
    }
  }

  sendBackGroundSoundEvent(trigger: string): void {
    if (this._currentBackgroundSound?.stateMachine) {
      this._currentBackgroundSound.stateMachine.switchToState(trigger);
    }
  }

  resetBackgroundSounds(): void {
    const configEntry = this._configEntries.find(
      (e) => e.soundType == SlotSoundType.Background && e.soundState == SoundState.Stopped
    );
    if (configEntry) {
      const stopBackgroundSoundsTrigger = configEntry.trigger;

      if (this._reelsSoundModel.backgroundSoundNode.stateMachine) {
        this._reelsSoundModel.backgroundSoundNode.stateMachine.switchToState(
          stopBackgroundSoundsTrigger
        );
      }

      if (this._reelsSoundModel.freeSpinsBackgroundSoundNode.stateMachine) {
        this._reelsSoundModel.freeSpinsBackgroundSoundNode.stateMachine.switchToState(
          stopBackgroundSoundsTrigger
        );
      }
    }
  }

  stopIconsSound(): void {
    for (const symbol of this._slotSession.machineInfo.symbols) {
      const symbolId = symbol.stacked != 0 && symbol.stacked != 1 ? symbol.id * 100 : symbol.id;
      const soundNodes = this._iconSoundModel.getIconSoundNodes(symbolId);
      if (soundNodes) {
        for (const node of soundNodes) {
          if (node.stateMachine) {
            node.stateMachine.switchToState('default');
          }
        }
      }
    }
  }
}
