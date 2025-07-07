// import { ISlotFeaturesApiService } from '@cgs/shared';
// import { ISessionHolder } from '@cgs/network';

// class SlotFeaturesService implements ISlotFeaturesApiService {
//   private _slotFeaturesApiService: SlotsfeaturesApiService;
//   private _sessionHolder: ISessionHolder;

//   constructor(slotFeaturesApiService: SlotsfeaturesApiService, sessionHolder: ISessionHolder) {
//     this._slotFeaturesApiService = slotFeaturesApiService;
//     this._sessionHolder = sessionHolder;
//   }

//   async trackEvent(eventType: string): Promise<void> {
//     try {
//       await this._slotFeaturesApiService.trackEvent(
//         (new TrackEventRequest().session = this._sessionHolder.sessionToken.eventType = eventType)
//       );
//     } catch (e) {}
//   }

//   async syncData(adjustment: number, metadata: string): Promise<SyncDataResponse> {
//     const request = new SyncDataRequest();
//     request.session = this._sessionHolder.sessionToken;
//     request.adjustment = adjustment;
//     request.metadata = metadata;

//     return this._slotFeaturesApiService.syncData(request);
//   }

//   async getUnplayedFeatures(): Promise<UnfinishedFsBonusFeatureResponse> {
//     const request = new UnfinishedFsBonusFeatureRequest();
//     request.session = this._sessionHolder.sessionToken;

//     return this._slotFeaturesApiService.getUnplayedFeatures(request);
//   }
// }
