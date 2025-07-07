import { IconsSceneObjectComponent } from './icons_scene_object_component';
import { IconsSceneObjectWithScissor } from '../../reels_engine/icons_scene_object_with_scissor';
import { Container } from '@cgs/syd';
import { LobbyFacade } from '../../lobby_facade';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { T_IReelsConfigProvider, T_ResourcesComponent } from '../../type_definitions';
import { ICoordinateSystemInfoProvider, T_ICoordinateSystemInfoProvider } from '@cgs/common';
import { ResourcesComponent } from './resources_component';

export class IconsSceneObjectWithScissorComponent extends IconsSceneObjectComponent {
  constructor(
    container: Container,
    private _lobbyFacade: LobbyFacade,
    drawWithPushState: boolean = true
  ) {
    super(container, drawWithPushState);
    const reeslConfig = container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    const coordinateProvider = _lobbyFacade.resolve<ICoordinateSystemInfoProvider>(
      T_ICoordinateSystemInfoProvider
    )!;
    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const iconFrameStart = res.findStartReelNode(0);

    const iconsHolder = res.slot.findById('icons_holder');
    const animHolder = res.slot.findById('anim_icons_holder');

    iconsHolder?.removeChild(this.iconsRender);

    if (this.animIconsRender) {
      animHolder?.removeChild(this.animIconsRender);
    }

    this.iconsRender = new IconsSceneObjectWithScissor(
      drawWithPushState,
      container,
      reeslConfig,
      coordinateProvider
    );
    this.animIconsRender = new IconsSceneObjectWithScissor(
      drawWithPushState,
      container,
      reeslConfig,
      coordinateProvider
    );
    this.iconsRender.position = iconFrameStart.position;
    this.animIconsRender.position = iconFrameStart.position;

    iconsHolder?.addChild(this.iconsRender);
    if (this.animIconsRender) {
      animHolder?.addChild(this.animIconsRender);
    }
  }
}
