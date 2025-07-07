import {
  Action,
  Container,
  EmptyAction,
  FunctionAction,
  InterpolateInplaceAction,
  ParallelSimpleAction,
  SceneObject,
  SequenceSimpleAction,
  Vector2,
} from '@cgs/syd';
import { LazyAction } from '@cgs/shared';
import { T_ResourcesComponent } from '../../../type_definitions';
import { ResourcesComponent } from '../resources_component';

export class SceneEmitter {
  private _root: SceneObject;
  private _emitPosition: Vector2;
  private _emitNode: SceneObject;
  private _destinationPositions: Vector2[];
  private _destinationNodes: SceneObject[];
  private _afterMoveActions: Map<SceneObject, Action>;
  private _afterMoveStates: Map<SceneObject, string>;
  private _featureStateControlName: string;
  private _freqency: number;
  private _emitCount: number;
  private _emitionTime: number;
  private _sceneFlyDuration: number;
  private _sceneLifeDuration: number;
  private _createFeatureScene: any;
  private _beforeFlyAction: Action | null;
  private _featureSceneCache: SceneObject[];

  get emitAction(): Action {
    return new LazyAction(() => this.buildEmitAction());
  }

  constructor(container: Container, _createFeatureScene: any) {
    this._root = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
    this._featureSceneCache = [];
  }

  update(
    emitNode: SceneObject,
    destinationNodes: SceneObject[],
    afterMoveActions: Map<SceneObject, Action>,
    afterMoveStates: Map<SceneObject, string>,
    emitCount: number,
    emitionTime: number,
    sceneFlyDuration: number,
    sceneLifeDuration: number,
    featureStateControlName: string,
    beforeFlyAction?: Action
  ): void {
    this._emitNode = emitNode;
    this._destinationNodes = destinationNodes;
    this._afterMoveActions = afterMoveActions;
    this._afterMoveStates = afterMoveStates;
    this._emitCount = emitCount;
    this._emitionTime = emitionTime;
    this._sceneFlyDuration = sceneFlyDuration;
    this._sceneLifeDuration = sceneLifeDuration;
    this._featureStateControlName = featureStateControlName;
    this._beforeFlyAction = beforeFlyAction ?? null;
  }

  buildEmitAction(): Action {
    const actions: Action[] = [];
    let delay = 0.0;
    let shootCounter = 0;
    for (let i = 0; i < this._emitCount; i++) {
      const moveToAction = new LazyAction(() => {
        const scene = this.getFeatureScene();
        const duration = this._sceneFlyDuration;

        return new SequenceSimpleAction([
          this._beforeFlyAction ? this._beforeFlyAction : new EmptyAction().withDuration(0.0),
          new ParallelSimpleAction([
            new FunctionAction(() => {
              this._root.addChild(scene);
              scene.z = 10000;
              scene.position = this.getNodeWorldPosition(this._emitNode);

              scene.stateMachine!.switchToState('default');
              scene.stateMachine!.switchToState('anim');

              if (this._featureStateControlName && this._featureStateControlName.length > 0) {
                scene
                  .findById(this._featureStateControlName)!
                  .stateMachine!.switchToState('default');
                scene.findById(this._featureStateControlName)!.stateMachine!.switchToState('fire4');
              }
            }),
            new LazyAction(() => {
              const nodeIndex = shootCounter++ % this._destinationNodes.length;
              return new SequenceSimpleAction([
                new LazyAction(() => {
                  const interpolateAction = new InterpolateInplaceAction<Vector2>((v) => v.clone())
                    .withInterpolateFunction(Vector2.lerpInplace)
                    .withValues(
                      this.getNodeWorldPosition(this._emitNode),
                      this.getNodeWorldPosition(this._destinationNodes[nodeIndex])
                    )
                    .withTimeFunction((time, _start, _dx) => time)
                    .withDuration(duration);

                  interpolateAction.valueChange.listen((e) => {
                    scene.position = e;
                  });

                  return interpolateAction;
                }),
                new FunctionAction(() => {
                  if (
                    this._afterMoveStates &&
                    this._afterMoveStates.has(this._destinationNodes[nodeIndex])
                  ) {
                    scene.stateMachine!.switchToState(
                      this._afterMoveStates.get(this._destinationNodes[nodeIndex])!
                    );
                  }
                }),
                this._afterMoveActions
                  ? this._afterMoveActions.get(this._destinationNodes[nodeIndex])!
                  : new EmptyAction().withDuration(0.0),
              ]);
            }),
            new EmptyAction().withDuration(this._sceneLifeDuration),
          ]),
          new FunctionAction(() => {
            this._root.removeChild(scene);
            this.putFeatureScene(scene);
          }),
        ]);
      });

      actions.push(new SequenceSimpleAction([new EmptyAction().withDuration(delay), moveToAction]));

      delay += this._emitionTime / this._emitCount;
    }

    return new ParallelSimpleAction(actions);
  }

  getFeatureScene(): SceneObject {
    if (this._featureSceneCache.length > 0) {
      const scene = this._featureSceneCache[0];
      this._featureSceneCache.splice(0, 1);

      return scene;
    }

    return this._createFeatureScene();
  }

  putFeatureScene(scene: SceneObject): void {
    this._featureSceneCache.push(scene);
  }

  getNodeWorldPosition(node: SceneObject): Vector2 {
    const nodeWorldPosition = new Vector2(node.worldTransform.tx, node.worldTransform.ty);
    this._root.inverseTransform.transformVectorInplace(nodeWorldPosition);
    return nodeWorldPosition;
  }

  dispose(): void {
    this._featureSceneCache.forEach((scene) => {
      scene.active = false;
      scene.deinitialize();
    });

    this._featureSceneCache = [];
  }
}
