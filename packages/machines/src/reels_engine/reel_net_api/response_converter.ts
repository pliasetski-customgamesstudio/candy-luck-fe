export abstract class ResponseConverter<Tin, Tout> {
  abstract ConvertObject(object: Tin): Tout;
}
