import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { RootStackParamList } from "../types";

type JoinTripScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "JoinTrip"
>;
type JoinTripScreenRouteProp = RouteProp<RootStackParamList, "JoinTrip">;

interface Props {
    navigation: JoinTripScreenNavigationProp;
    route: JoinTripScreenRouteProp;
}

const JoinTripScreen: React.FC<Props> = ({ navigation }) => {
    const [invitationLink, setInvitationLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleJoinByLink = async () => {
        if (!invitationLink.trim()) {
            Alert.alert("Erreur", "Veuillez coller le lien d'invitation");
            return;
        }

        // Validation basique du format du lien
        if (
            !invitationLink.includes("spontytrip.com/invite/") &&
            !invitationLink.includes("sponty.app/")
        ) {
            Alert.alert("Erreur", "Le lien d'invitation n'est pas valide");
            return;
        }

        setIsLoading(true);

        // Simulation de la validation du lien
        setTimeout(() => {
            setIsLoading(false);
            // Ici on analyserait le lien et naviguerait vers TripPreview ou directement rejoindre
            Alert.alert(
                "Voyage trouvé !",
                'Voulez-vous rejoindre le voyage "Barcelone 2024" ?',
                [
                    { text: "Annuler", style: "cancel" },
                    {
                        text: "Rejoindre",
                        onPress: () => {
                            // Navigation vers TripDetails ou MainApp
                            Alert.alert(
                                "Succès",
                                "Vous avez rejoint le voyage !"
                            );
                            navigation.navigate("MainApp");
                        },
                    },
                ]
            );
        }, 1500);
    };

    const handleScanQRCode = () => {
        // Ici on demanderait les permissions caméra et ouvrirait le scanner
        Alert.alert(
            "Scanner QR Code",
            "Cette fonctionnalité ouvrira votre caméra pour scanner un QR code d'invitation.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Ouvrir caméra",
                    onPress: () => {
                        // Simulation du scan
                        setTimeout(() => {
                            Alert.alert(
                                "QR Code scanné !",
                                'Voyage "Rome 2024" trouvé. Voulez-vous rejoindre ?'
                            );
                        }, 2000);
                    },
                },
            ]
        );
    };

    const isValidLink =
        invitationLink.trim().length > 0 &&
        (invitationLink.includes("spontytrip.com/invite/") ||
            invitationLink.includes("sponty.app/"));

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
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

            <View style={styles.content}>
                {/* Sous-titre */}
                <View style={styles.subtitleContainer}>
                    <Text style={styles.subtitle}>
                        Choisissez la méthode pour rejoindre le voyage
                    </Text>
                </View>

                {/* Champ lien d'invitation */}
                <View style={styles.linkSection}>
                    <TextInput
                        style={styles.linkInput}
                        placeholder="Collez le lien d'invitation"
                        placeholderTextColor="#6178899"
                        value={invitationLink}
                        onChangeText={setInvitationLink}
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                    />
                </View>

                {/* Bouton Join */}
                <TouchableOpacity
                    style={[
                        styles.joinButton,
                        (!isValidLink || isLoading) &&
                            styles.joinButtonDisabled,
                    ]}
                    onPress={handleJoinByLink}
                    disabled={!isValidLink || isLoading}
                >
                    <Text style={styles.joinButtonText}>
                        {isLoading ? "Rejoindre..." : "Rejoindre"}
                    </Text>
                </TouchableOpacity>

                {/* Séparateur Ou */}
                <View style={styles.separatorContainer}>
                    <Text style={styles.separatorText}>Ou</Text>
                </View>

                {/* Bouton QR Scanner */}
                <TouchableOpacity
                    style={styles.qrButton}
                    onPress={handleScanQRCode}
                    disabled={isLoading}
                >
                    <Text style={styles.qrButtonText}>Scanner le code QR</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60, // Safe area
        backgroundColor: Colors.background,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        flex: 1,
        textAlign: "center",
        marginRight: 48, // Pour compenser le bouton retour
    },
    headerSpacer: {
        width: 48,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    subtitleContainer: {
        marginBottom: 32,
        paddingHorizontal: 0,
    },
    subtitle: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        fontSize: 18,
        lineHeight: 28,
    },
    linkSection: {
        marginBottom: 20,
    },
    linkInput: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        ...TextStyles.body1,
        color: Colors.textPrimary,
        height: 56,
    },
    joinButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        alignItems: "center",
        height: 48,
        justifyContent: "center",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    joinButtonDisabled: {
        backgroundColor: "#A0A0A0",
        opacity: 0.6,
    },
    joinButtonText: {
        ...TextStyles.h3,
        color: Colors.background,
        fontSize: 14,
        fontWeight: "600",
    },
    separatorContainer: {
        alignItems: "center",
        marginVertical: 32,
        width: "100%",
    },
    separatorText: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    qrButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        alignItems: "center",
        height: 48,
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    qrButtonText: {
        ...TextStyles.h3,
        color: Colors.background,
        fontSize: 14,
        fontWeight: "600",
    },
});

export default JoinTripScreen;
