import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { useTripSync } from "../hooks/useTripSync";
import { ActivityLogEntry, RootStackParamList } from "../types";

type FeedDetailsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "FeedDetails"
>;

type FeedDetailsScreenRouteProp = RouteProp<RootStackParamList, "FeedDetails">;

interface Props {
    navigation: FeedDetailsScreenNavigationProp;
    route: FeedDetailsScreenRouteProp;
}

const { width, height } = Dimensions.get("window");

const FeedDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;
    const { trip, activityFeed, loading } = useTripSync(tripId);
    const [refreshing, setRefreshing] = useState(false);

    // Animations
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const headerSlideAnim = React.useRef(new Animated.Value(-100)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

    // Animation d'entrée au montage du composant
    useEffect(() => {
        // Animation séquentielle élégante
        Animated.sequence([
            // 1. Header slide down
            Animated.timing(headerSlideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            // 2. Fade in général + scale + slide up de la liste
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        // La synchronisation se fait automatiquement via useTripSync
        setTimeout(() => setRefreshing(false), 1000);
    };

    const formatTimestamp = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return "À l'instant";
        if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
        if (diffHours < 24) return `il y a ${diffHours}h`;
        if (diffDays < 7)
            return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;

        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getActionBadgeText = (action: string): string => {
        const translations: { [key: string]: string } = {
            activity_add: "ACTIVITÉ AJOUT",
            activity_delete: "ACTIVITÉ SUPPRESSION",
            activity_vote: "ACTIVITÉ VOTE",
            activity_validate: "ACTIVITÉ VALIDATION",
            note_add: "NOTE AJOUT",
            note_delete: "NOTE SUPPRESSION",
            note_update: "NOTE MODIFICATION",
            checklist_add: "CHECKLIST AJOUT",
            checklist_complete: "CHECKLIST TERMINÉ",
            checklist_delete: "CHECKLIST SUPPRESSION",
            expense_add: "DÉPENSE AJOUT",
            expense_delete: "DÉPENSE SUPPRESSION",
            expense_update: "DÉPENSE MODIFICATION",
            trip_join: "VOYAGE REJOINT",
            trip_update: "VOYAGE MODIFICATION",
        };

        return translations[action] || action.replace("_", " ").toUpperCase();
    };

    const renderActivityItem = ({
        item,
        index,
    }: {
        item: ActivityLogEntry;
        index: number;
    }) => (
        <View style={styles.activityItem}>
            {/* Timeline connector */}
            <View style={styles.timelineContainer}>
                <View
                    style={[
                        styles.timelineIcon,
                        { backgroundColor: item.color },
                    ]}
                >
                    <Ionicons name={item.icon as any} size={16} color="white" />
                </View>
                {index < activityFeed.length - 1 && (
                    <View style={styles.timelineLine} />
                )}
            </View>

            {/* Content */}
            <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>
                    {item.description}
                </Text>
                <View style={styles.activityMeta}>
                    <Text style={styles.activityTime}>
                        {formatTimestamp(item.timestamp)}
                    </Text>
                    <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText}>
                            {getActionBadgeText(item.action)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="time-outline" size={64} color="#E2E8F0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune activité</Text>
            <Text style={styles.emptySubtitle}>
                Les actions de votre groupe apparaîtront ici en temps réel
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7ED957" />
                    <Text style={styles.loadingText}>
                        Chargement du feed...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header animé */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        transform: [{ translateY: headerSlideAnim }],
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.primary}
                    />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>🔥 Feed Live</Text>
                    <Text style={styles.headerSubtitle}>
                        {trip?.title || "Chargement..."} • {activityFeed.length}{" "}
                        activités
                    </Text>
                </View>
            </Animated.View>

            {/* Contenu principal animé */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim },
                        ],
                    },
                ]}
            >
                {/* Feed List */}
                {activityFeed.length > 0 ? (
                    <FlatList
                        data={activityFeed}
                        renderItem={renderActivityItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.feedContainer}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={["#7ED957"]}
                                tintColor="#7ED957"
                            />
                        }
                        // Animation simple au scroll
                        onScrollBeginDrag={() => {}}
                        scrollEventThrottle={16}
                    />
                ) : (
                    renderEmptyState()
                )}
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#6B7280",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        backgroundColor: "#FFFFFF",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748B",
    },
    feedContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    activityItem: {
        flexDirection: "row",
        marginBottom: 20,
    },
    timelineContainer: {
        width: 32,
        alignItems: "center",
        marginRight: 16,
    },
    timelineIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: "#E2E8F0",
        marginTop: 8,
        minHeight: 20,
    },
    activityContent: {
        flex: 1,
        paddingTop: 4,
    },
    activityDescription: {
        fontSize: 16,
        color: "#1E293B",
        fontWeight: "500",
        lineHeight: 22,
        marginBottom: 8,
    },
    activityMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    activityTime: {
        fontSize: 14,
        color: "#64748B",
    },
    actionBadge: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    actionBadgeText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#64748B",
        letterSpacing: 0.5,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 24,
    },
    content: {
        flex: 1,
    },
});

export default FeedDetailsScreen;
