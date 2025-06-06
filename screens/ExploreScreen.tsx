import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { MainTabParamList } from "../types";

type ExploreScreenNavigationProp = BottomTabNavigationProp<
    MainTabParamList,
    "Explore"
>;

interface Props {
    navigation: ExploreScreenNavigationProp;
}

const ExploreScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explorer</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Ionicons
                        name="settings-outline"
                        size={24}
                        color={Colors.textPrimary}
                    />
                </TouchableOpacity>
            </View>

            {/* Content - En attente de la maquette Figma */}
            <View style={styles.content}>
                <View style={styles.placeholderContainer}>
                    <Ionicons
                        name="telescope-outline"
                        size={64}
                        color={Colors.textSecondary}
                    />
                    <Text style={styles.placeholderTitle}>Page Explorer</Text>
                    <Text style={styles.placeholderSubtitle}>
                        En attente de la maquette Figma pour développer cette
                        page
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.medium,
        paddingVertical: Spacing.large,
        backgroundColor: Colors.background,
    },
    headerTitle: {
        ...TextStyles.h1,
        color: Colors.textPrimary,
        fontSize: 28,
        fontWeight: "600",
    },
    settingsButton: {
        padding: Spacing.small,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Spacing.medium,
    },
    placeholderContainer: {
        alignItems: "center",
        maxWidth: 300,
    },
    placeholderTitle: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        marginTop: Spacing.medium,
        marginBottom: Spacing.small,
        textAlign: "center",
    },
    placeholderSubtitle: {
        ...TextStyles.body1,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },
});

export default ExploreScreen;
