"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
exports.environment = {
    name: "arkadium" /* EnvironmentName.Arkadium */,
    api: {
        url: 'https://candy-luck-be-dev.arkadiumhosted.com/SlotsEndpoint/',
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
};
