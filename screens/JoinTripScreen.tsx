import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { useAuth } from "../contexts/AuthContext";
import { useJoinTrip } from "../hooks/useTripSync";
import { RootStackParamList } from "../types";

// Import de l'emitter pour déclencher le refresh
import { tripRefreshEmitter } from "../hooks/useTripSync";

type JoinTripScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "JoinTrip"
>;

interface Props {
    navigation: JoinTripScreenNavigationProp;
}

const JoinTripScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const { joinTrip, loading, error } = useJoinTrip();
    const [inviteCode, setInviteCode] = useState("");

    const handleJoinTrip = async () => {
        if (!inviteCode.trim()) {
            Alert.alert("Erreur", "Veuillez saisir un code d'invitation");
            return;
        }

        try {
            const trip = await joinTrip(inviteCode.trim().toUpperCase(), () => {
                // Déclencher le refresh global des voyages
                console.log(
                    "🎉 Voyage rejoint avec succès, refresh global déclenché"
                );
                tripRefreshEmitter.emitRefresh();
            });

            if (trip && user) {
                // Logger l'activité de rejoindre le voyage
                try {
                    const firebaseService = (
                        await import("../services/firebaseService")
                    ).default;
                    await firebaseService.logActivity(
                        trip.id,
                        user.uid,
                        user.displayName || user.email || "Utilisateur",
                        "trip_join"
                    );
                } catch (logError) {
                    console.error("Erreur logging join trip:", logError);
                }

                Alert.alert(
                    "Succès !",
                    `Vous avez rejoint le voyage "${trip.title}"`,
                    [
                        {
                            text: "Voir le voyage",
                            onPress: () => {
                                navigation.navigate("TripDetails", {
                                    tripId: trip.id,
                                });
                            },
                        },
                        {
                            text: "Retour à l'accueil",
                            style: "cancel",
                            onPress: () => {
                                navigation.goBack();
                            },
                        },
                    ]
                );
            }
        } catch (err) {
            console.error("Erreur rejoindre voyage:", err);
            Alert.alert(
                "Erreur",
                error ||
                    "Impossible de rejoindre le voyage. Vérifiez le code d'invitation."
            );
        }
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rejoindre un voyage</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.instructionSection}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="enter-outline"
                            size={48}
                            color="#7ED957"
                        />
                    </View>
                    <Text style={styles.instructionTitle}>
                        Rejoignez un voyage existant
                    </Text>
                    <Text style={styles.instructionText}>
                        Saisissez le code d'invitation que vous avez reçu de
                        votre ami pour rejoindre son voyage.
                    </Text>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Code d'invitation</Text>
                    <TextInput
                        style={styles.codeInput}
                        placeholder="Ex: ABC123"
                        placeholderTextColor="#999"
                        value={inviteCode}
                        onChangeText={setInviteCode}
                        autoCapitalize="characters"
                        maxLength={6}
                        autoFocus={true}
                    />
                    <Text style={styles.inputHint}>
                        Le code fait généralement 6 caractères
                    </Text>
                </View>

                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons
                            name="alert-circle"
                            size={20}
                            color="#FF6B6B"
                        />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.joinButton,
                        (!inviteCode.trim() || loading) &&
                            styles.joinButtonDisabled,
                    ]}
                    onPress={handleJoinTrip}
                    disabled={!inviteCode.trim() || loading}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.joinButtonText}>
                                Connexion...
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.joinButtonText}>
                            Rejoindre le voyage
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={styles.alternativeSection}>
                    <Text style={styles.alternativeText}>
                        Vous n'avez pas de code d'invitation ?
                    </Text>
                    <TouchableOpacity
                        style={styles.createTripButton}
                        onPress={() => navigation.navigate("CreateTrip")}
                    >
                        <Text style={styles.createTripButtonText}>
                            Créer votre propre voyage
                        </Text>
                    </TouchableOpacity>
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
        alignItems: "center",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        flex: 1,
        textAlign: "center",
        fontWeight: "600",
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    instructionSection: {
        alignItems: "center",
        marginBottom: Spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#F0F8F0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    instructionTitle: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        textAlign: "center",
        marginBottom: Spacing.sm,
        fontWeight: "600",
    },
    instructionText: {
        ...TextStyles.body1,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },
    inputSection: {
        marginBottom: Spacing.xl,
    },
    inputLabel: {
        ...TextStyles.h4,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
        fontWeight: "600",
    },
    codeInput: {
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        letterSpacing: 2,
        backgroundColor: Colors.white,
        color: Colors.textPrimary,
    },
    inputHint: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textAlign: "center",
        marginTop: Spacing.sm,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
        marginBottom: Spacing.lg,
    },
    errorText: {
        ...TextStyles.body2,
        color: "#FF6B6B",
        marginLeft: Spacing.sm,
        flex: 1,
    },
    joinButton: {
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: Spacing.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.xl,
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    joinButtonDisabled: {
        backgroundColor: "#E5E5E5",
        shadowOpacity: 0,
        elevation: 0,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    joinButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: "600",
        marginLeft: Spacing.sm,
    },
    alternativeSection: {
        alignItems: "center",
    },
    alternativeText: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    createTripButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    createTripButtonText: {
        ...TextStyles.body1,
        color: "#7ED957",
        fontWeight: "600",
    },
});

export default JoinTripScreen;
