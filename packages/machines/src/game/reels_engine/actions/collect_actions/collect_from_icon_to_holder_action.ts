import { Container, SceneObject, Vector2, Action, SequenceSimpleAction } from '@cgs/syd';
import { PlaySoundActionByName } from '../sound_actions/play_sound_action_by_name';
import { StopSoundByNameAction } from '../sound_actions/stop_sound_action_by_name';
import { BuildAction } from '@cgs/shared';
import { FlyActionHelper } from '../../../components/fly_action_helper';

export class CollectFromIconToHolderAction extends BuildAction {
  private readonly _container: Container;
  private readonly _iconPos: number;
  private readonly _endHolder: SceneObject;
  private readonly _featureSceneName: string;
  private readonly _featureFlyState: string;
  private readonly _sound: string;
  private readonly _offset: Vector2 | null;
  private readonly _flyActionHelper: FlyActionHelper;

  constructor(
    container: Container,
    iconPos: number,
    endHolder: SceneObject,
    offset: Vector2 | null = null,
    featureSceneName: string = 'feature.scene',
    featureFlyState: string = 'anim',
    sound: string = ''
  ) {
    super();
    this._container = container;
    this._iconPos = iconPos;
    this._endHolder = endHolder;
    this._featureSceneName = featureSceneName;
    this._featureFlyState = featureFlyState;
    this._sound = sound;
    this._offset = offset;
  }

  buildAction(): Action {
    const actions: Action[] = [];

    const destinationPos = this._flyActionHelper
      .getDestinationMovingScenePosition(this._endHolder)
      .add(this._offset!);
    const collect = this._flyActionHelper.collectFromIconToMachineHolder(
      this._iconPos,
      destinationPos,
      0.0,
      {
        showValueOnScene: false,
        isMultiplier: false,
        featureSceneName: this._featureSceneName,
        featureFlyState: this._featureFlyState,
      }
    );

    actions.push(new PlaySoundActionByName(this._container, this._sound));
    actions.push(collect.item1);
    actions.push(collect.item2);
    actions.push(new StopSoundByNameAction(this._container, this._sound));

    return new SequenceSimpleAction(actions);
  }
}
