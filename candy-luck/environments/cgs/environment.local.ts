import { IEnvironmentConfig, EnvironmentName } from '@cgs/shared';

export const environment: IEnvironmentConfig = {
  name: EnvironmentName.CGS,
  api: {
    url: 'http://localhost:5139/SlotsEndpoint/',
    methods: {
      init: 'start',
      spin: 'spin',
      bonus: 'bonus',
      userInfo: 'userInfo',
      refreshUserInfo: 'refreshUserInfo',
      buyCreditsWithGems: 'buyCreditsWithGems',
      buyCreditsWithAds: 'buyCreditsWithAds',
      watchAds: 'watchAds',
      getTaskCompletedCreditsWithAds: 'getTaskCompletedCreditsWithAds',
    },
  },
  useHTMLPayTable: false,
  showSessionInfo: false,
  maxInitTimeSDK: 1000,
};
