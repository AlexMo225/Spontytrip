import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import { Spacing } from "../constants/Spacing";
import { useAuth } from "../contexts/AuthContext";
import { MainTabParamList, RootStackParamList } from "../types";

const { width: screenWidth } = Dimensions.get("window");

type ProfileScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, "Profile">,
    StackNavigationProp<RootStackParamList>
>;

interface Props {
    navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, signOut } = useAuth();
    const insets = useSafeAreaInsets();

    // Debug : Afficher les données utilisateur
    console.log("🔍 Données utilisateur dans ProfileScreen:", {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
    });

    // Détecter les changements de données utilisateur
    useEffect(() => {
        console.log("🔄 ProfileScreen - Données utilisateur mises à jour:", {
            displayName: user?.displayName,
            email: user?.email,
            photoURL: user?.photoURL,
        });
    }, [user?.displayName, user?.email, user?.photoURL]);

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
                    text: "Se déconnecter",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            // La navigation sera gérée automatiquement par AuthNavigator
                        } catch (error) {
                            Alert.alert(
                                "Erreur",
                                "Impossible de se déconnecter"
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header avec dégradé */}
            <LinearGradient
                colors={["#7ED957", "#4DA1A9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <Text style={styles.headerTitle}>Profil</Text>
                <View style={styles.headerDecoration}>
                    <View style={styles.floatingElement} />
                    <View
                        style={[
                            styles.floatingElement,
                            styles.floatingElement2,
                        ]}
                    />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Section Profil Utilisateur avec carte moderne */}
                <View style={styles.profileCard}>
                    <View style={styles.profileInfo}>
                        {/* Photo de profil avec effet premium */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarGlow}>
                                <Avatar
                                    imageUrl={user?.photoURL}
                                    size={100}
                                    showBorder={true}
                                />
                            </View>
                        </View>

                        {/* Nom, email et date d'inscription */}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {user?.displayName || "Utilisateur"}
                            </Text>
                            <Text style={styles.userEmail}>
                                {user?.email || "email@example.com"}
                            </Text>
                            <View style={styles.joinDateBadge}>
                                <Ionicons
                                    name="calendar"
                                    size={12}
                                    color="#7ED957"
                                />
                                <Text style={styles.joinDate}>
                                    Membre depuis{" "}
                                    {new Date().toLocaleDateString("fr-FR", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Bouton Modifier le profil avec dégradé */}
                    <TouchableOpacity
                        style={styles.editButtonContainer}
                        onPress={handleEditProfile}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#7ED957", "#4DA1A9"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.editButton}
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
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Section Paramètres avec cartes modernes */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Paramètres</Text>

                    <View style={styles.settingsCard}>
                        {/* Options des paramètres */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleNotifications}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(126, 217, 87, 0.15)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="notifications"
                                        size={20}
                                        color="#7ED957"
                                    />
                                </View>
                                <Text style={styles.optionText}>
                                    Notifications
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#7ED957"
                            />
                        </TouchableOpacity>

                        <View style={styles.optionSeparator} />

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handlePrivacy}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(77, 161, 169, 0.15)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="shield-checkmark"
                                        size={20}
                                        color="#4DA1A9"
                                    />
                                </View>
                                <Text style={styles.optionText}>
                                    Confidentialité
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#4DA1A9"
                            />
                        </TouchableOpacity>

                        <View style={styles.optionSeparator} />

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleSecurity}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(255, 107, 107, 0.15)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="lock-closed"
                                        size={20}
                                        color="#FF6B6B"
                                    />
                                </View>
                                <Text style={styles.optionText}>Sécurité</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#FF6B6B"
                            />
                        </TouchableOpacity>

                        <View style={styles.optionSeparator} />

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleHelp}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(255, 217, 61, 0.15)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="help-circle"
                                        size={20}
                                        color="#FFD93D"
                                    />
                                </View>
                                <Text style={styles.optionText}>Aide</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#FFD93D"
                            />
                        </TouchableOpacity>

                        <View style={styles.optionSeparator} />

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleAbout}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLeft}>
                                <View
                                    style={[
                                        styles.optionIcon,
                                        {
                                            backgroundColor:
                                                "rgba(126, 217, 87, 0.15)",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="information-circle"
                                        size={20}
                                        color="#7ED957"
                                    />
                                </View>
                                <Text style={styles.optionText}>À propos</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#7ED957"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section Déconnexion */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButtonContainer}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#FF6B6B", "#E74C3C"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.logoutButton}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={20}
                                color="#FFFFFF"
                            />
                            <Text style={styles.logoutButtonText}>
                                Se déconnecter
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        paddingHorizontal: Spacing.md,
        paddingBottom: 20,
        position: "relative",
        overflow: "hidden",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: 10,
    },
    headerDecoration: {
        position: "absolute",
        top: 0,
        right: 0,
        opacity: 0.3,
    },
    floatingElement: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.2)",
        position: "absolute",
        top: -20,
        right: -20,
    },
    floatingElement2: {
        width: 40,
        height: 40,
        borderRadius: 20,
        top: 40,
        right: 30,
    },
    content: {
        flex: 1,
        marginTop: -10,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    profileInfo: {
        alignItems: "center",
        marginBottom: 20,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatarGlow: {
        padding: 4,
        borderRadius: 60,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    userInfo: {
        alignItems: "center",
    },
    userName: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    joinDateBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    joinDate: {
        fontSize: 12,
        color: "#7ED957",
        fontWeight: "600",
    },
    editButtonContainer: {
        borderRadius: 25,
        overflow: "hidden",
    },
    editButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    editIcon: {},
    editButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    settingsSection: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 12,
    },
    settingsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    optionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
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
        marginRight: 12,
    },
    optionText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1A1A1A",
        flex: 1,
    },
    optionSeparator: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginLeft: 68,
        marginRight: 16,
    },
    logoutSection: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    logoutButtonContainer: {
        borderRadius: 16,
        overflow: "hidden",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 8,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    bottomSpacing: {
        height: 20,
    },
});

export default ProfileScreen;
