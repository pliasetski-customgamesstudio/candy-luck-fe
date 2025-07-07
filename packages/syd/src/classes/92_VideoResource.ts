import { DisposableResource } from './107_DisposableResource';
import { VideoData } from './108_VideoData';

export class VideoResource extends DisposableResource<VideoData> {
  static TypeId: string = 'video';

  constructor(id: string) {
    super(id);
  }

  get typeId(): string {
    return VideoResource.TypeId;
  }
}
