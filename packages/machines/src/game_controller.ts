import { OperationControllerBase } from '@cgs/common';
import { SceneObject } from '@cgs/syd';
import { GameOperation } from './game_operation';

export class GameController extends OperationControllerBase<GameOperation, SceneObject> {
  constructor(view: SceneObject, operation: GameOperation) {
    super(view, operation);
  }
}
