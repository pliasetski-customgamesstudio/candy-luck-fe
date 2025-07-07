import { ApplicationUserConfig } from "@cgs/shared";

export const T_ILocalizationInfoProvider = Symbol('ILocalizationInfoProvider');
export interface ILocalizationInfoProvider {
  currentLocale: string;
}

export class LocalizationInfoProvider implements ILocalizationInfoProvider {
  currentLocale: string = ApplicationUserConfig.language;
}
