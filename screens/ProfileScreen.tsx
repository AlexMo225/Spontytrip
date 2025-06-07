import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { MainTabParamList, RootStackParamList } from "../types";

type ProfileScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, "Profile">,
    StackNavigationProp<RootStackParamList>
>;

interface Props {
    navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const handleEditProfile = () => {
        navigation.navigate("EditProfile");
    };

    const handleNotifications = () => {
        // Navigation vers paramètres notifications
        console.log("Notifications");
    };

    const handlePrivacy = () => {
        // Navigation vers paramètres confidentialité
        console.log("Confidentialité");
    };

    const handleSecurity = () => {
        // Navigation vers paramètres sécurité
        console.log("Sécurité");
    };

    const handleHelp = () => {
        // Navigation vers aide
        console.log("Aide");
    };

    const handleAbout = () => {
        // Navigation vers à propos
        console.log("À propos");
    };

    const handleLogout = () => {
        Alert.alert(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            [
                {
                    text: "Annuler",
                    style: "cancel",
                },
                {
                    text: "Déconnexion",
                    style: "destructive",
                    onPress: () => {
                        // Logique de déconnexion
                        navigation.navigate("Login");
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Section Profil Utilisateur */}
                <View style={styles.profileSection}>
                    <View style={styles.profileInfo}>
                        {/* Photo de profil */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons
                                    name="person"
                                    size={48}
                                    color={Colors.textSecondary}
                                />
                            </View>
                        </View>

                        {/* Nom et date d'inscription */}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>Sophia Carter</Text>
                            <Text style={styles.joinDate}>
                                Membre depuis 2022
                            </Text>
                        </View>
                    </View>

                    {/* Bouton Modifier le profil */}
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEditProfile}
                    >
                        <Text style={styles.editButtonText}>
                            Modifier le profil
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Section Compte */}
                <View style={styles.accountSection}>
                    <Text style={styles.sectionTitle}>Compte</Text>

                    {/* Options du compte */}
                    <View style={styles.optionsList}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleNotifications}
                        >
                            <Text style={styles.optionText}>Notifications</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textPrimary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handlePrivacy}
                        >
                            <Text style={styles.optionText}>
                                Confidentialité
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textPrimary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleSecurity}
                        >
                            <Text style={styles.optionText}>Sécurité</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textPrimary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleHelp}
                        >
                            <Text style={styles.optionText}>Aide</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textPrimary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleAbout}
                        >
                            <Text style={styles.optionText}>À propos</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textPrimary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bouton Déconnexion */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>Déconnexion</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        height: 72,
        justifyContent: "center",
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
        backgroundColor: Colors.background,
    },
    headerTitle: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        textAlign: "center",
    },
    content: {
        flex: 1,
    },
    profileSection: {
        alignItems: "center",
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl,
        marginTop: Spacing.xl,
    },
    profileInfo: {
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    avatarContainer: {
        marginBottom: Spacing.md,
    },
    avatarPlaceholder: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: Colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    userInfo: {
        alignItems: "center",
    },
    userName: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    joinDate: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
    },
    editButton: {
        backgroundColor: "rgba(126, 217, 87, 0.91)",
        paddingHorizontal: Spacing.lg,
        borderRadius: 12,
        minWidth: 200,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    editButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    accountSection: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    optionsList: {
        backgroundColor: Colors.background,
    },
    optionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: Spacing.md,
        paddingHorizontal: 0,
        minHeight: 56,
    },
    optionText: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        flex: 1,
    },
    logoutSection: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    logoutButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        alignItems: "center",
        height: 48,
        justifyContent: "center",
        paddingHorizontal: Spacing.lg,
    },
    logoutButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
    },
});

export default ProfileScreen;
