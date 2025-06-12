const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Résolution des imports AsyncStorage pour Firebase
config.resolver.alias = {
    ...config.resolver.alias,
    "@react-native-community/async-storage":
        "@react-native-async-storage/async-storage",
};

// Redirection des imports React Native AsyncStorage vers le nouveau package
config.resolver.resolverMainFields = ["react-native", "browser", "main"];
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;
