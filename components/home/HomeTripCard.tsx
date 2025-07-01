import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants";
import { FirestoreTrip } from "../../services/firebaseService";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;

interface HomeTripCardProps {
    trip: FirestoreTrip;
    formatDateRange: (startDate: Date | any, endDate: Date | any) => string;
    getTripStatus: (trip: FirestoreTrip) => {
        text: string;
        color: string;
        emoji: string;
    };
    getTypeEmoji: (type: string) => string;
    currentUserId?: string;
    onPress: () => void;
}

export const HomeTripCard: React.FC<HomeTripCardProps> = ({
    trip,
    formatDateRange,
    getTripStatus,
    getTypeEmoji,
    currentUserId,
    onPress,
}) => {
    const status = getTripStatus(trip);

    const getStatusColor = () => {
        switch (status.text.toLowerCase()) {
            case "terminé":
                return "#4CAF50";
            case "en cours":
                return "#2196F3";
            case "à venir":
                return "#FFC107";
            default:
                return Colors.primary;
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.95}
        >
            <View style={styles.card}>
                <View style={styles.imageSection}>
                    {trip.coverImage ? (
                        <Image
                            source={{ uri: trip.coverImage }}
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary]}
                            style={styles.gradientPlaceholder}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.placeholderEmoji}>
                                {getTypeEmoji(trip.type)}
                            </Text>
                        </LinearGradient>
                    )}

                    <LinearGradient
                        colors={["rgba(0,0,0,0.4)", "transparent"]}
                        style={styles.imageDarkOverlay}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 0.7 }}
                    />

                    <View style={styles.statusBadge}>
                        <View
                            style={[
                                styles.statusIndicator,
                                { backgroundColor: getStatusColor() },
                            ]}
                        />
                        <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                </View>

                <View style={styles.contentSection}>
                    <Text style={styles.title} numberOfLines={1}>
                        {trip.title}
                    </Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoText}>
                                📍 {trip.destination}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoText}>
                                📅{" "}
                                {formatDateRange(trip.startDate, trip.endDate)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.membersText}>
                            👥 {trip.members?.length || 1} membre
                            {trip.members?.length !== 1 ? "s" : ""}
                        </Text>
                        {trip.creatorId === currentUserId && (
                            <View style={styles.creatorBadge}>
                                <Text style={styles.creatorText}>
                                    ✨ Organisateur
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginHorizontal: (screenWidth - CARD_WIDTH) / 2,
        marginVertical: 8,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    imageSection: {
        height: 140,
        width: "100%",
        position: "relative",
    },
    coverImage: {
        width: "100%",
        height: "100%",
    },
    gradientPlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderEmoji: {
        fontSize: 40,
    },
    imageDarkOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
    },
    statusBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    contentSection: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 12,
    },
    infoRow: {
        marginBottom: 12,
    },
    infoItem: {
        marginBottom: 6,
    },
    infoText: {
        fontSize: 14,
        color: "#666666",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    membersText: {
        fontSize: 14,
        color: "#666666",
    },
    creatorBadge: {
        backgroundColor: Colors.primary + "15",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    creatorText: {
        fontSize: 12,
        fontWeight: "500",
        color: Colors.primary,
    },
});
