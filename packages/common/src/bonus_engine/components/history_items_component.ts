import { RoundComponentBase } from './round_component_base';
import { HistoryItemsConfiguration } from '../configuration/elements/history_items_configuration';
import { IStorageRepositoryProvider } from './i_storage_repository_provider';
import { SceneObject } from '@cgs/syd';
import { TemplateExtension } from '../utils/template_extension';
import { RoundMessage } from '../messaging/round_message';
import { RoundMessageType } from '../enums/round_message_type';
import { MessagingConstants } from '../messaging/messaging_constants';

export class HistoryItemsComponent extends RoundComponentBase {
  private _configuration: HistoryItemsConfiguration;
  private _storageRepositoryProvider: IStorageRepositoryProvider;
  private _historyItemsIds: string[];
  private _historyMessageProperty: string;

  constructor(
    source: SceneObject[],
    configuration: HistoryItemsConfiguration,
    storageRepositoryProvider: IStorageRepositoryProvider
  ) {
    super(source, configuration.name);
    this._configuration = configuration;
    this._storageRepositoryProvider = storageRepositoryProvider;
    this._historyItemsIds = TemplateExtension.resolve(this._configuration.templateConfiguration);
    this._historyMessageProperty = this._configuration.historyMessageProperty;
  }

  public proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    if (message.type === RoundMessageType.Init) {
      const historyItemsString = this._storageRepositoryProvider.readItem('gamble_history');
      const historyItems = (historyItemsString || '').split(',').filter((x) => x !== '');
      if (historyItems.length > 0) {
        const historyCount = Math.min(this._historyItemsIds.length, historyItems.length);
        message.setValue(
          MessagingConstants.historyItemsIds,
          this._historyItemsIds.slice(0, historyCount)
        );
        message.setValue(
          MessagingConstants.historyItemsValues,
          historyItems.reverse().slice(0, historyCount)
        );
      }
    }

    if (message.type === RoundMessageType.Win || message.type === RoundMessageType.Lose) {
      const valueForHistory = message.getValue(this._historyMessageProperty);
      if (valueForHistory) {
        const historyItemsString = this._storageRepositoryProvider.readItem('gamble_history');
        const historyItems = (historyItemsString || '').split(',').filter((x) => x !== '');
        historyItems.push(valueForHistory);
        const historyCount = Math.min(this._historyItemsIds.length, historyItems.length);
        this._storageRepositoryProvider.createItem(
          'gamble_history',
          historyItems.slice(historyItems.length - historyCount).join(',')
        );
        message.setValue(
          MessagingConstants.historyItemsIds,
          this._historyItemsIds.slice(0, historyCount)
        );
        message.setValue(
          MessagingConstants.historyItemsValues,
          historyItems.reverse().slice(0, historyCount)
        );
      }
    }
  }
}
