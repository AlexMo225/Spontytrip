import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FirestoreTrip } from "../../services/firebaseService";

const { width: screenWidth } = Dimensions.get("window");

interface TripDetailsHeaderProps {
    trip: FirestoreTrip;
    scrollY: Animated.Value;
    isCreator: boolean;
    formatDates: (startDate: Date | any, endDate: Date | any) => string;
    calculateDuration: (startDate: Date | any, endDate: Date | any) => string;
    onBackPress: () => void;
    onEditPress: () => void;
    onDeletePress: () => void;
    onImagePress: () => void;
}

export const TripDetailsHeader: React.FC<TripDetailsHeaderProps> = ({
    trip,
    scrollY,
    isCreator,
    formatDates,
    calculateDuration,
    onBackPress,
    onEditPress,
    onDeletePress,
    onImagePress,
}) => {
    const insets = useSafeAreaInsets();

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    const imageScale = scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [1.2, 1, 0.9],
        extrapolate: "clamp",
    });

    const titleTranslateY = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -20],
        extrapolate: "clamp",
    });

    // Calculer si l'overlay doit être visible (inverse du header fixe)
    const overlayOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    return (
        <>
            {/* Header fixe animé */}
            <Animated.View
                style={[
                    styles.fixedHeader,
                    {
                        paddingTop: insets.top,
                        opacity: headerOpacity,
                    },
                ]}
            >
                <LinearGradient
                    colors={["#7ED957", "#4DA1A9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.fixedHeaderGradient,
                        { paddingTop: insets.top + 10 },
                    ]}
                >
                    <View style={styles.fixedHeaderContent}>
                        <TouchableOpacity
                            onPress={onBackPress}
                            style={styles.backButton}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                        <Text style={styles.fixedHeaderTitle} numberOfLines={1}>
                            {trip.title}
                        </Text>
                        {isCreator && (
                            <View style={styles.headerRightActions}>
                                <TouchableOpacity
                                    onPress={onEditPress}
                                    style={styles.editButton}
                                >
                                    <Ionicons
                                        name="create"
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onDeletePress}
                                    style={[
                                        styles.editButton,
                                        styles.deleteButtonHeader,
                                    ]}
                                >
                                    <Ionicons
                                        name="trash"
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* Image de couverture */}
            <TouchableOpacity
                style={styles.coverImageContainer}
                onPress={onImagePress}
                activeOpacity={0.9}
            >
                <Animated.View
                    style={[
                        styles.coverImageWrapper,
                        {
                            transform: [{ scale: imageScale }],
                        },
                    ]}
                >
                    {trip.coverImage ? (
                        <Image
                            source={{ uri: trip.coverImage }}
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={["#7ED957", "#4DA1A9"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.placeholderGradient}
                        >
                            <Ionicons name="image" size={60} color="#FFFFFF" />
                            <Text style={styles.placeholderText}>
                                Ajouter une photo
                            </Text>
                        </LinearGradient>
                    )}
                </Animated.View>

                {/* Overlay avec boutons - visible seulement quand header fixe invisible */}
                <Animated.View
                    style={[
                        styles.headerOverlay,
                        {
                            opacity: overlayOpacity,
                        },
                    ]}
                >
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.7)"]}
                        style={styles.overlayGradient}
                    >
                        <View
                            style={[
                                styles.headerActions,
                                { paddingTop: insets.top + 10 },
                            ]}
                        >
                            <TouchableOpacity
                                onPress={onBackPress}
                                style={styles.floatingBackButton}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name="arrow-back"
                                    size={24}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>

                            {isCreator && (
                                <View style={styles.headerRightActions}>
                                    <TouchableOpacity
                                        onPress={onEditPress}
                                        style={styles.floatingActionButton}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name="create"
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={onDeletePress}
                                        style={[
                                            styles.floatingActionButton,
                                            styles.deleteButton,
                                        ]}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name="trash"
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>

            {/* Informations du voyage */}
            <Animated.View
                style={[
                    styles.tripInfoContainer,
                    {
                        transform: [{ translateY: titleTranslateY }],
                    },
                ]}
            >
                <View style={styles.tripTitleRow}>
                    <Text style={styles.tripTitle}>{trip.title}</Text>
                    {isCreator && (
                        <View style={styles.creatorBadge}>
                            <Ionicons name="star" size={14} color="#FFD93D" />
                            <Text style={styles.creatorText}>Créateur</Text>
                        </View>
                    )}
                </View>

                <View style={styles.tripMetaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="location" size={16} color="#7ED957" />
                        <Text style={styles.metaText}>{trip.destination}</Text>
                    </View>
                </View>

                <View style={styles.tripMetaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar" size={16} color="#4DA1A9" />
                        <Text style={styles.metaText}>
                            {formatDates(trip.startDate, trip.endDate)}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time" size={16} color="#FF6B6B" />
                        <Text style={styles.metaText}>
                            {calculateDuration(trip.startDate, trip.endDate)}
                        </Text>
                    </View>
                </View>

                {trip.description && (
                    <Text style={styles.tripDescription}>
                        {trip.description}
                    </Text>
                )}
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    // Header fixe
    fixedHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    fixedHeaderGradient: {
        paddingBottom: 16,
    },
    fixedHeaderContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    fixedHeaderTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
        marginHorizontal: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },

    // Image de couverture
    coverImageContainer: {
        height: 300,
        width: screenWidth,
        position: "relative",
    },
    coverImageWrapper: {
        width: "100%",
        height: "100%",
    },
    coverImage: {
        width: "100%",
        height: "100%",
    },
    placeholderGradient: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginTop: 8,
    },

    // Overlay et actions
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlayGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    headerActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    floatingBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerRightActions: {
        flexDirection: "row",
        gap: 8,
    },
    floatingActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButton: {
        backgroundColor: "rgba(255,107,107,0.8)",
    },
    deleteButtonHeader: {
        backgroundColor: "rgba(255,107,107,0.8)",
    },

    // Informations du voyage
    tripInfoContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    tripTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    tripTitle: {
        flex: 1,
        fontSize: 28,
        fontWeight: "700",
        color: "#2D3748",
        marginRight: 12,
    },
    creatorBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF7E6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    creatorText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFD93D",
    },
    tripMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 20,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#64748B",
    },
    tripDescription: {
        fontSize: 14,
        fontWeight: "400",
        color: "#64748B",
        lineHeight: 20,
        marginTop: 8,
    },
});
