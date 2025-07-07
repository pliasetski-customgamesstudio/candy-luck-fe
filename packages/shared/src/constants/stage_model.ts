import { INamedModel } from './i_named_model';

// TODO: уточнить надо ли нам этo @networkReflector
export class StageModel implements INamedModel {
  static withValues(
    Name: string,
    StageAddress: string,
    FacebookAppId: string,
    FacebookAppNamespace: string
  ) {
    const stageModel = new StageModel();
    stageModel.Name = Name;
    stageModel.StageAddress = StageAddress;
    stageModel.FacebookAppId = FacebookAppId;
    stageModel.FacebookAppNamespace = FacebookAppNamespace;
  }

  Name: string;
  StageAddress: string;
  FacebookAppId: string;
  FacebookAppNamespace: string;

  // TODO: уточнить надо ли нам этo @GenericInfo(String, String)
  ClientProperties: Record<string, string> = {};
}
