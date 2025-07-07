import { Container, FunctionAction, IStreamSubscription, SceneObject } from '@cgs/syd';
import { ResponseDependentGameComponentProvider } from '../response_dependent_game_component_provider';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { IconsSceneObjectComponent } from '../icons_scene_object_component';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import {
  T_IconsSceneObjectComponent,
  T_IGameConfigProvider,
  T_ISlotGameEngineProvider,
} from '../../../type_definitions';
import { IReelsEngineProvider } from '../../../reels_engine/game_components_providers/i_reels_engine_provider';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { AbstractAnticipationConfig } from '../../../reels_engine/game_config/abstract_anticipation_config';
import { ConditionAction } from '../win_lines/complex_win_line_actions/condition_action';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';

export class SingleSceneIconStopBehaviourProvider extends ResponseDependentGameComponentProvider {
  private _reelsEngine: ReelsEngine;
  get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  private _iconNodeProvider: IconsSceneObjectComponent;
  protected animationCounter: number = 0;
  private _anticipationConfig: AbstractAnticipationConfig;
  get anticipationConfig(): AbstractAnticipationConfig {
    return this._anticipationConfig;
  }

  constructor(private container: Container) {
    super(container);
    this._reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._iconNodeProvider = container.forceResolve<IconsSceneObjectComponent>(
      T_IconsSceneObjectComponent
    );
    this._anticipationConfig =
      container.forceResolve<IGameConfigProvider>(
        T_IGameConfigProvider
      ).gameConfig.anticipationConfig;
    this.createSubscriptions();
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
    this._reelsEngine.entityDirectionChanged.listen((t) => {
      const reel = t.item1;
      const line = t.item2;
      if (reel < 0 || reel > 4 || line < 0 || line >= this._reelsEngine.ReelConfig.lineCount)
        return;
      if (
        this._anticipationConfig.stopBehaviorIcons.includes(
          this.gameStateMachine.curResponse.viewReels[reel][line]
        ) &&
        this.isWinPossible(this.gameStateMachine.curResponse.viewReels[reel][line], reel)
      ) {
        const entity = this._reelsEngine
          .getReelStopedEntities(reel, line, false)
          .find(
            (e) =>
              e.get(
                this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
              ) == this.gameStateMachine.curResponse.viewReels[reel][line],
            { orElse: () => null }
          );
        if (!entity) {
          return;
        }
        let state = 'anticipation';
        const anticipationWithoutSoundExist = entity
          .get<SceneObject>(
            this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
          )
          .stateMachine!.findById('anticipation2');
        if (reelWithStb.length != 0) {
          if (reelWithStb.includes(reel) && anticipationWithoutSoundExist)
            state = 'anticipation2'; //state without sound
          else reelWithStb.push(reel);
        } else reelWithStb.push(reel);

        this._reelsEngine.startAnimation(entity, state);
        let unsubscribe: IStreamSubscription;
        // eslint-disable-next-line prefer-const
        unsubscribe = entity
          .get<SceneObject>(
            this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
          )
          .stateMachine!.findById(state)!
          .enterAction.done.listen(() => {
            this.animationCounter--;
            this._reelsEngine.stopAnimation(entity, 'anticipation');
            unsubscribe.cancel();
          });
        this.animationCounter++;
      }
    });
  }

  public isWinPossible(symbolId: number, reel: number): boolean {
    const response = this.gameStateMachine.curResponse;
    let symbolsCount = 0;
    for (let i = 0; i < reel; i++) {
      if (response.viewReels[i].includes(symbolId)) {
        symbolsCount++;
      }
    }
    const reelsLeft = this._anticipationConfig.stopBehaviorReels[
      this._anticipationConfig.stopBehaviorIcons.slice().indexOf(symbolId)
    ].filter((r) => r >= reel).length;
    return (
      reelsLeft >=
        this._anticipationConfig.minIconsForStopBehavior[
          this._anticipationConfig.stopBehaviorIcons.slice().indexOf(symbolId)
        ] ||
      this._anticipationConfig.minIconsForStopBehavior[
        this._anticipationConfig.stopBehaviorIcons.slice().indexOf(symbolId)
      ] -
        symbolsCount <=
        reelsLeft
    );
  }
}
