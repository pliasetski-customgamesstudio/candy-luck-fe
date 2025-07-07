import { ISpinResponse } from '@cgs/common';
import { Container, SceneObject } from '@cgs/syd';

import {
  ComponentNames,
  GameStateMachine,
  IGameStateMachineProvider,
  ISlotGameEngineProvider,
  ReelsEngine,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
} from '@cgs/machines';
import { NodeUtils } from '@cgs/shared';

export const T_CandyLuckMaskComponent = Symbol('T_CandyLuckMaskComponent');

export class CandyLuckMaskComponent {
  private readonly _gameStateMachine: GameStateMachine<ISpinResponse>;
  private readonly _reelsEngine: ReelsEngine;

  constructor(container: Container) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;

    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    this._gameStateMachine.accelerate.entered.listen(() => {
      positions.forEach((position) =>
        this._reelsEngine.iconAnimationHelper.getEntities(position).forEach((entity) => {
          const iconNodeScene = entity.get<SceneObject>(
            this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
          );
          NodeUtils.addMask(iconNodeScene);
        })
      );
    });

    this._gameStateMachine.stop.entered.listen(() => {
      positions.forEach((position) =>
        this._reelsEngine.iconAnimationHelper.getEntities(position).forEach((entity) => {
          const iconNodeScene = entity.get<SceneObject>(
            this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.IconNode)
          );
          NodeUtils.removeMask(iconNodeScene);
        })
      );
    });
  }
}
