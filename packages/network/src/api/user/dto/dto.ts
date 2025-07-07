// import { networkReflector, GenericInfo, IBaseRequest } from 'network/network';
// import { shared } from 'shared/shared';
//
// @networkReflector
// class CountryDTO {
//
//   code: string;
//
//   country: string;
//
//   id: number;
//
// }
//
// @networkReflector
// class CountryResponse {
//
//   @GenericInfo(CountryDTO)
//   countries: CountryDTO[];
//
// }
//
// @networkReflector
// class DetailedUserInfoDTO {
//
//   currentLevelConfig: LevelConfigDTO;
//
//   nextLevelConfig: LevelConfigDTO;
//
//   user: UserDTO;
//
// }
//
// @networkReflector
// class InvitedUsersRequest implements IBaseRequest {
//
//   session: string;
//   userId: number;
//
//   @GenericInfo(String)
//   socialIds: string[];
//
// }
//
// @networkReflector
// class SurveyAnswerRequest implements IBaseRequest {
//
//   answer: string;
//
//   questionKey: string;
//
//   session: string;
//   userId: number;
//
//   surveyKey: string;
//
//   uuid: string;
//
// }
//
// @networkReflector
// class SurveyQuestionDto {
//
//   @GenericInfo(MapEntryStringValueDTO)
//   params: MapEntryStringValueDTO[];
//
//   questionKey: string;
//
//   surveyKey: string;
//
//   text: string;
//
//   title: string;
//
//   type: string;
//
//   uuid: string;
//
// }
//
// @networkReflector
// class SurveyRequest implements IBaseRequest {
//
//   session: string;
//   userId: number;
//
//   surveyKey: string;
//
// }
//
// @networkReflector
// class TopPlayersRequest implements IBaseRequest {
//
//   kind: string;
//
//   session: string;
//   userId: number;
//
// }
//
// @networkReflector
// class UserDTOCollection {
//
//   @GenericInfo(UserDTO)
//   items: UserDTO[];
//
// }
//
// @networkReflector
// class UserLocalMediaDTO {
//
//   id: number;
//
//   location: string;
//
//   mediaId: string;
//
//   name: string;
//
//   vip: boolean;
//
// }
//
// @networkReflector
// class UserLocalMediaResponse {
//
//   @GenericInfo(UserLocalMediaDTO)
//   media: UserLocalMediaDTO[];
//
// }
//
// @networkReflector
// class UserLocalProfileRequest implements IBaseRequest {
//
//   avatarId: number;
//
//   birthDate: string;
//
//   celebrateWithFriends: boolean;
//
//   country: number;
//
//   denyChangeName: boolean;
//
//   email: string;
//
//   fullName: string;
//
//   gender: string;
//
//   session: string;
//   userId: number;
//
//   status: number;
//
// }
//
// @networkReflector
// class UserLocalProfileResponse {
//
//   allowedCelebrateWithFriends: boolean;
//
//   avatarId: number;
//
//   biggestContestId: number;
//
//   biggestContestWin: number;
//
//   biggestHighRollerContestId: number;
//
//   biggestHighRollerContestWin: number;
//
//   biggestJackpotType: string;
//
//   biggestJackpotWin: number;
//
//   biggestJackpotWinMachineId: number;
//
//   biggestWin: number;
//
//   biggestWinMachineId: number;
//
//   birthDate: string;
//
//   celebrateWithFriends: boolean;
//
//   country: number;
//
//   denyChangeName: boolean;
//
//   displayName: string;
//
//   email: string;
//
//   favoriteGames: string;
//
//   friendsRewardSended: boolean;
//
//   fullName: string;
//
//   gender: string;
//
//   hasEditableUserName: boolean;
//
//   hasEditableUserProfile: boolean;
//
//   hostedBy: string;
//
//   lastPlayedMachineId: number;
//
//   status: number;
//
//   userCountryAutodetect: string;
//
// }
//
// @networkReflector
// class UserLocalStatusDTO {
//
//   id: number;
//
//   status: string;
//
// }
//
// @networkReflector
// class UserLocalStatusResponse {
//
//   @GenericInfo(UserLocalStatusDTO)
//   statuses: UserLocalStatusDTO[];
//
// }
//
// @networkReflector
// class UserStatusRequest implements IBaseRequest {
//
//   session: string;
//   userId: number;
//
//   status: number;
//
// }
