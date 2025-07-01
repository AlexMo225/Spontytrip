import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
    ActivityIndicator,
    Animated,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ActivityFeed } from "../components";
import {
    TripDetailsHeader,
    TripDetailsStats,
    TripDetailsTeam,
} from "../components/tripDetails";
import { useTripDetails } from "../hooks/useTripDetails";
import { RootStackParamList } from "../types";

type TripDetailsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "TripDetails"
>;
type TripDetailsScreenRouteProp = RouteProp<RootStackParamList, "TripDetails">;

interface Props {
    navigation: TripDetailsScreenNavigationProp;
    route: TripDetailsScreenRouteProp;
}

const TripDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;

    const {
        trip,
        tripNotes,
        activityFeed,
        loading,
        error,
        showMemberNames,
        scrollY,
        tripStats,
        isCreator,
        setShowMemberNames,
        handleNavigateToFeature,
        handleDeleteTrip,
        updateCoverImage,
        formatDates,
        calculateDuration,
    } = useTripDetails(tripId);

    // Navigation handlers
    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleEditPress = () => {
        navigation.navigate("EditTrip", { tripId });
    };

    const handleDeletePress = () => {
        handleDeleteTrip(navigation);
    };

    const handleImagePress = async () => {
        if (!isCreator) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await updateCoverImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Erreur sélection image:", error);
        }
    };

    const handleNavigateWrapper = (feature: string) => {
        handleNavigateToFeature(feature, navigation);
    };

    const handleToggleNames = () => {
        setShowMemberNames(!showMemberNames);
    };

    // États de chargement et d'erreur
    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
                <Text style={styles.loadingText}>
                    Chargement des détails du voyage...
                </Text>
            </SafeAreaView>
        );
    }

    if (error || !trip) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons
                    name="alert-circle-outline"
                    size={64}
                    color="#FF6B6B"
                />
                <Text style={styles.errorTitle}>Erreur de chargement</Text>
                <Text style={styles.errorText}>
                    {error || "Impossible de charger les détails du voyage"}
                </Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryButtonText}>Retour</Text>
                </TouchableOpacity>
                <Text style={styles.redirectText}>
                    Redirection automatique dans quelques secondes...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Contenu principal avec scroll */}
            <View style={styles.mainContent}>
                <Animated.ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* Header avec image et infos */}
                    <TripDetailsHeader
                        trip={trip}
                        scrollY={scrollY}
                        isCreator={isCreator}
                        formatDates={formatDates}
                        calculateDuration={calculateDuration}
                        onBackPress={handleBackPress}
                        onEditPress={handleEditPress}
                        onDeletePress={handleDeletePress}
                        onImagePress={handleImagePress}
                    />

                    {/* Statistiques */}
                    <TripDetailsStats
                        tripStats={tripStats}
                        tripNotes={tripNotes}
                        onNavigateToFeature={handleNavigateWrapper}
                    />

                    {/* Section équipe */}
                    <TripDetailsTeam
                        trip={trip}
                        showMemberNames={showMemberNames}
                        onToggleNames={handleToggleNames}
                    />

                    {/* Feed Live d'activités */}
                    <View style={styles.feedSection}>
                        <ActivityFeed
                            activities={activityFeed || []}
                            maxItems={5}
                            showHeader={true}
                            tripId={tripId}
                            onSeeAll={() =>
                                navigation.navigate("FeedDetails", { tripId })
                            }
                        />
                    </View>

                    <View style={styles.bottomSpacing} />
                </Animated.ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    mainContent: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    bottomSpacing: {
        height: 40,
    },

    // États de chargement et d'erreur
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F8FAFC",
    },
    loadingText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F8FAFC",
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FF6B6B",
        marginBottom: 16,
        marginTop: 16,
    },
    errorText: {
        fontSize: 14,
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        padding: 12,
        backgroundColor: "#7ED957",
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    redirectText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        fontStyle: "italic",
        marginTop: 10,
    },
    feedSection: {
        marginTop: 20,
        marginHorizontal: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default TripDetailsScreen;
