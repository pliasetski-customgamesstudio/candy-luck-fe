export class BuildMode {
  static get isDebug(): boolean {
    return !!DEBUG;
  }
}
