export class BrowserHelper {
  private static _cache: Map<string, string> | null = null;

  static refreshPage(): void {
    const windowObj = window as any;
    windowObj.location.assign(windowObj.location.href);
  }

  static isMacOS(): boolean {
    return navigator.userAgent.includes('Macintosh');
  }

  static parseUserAgent(): Map<string, string> {
    if (BrowserHelper._cache) {
      return BrowserHelper._cache;
    }

    const nAgt = navigator.userAgent;

    let browserName = navigator.appName;
    let fullVersion = navigator.appVersion;
    let os = navigator.platform;

    const nameOffset = nAgt.lastIndexOf(' ') + 1;
    const verOffset = nAgt.lastIndexOf('/');

    const osType = nAgt.indexOf('WOW64') !== -1 ? '(64 bit)' : '';
    os += osType;

    if (new RegExp('android').test(nAgt)) os = 'android';
    if (new RegExp('iPhone|iPad|iPod').test(nAgt)) os = 'ios';
    if (new RegExp('IEMobile').test(nAgt) || new RegExp('WPDesktop').test(nAgt)) os = 'wp';

    if (verOffset !== -1) {
      browserName = nAgt.substring(nameOffset, verOffset);
      fullVersion = nAgt.substring(verOffset + 1);

      if (browserName.toLowerCase() === browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }

    const ix = fullVersion.indexOf(';');
    if (ix !== -1) {
      fullVersion = fullVersion.substring(0, ix);
    }

    const majorVersion = parseInt(fullVersion, 10) || 0;

    if (majorVersion === 0) {
      fullVersion = navigator.appVersion;
    }

    BrowserHelper._cache = new Map<string, string>([
      ['os', os],
      ['browser', browserName + ' ' + fullVersion],
    ]);

    return BrowserHelper._cache;
  }

  // static parseUserAgentAccurate(): Map<string, string> {
  //   const result = new Map<string, string>();
  //
  //   const sb = new StringBuffer();
  //   const ua = parseUA(); // Assuming parseUA() is defined elsewhere.
  //
  //   sb.push([ua.os.name, ua.os.version]);
  //   result.set("os", sb.toString());
  //
  //   sb.clear();
  //   sb.push(ua.browser.name, ua.browser.version);
  //   result.set("browser", sb.toString());
  //
  //   sb.clear();
  //   sb.push(ua.device.type, ua.cpu.architecture, ua.device.vendor, ua.device.model);
  //   result.set("device_type", sb.toString());
  //
  //   return result;
  // }

  // static screen(): Map<string, number> {
  //   return {
  //     'w': window.screen.width,
  //     'h': window.screen.height,
  //   };
  // }

  static queryString(): string {
    return window.location.search;
  }
  //
  // static parseQueryString(): Map<string, string> {
  //   const query = BrowserHelper.queryString();
  //
  //   const search = new RegExp('([^&=]+)=?([^&]*)');
  //   const result = new Map<string, string>();
  //
  //   if (query.startsWith('?')) {
  //     query = query.substring(1);
  //   }
  //
  //   const decode = (s: string) => decodeURIComponent(s.replace('+', ' '));
  //
  //   for (const match of query.matchAll(search)) {
  //     result.set(decode(match[1]).toLowerCase(), decode(match[2]));
  //   }
  //
  //   return result;
  // }
  //
  // static getInstallSourceParamsWithAds(): Map<string, string> {
  //   const res = BrowserHelper.getInstallSourceParams();
  //   const params = BrowserHelper.parseQueryString();
  //
  //   if (params.has("ad_name")) {
  //     res.set("ad_id", params.get("ad_name")!);
  //   } else if (params.has("ad_id")) {
  //     res.set("ad_id", params.get("ad_id")!);
  //   }
  //   if (params.has("adset_name")) {
  //     res.set("adset_id", params.get("adset_name")!);
  //   } else if (params.has("adset_id")) {
  //     res.set("adset_id", params.get("adset_id")!);
  //   }
  //   return res;
  // }
  //
  // static getInstallSourceParams(): Map<string, string> {
  //   const params = BrowserHelper.parseQueryString();
  //   const facebook = "Facebook";
  //
  //   let affiliateId = "";
  //   let campaignId = "";
  //   let trackerId = "";
  //
  //   if (params.has("affiliate_id")) {
  //     affiliateId = params.get("affiliate_id")!;
  //     if (params.has("campaign_id")) {
  //       campaignId = params.get("campaign_id")!;
  //     }
  //     if (campaignId === "share_sheet" && params.has("tracker_id") && params.has("user_id")) {
  //       trackerId = `{"inviteId":"${params.get("tracker_id")}", "userId":${params.get("user_id")}}`;
  //     } else if (params.has("tracker_id")) {
  //       trackerId = params.get("tracker_id")!;
  //     }
  //
  //     return new Map<string, string>([
  //       ["affiliateId", affiliateId],
  //       ["campaignId", campaignId],
  //       ["trackerId", trackerId],
  //     ]);
  //   }
  //
  //   if (params.has("request_ids")) {
  //     return new Map<string, string>([
  //       ["affiliateId", "Internal"],
  //       ["campaignId", "PushNotification"],
  //       ["trackerId", "Invite"],
  //       ["requestIds", params.get("request_ids")!],
  //     ]);
  //   }
  //
  //   if (params.has("fb_source") || params.has("fbsource")) {
  //     const fbsource = params.has("fb_source") ? params.get("fb_source") : params.get("fbsource");
  //
  //     switch (fbsource.toLowerCase()) {
  //       case "fanpage":
  //         if (params.has("post_id")) trackerId = params.get("post_id")!;
  //         else if (params.has("gift_id")) trackerId = params.get("gift_id")!;
  //         else trackerId = "FanPagePost";
  //
  //         return new Map<string, string>([
  //           ["affiliateId", facebook],
  //           ["campaignId", fbsource],
  //           ["trackerId", trackerId],
  //         ]);
  //
  //       case "fbpage":
  //         const fpplay = "fp Play now";
  //
  //         return new Map<string, string>([
  //           ["affiliateId", facebook],
  //           ["campaignId", fpplay],
  //           ["trackerId", fpplay],
  //         ]);
  //
  //       case "ad":
  //         if (params.has("pub") && params.get("pub") === "fb") {
  //           return new Map<string, string>([
  //             ["affiliateId", "Facebook Ads"],
  //             ["campaignId", params.has("camp") ? params.get("camp")! : "ad"],
  //             ["trackerId", params.has("ad_id") ? params.get("ad_id")! : "ad"],
  //           ]);
  //         }
  //         break;
  //
  //       case "notification":
  //         const res = new Map<string, string>([
  //           ["affiliateId", "Internal"],
  //           ["campaignId", "PushNotification"],
  //         ]);
  //
  //         if (params.has("pushtype")) {
  //           res.set("trackerId", params.get("pushtype")!);
  //         } else if (params.has("notif_t")) {
  //           switch (params.get("notif_t")!) {
  //             case "app_request":
  //               res.set("trackerId", "Gift");
  //               break;
  //             case "app_invite":
  //               res.set("trackerId", "Invite");
  //               break;
  //           }
  //         } else if (params.get("ref") === "notif" && params.has("request_ids")) {
  //           res.set("trackerId", "Invite");
  //           res.set("requestIds", params.get("request_ids")!);
  //         }
  //         return res;
  //         break;
  //
  //       default:
  //         return new Map<string, string>([
  //           ["affiliateId", facebook],
  //           ["campaignId", fbsource],
  //           ["trackerId", fbsource],
  //         ]);
  //     }
  //   }
  //
  //   if (params.has("fb_appcenter")) {
  //     return new Map<string, string>([
  //       ["affiliateId", facebook],
  //       ["campaignId", "appcenter"],
  //       ["trackerId", BrowserHelper.queryString()],
  //     ]);
  //   }
  //
  //   if (params.has("hash") && params.get("hash")!.startsWith("gift")) {
  //     return new Map<string, string>([
  //       ["affiliateId", facebook],
  //       ["campaignId", "SocialGift"],
  //       ["trackerId", params.get("hash")!],
  //     ]);
  //   }
  //
  //   if (params.has("pub")) {
  //     affiliateId = params.get("pub")!;
  //
  //     if (params.has("ad_id")) {
  //       trackerId = params.get("ad_id")!;
  //
  //       if (params.has("camp")) {
  //         campaignId = params.get("camp")!;
  //       } else {
  //         affiliateId = facebook;
  //         if (params.get("pub")!.toLowerCase() === "fanpagegift") {
  //           campaignId = "FanPage";
  //         } else {
  //           campaignId = params.get("pub")!;
  //         }
  //       }
  //     }
  //     return new Map<string, string>([
  //       ["affiliateId", affiliateId],
  //       ["campaignId", campaignId],
  //       ["trackerId", trackerId],
  //     ]);
  //   }
  //
  //   if (navigator.userAgent.includes("FacebookCanvasDesktop")) {
  //     affiliateId = facebook;
  //     campaignId = "Gameroom";
  //     trackerId = BrowserHelper.queryString();
  //   } else {
  //     if ((window as any).STANDALONE_APP === "true") {
  //       return new Map<string, string>([
  //         ["affiliateId", null],
  //         ["campaignId", null],
  //         ["trackerId", null],
  //       ]);
  //     }
  //     affiliateId = facebook;
  //     campaignId = "Unknown";
  //     trackerId = BrowserHelper.queryString();
  //   }
  //
  //   return new Map<string, string>([
  //     ["affiliateId", affiliateId],
  //     ["campaignId", campaignId],
  //     ["trackerId", trackerId],
  //   ]);
  // }
}
