import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import { useAuth } from "../contexts/AuthContext";
import { useModal, useQuickModals } from "../hooks/useModal";
import { useProfileScreenStyle } from "../hooks/useProfileScreenStyle";
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
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user, signOut } = useAuth();
    const insets = useSafeAreaInsets();
    const styles = useProfileScreenStyle();

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
        modal.showConfirm(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            async () => {
                // Action quand l'utilisateur confirme (Oui)
                try {
                    await signOut();
                    // La navigation sera gérée automatiquement par AuthNavigator
                } catch (error) {
                    modal.showError("Erreur", "Impossible de se déconnecter");
                }
            },
            () => {
                // Action quand l'utilisateur annule (optionnel)
                console.log("Déconnexion annulée");
            },
            "Oui, me déconnecter", // Texte du bouton de confirmation
            "Annuler" // Texte du bouton d'annulation
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

export default ProfileScreen;
