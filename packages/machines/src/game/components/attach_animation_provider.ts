import {
  Action,
  Container,
  IFramePulse,
  IStreamSubscription,
  SceneObject,
  T_IFramePulse,
  Vector2,
} from '@cgs/syd';
import { GameComponentProvider } from './game_component_provider';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { T_ISlotGame } from '../../type_definitions';

export class OriginalProperty {
  position: Vector2;
  constructor(node: SceneObject) {
    this.position = new Vector2(node.position.x, node.position.y);
  }
}

export class AttachAnimationProvider extends GameComponentProvider {
  private _animationProperty: OriginalProperty;
  private _animationProvider: SceneObject;
  private _framePulse: IFramePulse;
  private _pulserSub: IStreamSubscription;

  private _absoluteAnimationMap: Map<SceneObject, OriginalProperty> = new Map<
    SceneObject,
    OriginalProperty
  >();
  private action: Action;

  constructor(container: Container, controlName: string, animatedContainer: string) {
    super();
    this._framePulse = container.forceResolve(T_IFramePulse);
    this.action = this.getAttachedAnimation(
      container.forceResolve<ISlotGame>(T_ISlotGame).gameNode.findById(controlName)!,
      animatedContainer
    );
  }

  private getAttachedAnimation(node: SceneObject, animatedContainer: string): Action {
    const ap = node.findById(animatedContainer);
    if (!ap) {
      throw new Error('Animated container not found');
    }
    this._animationProvider = ap;
    this._animationProperty = new OriginalProperty(this._animationProvider);
    this._pulserSub = this._framePulse.framePulsate.listen((dt) => this.update(dt));
    node.stateMachine!.findById('anim')?.enterAction.done.listen((e) => this.onEnd());
    const result = node.stateMachine!.findById('anim')?.enterAction;
    if (!result) {
      throw new Error('Animation not found');
    }
    return result;
  }

  private update(_f: number): void {
    if (this.action && !this.action.isDone) {
      for (const key of this._absoluteAnimationMap.keys()) {
        const node = key;
        const property = this._absoluteAnimationMap.get(key)!;
        this.animatePosition(node, property);
      }
    }
  }

  private onEnd(): void {
    for (const key of this._absoluteAnimationMap.keys()) {
      const node = key;
      const property = this._absoluteAnimationMap.get(key);
      if (!property) {
        throw new Error('Property not found');
      }
      this.animatePosition(node, property);
    }
  }

  deinitialize(): void {
    this._pulserSub.cancel();
    super.deinitialize();
  }

  private animatePosition(node: SceneObject, property: OriginalProperty): void {
    let diff = new Vector2(
      this._animationProperty.position.x + this._animationProvider.position.x,
      this._animationProperty.position.y + this._animationProvider.position.y
    );
    node.position = new Vector2(property.position.x + diff.x, property.position.y + diff.y);
  }

  registerToAttach(node: SceneObject): void {
    this._absoluteAnimationMap.set(node, new OriginalProperty(node));
  }

  unRegisterToAttach(node: SceneObject): void {
    this._absoluteAnimationMap.delete(node);
  }
}
