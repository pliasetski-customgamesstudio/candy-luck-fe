import { BitmapTextSceneObject, Button, CheckBox, SceneObject } from '@cgs/syd';

export interface ILevelUpNotificationView {
  isInitialized: boolean;
  levelUpInfoStates: SceneObject;
  winCoinsText: BitmapTextSceneObject;
  levelToUnlockText: BitmapTextSceneObject;
  shareBtn: Button;
  loyaltyPointsText: BitmapTextSceneObject;
  shareCheckbox: CheckBox;
  iconHolder: SceneObject;
  levelPercent: BitmapTextSceneObject;
  levelUpInfoStates_LevelUpInfo_show_unlocked(): void;
  levelUpInfoStates_LevelUpInfo_show_coins(): void;
  levelUpInfoStates_LevelUpInfo_hide_coins(): void;
  levelUpInfoStates_LevelUpInfo_hide_unlocked(): void;
  levelUpInfoStates_LevelUpInfo_show_next_game(): void;
  levelUpInfoStates_LevelUpInfo_hide_next_game(): void;
  levelUpInfoStates_LevelUpInfo_default(): void;
  levelUpPanel_levelup_panel_show(): void;
  levelUpPanel_levelup_panel_show_xpBooster(): void;
  levelUpPanel_levelup_panel_hide(): void;
}
