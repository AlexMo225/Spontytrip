import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FirestoreTrip } from "../../services/firebaseService";
import Avatar from "../Avatar";

interface TripDetailsTeamProps {
    trip: FirestoreTrip;
    showMemberNames: boolean;
    onToggleNames: () => void;
}

export const TripDetailsTeam: React.FC<TripDetailsTeamProps> = ({
    trip,
    showMemberNames,
    onToggleNames,
}) => {
    return (
        <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
                <Text style={styles.sectionTitle}>Équipe du voyage</Text>
                <TouchableOpacity
                    onPress={onToggleNames}
                    style={styles.toggleNamesButton}
                >
                    <Ionicons
                        name={showMemberNames ? "eye-off" : "eye"}
                        size={16}
                        color="#7ED957"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.teamMembers}>
                {trip.members.map((member, index) => (
                    <View key={member.userId} style={styles.memberContainer}>
                        <View style={styles.memberAvatar}>
                            <Avatar
                                imageUrl={member.avatar}
                                size={50}
                                showBorder={true}
                            />
                            {member.role === "creator" && (
                                <View style={styles.creatorIndicator}>
                                    <Ionicons
                                        name="star"
                                        size={12}
                                        color="#FFD93D"
                                    />
                                </View>
                            )}
                        </View>
                        {showMemberNames && (
                            <Text style={styles.memberName} numberOfLines={2}>
                                {member.name}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
            <Text style={styles.teamCount}>
                {trip.members.length} membre{trip.members.length > 1 ? "s" : ""}{" "}
                au total
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    teamSection: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    teamHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2D3748",
    },
    toggleNamesButton: {
        padding: 4,
    },
    teamMembers: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 16,
    },
    memberContainer: {
        alignItems: "center",
        maxWidth: 70,
    },
    memberAvatar: {
        position: "relative",
        marginBottom: 6,
    },
    creatorIndicator: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFD93D",
    },
    memberName: {
        fontSize: 12,
        fontWeight: "500",
        color: "#64748B",
        textAlign: "center",
        lineHeight: 14,
    },
    teamCount: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7ED957",
        textAlign: "center",
    },
});
