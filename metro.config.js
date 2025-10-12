const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  '@': path.resolve(__dirname),
  '~': path.resolve(__dirname, 'src'),
};

module.exports = withNativeWind(config, { input: './global.css' });
