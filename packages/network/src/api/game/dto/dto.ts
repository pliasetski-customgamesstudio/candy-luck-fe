// import { networkReflector, GenericInfo, IBaseRequest } from 'network';
// import { RoomDTO } from './RoomDTO';
//
// @networkReflector
// class BaseUriConfigResponse {
//   hash: string;
//   notFound: boolean;
//   uri: string;
// }
//
// @networkReflector
// class GameConfigDTO {
//   appVersion: string;
//   baseIconURI: string;
//   baseURI: string;
//   group: number;
//   platform: string;
//   @GenericInfo(RoomDTO)
//   rooms: RoomDTO[];
// }
//
// @networkReflector
// class GameConfigRequest implements IBaseRequest {
//   resolution: string;
//   session: string;
//   userId: number;
//   timeZoneId: string;
// }
//
// @networkReflector
// class GameLobbyConfigRequest implements IBaseRequest {
//   resolution: string;
//   session: string;
//   userId: number;
//   timeZoneId: string;
// }
//
// @networkReflector
// class KeyValuePair {
//   key: string;
//   timestamp: number;
//   value: string;
// }
//
// @networkReflector
// class Machine {
//   action: string;
//   @GenericInfo(KeyValueActionParam_String)
//   actionParams: KeyValueActionParam_String[];
//   assetsLocation: string;
//   assetsVersion: string;
//   availableFromLevel: number;
//   clientVersion: number;
//   iconLocation: string;
//   id: string;
//   imageUrl: string;
//   itemType: string;
//   @GenericInfo(string)
//   labels: string[];
//   position: number;
//   room: RoomDTO;
//   sceneName: string;
//   sceneUrl: string;
//   sizeType: string;
//   specialIconLocation: string;
//   title: string;
// }
//
// @networkReflector
// class RoomDTO {
//   availableFromLevel: number;
//   @GenericInfo(Machine)
//   favoriteGames: Machine[];
//   @GenericInfo(Machine)
//   games: Machine[];
//   id: number;
//   @GenericInfo(string)
//   labels: string[];
//   title: string;
// }
//
// @networkReflector
// class UserGameConfigRequest implements IBaseRequest {
//   dataBelongs: string;
//   session: string;
//   userId: number;
//   @GenericInfo(KeyValuePair)
//   structuredData: KeyValuePair[];
//   @GenericInfo(string)
//   structuredDataKeys: string[];
//   unstructuredData: string;
// }
//
// @networkReflector
// class UserGameConfigResponse {
//   @GenericInfo(KeyValuePair)
//   structuredData: KeyValuePair[];
//   unstructuredData: string;
// }
