import { Container } from '@cgs/syd';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { ResourcesComponent } from './resources_component';
import { IconsSceneObject } from '../../reels_engine/icons_scene_object';
import { T_IReelsConfigProvider, T_ResourcesComponent } from '../../type_definitions';

export class IconsSceneObjectComponent {
  public iconsRender: IconsSceneObject;
  public animIconsRender: IconsSceneObject;

  constructor(container: Container, drawWithPushState: boolean = true) {
    console.log('load ' + this.constructor.name);
    const reeslConfig =
      container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this.iconsRender = new IconsSceneObject(drawWithPushState, container, reeslConfig);
    this.animIconsRender = new IconsSceneObject(drawWithPushState, container, reeslConfig);
    const iconsHolder = res.slot.findById('icons_holder');
    const animHolder = res.slot.findById('anim_icons_holder');
    const iconFrameStart = res.findStartReelNode(0);
    this.iconsRender.position = iconFrameStart.position;
    this.animIconsRender.position = iconFrameStart.position;

    if (iconsHolder) iconsHolder.addChild(this.iconsRender);
    if (animHolder) animHolder.addChild(this.animIconsRender);
  }
}
