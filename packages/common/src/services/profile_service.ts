// import {
//   BaseRequest,
//   NoInternetException,
//   ServerException,
//   ParseException,
//   SegmentableConfigNotFoundException,
// } from '@cgs/network';
// import { UserApiService } from '@cgs/shared';
// import { Logger } from '@cgs/shared';

// class ProfileService implements IProfileService {
//   private _sessionHolder: ISessionHolder;
//   private _userApiService: UserApiService;

//   private _lastProfileResponse: UserLocalProfileResponse;
//   get lastProfileResponse(): UserLocalProfileResponse {
//     return this._lastProfileResponse;
//   }

//   constructor(sessionHolder: ISessionHolder, userApiService: UserApiService) {
//     this._sessionHolder = sessionHolder;
//     this._userApiService = userApiService;
//   }

//   async getLocalUserMedia(): Promise<UserLocalMediaResponse> {
//     const request: BaseRequest = new BaseRequest();
//     request.session = this._sessionHolder.sessionToken;
//     try {
//       return await this._userApiService.getLocalUserMedia(request);
//     } catch (e) {
//       if (e instanceof NoInternetException) {
//         // ignore
//       } else if (e instanceof ServerException) {
//         Logger.Error(`Error on getting local user media ${e}\n${e.stack}`);
//       } else if (e instanceof ParseException) {
//         Logger.Error(`Error on getting local user media ${e}\n${e.stack}`);
//       } else if (e instanceof SegmentableConfigNotFoundException) {
//         Logger.Error(`Error on getting local user media ${e}\n${e.stack}`);
//       }
//     }
//     return null;
//   }

//   async getLocalUserProfile(): Promise<UserLocalProfileResponse> {
//     const request: BaseRequest = new BaseRequest();
//     request.session = this._sessionHolder.sessionToken;
//     try {
//       this._lastProfileResponse = await this._userApiService.getLocalUserProfile(request);
//     } catch (e) {
//       if (e instanceof NoInternetException) {
//         // ignore
//       } else if (e instanceof ServerException) {
//         Logger.Error(`Error on getting local user profile ${e}\n${e.stack}`);
//       } else if (e instanceof ParseException) {
//         Logger.Error(`Error on getting local user profile ${e}\n${e.stack}`);
//       } else if (e instanceof SegmentableConfigNotFoundException) {
//         Logger.Error(`Error on getting local user profile ${e}\n${e.stack}`);
//       }
//     }
//     return this._lastProfileResponse;
//   }

//   async setLocalUserProfile(
//     fullName: string,
//     email: string,
//     status: number,
//     country: number,
//     birthday: string,
//     gender: string,
//     avatarId: number,
//     celebrateWithFriends: boolean
//   ): Promise<UserLocalProfileResponse> {
//     const request: UserLocalProfileRequest = new UserLocalProfileRequest();
//     request.session = this._sessionHolder.sessionToken;
//     request.fullName = fullName;
//     request.email = email;
//     request.status = status;
//     request.country = country;
//     request.birthDate = birthday;
//     request.gender = gender;
//     request.avatarId = avatarId;
//     request.celebrateWithFriends = celebrateWithFriends;
//     try {
//       this._lastProfileResponse = await this._userApiService.setLocalUserProfile(request);
//     } catch (e) {
//       if (e instanceof NoInternetException) {
//         // ignore
//       } else if (e instanceof ServerException) {
//         Logger.Error(`Error on saving local user profile ${e}\n${e.stack}`);
//       } else if (e instanceof ParseException) {
//         Logger.Error(`Error on saving local user profile ${e}\n${e.stack}`);
//       } else if (e instanceof SegmentableConfigNotFoundException) {
//         Logger.Error(`Error on saving local user profile ${e}\n${e.stack}`);
//       }
//     }
//     return this._lastProfileResponse;
//   }

//   async getLocalUserStatuses(): Promise<UserLocalStatusResponse> {
//     const request: BaseRequest = new BaseRequest();
//     request.session = this._sessionHolder.sessionToken;
//     try {
//       return await this._userApiService.getLocalUserStatuses(request);
//     } catch (e) {
//       if (e instanceof NoInternetException) {
//         // ignore
//       } else if (e instanceof ServerException) {
//         Logger.Error(`Error on getting local user statuses ${e}\n${e.stack}`);
//       } else if (e instanceof ParseException) {
//         Logger.Error(`Error on getting local user statuses ${e}\n${e.stack}`);
//       } else if (e instanceof SegmentableConfigNotFoundException) {
//         Logger.Error(`Error on getting local user statuses ${e}\n${e.stack}`);
//       }
//     }
//     return null;
//   }

//   async getCountries(): Promise<CountryResponse> {
//     const request: BaseRequest = new BaseRequest();
//     request.session = this._sessionHolder.sessionToken;
//     try {
//       return await this._userApiService.getCountries(request);
//     } catch (e) {
//       if (e instanceof NoInternetException) {
//         // ignore
//       } else if (e instanceof ServerException) {
//         Logger.Error(`Error on getting countries ${e}\n${e.stack}`);
//       } else if (e instanceof ParseException) {
//         Logger.Error(`Error on getting countries ${e}\n${e.stack}`);
//       } else if (e instanceof SegmentableConfigNotFoundException) {
//         Logger.Error(`Error on getting countries ${e}\n${e.stack}`);
//       }
//     }
//     return null;
//   }

//   async setUserStatus(status: number): Promise<UserLocalProfileResponse> {
//     const request: UserStatusRequest = new UserStatusRequest();
//     request.session = this._sessionHolder.sessionToken;
//     request.status = status;
//     try {
//       return await this._userApiService.setUserStatus(request);
//     } catch (e) {
//       if (e instanceof NoInternetException) {
//         // ignore
//       } else if (e instanceof ServerException) {
//         Logger.Error(`Error on saving user status ${e}\n${e.stack}`);
//       } else if (e instanceof ParseException) {
//         Logger.Error(`Error on saving user status ${e}\n${e.stack}`);
//       } else if (e instanceof SegmentableConfigNotFoundException) {
//         Logger.Error(`Error on saving user status ${e}\n${e.stack}`);
//       }
//     }
//     return null;
//   }
// }
