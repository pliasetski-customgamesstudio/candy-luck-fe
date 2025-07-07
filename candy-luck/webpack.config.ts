import path from 'path';
import { Configuration } from 'webpack';
import {
  BuildMode,
  CopyFilesOption,
  EnvironmentOptions,
  webConfigBuilder,
} from '@cgs/webpack-config-builder';
import { EnvironmentName } from '@cgs/shared';

export default async (env: EnvironmentOptions): Promise<Configuration> => {
  const mode = env.mode || BuildMode.Dev;
  const isProd = mode === BuildMode.Prod;
  const server = env.server || EnvironmentName.CGS;
  const enableCheats = env.cheats === 'true';

  const environmentConfig = await import(`./environments/${server}/environment.${mode}.ts`).then(
    (module) => module.environment
  );

  return webConfigBuilder({
    ...env,
    mode,
    serviceWorker: true,
    entryFile: path.resolve(__dirname, 'src', `index.ts`),
    entryCssFile: path.resolve(__dirname, 'styles', 'main.css'),
    outputFolder: path.resolve(__dirname, 'dist'),
    indexHTMLFile: path.resolve(__dirname, 'public', 'index.html'),
    copyFiles: [
      { from: 'assets', to: 'assets' },
      { from: 'configs', to: 'configs' },
      { from: 'scripts', to: 'scripts' },
      { from: path.resolve('public', 'manifest.json') },
      { from: path.resolve('public', 'icons'), to: 'icons' },
      !isProd
        ? {
            from: path.resolve('public', `aggregator.html`),
            to: path.resolve('dist', 'aggregator.html'),
          }
        : null,
      !isProd ? { from: path.resolve('public', 'launcher.html') } : null,
      !isProd ? { from: path.resolve('public', 'test-sdk.html') } : null,
    ].filter((file): file is CopyFilesOption => !!file),
    envVariable: {
      DEBUG: enableCheats || !isProd,
      ENVIRONMENT_CONFIG: JSON.stringify(environmentConfig),
    },
  });
};
