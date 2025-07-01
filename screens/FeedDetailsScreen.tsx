import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants";
import { useFeedDetailsStyles  } from "../styles/screens";
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

const FeedDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const styles = useFeedDetailsStyles();
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

    // Redirection automatique silencieuse si le voyage est supprimé
    useEffect(() => {
        if (!trip && !loading) {
            console.log(
                "🚨 FeedDetailsScreen - Redirection automatique - voyage supprimé"
            );

            const timer = setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainApp" }],
                });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [trip, navigation, loading]);

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
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        transform: [{ translateY: headerSlideAnim }],
                    },
                ]}
            >
                <Ionicons
                    name="arrow-back"
                    size={24}
                    color={Colors.textPrimary}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerTitle}>Activités du voyage</Text>
            </Animated.View>

            {/* Liste des activités */}
            <Animated.View
                style={[
                    styles.activityList,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim },
                        ],
                    },
                ]}
            >
                <FlatList
                    data={activityFeed}
                    renderItem={renderActivityItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    }
                />
            </Animated.View>
        </SafeAreaView>
    );
};

export default FeedDetailsScreen;
