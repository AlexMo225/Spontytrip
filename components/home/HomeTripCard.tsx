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
const CARD_WIDTH = screenWidth * 0.75;

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
        alignSelf: "center",
        marginVertical: 12,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#7FBDC3",
        ...Platform.select({
            ios: {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    imageSection: {
        height: 160,
        width: "100%",
        position: "relative",
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundColors.secondary,
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
        backgroundColor: Colors.backgroundColors.secondary,
    },
    placeholderEmoji: {
        fontSize: 48,
        opacity: 0.9,
    },
    imageDarkOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    statusBadge: {
        position: "absolute",
        top: 16,
        left: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    contentSection: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: Platform.select({
            ios: "System",
            android: "Roboto",
        }),
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        backgroundColor: Colors.backgroundColors.secondary,
        padding: 12,
        borderRadius: 16,
    },
    infoItem: {
        flex: 1,
        alignItems: "center",
    },
    infoText: {
        fontSize: 15,
        color: Colors.text.secondary,
        fontWeight: "600",
        textAlign: "center",
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.backgroundColors.secondary,
    },
    membersText: {
        fontSize: 15,
        color: Colors.text.secondary,
        fontWeight: "600",
    },
    creatorBadge: {
        backgroundColor: Colors.backgroundColors.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    creatorText: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: "700",
    },
});
