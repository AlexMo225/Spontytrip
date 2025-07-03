import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TripInvitationModalProps {
    showInvitationModal: boolean;
    invitationCode: string;
    tripName: string;
    handleCopyCode: () => Promise<void>;
    handleShareInvitation: () => Promise<void>;
    handleCloseInvitationModal: () => void;
}

export const TripInvitationModal: React.FC<TripInvitationModalProps> = ({
    showInvitationModal,
    invitationCode,
    tripName,
    handleCopyCode,
    handleShareInvitation,
    handleCloseInvitationModal,
}) => {
    const [copyFeedback, setCopyFeedback] = useState(false);

    const handleCopyWithFeedback = async () => {
        try {
            await Clipboard.setStringAsync(invitationCode);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
            handleCopyCode();
        } catch (error) {
            console.error("Erreur copie:", error);
        }
    };

    return (
        <Modal
            visible={showInvitationModal}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCloseInvitationModal}
        >
            <View style={styles.invitationModalOverlay}>
                <View style={styles.invitationModalContainer}>
                    <View style={styles.invitationModalHeader}>
                        <Text style={styles.invitationModalTitle}>
                            🎉 Voyage créé !
                        </Text>
                        <TouchableOpacity
                            style={styles.invitationModalCloseButton}
                            onPress={handleCloseInvitationModal}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.invitationModalSubtitle}>
                        Partagez ce code pour inviter vos amis à rejoindre "
                        {tripName}"
                    </Text>

                    {/* Code d'invitation */}
                    <View style={styles.invitationCodeContainer}>
                        <Text style={styles.invitationCodeLabel}>
                            Code d'invitation
                        </Text>
                        <View style={styles.invitationCodeBox}>
                            <Text style={styles.invitationCodeText}>
                                {invitationCode}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.copyButton,
                                    copyFeedback && styles.copyButtonSuccess,
                                ]}
                                onPress={handleCopyWithFeedback}
                            >
                                <Ionicons
                                    name={copyFeedback ? "checkmark" : "copy"}
                                    size={20}
                                    color={copyFeedback ? "#7ED957" : "#4DA1A9"}
                                />
                            </TouchableOpacity>
                        </View>
                        {copyFeedback && (
                            <Text style={styles.copyFeedbackText}>
                                ✅ Code copié !
                            </Text>
                        )}
                    </View>

                    {/* QR Code amélioré */}
                    <View style={styles.qrCodeContainer}>
                        <Text style={styles.qrCodeLabel}>QR Code</Text>
                        <View style={styles.qrCodePlaceholder}>
                            <Ionicons
                                name="qr-code-outline"
                                size={80}
                                color="#4DA1A9"
                            />
                            <Text style={styles.qrCodePlaceholderText}>
                                Scan pour rejoindre rapidement
                            </Text>
                            <Text style={styles.qrCodeSubtext}>
                                Fonctionnalité à venir
                            </Text>
                        </View>
                    </View>

                    {/* Boutons d'action */}
                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={handleShareInvitation}
                        >
                            <Ionicons
                                name="share-outline"
                                size={20}
                                color="#FFFFFF"
                            />
                            <Text style={styles.shareButtonText}>Partager</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleCloseInvitationModal}
                        >
                            <Text style={styles.continueButtonText}>
                                Continuer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    invitationModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    invitationModalContainer: {
        backgroundColor: "#FFFFFF",
        padding: 24,
        borderRadius: 16,
        width: "100%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    invitationModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    invitationModalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1A1A1A",
        letterSpacing: -0.5,
    },
    invitationModalCloseButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 22,
    },
    invitationModalSubtitle: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    invitationCodeContainer: {
        marginBottom: 24,
    },
    invitationCodeLabel: {
        fontSize: 16,
        color: "#1A1A1A",
        fontWeight: "600",
        marginBottom: 8,
    },
    invitationCodeBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        padding: 16,
        backgroundColor: "#F8F9FA",
    },
    invitationCodeText: {
        flex: 1,
        fontSize: 18,
        color: "#1A1A1A",
        fontWeight: "700",
        letterSpacing: 2,
        textAlign: "center",
    },
    copyButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#DBE0E5",
    },
    copyButtonSuccess: {
        borderColor: "#7ED957",
    },
    copyFeedbackText: {
        fontSize: 14,
        color: "#7ED957",
        marginTop: 8,
        textAlign: "center",
    },
    qrCodeContainer: {
        marginBottom: 24,
    },
    qrCodeLabel: {
        fontSize: 16,
        color: "#1A1A1A",
        fontWeight: "600",
        marginBottom: 8,
    },
    qrCodePlaceholder: {
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 32,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    qrCodePlaceholderText: {
        fontSize: 14,
        color: "#999",
        marginTop: 12,
        textAlign: "center",
    },
    qrCodeSubtext: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
        textAlign: "center",
    },
    modalButtonsContainer: {
        flexDirection: "row",
        gap: 12,
    },
    shareButton: {
        flex: 1,
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    shareButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    continueButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "600",
    },
});
