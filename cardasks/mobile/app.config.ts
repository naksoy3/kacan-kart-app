import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const plugins = [...(config.plugins ?? [])];

  if (googleMapsApiKey) {
    plugins.push(["react-native-maps", { androidGoogleMapsApiKey: googleMapsApiKey }]);
  }

  return {
    ...config,
    name: config.name || "Cardasks",
    slug: config.slug || "cardasks",
    plugins,
  };
};