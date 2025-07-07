export interface EnvironmentOptions {
  mode?: BuildMode;
  port?: string | number;
  url?: string;
  server?: string;
  cheats?: string;
  WEBPACK_SERVE?: boolean;
}

export enum BuildMode {
  Dev = 'development',
  Local = 'local',
  Qa = 'qa',
  Prod = 'production',
}

export interface CopyFilesOption {
  from: string;
  to?: string;
}

export interface WebBuilderOptions extends EnvironmentOptions {
  mode: BuildMode;
  entryFile: string;
  entryCssFile: string;
  outputFolder: string;
  indexHTMLFile: string;
  copyFiles?: CopyFilesOption[];
  envVariable?: Record<string, string | number | boolean>;
  serviceWorker?: boolean;
}

export interface PackageBuilderOptions extends EnvironmentOptions {
  mode: BuildMode;
  entryFile: string;
  outputFolder: string;
  copyFiles?: { from: string; to?: string }[];
  envVariable?: Record<string, string>;
}
