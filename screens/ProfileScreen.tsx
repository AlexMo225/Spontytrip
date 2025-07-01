import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo } from "react";
import {
    Animated,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../components/Avatar";
import { Colors } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../hooks/useModal";
import { useProfileStyles } from "../styles/screens/profileStyles";
import { RootStackParamList } from "../types";

type ProfileScreenProps = {
    navigation: StackNavigationProp<RootStackParamList>;
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const modal = useModal();
    const { user, signOut } = useAuth();
    const insets = useSafeAreaInsets();
    const styles = useProfileStyles();

    // Animation pour le dégradé
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animate();
        return () => {
            animatedValue.stopAnimation();
        };
    }, []);

    const animatedColor = useMemo(() => {
        return animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ["#7ED957", "#4DA1A9", "#7ED957"],
        });
    }, [animatedValue]);

    const handleEditProfile = () => {
        navigation.navigate("EditProfile");
    };

    const handleNotifications = () => {
        navigation.navigate("Notifications");
    };

    const handlePrivacy = () => {
        navigation.navigate("Privacy");
    };

    const handleSecurity = () => {
        navigation.navigate("Preferences");
    };

    const handleHelp = () => {
        navigation.navigate("Help");
    };

    const handleAbout = () => {
        navigation.navigate("About");
    };

    const handleLogout = async () => {
        modal.showConfirm(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            async () => {
                try {
                    await signOut();
                } catch (error) {
                    console.error("Erreur lors de la déconnexion:", error);
                    modal.showError(
                        "Erreur",
                        "Une erreur est survenue lors de la déconnexion. Veuillez réessayer."
                    );
                }
            },
            () => {},
            "Se déconnecter",
            "Annuler"
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top },
                ]}
            >
                {/* Section Profil Utilisateur */}
                <View style={styles.profileSection}>
                    <LinearGradient
                        colors={["#7ED957", "#4DA1A9"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.gradientBackground}
                    >
                        <Animated.View
                            style={[
                                styles.contentContainer,
                                {
                                    opacity: animatedValue.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0.8, 1, 0.8],
                                    }),
                                },
                            ]}
                        >
                            <View style={styles.avatarContainer}>
                                <Avatar
                                    imageUrl={user?.photoURL || undefined}
                                    size={80}
                                    showBorder={true}
                                />
                            </View>
                            <Text style={styles.userName}>
                                {user?.displayName || "Utilisateur"}
                            </Text>
                            <Text style={styles.userEmail}>
                                {user?.email || "email@example.com"}
                            </Text>
                            {user?.createdAt && (
                                <View style={styles.joinDateBadge}>
                                    <Ionicons
                                        name="calendar"
                                        size={12}
                                        color="#7ED957"
                                    />
                                    <Text style={styles.joinDate}>
                                        Membre depuis{" "}
                                        {formatDate(user.createdAt)}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={handleEditProfile}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name="pencil"
                                    size={16}
                                    color="#7ED957"
                                />
                                <Text style={styles.editButtonText}>
                                    Modifier le profil
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </LinearGradient>
                </View>

                {/* Section Paramètres */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Paramètres</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleNotifications}
                    >
                        <View style={styles.settingLeft}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    {
                                        backgroundColor:
                                            "rgba(126, 217, 87, 0.1)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="notifications"
                                    size={22}
                                    color="#7ED957"
                                />
                            </View>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>
                                    Notifications
                                </Text>
                                <Text style={styles.settingDescription}>
                                    Alertes de voyage et activités
                                </Text>
                            </View>
                        </View>
                        <View style={styles.settingRight}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>3</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.text.secondary}
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handlePrivacy}
                    >
                        <View style={styles.settingLeft}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    {
                                        backgroundColor:
                                            "rgba(77, 161, 169, 0.1)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="lock-closed"
                                    size={22}
                                    color="#4DA1A9"
                                />
                            </View>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>
                                    Confidentialité
                                </Text>
                                <Text style={styles.settingDescription}>
                                    Visibilité et partage
                                </Text>
                            </View>
                        </View>
                        <View style={styles.settingRight}>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.text.secondary}
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleSecurity}
                    >
                        <View style={styles.settingLeft}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    {
                                        backgroundColor:
                                            "rgba(245, 158, 11, 0.1)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="compass"
                                    size={22}
                                    color="#F59E0B"
                                />
                            </View>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>
                                    Préférences
                                </Text>
                                <Text style={styles.settingDescription}>
                                    Style de voyage
                                </Text>
                            </View>
                        </View>
                        <View style={styles.settingRight}>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.text.secondary}
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleHelp}
                    >
                        <View style={styles.settingLeft}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    {
                                        backgroundColor:
                                            "rgba(99, 102, 241, 0.1)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="help-circle"
                                    size={22}
                                    color="#6366F1"
                                />
                            </View>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>
                                    Centre d'aide
                                </Text>
                                <Text style={styles.settingDescription}>
                                    Guides et support
                                </Text>
                            </View>
                        </View>
                        <View style={styles.settingRight}>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.text.secondary}
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleAbout}
                    >
                        <View style={styles.settingLeft}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    {
                                        backgroundColor:
                                            "rgba(139, 92, 246, 0.1)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="information-circle"
                                    size={22}
                                    color="#8B5CF6"
                                />
                            </View>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>
                                    À propos
                                </Text>
                                <Text style={styles.settingDescription}>
                                    v2.1.0
                                </Text>
                            </View>
                        </View>
                        <View style={styles.settingRight}>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.text.secondary}
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Bouton Déconnexion */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;
