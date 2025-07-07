import { IEnvironmentConfig, EnvironmentName } from '@cgs/shared';

export const environment: IEnvironmentConfig = {
  name: EnvironmentName.CGS,
  api: {
    url: 'https://p3crxxfcxk.us-east-1.awsapprunner.com/SlotsEndpoint/',
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
  maxInitTimeSDK: 5000,
};
