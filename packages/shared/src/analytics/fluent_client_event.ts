import { BaseClientEvent } from './base_client_event';
import { ClientEventModel } from './client_event_model';

export class FluentClientEvent extends BaseClientEvent {
  private _eventValue: string;
  private _additionalParams: string;
  private _featureId: string;
  private _eventInitiator: string;
  private _eventInitiatorId: string;
  private _transactionId: string;
  private _subfeature: string;

  constructor(eventType: string, eventName: string) {
    super(eventType, eventName);
  }

  get EventValue(): string {
    return this._eventValue;
  }

  fillEventModel(model: ClientEventModel): void {
    super.fillEventModel(model);
    if (this._eventValue) {
      model.eventValue = this._eventValue;
    }
    if (this._additionalParams) {
      model.additionalParams = this._additionalParams;
    }
    if (this._featureId) {
      model.featureId = this._featureId;
    }
    if (this._subfeature) {
      model.subfeature = this._subfeature;
    }
    if (this._eventInitiator) {
      model.eventInitiator = this._eventInitiator;
    }
    if (this._eventInitiatorId) {
      model.eventInitiatorId = this._eventInitiatorId;
    }
    if (this._transactionId) {
      model.transactionId = this._transactionId;
    }
  }

  withEventValue(eventValue: string): FluentClientEvent {
    this._eventValue = eventValue;
    return this;
  }

  withAdditionalParams(additionalParams: string): FluentClientEvent {
    this._additionalParams = additionalParams;
    return this;
  }

  withFeatureId(featureId: string): FluentClientEvent {
    this._featureId = featureId;
    return this;
  }

  withInitiator(eventInitiator: string): FluentClientEvent {
    this._eventInitiator = eventInitiator;
    return this;
  }

  withInitiatorId(initiatorId: string): FluentClientEvent {
    this._eventInitiatorId = initiatorId;
    return this;
  }

  withTransactionId(transactionId: string): FluentClientEvent {
    this._transactionId = transactionId;
    return this;
  }

  withSubfeature(subfeature: string): FluentClientEvent {
    this._subfeature = subfeature;
    return this;
  }
}
