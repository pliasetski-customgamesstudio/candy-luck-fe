import { ConnectionState, IConnectionMonitor } from './i_connection_monitor';
import { EventDispatcher, EventStream, IDisposable, IStreamSubscription } from '@cgs/syd';
import { IExceptionHandlerFacade } from './i_exception_handler_facade';
import { Logger } from '@cgs/shared';

export class ConnectionMonitor implements IConnectionMonitor, IDisposable {
  private readonly _exceptionHandlerFacade: IExceptionHandlerFacade;
  private readonly _connectionChangedDispatcher: EventDispatcher<ConnectionState>;
  private readonly _noInternetSubscription: IStreamSubscription;
  private _currentConnectionState: ConnectionState;

  constructor(exceptionHandlerFacade: IExceptionHandlerFacade) {
    this._exceptionHandlerFacade = exceptionHandlerFacade;
    this._currentConnectionState = ConnectionState.Connected;
    this._connectionChangedDispatcher = new EventDispatcher<ConnectionState>();
    this._noInternetSubscription = this._exceptionHandlerFacade.noInternetStream.listen(() =>
      this.onNoInternet()
    );
  }

  public get connectionStateChanged(): EventStream<ConnectionState> {
    return this._connectionChangedDispatcher.eventStream;
  }

  public notifyRequestSucceed(): void {
    if (this._currentConnectionState !== ConnectionState.Connected) {
      this._currentConnectionState = ConnectionState.Connected;
      this._connectionChangedDispatcher.dispatchEvent(ConnectionState.Connected);
      Logger.Info('Connection monitor: network connectection repaired');
    }
  }

  private onNoInternet(): void {
    if (this._currentConnectionState !== ConnectionState.Disconnected) {
      this._currentConnectionState = ConnectionState.Disconnected;
      this._connectionChangedDispatcher.dispatchEvent(ConnectionState.Disconnected);
      Logger.Info('Connection monitor: network connectection lost');
    }
  }

  public dispose(): void {
    this._noInternetSubscription.cancel();
  }
}
