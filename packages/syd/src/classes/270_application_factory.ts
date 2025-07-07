import { IConcreteResourceCache, IResourceCache } from './23_IResourceCache';
import { Platform } from './282_Platform';
import { TemplateApplication } from './287_TemplateApplication';

export type ApplicationFactory = (
  platform: Platform,
  resourceCache: IConcreteResourceCache
) => TemplateApplication;
