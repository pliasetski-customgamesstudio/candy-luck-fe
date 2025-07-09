import { getInstance } from '@arkadiuminc/sdk';
import { Logger } from '../utils/logger';
import { Completer, EventDispatcher, EventStream } from '@cgs/syd';
import { EnvironmentConfig } from '../config/environment_config';

interface Image {
  png: string;
  webp: string;
}

interface UserProfile {
  uid: string;
  username: string;
  avatar: Image;
  avatarFrame?: Image;
  avatarBackground?: string;
  isUserSubscriber: boolean;
  aarpMembershipStatus?: boolean;
  coins?: number;
  level?: number;
}

export interface ArkadiumRequestData {
  gameId: string | null;
  arenaName: string | null;
  token: string | null;
}

interface ArkadiumGameSdk {
  lifecycle: {
    onTestReady(): Promise<void>;
    onPauseReady(): Promise<void>;
    onGamePause(): Promise<void>;
    onGameResume(): Promise<void>;
    onGameStart(): Promise<void>;
    onInteract(): Promise<void>;
    onChangeScore(score: number): Promise<void>;
    onGameEnd(): Promise<void>;
    onGemsUpdate(): Promise<void>;
  };
  ads: {
    showRewardAd(options?: { duration?: number }): Promise<{
      value: number;
    }>;
  };
  auth: {
    isUserAuthorized(): Promise<boolean>;
    getUserProfile(): Promise<UserProfile | null>;
    onAuthStatusChange(observer: any): () => void;
    getToken(): Promise<string | undefined>;
    openAuthForm(): Promise<void>;
    onOpenAuthForm(observer: any): void | undefined;
  };
  wallet: {
    getGems(): Promise<number>;
    consumeGems(amount: number): Promise<boolean>;
  };
  host: {
    getGameId(): Promise<string>;
    getArenaName(): Promise<string>;
  };
  debugMode(enabled: boolean): void;
}

export class ArkadiumSdk {
  private static _instance: ArkadiumSdk | null;

  public static getInstance(): ArkadiumSdk {
    if (!ArkadiumSdk._instance) {
      ArkadiumSdk._instance = new ArkadiumSdk();
    }
    return ArkadiumSdk._instance;
  }

  private _sdk: Completer<ArkadiumGameSdk | null> = new Completer();
  private _authFormOpenEventDispatcher: EventDispatcher<boolean> = new EventDispatcher();

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (EnvironmentConfig.maxInitTimeSDK) {
      setTimeout(() => {
        Logger.Error('Arkadium SDK is not available!');
        this._sdk.complete(null);
      }, EnvironmentConfig.maxInitTimeSDK);
    }

    try {
      // const sdk = await window.ArkadiumGameSDK.getInstance();
      const sdk = await getInstance();
      this._sdk.complete(sdk);
    } catch {
      this._sdk.complete(null);
    }

    this.onOpenAuthForm((isOpened) => {
      this._authFormOpenEventDispatcher.dispatchEvent(isOpened);
    });
  }

  public async isInited(): Promise<boolean> {
    return this._sdk.promise.then((sdk) => !!sdk);
  }

  public async onTestReady(): Promise<void> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.lifecycle.onTestReady() : Promise.resolve();
  }

  public async onGameStart(): Promise<void> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.lifecycle.onGameStart() : Promise.resolve();
  }

  public async onChangeScore(score: number): Promise<void> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.lifecycle.onChangeScore(score) : Promise.resolve();
  }

  public async onGameEnd(): Promise<void> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.lifecycle.onGameEnd() : Promise.resolve();
  }

  public async getGems(): Promise<number> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.wallet.getGems() : Promise.resolve(0);
  }

  public async consumeGems(amount: number): Promise<boolean> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.wallet.consumeGems(amount).catch(() => false) : Promise.resolve(false);
  }

  public enableLogs(): void {
    this._sdk.promise.then((sdk) => sdk?.debugMode(true));
  }

  public async isAuthorized(): Promise<boolean> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.auth.isUserAuthorized() : Promise.resolve(false);
  }

  public async onAuthStatusChange(callback: (isAuthorized: boolean) => void): Promise<() => void> {
    const sdk = await this._sdk.promise;
    return sdk?.auth.onAuthStatusChange(callback) || (() => {});
  }

  public async onOpenAuthForm(callback: (isOpened: boolean) => void): Promise<() => void> {
    const sdk = await this._sdk.promise;
    return sdk?.auth.onOpenAuthForm(callback) || (() => {});
  }

  public async getUserProfile(): Promise<UserProfile | null> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.auth.getUserProfile().catch(() => null) : Promise.resolve(null);
  }

  public async getUserProfileId(): Promise<string | null> {
    const profile = await this.getUserProfile();
    return profile?.uid || null;
  }

  public async getGameId(): Promise<string | null> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.host.getGameId() : Promise.resolve(null);
  }

  public async getArenaName(): Promise<string | null> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.host.getArenaName() : Promise.resolve(null);
  }

  public async getToken(): Promise<string | null> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.auth.getToken().then((token) => token || null) : Promise.resolve(null);
  }

  public async getRequestData(): Promise<ArkadiumRequestData> {
    return Promise.all([this.getGameId(), this.getArenaName(), this.getToken()]).then(
      ([gameId, arenaName, token]) => ({ gameId, arenaName, token })
    );
  }

  public async showRewardAd(): Promise<number | null> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.ads.showRewardAd().then((reward) => reward.value) : Promise.resolve(null);
  }

  public async openAuthForm(): Promise<void> {
    const sdk = await this._sdk.promise;
    return sdk ? sdk.auth.openAuthForm() : Promise.resolve();
  }

  public get authFormOpenStream(): EventStream<boolean> {
    return this._authFormOpenEventDispatcher.eventStream;
  }
}
