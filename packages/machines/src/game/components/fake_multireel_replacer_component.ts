import { IClientProperties, ISpinResponse, T_IClientProperties } from '@cgs/common';
import { Container } from '@cgs/syd';
import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { T_ISlotSessionProvider } from '../../type_definitions';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';

export class FakeMultireelReplacerComponent {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _iconsEnumerator: IconEnumerator;
  get iconsEnumerator(): IconEnumerator {
    return this._iconsEnumerator;
  }
  set iconsEnumerator(value: IconEnumerator) {
    this._iconsEnumerator = value;
  }
  private _clientProperties: IClientProperties;
  get clientProperties(): IClientProperties {
    return this._clientProperties;
  }
  set clientProperties(value: IClientProperties) {
    this._clientProperties = value;
  }

  constructor(container: Container) {
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    const gameId =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession.GameId;
    /*var gameIds = _clientProperties.get(MultiReplaceStaticConfig.EnabledPerSlot, "").split(';');
    if (gameIds.contains(gameId)) {
      _iconsEnumerator = container
          .resolve(IconEnumeratorComponent)
          .iconsEnumerator;
      _gameStateMachine = container
          .forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider)
          .gameStateMachine;
      _gameStateMachine.waitaccelerationComplete.leaved.listen((e) =>
          newIconsDependOnSpin());
    }*/
  }

  newIconsDependOnSpin(): void {
    let originalFakeConfig;
    const fakeConfig: number[][] = [];
    const views = this._gameStateMachine.curResponse.substituteReelViews;
    if (views) {
      originalFakeConfig = this._iconsEnumerator.getSpinedReels();
      for (let i = 0; i < originalFakeConfig.length; i++) {
        fakeConfig.push([]);
        for (let j = 0; j < originalFakeConfig[i].length; j++) {
          fakeConfig[i].push(originalFakeConfig[i][j]);
        }
      }
      for (let i = 0; i < views.length; i++) {
        for (let j = 0; j < fakeConfig[views[i].reelId].length; j++) {
          if (fakeConfig[views[i].reelId][j] >= 1000 && fakeConfig[views[i].reelId][j] <= 1010) {
            fakeConfig[views[i].reelId][j] =
              views[i].symbols[fakeConfig[views[i].reelId][j] - 1000];
          }
        }
      }
      for (let i = 0; i < fakeConfig.length; i++) {
        for (let j = 0; j < fakeConfig[i].length; j++) {
          if (fakeConfig[i][j] >= 1000 && fakeConfig[i][j] <= 1010) {
            fakeConfig[i][j] = 18;
          }
        }
      }
      this._iconsEnumerator.setSpinedReels(fakeConfig);
    }
  }
}
