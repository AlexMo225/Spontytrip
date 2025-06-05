import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Layout } from "../constants/Spacing";
import { MainTabParamList } from "../types";

type DiscoverScreenNavigationProp = BottomTabNavigationProp<
    MainTabParamList,
    "Discover"
>;

interface Props {
    navigation: DiscoverScreenNavigationProp;
}

const DiscoverScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>DiscoverScreen</Text>
            <Text style={styles.subtitle}>En attente de la maquette Figma</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...Layout.container,
        ...Layout.centerContent,
        backgroundColor: Colors.background,
    },
    title: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        ...TextStyles.body1,
        color: Colors.textSecondary,
    },
});

export default DiscoverScreen;
