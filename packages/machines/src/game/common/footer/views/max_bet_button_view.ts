import { NumberFormatter, InternalBet, ISpinResponse } from '@cgs/common';
import {
  Button,
  SceneObject,
  EventDispatcher,
  Container,
  BitmapTextSceneObject,
  EventStream,
} from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { SlotSession } from '../../slot_session';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { T_IGameStateMachineProvider, T_ISlotSessionProvider } from '../../../../type_definitions';
import { MaxBetButtonController } from '../controllers/max_bet_button_controller';
import { SoundInstance } from '../../../../reels_engine/sound_instance';

export class MaxBetButtonView extends BaseSlotView<MaxBetButtonController> {
  private _slotSession: SlotSession;
  private static Disable: string = 'dis';
  private static Show: string = 'up';
  private _maxBetButton: Button[];
  private _modes: SceneObject;
  private _clickedDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get clicked(): EventStream<void> {
    return this._clickedDispatcher.eventStream;
  }
  // private _xtremeClickedDispatcher: EventDispatcher = new EventDispatcher();
  // get xtremeClicked(): Stream<any> { return this._xtremeClickedDispatcher.eventStream; }
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private readonly _clickSound: SoundInstance;

  constructor(
    container: Container,
    parent: SceneObject,
    betScene: SceneObject,
    clickSound: SoundInstance
  ) {
    super(parent);
    this._clickSound = clickSound;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._slotSession = (
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider) as ISlotSessionProvider
    ).slotSession;
    this._maxBetButton = parent.parent!.findAllById<Button>('Bet_button');
    ['closeBTN', 'blackoutBTN'].forEach((sceneId) => {
      const closeBtn = betScene.findById<Button>(sceneId);
      closeBtn?.clicked.listen(() => {
        this.hideBetPanel();
      });
    });

    this._modes = betScene.findById('Modes')!;

    this._gameStateMachine.init.entered.listen(() => {
      for (let i = 0; i < this._slotSession.Bets.length; i++) {
        const btn = this._modes.findById<Button>(`betBtn_${i}`);
        const btnText = btn?.findById<BitmapTextSceneObject>('betText');

        if (!btn || !btnText) {
          continue;
        }

        const bet = this._slotSession.Bets[i].bet;
        const betValue = bet * this._slotSession.lines;
        btnText.text = NumberFormatter.formatMoney(betValue);
        btn.clicked.listen(() => {
          this.setBet(bet);
          this._clickSound.stop();
          this._clickSound.play();
        });
      }
    });
    this._maxBetButton.forEach((maxBetButton) =>
      maxBetButton.clicked.listen(() => {
        this._clickedDispatcher.dispatchEvent();
        this._clickSound.stop();
        this._clickSound.play();
      })
    );
  }

  async setBet(bet: number): Promise<void> {
    const newBet = new InternalBet();
    newBet.bet = bet;
    await this._slotSession.SetBet(newBet);
    this.hideBetPanel();
  }

  showBetPanel(): void {
    this._modes.stateMachine!.switchToState('show');
  }

  hideBetPanel(): void {
    this._modes.stateMachine!.switchToState('hide');
  }

  disableButton(): void {
    this._maxBetButton.forEach((maxBetButton) => {
      maxBetButton.stateMachine?.switchToState(MaxBetButtonView.Disable);
      maxBetButton.touchable = false;
    });
  }

  enableButton(): void {
    this._maxBetButton.forEach((maxBetButton) => {
      maxBetButton.stateMachine?.switchToState(MaxBetButtonView.Show);
      maxBetButton.touchable = true;
    });
  }
}
