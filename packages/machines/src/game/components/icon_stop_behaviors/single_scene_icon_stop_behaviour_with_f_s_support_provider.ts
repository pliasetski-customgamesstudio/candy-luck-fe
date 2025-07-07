import { Container, FunctionAction, SceneObject } from '@cgs/syd';
import { SingleSceneIconStopBehaviourProvider } from './single_scene_icon_stop_behavior_provider';
import { MultiSceneReelsEngineV2 } from '../../../reels_engine/multi_scene_reels_engine_v2';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { T_IGameConfigProvider, T_ISlotGameEngineProvider } from '../../../type_definitions';
import { ConditionAction } from '../win_lines/complex_win_line_actions/condition_action';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';
import { AbstractAnticipationConfig } from '../../../reels_engine/game_config/abstract_anticipation_config';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';

export class SingleSceneIconStopBehaviourWithFSSupportProvider extends SingleSceneIconStopBehaviourProvider {
  private _container: Container;
  private _disableScissorsDuringStb: boolean;
  private _reelEngine: MultiSceneReelsEngineV2;

  constructor(container: Container, disableScissorsDuringStb: boolean = false) {
    super(container);
    this._container = container;
    this._disableScissorsDuringStb = disableScissorsDuringStb;
    this._reelEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as MultiSceneReelsEngineV2;
  }

  public createSubscriptions(): void {
    const reelWithStb: number[] = [];
    this.gameStateMachine.stopping.appendLazyAnimation(
      () =>
        new ConditionAction(() => {
          return this.animationCounter == 0;
        })
    );
    this.gameStateMachine.stopping.appendLazyAnimation(
      () => new FunctionAction(() => (reelWithStb.length = 0))
    );
    this.gameStateMachine.immediatelyStop.appendLazyAnimation(
      () =>
        new ConditionAction(() => {
          return this.animationCounter == 0;
        })
    );
    this.reelsEngine.entityDirectionChanged.listen((t) => {
      const reel = t.item1;
      const line = t.item2;
      if (
        reel < 0 ||
        reel >= this.reelsEngine.ReelConfig.reelCount ||
        line < 0 ||
        line >= this.reelsEngine.ReelConfig.lineCount
      )
        return;

      const currentConfig = this.getAnticipationConfig();
      if (
        currentConfig.stopBehaviorIcons.includes(
          this.gameStateMachine.curResponse.viewReels[reel][line]
        ) &&
        this.isWinPossible(this.gameStateMachine.curResponse.viewReels[reel][line], reel)
      ) {
        const entity =
          this.reelsEngine
            .getReelStopedEntities(reel, line, false)
            .find(
              (e) =>
                e.get(
                  this.reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
                ) == this.gameStateMachine.curResponse.viewReels[reel][line]
            ) ?? null;
        if (!entity) {
          return;
        }
        let state = 'anticipation';
        const anticipationWithoutSoundExist = entity
          .get<SceneObject>(
            this.reelsEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
          )
          .stateMachine!.findById('anticipation2');
        if (reelWithStb.length != 0) {
          if (reelWithStb.includes(reel) && anticipationWithoutSoundExist)
            state = 'anticipation2'; //state without sound
          else reelWithStb.push(reel);
        } else reelWithStb.push(reel);

        this.reelsEngine.startAnimation(entity, state);
        const unsubscribe = entity
          .get<SceneObject>(
            this.reelsEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
          )
          .stateMachine!.findById(state)!
          .enterAction.done.listen(() => {
            this.animationCounter--;
            this.reelsEngine.stopAnimation(entity, 'anticipation');
            unsubscribe.cancel();
          });

        // TODO: Candy-luck: try to fix this code
        // if (this.gameStateMachine.curResponse.viewReels[reel][line] == 1) {
        //   for (let r = 0; r < reel; r++) {
        //     for (let l = 0; l < this._reelEngine.ReelConfig.lineCount; l++) {
        //       const e = this._reelEngine.getReelStopedEntities(r, l)[0];
        //       if (
        //         e.get(
        //           this._reelEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
        //         ) ==
        //         entity.get(
        //           this._reelEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
        //         )
        //       ) {
        //         this.reelsEngine.startAnimation(e, 'anticipation2');
        //       }
        //     }
        //   }
        // }
        this.animationCounter++;
      }
    });
  }

