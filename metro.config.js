const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-svg 15.x ships TypeScript source in its "react-native" field,
// which Metro cannot compile from node_modules. Override to use the "main"
// field (compiled CommonJS) instead, only for this package.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-svg') {
    return context.resolveRequest(
      { ...context, mainFields: ['main', 'browser'] },
      moduleName,
      platform
    );
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
