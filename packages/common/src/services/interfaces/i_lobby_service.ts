import { SimpleDetailedUserInfoDTO } from '@cgs/network';

export abstract class ILobbyService {
  abstract getUserInfo(): Promise<SimpleDetailedUserInfoDTO>;
  // surveyStartRating(): Promise<SurveyQuestionDto>;
  // surveyAnswer(request: SurveyAnswerRequest): Promise<SurveyQuestionDto>;
  // getStructuredUserGameConfig(request: UserGameConfigRequest): Promise<UserGameConfigResponse>;
  // saveStructuredUserGameConfig(request: UserGameConfigRequest): Promise<void>;
}
