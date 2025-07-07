import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
  TextSceneObject,
} from '@cgs/syd';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { IconModel } from './icon_model';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import { ISpinResponse, NumberFormatter, SpecialSymbolGroup } from '@cgs/common';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IconModelComponent,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
} from '../../type_definitions';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconModelComponent } from './icon_model_component';

export class IconTextProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _iconModel: IconModel;
  private _iconAnimationHelper: IconAnimationHelper;

  constructor(container: Container, markers: string[]) {
    this._container = container;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent)
      .iconModel as IconModel;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;

    this._gameStateMachine.stop.appendLazyAnimation(() =>
      this.setTextAction(this._gameStateMachine.curResponse, markers)
    );
  }

  private setTextAction(response: ISpinResponse, markers: string[]): IntervalAction {
    const actions: IntervalAction[] = [];
    const symbols: SpecialSymbolGroup[] | null = response.specialSymbolGroups;
    let symbolGroups: SpecialSymbolGroup[] | null = null;
    if (symbols && markers) {
      symbolGroups = [];
      for (const marker of markers) {
        symbolGroups.push(...symbols.filter((p) => p.type === marker));
      }
    } else {
      return new EmptyAction();
    }

    if (symbolGroups?.some((x) => !!x)) {
      for (const symbolGroup of symbolGroups) {
        const symbolActions: IntervalAction[] = [];

        for (let i = 0; i < (symbolGroup.positions?.length || 0); i++) {
          const pos = symbolGroup.positions![i];
          const drawId = this._iconAnimationHelper.getDrawIndexes(pos)[0];
          const iconActions: IntervalAction[] = [];
          const icons = this._iconModel.getAnimIcon(drawId);

          if (icons && icons.some((i) => !!i)) {
            let textNode: TextSceneObject | null = null;
            switch (symbolGroup.type) {
              case 'AddFreeSpins':
                textNode = icons[0].findById('extra_spins_text') as TextSceneObject;
                break;
              case 'InstantCoins':
                textNode = icons[0].findById('coins_txt') as TextSceneObject;
                break;
              case 'MultiplyTotalWin':
                textNode = icons[0].findById('multiple_text') as TextSceneObject;
                break;
            }
            if (textNode) {
              iconActions.push(
                new FunctionAction(
                  () => (textNode!.text = NumberFormatter.format(symbolGroup.totalJackPotWin))
                )
              );
            }
          }
          symbolActions.push(new SequenceAction(iconActions));
        }
        actions.push(new SequenceAction([new ParallelAction(symbolActions)]));
      }
      return new ParallelAction(actions);
    }
    return new EmptyAction();
  }
}
