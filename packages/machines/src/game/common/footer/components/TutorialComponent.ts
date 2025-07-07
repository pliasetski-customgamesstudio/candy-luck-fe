import { Button, Container, SceneObject, SoundSceneObject } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider, T_ResourcesComponent } from '../../../../type_definitions';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { ResourcesComponent } from '../../../components/resources_component';
import { SoundInstance } from '../../../../reels_engine/sound_instance';

enum SceneId {
  Tutorial = 'tutorial',
  Background = 'TutorialBlackoutBTN',
  Close = 'TutorialCloseBTN',
}

enum TutorialStates {
  Default = 'default',
  AutoSpin = 'tutorial_autospin',
  FastSpins = 'tutorial_fast_spins',
  Spin = 'tutorial_spin',
  Bets = 'tutorial_bets',
  Balance = 'tutorial_balance',
}

const TUTORIAL_STEPS = [
  TutorialStates.FastSpins,
  TutorialStates.Spin,
  TutorialStates.AutoSpin,
  TutorialStates.Bets,
  TutorialStates.Balance,
];

const TUTORIAL_CHANGE_TIMEOUT = 10000;
const TUTORIAL_VIEWED_STORAGE_KEY = 'TUTORIAL_VIEWED';

export class TutorialComponent {
  private _tutorialScenes: SceneObject[];
  private _backgroundScenes: Button[];
  private _closeScenes: Button[];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _currentStep: number | null = null;
  private _timeoutId: ReturnType<typeof setTimeout> | null = null;
  private _buttonClickSound: SoundInstance;

  private _unsubscribe: (() => void) | null = null;

  constructor(container: Container, rootScene: SceneObject) {
    this._tutorialScenes = rootScene.parent?.findAllById(SceneId.Tutorial) || [];
    this._backgroundScenes = rootScene.parent?.findAllById<Button>(SceneId.Background) || [];
    this._closeScenes = rootScene.parent?.findAllById<Button>(SceneId.Close) || [];

    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    const resourcesComponent = container.resolve<ResourcesComponent>(T_ResourcesComponent);

    const buttonClickSoundScene = resourcesComponent?.sounds
      .findById<SoundSceneObject>('button_click')
      ?.findAllByType(SoundSceneObject)[0];
    this._buttonClickSound = new SoundInstance(buttonClickSoundScene || null);
  }

  public initialize(): void {
    if (!this.isViewed()) {
      const idleSubscription = this._gameStateMachine.idle.entered.listen(() => {
        this.startTutorial();
        idleSubscription.cancel();
      });
    }
  }

  public startTutorial(): void {
    const nextStepCallback = () => {
      this._buttonClickSound.stop();
      this._buttonClickSound.play();
      this.nextStep();
    };

    const backgroundClicks = this._backgroundScenes.map((backgroundScene) =>
      backgroundScene.clicked.listen(nextStepCallback)
    );

    const closeCallback = () => {
      this._buttonClickSound.stop();
      this._buttonClickSound.play();
      this.finishTutorial();
    };

    const closeClicks = this._closeScenes.map((closeScene) =>
      closeScene.clicked.listen(closeCallback)
    );

    this._unsubscribe = () => {
      backgroundClicks.forEach((unsub) => unsub.cancel());
      closeClicks.forEach((unsub) => unsub.cancel());
    };

    this.nextStep();
  }

  private nextStep(): void {
    this.clearTimeout();

    this._currentStep = this._currentStep === null ? 0 : this._currentStep + 1;

    if (this._currentStep! < TUTORIAL_STEPS.length) {
      this.playCurrentStep();
      this._timeoutId = setTimeout(() => this.nextStep(), TUTORIAL_CHANGE_TIMEOUT);
    } else {
      this.finishTutorial();
    }
  }

  private playCurrentStep(): void {
    if (this._currentStep === null) {
      return;
    }

    const state = TUTORIAL_STEPS[this._currentStep];

    if (state) {
      this._tutorialScenes.forEach((tutorialScene) => {
        if (tutorialScene.stateMachine?.findById(state)) {
          tutorialScene.stateMachine?.switchToState(state);
        } else {
          tutorialScene.stateMachine?.switchToState(TutorialStates.Default);
        }
      });
    }
  }

  private finishTutorial(): void {
    this.clearTimeout();
    this._currentStep = null;
    this._tutorialScenes.forEach((tutorialScene) =>
      tutorialScene.stateMachine?.switchToState(TutorialStates.Default)
    );
    this._unsubscribe?.();
    this._unsubscribe = null;
    this.setIsViewed();
  }

  private clearTimeout(): void {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  private isViewed(): boolean {
    const isViewed = localStorage.getItem(TUTORIAL_VIEWED_STORAGE_KEY);
    return isViewed === 'true';
  }

  private setIsViewed(): void {
    localStorage.setItem(TUTORIAL_VIEWED_STORAGE_KEY, 'true');
  }
}