  public getAnticipationConfig(): AbstractAnticipationConfig {
    if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.event !=
        FreeSpinsInfoConstants.FreeSpinsStarted
    ) {
      const config =
        this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
      const namedConfig = config.getNamedConfig(
        this.gameStateMachine.curResponse.freeSpinsInfo!.name
      );
      if (!namedConfig) {
        return this.anticipationConfig;
      }
      return namedConfig.anticipationConfig;
    }
    return this.anticipationConfig;
  }

  public isWinPossible(symbolId: number, reel: number): boolean {
    if (
      this.anticipationConfig.stopBehaviorIconsByPos &&
      this.anticipationConfig.stopBehaviorIconsByPos.includes(symbolId)
    ) {
      return this.isWinPossibleByPos(symbolId, reel);
    }
    return this.isWinPossibleByReels(symbolId, reel);
  }

  public getIconsWhereSTBLogicShouldBeConnectedToEachOther(symbolId: number): number[] {
    const currentConfig = this.getAnticipationConfig();

    if (
      !currentConfig.stopBehaviorConnectedIcons ||
      currentConfig.stopBehaviorConnectedIcons.length == 0 ||
      !currentConfig.stopBehaviorConnectedIcons.some((arg) => arg.includes(symbolId))
    )
      return [symbolId];

    const icons: number[] = [];

    const correlateLogicSymbols = currentConfig.stopBehaviorConnectedIcons.filter((arg) =>
      arg.includes(symbolId)
    );

    for (const correlateLogicSymbol of correlateLogicSymbols) {
      icons.push(...correlateLogicSymbol);
    }

    return icons;
  }

  public isWinPossibleByReels(symbolId: number, reel: number): boolean {
    const currentConfig = this.getAnticipationConfig();
    const correlateLogicSymbols = this.getIconsWhereSTBLogicShouldBeConnectedToEachOther(symbolId);
    const response = this.gameStateMachine.curResponse;
    let symbolsCount = 0;
    for (let i = 0; i < reel; i++) {
      if (
        response.viewReels[i].some((viewReelSymbol) =>
          correlateLogicSymbols.includes(viewReelSymbol)
        )
      ) {
        symbolsCount++;
      }
    }
    const reelsLeft = currentConfig.stopBehaviorReels[
      currentConfig.stopBehaviorIcons.slice().indexOf(symbolId)
    ].filter((r) => r >= reel).length;
    return (
      reelsLeft >=
        currentConfig.minIconsForStopBehavior[
          currentConfig.stopBehaviorIcons.slice().indexOf(symbolId)
        ] ||
      currentConfig.minIconsForStopBehavior[
        currentConfig.stopBehaviorIcons.slice().indexOf(symbolId)
      ] -
        symbolsCount <=
        reelsLeft
    );
  }

  public isWinPossibleByPos(symbolId: number, reel: number): boolean {
    const currentConfig = this.getAnticipationConfig();
    const correlateLogicSymbols = this.getIconsWhereSTBLogicShouldBeConnectedToEachOther(symbolId);
    const response = this.gameStateMachine.curResponse;
    const nextReel = reel + 1;
    let symbolsCount = 0;
    for (let i = 0; i < nextReel; i++) {
      for (let j = 0; j < this.reelsEngine.ReelConfig.lineCount; j++) {
        if (correlateLogicSymbols.includes(response.viewReels[i][j])) {
          symbolsCount++;
        }
      }
    }
    const minIconsForSTB =
      currentConfig.minIconsForStopBehavior[
        currentConfig.stopBehaviorIcons.slice().indexOf(symbolId)
      ];
    const reelsLeft = this.anticipationConfig.stopBehaviorReels[
      this.anticipationConfig.stopBehaviorIcons.slice().indexOf(symbolId)
    ].filter((r) => r >= nextReel).length;
    if (minIconsForSTB - symbolsCount <= reelsLeft * this.reelsEngine.ReelConfig.lineCount)
      return true;
    return false;
  }
}
