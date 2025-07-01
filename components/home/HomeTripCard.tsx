import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { TextStyles } from "../../constants/Fonts";
import { FirestoreTrip } from "../../services/firebaseService";

const { width: screenWidth } = Dimensions.get("window");

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

    return (
        <TouchableOpacity
            style={styles.modernTripCard}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.modernTripImageContainer}>
                {trip.coverImage ? (
                    <Image
                        source={{ uri: trip.coverImage }}
                        style={styles.modernTripImage}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={["#7ED957", "#4DA1A9"]}
                        style={styles.modernTripImagePlaceholder}
                    >
                        <Text style={styles.modernTripImageEmoji}>
                            {getTypeEmoji(trip.type)}
                        </Text>
                    </LinearGradient>
                )}

                <View style={styles.modernStatusBadge}>
                    <Text
                        style={[
                            styles.modernStatusText,
                            { color: status.color },
                        ]}
                    >
                        {status.emoji} {status.text}
                    </Text>
                </View>

                {trip.creatorId === currentUserId && (
                    <View style={styles.modernCreatorBadge}>
                        <Ionicons name="star" size={16} color="#FFA500" />
                    </View>
                )}
            </View>

            <View style={styles.modernTripInfo}>
                <Text style={styles.modernTripTitle} numberOfLines={2}>
                    {trip.title}
                </Text>
                <Text style={styles.modernTripDestination} numberOfLines={1}>
                    📍 {trip.destination}
                </Text>
                <Text style={styles.modernTripDate}>
                    📅 {formatDateRange(trip.startDate, trip.endDate)}
                </Text>
                <View style={styles.modernTripMembers}>
                    <Text style={styles.modernMembersText}>
                        👥 {trip.members?.length || 0} membre
                        {(trip.members?.length || 0) > 1 ? "s" : ""}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // 🏞️ CARTES DE VOYAGE MODERNES
    modernTripCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        overflow: "hidden",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        width: screenWidth * 0.75,
        marginBottom: 16,
    },
    modernTripImageContainer: {
        height: 200,
        position: "relative",
    },
    modernTripImage: {
        width: "100%",
        height: "100%",
    },
    modernTripImagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    modernTripImageEmoji: {
        fontSize: 48,
    },
    modernStatusBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    modernStatusText: {
        fontSize: 12,
        fontFamily: TextStyles.body.family,
        fontWeight: "700",
    },
    modernCreatorBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255, 217, 61, 0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    modernTripInfo: {
        padding: 20,
    },
    modernTripTitle: {
        fontSize: 20,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 8,
    },
    modernTripDestination: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 6,
    },
    modernTripDate: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "#94A3B8",
        marginBottom: 12,
    },
    modernTripMembers: {
        flexDirection: "row",
        alignItems: "center",
    },
    modernMembersText: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
});
