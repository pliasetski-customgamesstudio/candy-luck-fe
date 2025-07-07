// import { IAppSettings } from "@cgs/common";
// import { IApplicationInfo } from "@cgs/common";
// import { ICustomerSupport } from "@cgs/common";
// import { IBrowser } from "@cgs/common";
// import { IClientProperties } from "@cgs/common";
// import { OperationControllerBase } from "@cgs/common";
// import { SettingsOperation } from "@cgs/common";
// import { SettingsView } from "@cgs/common";
// import { StreamSubscription } from 'dart:async';
// import { js } from 'dart:js';
//
// class SettingsController extends OperationControllerBase<SettingsOperation, SettingsView> {
//   private _userInfoHolder: IUserInfoHolder;
//   private _appSettings: IAppSettings;
//   private _applicationInfo: IApplicationInfo;
//   private _customerSupport: ICustomerSupport;
//   private _browser: IBrowser;
//   private _clientProperties: IClientProperties;
//
//   private _streamSubscription: StreamSubscription;
//   private _streamSubscription1: StreamSubscription;
//   private _streamSubscription2: StreamSubscription;
//   private _streamSubscription3: StreamSubscription;
//   private _streamSubscription4: StreamSubscription;
//   private _streamSubscription5: StreamSubscription;
//
//   constructor(view: SettingsView,
//       operation: SettingsOperation,
//       userInfoHolder: IUserInfoHolder,
//       appSettings: IAppSettings,
//       applicationInfo: IApplicationInfo,
//       customerSupport: ICustomerSupport,
//       browser: IBrowser,
//       clientProperties: IClientProperties) {
//     super(view, operation);
//     this._userInfoHolder = userInfoHolder;
//     this._appSettings = appSettings;
//     this._applicationInfo = applicationInfo;
//     this._customerSupport = customerSupport;
//     this._browser = browser;
//     this._clientProperties = clientProperties;
//   }
//
//   public async onInitializeAsync(): Promise<void> {
//     /*
//     _fbLogger.logContent(FbLoggerConstantsContentType.settings, null);
//     setupEventHandler(view.logOutBtnClicked, logout_Clicked, false);
//     setupEventHandler(view.signOutBtnClicked, logout_Clicked, false);
//     setupEventHandler(view.connectBtnClicked, login_Clicked, false);
//     setupEventHandler(view.inviteBtnClicked, inviteClicked, false);
//     setupEventHandler(view.contactBtnClicked, support_Clicked, false);
//     setupActionEventHandler(view.termsBtnClicked, terms_Clicked, false);
//     setupEventHandler(view.privacyBtnClicked, privacy_Clicked, false);
// //    setupEventHandler(view.shortcutBtnClicked, shortcut_Clicked, false);
//     setupActionEventHandler(view.faqBtnClicked, faqBtn_Clicked, false);
//     setupActionEventHandler(view.fanPageBtnClicked, fanPageBtn_Clicked, false);
//
//
//     view.closeBtnClicked.listen((e) => close_Clicked());
//
//     view.soundsCheckboxClicked.listen((e) => sound_Clicked());
//     view.sharingCheckboxClicked.listen((e) => sharing_Clicked());
//     view.notificationsCheckboxClicked.listen((e) => notifications_Clicked());
//     // view.notificationsJPCheckboxClicked.listen((e) => jackpot_Clicked());
//     view.reteUsBtnClicked.listen((e) => rateUs_Clicked());
//
//     _analytics.trackScreen("Settings");
//     await updateView();
//
//     view.volumeValue = _appSettings.sounds;
//     // view.jackpotValue = _appSettings.jackpot;
//
//     view.sharingEnabled = _appSettings.sharing;
//
//     if (!_sharingManager.enabled || !_authorizationHolder.isFacebook) {
//       view.sharingEnabled = false;
//       view.disableSharing();
//     }
//
//     _analytics.trackEvent("lobby", "lobbySucceedAction", "settings");
//
//     checkIfSocialLoginAvailable();
//
//     if (_authorizationHolder.isFacebook) {
// //      if(_pwaSupportService.canInstall) {
// //        _analytics.trackComposedEvent(new FluentClientEvent("pwa_shortcut_button", "settings").withEventValue("displayed"));
// //        view.root_h5_fb_connected_sc();
// //      }
// //      else {
//       _analytics.trackComposedEvent(new FluentClientEvent("pwa_shortcut_button", "settings").withEventValue("not_available"));
//       view.root_fb_connected();
// //      }
//       if (!_authorizationHolder.isWebSite) {
//         view.signOutBtn.hidden = true;
//         view.signOutBtn_hide();
//       }
//     } else {
// //      if(_pwaSupportService.canInstall) {
// //        _analytics.trackComposedEvent(new FluentClientEvent("pwa_shortcut_button", "settings").withEventValue("displayed"));
// //        view.root_h5_fb_disconnected_sc();
// //      }
// //      else {
//       _analytics.trackComposedEvent(new FluentClientEvent("pwa_shortcut_button", "settings").withEventValue("not_available"));
//       if(!_authorizationHolder.isStandAlone && !_authorizationHolder.isFacebook) {
//         view.root_h5_fb_disconnected();
//       } else {
//         view.root_h5_fb_disconnected_no_signOut();
//       }
// //      }
//     } */
//   }
//
// //  Future shortcut_Clicked() async {
// //    _analytics.trackComposedEvent(new FluentClientEvent("pwa_shortcut_button", "settings").withEventValue("clicked"));
// //    if(_pwaSupportService.canInstall) {
// //      if (await _pwaSupportService.install()) {
// //        _analytics.trackComposedEvent(new FluentClientEvent("pwa_shortcut_button", "settings").withEventValue("dialog_accepted"));
// //        view.shortcutBtn_dis();
// //        _toastShower.queryToast(
// //            new ActionToast(
// //                    (_) => view.tooltipShortcut_tooltip_show(),
// //                    (_) => view.tooltipShortcut_tooltip_hide(),
// //                4000)
// //                .withName("shortcut_toast")
// //              ..addCloseButton(view.closeBtnTooltip));
// //      }
// //      else {
// //        _analytics.trackComposedEvent(new FluentClientEvent("pwa_shortcut_button", "settings").withEventValue("dialog_dismissed"));
// //      }
// //    }
// //  }
//
//   private checkIfSocialLoginAvailable(): void {
//   }
//
//   public async inviteClicked(): Promise<void> {
//     await new Promise<void>((resolve) => setTimeout(resolve, 1000));
//   }
//
//   public async onStartAsync(): Promise<void> {
//     //await _treasureBox.tryDisplayTreasureTutorial();
//   }
//
//   public terms_Clicked(): void {
//   }
//
//   public faqBtn_Clicked(): void {
//   }
//
//   public fanPageBtn_Clicked(): void {
//   }
//
//   public async privacy_Clicked(): Promise<boolean> {
//     return true;
//   }
//
//   public async support_Clicked(): Promise<void> {
//     await this._customerSupport.open();
//   }
//
//   public async rateUs_Clicked(): Promise<void> {
//     const isFullScreenMode: boolean = js.context.callMethod("isFullscreenMode");
//     js.context.callMethod(isFullScreenMode ? "exitFullscreen" : "enterFullscreen");
//
//     await new Promise<void>((resolve) => setTimeout(resolve, 1000));
//   }
//
//   public notifications_Clicked(): void {
//   }
//
//   public sound_Clicked(): void {
//     this._appSettings.sounds = this.view.volumeValue;
//   }
//
//
//   public sharing_Clicked(): void {
//   }
//
//   public async updateView(): Promise<void> {
//     this.view.setVersion(this._applicationInfo.appVersion);
//     this.view.setUser(this._userInfoHolder.user);
//
//     await this.loadIcon(this._userInfoHolder.user.socialId, this._userInfoHolder.user.userId, this._userInfoHolder.user.socialNetwork, this._userInfoHolder.user.avatar);
//   }
//
//   public async loadIcon(socialId: string, userId: string, socialNetwork: string, avatarId: string): Promise<boolean> {
//     return true;
//   }
//
//
//   public async logout_Clicked(): Promise<void> {
//     await new Promise<void>((resolve) => setTimeout(resolve, 1000));
//   }
//
//   public forgetFbRewardForUser(): void {
//     /*var settings = _settingsManager.getMainSection(FbRewardOperation.FbAwardSettings);
//       if (settings.keyExists(_userInfoHolder.user.userId)) {
//         settings.deleteKey(_userInfoHolder.user.userId);
//       }*/
//   }
//
//
//   public async login_Clicked(): Promise<boolean> {
//     return true;
//   }
//
//   public close_Clicked(): void {
//     this.operation.complete(VoidType.value);
//   }
//
//   public onStop(): void {
//     super.onStop();
//     this._streamSubscription?.cancel();
//     this._streamSubscription1?.cancel();
//     this._streamSubscription2?.cancel();
//     this._streamSubscription3?.cancel();
//     this._streamSubscription4?.cancel();
//     this._streamSubscription5?.cancel();
//   }
// }
