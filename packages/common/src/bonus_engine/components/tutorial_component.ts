import { RoundComponentBase } from './round_component_base';
import { BonusContext } from '../messaging/bonus_context';
import { Log, SceneObject, Timer } from '@cgs/syd';
import { TutorialConfiguration } from '../configuration/elements/tutorial_configuration';
import { CancellationToken } from '../../future/cancellation_token';
import { RoundMessage } from '../messaging/round_message';
import { IExecuteData } from '../execute/executers/i_execute_data';
import { MessageContext } from '../execute/message_context';

export class TutorialComponent extends RoundComponentBase {
  static readonly componentTemplate: string = '{0}.{1}';
  static readonly tutorialKey: string = 'Tutorial';
  private _bonusContext: BonusContext;
  private _active: boolean = false;
  private _gameTimer: Timer | null = null;
  private _config: TutorialConfiguration;
  private _token: CancellationToken;

  constructor(
    configuration: TutorialConfiguration,
    bonusContext: BonusContext,
    source: SceneObject[]
  ) {
    super(source, configuration.name);
    this._config = configuration;
    this._bonusContext = bonusContext;
  }

  deinit(): void {
    if (this._gameTimer) {
      this._gameTimer.cancel();
    }
  }

  proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    message.setValue(this.getComponentKey(TutorialComponent.tutorialKey), this);
  }

  onElapsed(): void {
    this._active = true;
    this.playExecute(this._config.startExecute);
  }

  start(token: CancellationToken): void {
    this._token = token;
    // TODO: check Timer
    this._gameTimer = new Timer(this._config.delay, () => this.onElapsed());
  }

  stop(token: CancellationToken): void {
    this._token = token;
    if (this._gameTimer) {
      this._gameTimer.cancel();
    }
    if (this._active) {
      this._active = false;
      this.playExecute(this._config.stopExecute);
    }
  }

  restart(token: CancellationToken): void {
    this._token = token;
    this.stop(token);
    this.start(token);
  }

  async playExecute(execute: Iterable<IExecuteData>): Promise<void> {
    try {
      for (const executor of execute) {
        await executor.play(new MessageContext(null, this._bonusContext), this.source, this._token);
        this._token.throwIfCancellationRequested();
      }
    } catch (error) {
      Log.Trace('TutorialComponent cancelled');
    }
  }
}
