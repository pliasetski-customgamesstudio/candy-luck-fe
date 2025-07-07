import { Configuration, DefinePlugin } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { BuildMode, WebBuilderOptions } from './configBuilder.types';
import { Logger } from './logger';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { GenerateSW } from 'workbox-webpack-plugin';

export function webConfigBuilder(options: WebBuilderOptions): Configuration {
  const isServe = options.WEBPACK_SERVE;
  const isProd = options.mode === BuildMode.Prod;
  const port = options?.port || 8080;

  Logger.info('Build mode:', options.mode);
  Logger.info('Env variables:', options.envVariable || null);

  return {
    mode: !isProd ? 'development' : 'production',
    entry: options.entryFile,
    devtool: !isProd ? 'inline-source-map' : undefined,
    output: {
      path: options.outputFolder,
      filename: '[name].[contenthash].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(xml)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]',
          },
        },
        {
          test: /\.(zip)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]',
          },
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: options.indexHTMLFile,
      }),
      new MiniCssExtractPlugin({
        filename: 'styles.css',
      }),
      options.envVariable ? new DefinePlugin(options.envVariable) : null,
      options.copyFiles ? new CopyWebpackPlugin({ patterns: options.copyFiles }) : null,
      options.serviceWorker && !isServe
        ? new GenerateSW({
            exclude: ['index.html', 'manifest.json'],
            clientsClaim: true,
            skipWaiting: true,
            disableDevLogs: isProd,
            mode: isProd ? 'production' : 'development',
          })
        : null,
    ].filter(Boolean),
    performance: isProd
      ? {
          hints: false,
          maxEntrypointSize: 1024000,
          maxAssetSize: 1024000,
        }
      : false,
    devServer: isServe
      ? ({
          static: options.outputFolder,
          port,
          open: `http://localhost:${port}${options.url ? '/' + options.url : ''}`,
        } as DevServerConfiguration)
      : undefined,
  };
}
