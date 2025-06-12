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
            "Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.",
            [
                {
                    text: "Annuler",
                    style: "cancel",
                },
                {
                    text: "Se déconnecter",
                    style: "destructive",
                    onPress: () => {
                        // TODO: Effacer les données utilisateur/token stockés
                        // await AsyncStorage.removeItem('userToken');
                        // await AsyncStorage.removeItem('userData');

                        // Navigation vers l'écran de connexion
                        navigation.getParent()?.reset({
                            index: 0,
                            routes: [{ name: "Login" }],
                        });
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

                        {/* Nom, email et date d'inscription */}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>Sophia Carter</Text>
                            <Text style={styles.userEmail}>
                                sophia.carter@email.com
                            </Text>
                            <Text style={styles.joinDate}>
                                Membre depuis juin 2022
                            </Text>
                        </View>
                    </View>

                    {/* Bouton Modifier le profil */}
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEditProfile}
                    >
                        <Ionicons
                            name="pencil"
                            size={16}
                            color="#FFFFFF"
                            style={styles.editIcon}
                        />
                        <Text style={styles.editButtonText}>
                            Modifier le profil
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Section Statistiques */}
                <View style={styles.statsSection}>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>12</Text>
                            <Text style={styles.statLabel}>Voyages</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>47</Text>
                            <Text style={styles.statLabel}>Destinations</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>156</Text>
                            <Text style={styles.statLabel}>Souvenirs</Text>
                        </View>
                    </View>
                </View>

                {/* Section Paramètres */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Paramètres</Text>

                    {/* Options des paramètres */}
                    <View style={styles.optionsList}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleNotifications}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(126, 217, 87, 0.1)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="notifications"
                                        size={20}
                                        color="rgba(126, 217, 87, 0.91)"
                                    />
                                </View>
                                <Text style={styles.optionText}>
                                    Notifications
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textSecondary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handlePrivacy}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(126, 217, 87, 0.1)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="shield-checkmark"
                                        size={20}
                                        color="rgba(126, 217, 87, 0.91)"
                                    />
                                </View>
                                <Text style={styles.optionText}>
                                    Confidentialité
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textSecondary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleSecurity}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(126, 217, 87, 0.1)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="lock-closed"
                                        size={20}
                                        color="rgba(126, 217, 87, 0.91)"
                                    />
                                </View>
                                <Text style={styles.optionText}>Sécurité</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textSecondary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleHelp}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(126, 217, 87, 0.1)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="help-circle"
                                        size={20}
                                        color="rgba(126, 217, 87, 0.91)"
                                    />
                                </View>
                                <Text style={styles.optionText}>Aide</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textSecondary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleAbout}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(126, 217, 87, 0.1)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="information-circle"
                                        size={20}
                                        color="rgba(126, 217, 87, 0.91)"
                                    />
                                </View>
                                <Text style={styles.optionText}>À propos</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section Déconnexion */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <View style={styles.logoutButtonContent}>
                            <Ionicons
                                name="log-out-outline"
                                size={20}
                                color="#FFFFFF"
                                style={styles.logoutIcon}
                            />
                            <Text style={styles.logoutButtonText}>
                                Se déconnecter
                            </Text>
                        </View>
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
        paddingBottom: Spacing.lg,
        marginTop: Spacing.lg,
    },
    profileInfo: {
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    avatarContainer: {
        marginBottom: Spacing.md,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
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
        fontSize: 24,
        fontWeight: "600",
    },
    userEmail: {
        ...TextStyles.body1,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontSize: 16,
    },
    joinDate: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        fontSize: 14,
    },
    editButton: {
        backgroundColor: "rgba(126, 217, 87, 0.91)",
        paddingHorizontal: Spacing.lg,
        borderRadius: 25,
        minWidth: 180,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    editIcon: {
        marginRight: 8,
    },
    editButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
    statsSection: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        padding: Spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: "center",
        paddingVertical: Spacing.sm,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "700",
        color: "#4DA1A9",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: "500",
    },
    settingsSection: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        fontSize: 20,
        fontWeight: "600",
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
        minHeight: 64,
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: Spacing.md,
    },
    optionText: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
    },
    logoutSection: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    logoutButton: {
        backgroundColor: "#E74C3C",
        borderRadius: 12,
        alignItems: "center",
        height: 48,
        justifyContent: "center",
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.md,
    },
    logoutButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    logoutIcon: {
        marginRight: 8,
    },
    logoutButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default ProfileScreen;
