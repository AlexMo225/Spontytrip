import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { TripActivity } from "../../services/firebaseService";
import SpontyModal from "../SpontyModal";

interface ActivityDetailModalProps {
    visible: boolean;
    activity: TripActivity | null;
    onClose: () => void;
    onEdit?: (activity: TripActivity) => void;
    onDelete?: (activityId: string) => void;
    onVote?: (activityId: string, currentlyVoted: boolean) => void;
    user: any;
    trip: any;
    getStatusColor: (status?: string) => string;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
    visible,
    activity,
    onClose,
    onEdit,
    onDelete,
    onVote,
    user,
    trip,
    getStatusColor,
}) => {
    if (!activity) return null;

    const userVoted = activity.votes?.includes(user?.uid) || false;
    const voteCount = activity.votes?.length || 0;
    const canEdit =
        activity.createdBy === user?.uid || trip?.creatorId === user?.uid;

    // 🎨 Fonction pour obtenir le statut en français avec de belles couleurs
    const getActivityStatus = () => {
        const now = new Date();
        const activityDate = new Date(activity.date);

        // Normaliser les dates pour comparaison (ignorer l'heure)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activityDateNormalized = new Date(activityDate);
        activityDateNormalized.setHours(0, 0, 0, 0);

        if (activityDateNormalized < today) {
            return {
                text: "Passée",
                color: "#64748B", // Gris
                backgroundColor: "#F1F5F9",
                icon: "checkmark-circle",
            };
        } else if (activityDateNormalized.getTime() === today.getTime()) {
            return {
                text: "Aujourd'hui",
                color: "#FFFFFF",
                backgroundColor: "#F59E0B", // Orange vif
                icon: "today",
            };
        } else if (activity.validated) {
            return {
                text: "Validée",
                color: "#FFFFFF",
                backgroundColor: "#10B981", // Vert
                icon: "checkmark-circle",
            };
        } else {
            return {
                text: "En attente",
                color: "#FFFFFF",
                backgroundColor: "#3B82F6", // Bleu
                icon: "time",
            };
        }
    };

    const statusInfo = getActivityStatus();

    const formatDate = (date: any) => {
        if (!date) return "Date non définie";
        const dateObj =
            date instanceof Date
                ? date
                : date.toDate
                ? date.toDate()
                : new Date(date);
        return dateObj.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const [errorModal, setErrorModal] = useState({
        visible: false,
        message: "",
    });

    // 🔗 Fonction pour ouvrir les liens
    const handleOpenLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                setErrorModal({
                    visible: true,
                    message: "Impossible d'ouvrir ce lien",
                });
            }
        } catch (error) {
            setErrorModal({
                visible: true,
                message:
                    "Une erreur s'est produite lors de l'ouverture du lien",
            });
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Détails de l activité
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{activity.title}</Text>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: statusInfo.backgroundColor },
                            ]}
                        >
                            <Ionicons
                                name={statusInfo.icon as any}
                                size={14}
                                color={statusInfo.color}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: statusInfo.color },
                                ]}
                            >
                                {statusInfo.text}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons
                                name="calendar"
                                size={20}
                                color="#4DA1A9"
                            />
                            <Text style={styles.sectionTitle}>Date</Text>
                        </View>
                        <Text style={styles.dateText}>
                            {formatDate(activity.date)}
                        </Text>
                        {(activity.startTime || activity.endTime) && (
                            <View style={styles.timeContainer}>
                                {activity.startTime && (
                                    <Text style={styles.timeText}>
                                        Début : {activity.startTime}
                                    </Text>
                                )}
                                {activity.endTime && (
                                    <Text style={styles.timeText}>
                                        Fin : {activity.endTime}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {activity.location && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons
                                    name="location"
                                    size={20}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.sectionTitle}>Lieu</Text>
                            </View>
                            <Text style={styles.locationText}>
                                {activity.location}
                            </Text>
                        </View>
                    )}

                    {activity.description && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons
                                    name="document-text"
                                    size={20}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.sectionTitle}>
                                    Description
                                </Text>
                            </View>
                            <Text style={styles.descriptionText}>
                                {activity.description}
                            </Text>
                        </View>
                    )}

                    {activity.link && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons
                                    name="link"
                                    size={20}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.sectionTitle}>Lien</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.linkContainer}
                                onPress={() => handleOpenLink(activity.link!)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="open-outline"
                                    size={16}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.linkText} numberOfLines={2}>
                                    {activity.link}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="heart" size={20} color="#FF6B6B" />
                            <Text style={styles.sectionTitle}>
                                Votes ({voteCount})
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.voteButton,
                                userVoted && styles.voteButtonActive,
                            ]}
                            onPress={() => onVote?.(activity.id, userVoted)}
                        >
                            <Ionicons
                                name={userVoted ? "heart" : "heart-outline"}
                                size={20}
                                color={userVoted ? "#FFFFFF" : "#FF6B6B"}
                            />
                            <Text
                                style={[
                                    styles.voteButtonText,
                                    userVoted && styles.voteButtonTextActive,
                                ]}
                            >
                                {userVoted
                                    ? "Vous avez voté"
                                    : "Voter pour cette activité"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {canEdit && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => {
                                onEdit?.(activity);
                                onClose();
                            }}
                        >
                            <Ionicons name="pencil" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>
                                Modifier
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => {
                                onDelete?.(activity.id);
                                onClose();
                            }}
                        >
                            <Ionicons name="trash" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>
                                Supprimer
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Modale d'erreur */}
            <SpontyModal
                visible={errorModal.visible}
                type="error"
                title="Erreur"
                message={errorModal.message}
                buttons={[
                    {
                        text: "OK",
                        onPress: () =>
                            setErrorModal({ visible: false, message: "" }),
                        style: "default",
                    },
                ]}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    titleSection: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginLeft: 8,
    },
    dateText: {
        fontSize: 16,
        color: "#111827",
        marginLeft: 28,
    },
    timeContainer: {
        marginTop: 4,
        marginLeft: 28,
    },
    timeText: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 2,
    },
    locationText: {
        fontSize: 16,
        color: "#111827",
        marginLeft: 28,
    },
    descriptionText: {
        fontSize: 16,
        color: "#111827",
        lineHeight: 24,
        marginLeft: 28,
    },
    linkContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9FF",
        borderWidth: 1,
        borderColor: "#BAE6FD",
        borderRadius: 8,
        padding: 12,
        marginLeft: 28,
        marginRight: 20,
    },
    linkText: {
        fontSize: 14,
        color: "#4DA1A9",
        fontWeight: "500",
        marginLeft: 8,
        flex: 1,
    },
    voteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#FF6B6B",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginLeft: 28,
        marginRight: 20,
    },
    voteButtonActive: {
        backgroundColor: "#FF6B6B",
    },
    voteButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FF6B6B",
        marginLeft: 8,
    },
    voteButtonTextActive: {
        color: "#FFFFFF",
    },
    actionsContainer: {
        flexDirection: "row",
        padding: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    editButton: {
        backgroundColor: "#4DA1A9",
    },
    deleteButton: {
        backgroundColor: "#EF4444",
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 8,
    },
});
