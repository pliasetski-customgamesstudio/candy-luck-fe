"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
exports.environment = {
    name: "cgs" /* EnvironmentName.CGS */,
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
