import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useModal, useQuickModals } from "../hooks/useModal";
import { useJoinTrip } from "../hooks/useTripSync";
import { useJoinTripStyles } from "../styles/screens";
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
    const styles = useJoinTripStyles();
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user } = useAuth();
    const { joinTrip, loading, error } = useJoinTrip();
    const [inviteCode, setInviteCode] = useState("");

    const handleJoinTrip = async () => {
        if (!inviteCode.trim()) {
            modal.showError("Erreur", "Veuillez saisir un code d'invitation");
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

                modal.showConfirm(
                    "Succès !",
                    `Vous avez rejoint le voyage "${trip.title}"`,
                    () => {
                        navigation.navigate("TripDetails", {
                            tripId: trip.id,
                        });
                    },
                    () => {
                        navigation.goBack();
                    },
                    "Voir le voyage",
                    "Retour à l'accueil"
                );
            }
        } catch (err) {
            console.error("Erreur rejoindre voyage:", err);
            modal.showError(
                "Erreur",
                error ||
                    "Impossible de rejoindre le voyage. Vérifiez le code d'invitation."
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
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
                            color={Colors.primary}
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
                        placeholderTextColor={Colors.textSecondary}
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
                            color={Colors.error}
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
                            <ActivityIndicator
                                size="small"
                                color={Colors.white}
                            />
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

export default JoinTripScreen;
