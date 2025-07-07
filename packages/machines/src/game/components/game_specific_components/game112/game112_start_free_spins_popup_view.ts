import { TextSceneObject, State, SceneObject, Container, Button, SoundSceneObject } from '@cgs/syd';
import { BaseSlotPopupView, SlotPopups } from '../../../common/slot/views/base_popup_view';
import { IFreeSpinsModeProvider } from '../../free_spins/i_free_spins_mode_provider';
import { T_IFreeSpinsModeProvider, T_ResourcesComponent } from '../../../../type_definitions';
import { Game112StartFreeSpinsPopupController } from './game112_start_free_spins_popup_controller';
import { ResourcesComponent } from '../../resources_component';
import { SoundInstance } from '../../../../reels_engine/sound_instance';

export class Game112StartFreeSpinsPopupView extends BaseSlotPopupView<Game112StartFreeSpinsPopupController> {
  private _spinsCount: TextSceneObject[];
  private _freespins: State;
  private _freespinsAdd: State;
  private popupView: SceneObject;
  private _multiplierView: TextSceneObject;

  constructor(
    _root: SceneObject,
    _popupView: SceneObject,
    startByButton: boolean,
    container: Container,
    useFreeSpinMode: boolean
  ) {
    super(_root, _popupView, null, SlotPopups.StartFreeSpins);

    const resourcesComponent = container.resolve<ResourcesComponent>(T_ResourcesComponent);
    const buttonClickSoundScene = resourcesComponent?.sounds
      .findById<SoundSceneObject>('button_click')
      ?.findAllByType(SoundSceneObject)[0];
    const buttonClickSound = new SoundInstance(buttonClickSoundScene || null);

    this.popupView = _popupView;
    this._spinsCount = _popupView.findAllById<TextSceneObject>('freespin_text');

    this._multiplierView = _popupView.findById<TextSceneObject>('multiplierText')!;

    if (startByButton) {
      const startButtons = _popupView.findAllById<Button>('btnStart');
      for (const startButton of startButtons) {
        startButton.clicked.listen(() => {
          buttonClickSound.stop();
          buttonClickSound.play();
          this.onBackToGameClicked();
        });
      }

      this._freespinsAdd = _popupView.stateMachine!.findById('freespins_add')!;
      if (this._freespinsAdd) {
        this._freespinsAdd.enterAction.done.listen(() => this.onAnimationCompleted());
      } else {
        if (useFreeSpinMode) {
          this._subscribeCloseEventWithFreeSpinMode(container, _popupView, 'freespins_add_');
        }
      }
    } else {
      if (useFreeSpinMode) {
        this._subscribeCloseEventWithFreeSpinMode(container, _popupView, 'freespins_add_');

        this._subscribeCloseEventWithFreeSpinMode(container, _popupView, 'freespins_');
      } else {
        this._freespins = _popupView.stateMachine!.findById('freespins') as State;

        if (this._freespins) {
          this._freespins.enterAction.done.listen(() => this.onAnimationCompleted());
        } else {
          console.log('State freespins is absent');
        }

        this._freespinsAdd = _popupView.stateMachine!.findById('freespins_add') as State;
        if (this._freespinsAdd) {
          this._freespinsAdd.enterAction.done.listen(() => this.onAnimationCompleted());
        } else {
          console.log('State freespins_add is absent');
        }
      }
    }
  }

  setMultiplier(multiplier: number): void {
    this._multiplierView.text = multiplier.toString();
  }

  onBackToGameClicked(): void {
    const closeStateName = 'close';
    const closeState = this.popupView.stateMachine?.findById(closeStateName);
    if (closeState) {
      closeState.enterAction.done.listen((_e) => this.controller.onAnimCompleted());
      this.popupView.stateMachine?.switchToState(closeStateName);
    } else {
      this.controller.onAnimCompleted();
    }
  }

  setFreeSpins(freespins: number): void {
    for (const text of this._spinsCount) {
      text.text = freespins.toString();
    }
  }

  onAnimationCompleted(): void {
    this.controller.onAnimCompleted();
  }

  private _subscribeCloseEventWithFreeSpinMode(
    container: Container,
    view: SceneObject,
    pattern: string
  ): void {
    const modeProvider = container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);
    if (modeProvider && modeProvider.AllViews) {
      modeProvider.AllViews.forEach((x) => {
        const state = view.stateMachine!.findById(pattern + x);
        if (state) {
          state.enterAction.done.listen((e) => this.onAnimationCompleted());
        }
      });
    }
  }
}
