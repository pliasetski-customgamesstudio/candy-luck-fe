import { UserSessionHolder } from '../local_user_session_holder';
import { DeviceAuthorizationResult } from './device_authorization_result';

export abstract class IAuthorizationService {
  // abstract authSemaphore: Semaphore;
  abstract authorizeLocal(
    authorizationKey: string,
    userInfo: UserSessionHolder,
    trackInstallation?: boolean
  ): Promise<DeviceAuthorizationResult>;
  abstract authorizeLocalByUser(
    authorizationKey: string,
    userInfo: UserSessionHolder,
    selectedUser: string
  ): Promise<DeviceAuthorizationResult>;
  abstract authorizeSocial(
    authorizationKey: string,
    socialInfo: UserSessionHolder,
    isRelogin?: boolean
  ): Promise<DeviceAuthorizationResult>;
  abstract authorizeSocialByUser(
    authorizationKey: string,
    socialInfo: UserSessionHolder,
    selectedUser: string
  ): Promise<DeviceAuthorizationResult>;
  abstract authorizeByKeyFull(
    authorizationKey: string,
    socialInfo: UserSessionHolder
  ): Promise<DeviceAuthorizationResult>;
  abstract authorizeByKey(authorizationKey: string): Promise<DeviceAuthorizationResult>;
  // abstract getSpecialClientConfigProperties(): Promise<ClientConfigResponse>;
  // abstract updateSocialAuthorization(request: UpdateSocialAuthorizationRequest): Promise<EmptyDto>;
  // abstract overrideAuthorizationFunction(
  //   authorizationFunc: Func1<AuthorizeRequest, Promise<DeviceAuthorizationResult>>
  // ): Disposable;
  // abstract authorizationFunc(request: AuthorizeRequest): Promise<DeviceAuthorizationResult>;
  // abstract lightWeightAuthorizationFunc(
  //   request: AuthorizeRequest
  // ): Promise<DeviceAuthorizationResult>;
}
