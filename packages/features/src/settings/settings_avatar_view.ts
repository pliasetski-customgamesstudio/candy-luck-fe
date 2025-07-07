// import { TextureSceneObject } from "@cgs/network";
// import { SceneObject, Rect, Vector2 } from "@cgs/shared";
// import { UserDTO } from 'syd';
//
// class SettingsAvatarView extends SceneObject {
//   private _icon: TextureSceneObject;
//
//   constructor(root: SceneObject) {
//     super();
//     this._icon = new TextureSceneObject();
//     this._icon.z = 10;
//     this._icon.size = new Vector2(0, 0);
//
//     // avatarFB.addChild(_icon);
//     this.bounds = new Rect(root.position, root.size);
//   }
//
//   public setStandaloneAvatar(user: UserDTO): void {
//     this.setStandaloneAvatarByUserId(user.userId);
//   }
//
//   public setStandaloneAvatarByUserId(userId: string): void {
//     const saAvatar: number = this.getSaAvatarIndexByUserId(userId);
//
//     const state: string = "avatar_" + saAvatar.toString();
//
//     // if (!root.stateMachine.isActive(state)) {
//     //   root.stateMachine.switchToState(state);
//     // }
//   }
//
//   private getSaAvatarIndexByUserId(userId: string): number {
//     return parseInt(userId) % 6;
//   }
//
//   public setFacebookAvatar(icon: TextureSource): void {
//     // if (!root.stateMachine.isActive("avatar_fb")) {
//     //   root_avatar_fb();
//     // }
//     this._icon.source = icon;
//   }
//
//   public get avatarSize(): Vector2 {
//     return Vector2.Zero;//root.bounds.size;
//   }
//
//   public setSceneAvatar(avatarView: SceneObject): void {
//     // NodeUtils.sendEventIfNeeded(root, "avatar_fb");
//     this._icon.hidden = true;
//     // avatarFB.addChild(avatarView);
//   }
// }
