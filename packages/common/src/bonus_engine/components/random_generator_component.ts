import { RoundComponentBase } from './round_component_base';
import { RandomGeneratorConfiguration } from '../configuration/elements/random_generator_configuration';
import { SceneObject } from '@cgs/syd';
import { TemplateExtension } from '../utils/template_extension';
import { RandomGeneratorType } from '../enums/random_generator_type';
import { RandomIterator } from '../utils/random_iterator';
import { UniqueIterator } from '../utils/unique_iterator';
import { RoundMessage } from '../messaging/round_message';
import { RandomGeneratorMode } from '../enums/random_generator_mode';
import { RoundMessageType } from '../enums/round_message_type';
import { MessagingConstants } from '../messaging/messaging_constants';
import { IMessageContext } from '../execute/i_message_context';
import { ConfigConstants } from '../configuration/config_constants';
import { IBaseIterator } from '../utils/i_base_iterator';

export class RandomGeneratorComponent extends RoundComponentBase {
  private _configuration: RandomGeneratorConfiguration;
  private _iterator: IBaseIterator<string>;
  private _random: string[];

  constructor(source: SceneObject[], configuration: RandomGeneratorConfiguration) {
    super(source, configuration.name);
    this._configuration = configuration;
    const elements = TemplateExtension.resolve(this._configuration.templateConfiguration);
    switch (this._configuration.generatorType) {
      case RandomGeneratorType.Default:
        this._iterator = new RandomIterator<string>(elements);
        break;
      case RandomGeneratorType.UniqueSequence:
        this._iterator = new UniqueIterator<string>(elements);
        break;
      default:
        throw new Error('');
    }
  }

  public proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    const random: string[] = [];
    if (this._configuration.mode === RandomGeneratorMode.Auto) {
      if (message.type === RoundMessageType.Restore) {
        this._random = [];
        const selectedIndexes = message.getValue(MessagingConstants.selectedIndexes);
        const selectedCount = selectedIndexes ? selectedIndexes.length : 0;
        for (let i = 0; i < selectedCount && !this._iterator.next().done; i++) {
          random.push(this._iterator.current);
        }
      } else {
        if (message.type === RoundMessageType.Win || message.type === RoundMessageType.Lose) {
          this._iterator.next();
        }
        if (this._iterator.current) {
          random.push(this._iterator.current);
          this._random = [this._iterator.current];
        }
      }
    }
    message.setValue(this.getComponentKey(MessagingConstants.random), random);
    if (this._configuration.generatorType === RandomGeneratorType.UniqueSequence) {
      message.setValue(
        this.getComponentKey(MessagingConstants.randomUnused),
        (this._iterator as UniqueIterator<string>).unusedItems()
      );
    }
    message.setValue(this.getComponentKey(MessagingConstants.randomComponent), this);
  }

  public execute(method: string, context: IMessageContext, args: Record<string, string>): void {
    switch (method) {
      case ConfigConstants.randomNextMethod:
        let count = 1;
        if (args[ConfigConstants.randomNextCount] !== undefined) {
          const parsedCount = parseInt(args[ConfigConstants.randomNextCount]);
          if (!isNaN(parsedCount)) {
            count = parsedCount;
          } else {
            console.log(
              `${ConfigConstants.randomNextCount}: ${
                args[ConfigConstants.randomNextCount]
              } can't be parsed as int`
            );
          }
        }
        this.next(context.message!.properties, count);
        break;
    }
  }

  private next(props: Record<string, any>, count: number): void {
    if (this._configuration.mode === RandomGeneratorMode.Manual) {
      this._random = [];
      for (let i = 0; i < count; i++) {
        this._random.push(this._iterator.next().value);
      }
      props[this.getComponentKey(MessagingConstants.random)] = this._random;
    } else {
      console.log("Random generator mustn't use auto mode to be controlled with executor");
    }
  }
}
