// import { SceneObject } from 'syd';
// import { UserDTO, UserExtensions } from "@cgs/common";
// import { NodeUtils } from "@cgs/network";
// import { NameDisplayHelper } from "@cgs/shared";
//
// class SettingsView extends SceneObject {
//   constructor(root: SceneObject, viewFactory: IViewFactory, clientProperties: IClientProperties) {
//     super();
//
//     this.initTreasures();
//   }
//
//   private initTreasures(): void {
//   }
//
//   private registerTresures(): void {
//   }
//
//   private unregisterTresures(): void {
//   }
//
//   public initialize(): void {
//     super.initialize();
//
//     this.registerTresures();
//   }
//
//   public deinitialize(): void {
//     super.deinitialize();
//
//     this.unregisterTresures();
//   }
//
//   public get volumeValue(): number { return 1.0; }
//
//   public set volumeValue(value: number): void {
//     // if (value > 0) {
//     //   soundsCheckbox_enabling();
//     // }
//     // else {
//     //   soundsCheckbox_disabled();
//     // }
//   }
//
//   // public get jackpotValue(): boolean { return !NodeUtils.anyActiveState(notificationsJPCheckbox, (st) => st.name.contains("enabl")); }
//   //
//   // public set jackpotValue(value: boolean): void {
//   //   if (value) {
//   //     notificationsJPCheckbox_enabled();
//   //   }
//   //   else {
//   //     notificationsJPCheckbox_disabled();
//   //   }
//   // }
//
//   public get notificationsEnabled(): boolean { return false; }
//
//   public set notificationsEnabled(value: boolean): void {
//     if (value) {
//
//       //notificationsCheckbox_enabled();
//     }
//     else {
//       //notificationsCheckbox_disabled();
//     }
//   }
//
//   public get sharingEnabled(): boolean { return false; }
//
//   public set sharingEnabled(value: boolean): void {
//     if (value) {
//      // sharingCheckbox_enabled();
//     }
//     else {
//      // sharingCheckbox_disabled();
//     }
//   }
//
//   public setSocialMode(invite: boolean): void {
//     // if (invite) {
//     //   root_connected();
//     // }
//     // else {
//     //   root_connected_no_invite();
//     // }
//   }
//
//   public setStandAloneMode(invite: boolean): void {
//     // if (invite) {
//     //   root_disconnected();
//     // }
//     // else {
//     //   root_disconnected_no_invite();
//     // }
//   }
//
//   public setUser(user: UserDTO): void {
//     //userId.text = user.userId;
//
//     let name1: string;
//     let name2: string;
//     name1 = NameDisplayHelper.splitNameInTwo(UserExtensions.safeDisplayName(user))[0];
//     name2 = NameDisplayHelper.splitNameInTwo(UserExtensions.safeDisplayName(user))[1];
//     //NameDisplayHelper.setNameText(nameText, UserExtensions.safeDisplayName(user));
//   }
//
//   public setVersion(appVersion: string): void {
//     //versionText.text = appVersion;
//   }
//
//   public disableSharing(): void {
//     //sharingCheckbox.touchable = false;
//   }
//
//   public setAvatar(avatar: SceneObject): void {
//     // if (avatar && !avatar.parent) {
//     //   NodeUtils.removeAllChildsDisposing(userAva);
//     //   userAva.addChild(avatar);
//     // }
//   }
// }
