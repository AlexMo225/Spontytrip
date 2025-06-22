import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
import { RootStackParamList } from "../types";

const { width: screenWidth } = Dimensions.get("window");

type TripDetailsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "TripDetails"
>;
type TripDetailsScreenRouteProp = RouteProp<RootStackParamList, "TripDetails">;

interface Props {
    navigation: TripDetailsScreenNavigationProp;
    route: TripDetailsScreenRouteProp;
}

interface TripMember {
    id: string;
    name: string;
    avatar: string;
    role: "creator" | "member";
}

interface TripStats {
    checklistProgress: number;
    totalExpenses: number;
    myExpenses: number;
    activitiesCount: number;
    notesUpdated: string;
    daysUntilTrip: number;
}

const TripDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, checklist, expenses, notes, activities, loading, error } =
        useTripSync(tripId);
    const insets = useSafeAreaInsets();

    const scrollY = useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState("overview");

    // Calculer les statistiques en temps réel
    const getChecklistProgress = (): number => {
        if (!checklist?.items || checklist.items.length === 0) return 0;
        const completed = checklist.items.filter(
            (item) => item.isCompleted
        ).length;
        return Math.round((completed / checklist.items.length) * 100);
    };

    const getTotalExpenses = (): number => {
        if (!expenses?.expenses) return 0;
        return expenses.expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );
    };

    const getMyExpenses = (): number => {
        if (!expenses?.expenses || !user) return 0;
        return expenses.expenses
            .filter((expense) => expense.paidBy === user.uid)
            .reduce((total, expense) => total + expense.amount, 0);
    };

    const getActivitiesCount = (): number => {
        return activities?.activities?.length || 0;
    };

    const getDaysUntilTrip = (): number => {
        if (!trip || !trip.startDate) return 0;

        try {
            const today = new Date();
            const tripDate =
                trip.startDate instanceof Date
                    ? trip.startDate
                    : new Date(trip.startDate);

            // Vérifier que la date est valide
            if (isNaN(tripDate.getTime())) {
                return 0;
            }

            const diffTime = tripDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        } catch (error) {
            console.error("Erreur calcul jours restants:", error);
            return 0;
        }
    };

    const formatLastUpdate = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return "À l'instant";
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        return `Il y a ${diffDays}j`;
    };

    const isCreator = trip?.creatorId === user?.uid;

    const handleNavigateToFeature = (feature: string) => {
        switch (feature) {
            case "Checklist":
                navigation.navigate("Checklist", { tripId });
                break;
            case "Expenses":
                navigation.navigate("Expenses", { tripId });
                break;
            case "Activities":
                navigation.navigate("Activities", { tripId });
                break;
            case "Notes":
                navigation.navigate("Notes", { tripId });
                break;
        }
    };

    const handleDeleteTrip = () => {
        if (!isCreator) {
            Alert.alert("Erreur", "Seul le créateur peut supprimer le voyage");
            return;
        }

        Alert.alert(
            "Supprimer le voyage",
            `Êtes-vous sûr de vouloir supprimer "${trip?.title}" ?\n\nCette action est irréversible et supprimera :\n• Toutes les checklists\n• Toutes les dépenses\n• Toutes les notes\n• Toutes les activités`,
            [
                {
                    text: "Annuler",
                    style: "cancel",
                },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const firebaseService = (
                                await import("../services/firebaseService")
                            ).default;
                            await firebaseService.deleteTrip(
                                tripId,
                                user?.uid || ""
                            );

                            Alert.alert(
                                "Voyage supprimé",
                                "Le voyage a été supprimé avec succès",
                                [
                                    {
                                        text: "OK",
                                        onPress: () => {
                                            // Retour à l'écran principal avec reset de navigation
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: "MainApp" }],
                                            });
                                        },
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error("Erreur suppression voyage:", error);
                            Alert.alert(
                                "Erreur",
                                "Impossible de supprimer le voyage"
                            );
                        }
                    },
                },
            ]
        );
    };

    const updateCoverImage = async (newImageUri: string | null) => {
        try {
            console.log("📸 Début updateCoverImage:", { newImageUri, tripId });
            let imageUrl = null;

            if (newImageUri) {
                console.log("🔄 Upload de l'image vers Firebase Storage...");
                // Upload de l'image vers Firebase Storage
                const { ImageService } = await import(
                    "../services/imageService"
                );
                const uploadResult = await ImageService.uploadTripCoverImage(
                    tripId,
                    newImageUri
                );

                console.log("📤 Résultat upload:", uploadResult);

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || "Erreur d'upload");
                }

                imageUrl = uploadResult.url;
                console.log("✅ URL de l'image uploadée:", imageUrl);

                // Supprimer l'ancienne image si elle existe
                if (trip?.coverImage) {
                    console.log(
                        "🗑️ Suppression ancienne image:",
                        trip.coverImage
                    );
                    ImageService.deleteTripCoverImage(trip.coverImage).catch(
                        (error: any) => {
                            console.warn(
                                "⚠️ Impossible de supprimer l'ancienne image:",
                                error
                            );
                        }
                    );
                }
            } else if (trip?.coverImage) {
                console.log(
                    "🗑️ Suppression de la photo existante:",
                    trip.coverImage
                );
                // Suppression de la photo existante
                const { ImageService } = await import(
                    "../services/imageService"
                );
                ImageService.deleteTripCoverImage(trip.coverImage).catch(
                    (error: any) => {
                        console.warn(
                            "⚠️ Impossible de supprimer l'image:",
                            error
                        );
                    }
                );
            }

            // Mettre à jour le document du voyage avec la nouvelle URL
            console.log(
                "💾 Mise à jour du document Firestore avec URL:",
                imageUrl
            );
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            await firebaseService.updateTripCoverImage(
                tripId,
                imageUrl || null,
                user?.uid || ""
            );

            console.log("✅ Document Firestore mis à jour avec succès");

            Alert.alert(
                "Photo mise à jour",
                imageUrl
                    ? "La photo de couverture a été mise à jour avec succès"
                    : "La photo de couverture a été supprimée"
            );
        } catch (error) {
            console.error("❌ Erreur mise à jour photo:", error);
            Alert.alert(
                "Erreur",
                "Impossible de mettre à jour la photo de couverture"
            );
        }
    };

    // Hook pour la redirection automatique en cas d'erreur - TOUJOURS appelé
    React.useEffect(() => {
        if (
            (error === "Voyage introuvable" ||
                error === "Accès non autorisé à ce voyage") &&
            !loading
        ) {
            const timer = setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainApp" }],
                });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error, navigation, loading]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
                <Text style={styles.loadingText}>Chargement du voyage...</Text>
            </View>
        );
    }

    if (error || !trip) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons
                    name="alert-circle-outline"
                    size={64}
                    color="#FF6B6B"
                />
                <Text style={styles.errorTitle}>Erreur</Text>
                <Text style={styles.errorText}>
                    {error || "Voyage introuvable"}
                </Text>
                {error === "Voyage introuvable" ||
                error === "Accès non autorisé à ce voyage" ? (
                    <Text style={styles.redirectText}>
                        Redirection automatique...
                    </Text>
                ) : (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Retour</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    const formatDates = (
        startDate: Date | any,
        endDate: Date | any
    ): string => {
        try {
            // S'assurer qu'on a des objets Date valides
            const start =
                startDate instanceof Date ? startDate : new Date(startDate);
            const end = endDate instanceof Date ? endDate : new Date(endDate);

            // Vérifier que les dates sont valides
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return "Dates non définies";
            }

            const options: Intl.DateTimeFormatOptions = {
                day: "numeric",
                month: "long",
            };

            return `${start.toLocaleDateString(
                "fr-FR",
                options
            )} - ${end.toLocaleDateString(
                "fr-FR",
                options
            )} ${end.getFullYear()}`;
        } catch (error) {
            console.error("Erreur formatage dates:", error);
            return "Dates invalides";
        }
    };

    const calculateDuration = (
        startDate: Date | any,
        endDate: Date | any
    ): string => {
        try {
            // S'assurer qu'on a des objets Date valides
            const start =
                startDate instanceof Date ? startDate : new Date(startDate);
            const end = endDate instanceof Date ? endDate : new Date(endDate);

            // Vérifier que les dates sont valides
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return "0 jour";
            }

            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
        } catch (error) {
            console.error("Erreur calcul durée:", error);
            return "0 jour";
        }
    };

    const tripData = {
        id: tripId,
        title: trip.destination,
        dates: formatDates(trip.startDate, trip.endDate),
        coverImage: trip.coverImage,
        location: trip.destination,
        duration: calculateDuration(trip.startDate, trip.endDate),
    };

    const mockMembers: TripMember[] = trip.members.map((member) => ({
        id: member.userId,
        name:
            member.userId === user?.uid
                ? "Vous"
                : member.name || member.email || "Membre",
        avatar:
            member.avatar ||
            `https://i.pravatar.cc/150?img=${
                Math.abs((member.userId || "default").charCodeAt(0) % 70) + 1
            }`,
        role: member.userId === trip.creatorId ? "creator" : "member",
    }));

    const tripStats: TripStats = {
        checklistProgress: getChecklistProgress(),
        totalExpenses: getTotalExpenses(),
        myExpenses: getMyExpenses(),
        activitiesCount: getActivitiesCount(),
        notesUpdated: formatLastUpdate(new Date(trip.updatedAt)),
        daysUntilTrip: getDaysUntilTrip(),
    };

    const tabs = [
        { id: "overview", label: "Vue d'ensemble", icon: "analytics" },
        { id: "checklist", label: "Checklist", icon: "checkbox" },
        { id: "expenses", label: "Dépenses", icon: "wallet" },
        { id: "activities", label: "Activités", icon: "calendar" },
        { id: "notes", label: "Notes", icon: "document-text" },
    ];

    const renderOverview = () => (
        <View style={styles.overviewContainer}>
            {/* Countdown Card */}
            <View style={styles.countdownCard}>
                <LinearGradient
                    colors={["#7ED957", "#4DA1A9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.countdownGradient}
                >
                    <Text style={styles.countdownNumber}>
                        {tripStats.daysUntilTrip}
                    </Text>
                    <Text style={styles.countdownLabel}>jours restants</Text>
                    <Ionicons
                        name="time"
                        size={24}
                        color="#FFFFFF"
                        style={styles.countdownIcon}
                    />
                </LinearGradient>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons name="checkbox" size={20} color="#7ED957" />
                        <Text style={styles.statTitle}>Checklist</Text>
                    </View>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${tripStats.checklistProgress}%`,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {tripStats.checklistProgress}% terminé
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => handleNavigateToFeature("Checklist")}
                    >
                        <Text style={styles.quickActionText}>
                            Voir les tâches
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#7ED957"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons name="wallet" size={20} color="#4DA1A9" />
                        <Text style={styles.statTitle}>Dépenses</Text>
                    </View>
                    <Text style={styles.statNumber}>
                        {tripStats.totalExpenses}€
                    </Text>
                    <Text style={styles.statSubtext}>
                        Mes dépenses: {tripStats.myExpenses}€
                    </Text>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => handleNavigateToFeature("Expenses")}
                    >
                        <Text style={styles.quickActionText}>Gérer budget</Text>
                        <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#4DA1A9"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons name="calendar" size={20} color="#FF6B6B" />
                        <Text style={styles.statTitle}>Activités</Text>
                    </View>
                    <Text style={styles.statNumber}>
                        {tripStats.activitiesCount}
                    </Text>
                    <Text style={styles.statSubtext}>Planifiées</Text>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => handleNavigateToFeature("Activities")}
                    >
                        <Text style={styles.quickActionText}>
                            Voir planning
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#FF6B6B"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons
                            name="document-text"
                            size={20}
                            color="#FFD93D"
                        />
                        <Text style={styles.statTitle}>Notes</Text>
                    </View>
                    <Text style={styles.statLabel}>Dernière maj</Text>
                    <Text style={styles.statSubtext}>
                        {tripStats.notesUpdated}
                    </Text>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => handleNavigateToFeature("Notes")}
                    >
                        <Text style={styles.quickActionText}>Modifier</Text>
                        <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#FFD93D"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Team Section */}
            <View style={styles.teamSection}>
                <Text style={styles.sectionTitle}>Équipe du voyage</Text>
                <View style={styles.teamMembers}>
                    {mockMembers.map((member, index) => (
                        <View
                            key={member.id}
                            style={[
                                styles.memberCard,
                                { marginLeft: index > 0 ? -12 : 0 },
                            ]}
                        >
                            <Image
                                source={{ uri: member.avatar }}
                                style={styles.memberAvatar}
                            />
                            {member.role === "creator" && (
                                <View style={styles.crownBadge}>
                                    <Ionicons
                                        name="star"
                                        size={10}
                                        color="#FFD93D"
                                    />
                                </View>
                            )}
                        </View>
                    ))}
                    <View style={styles.addMemberButton}>
                        <Ionicons name="add" size={16} color="#7ED957" />
                    </View>
                </View>
                <Text style={styles.teamSubtext}>
                    {mockMembers.length} membres
                </Text>
            </View>

            {/* Recent Activity */}
            <View style={styles.activitySection}>
                <Text style={styles.sectionTitle}>Activité récente</Text>
                <View style={styles.activityList}>
                    <View style={styles.activityItem}>
                        <View
                            style={[
                                styles.activityIcon,
                                { backgroundColor: "#7ED957" },
                            ]}
                        >
                            <Ionicons
                                name="checkbox"
                                size={16}
                                color="#FFFFFF"
                            />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityText}>
                                Sophie a ajouté 3 tâches à la checklist
                            </Text>
                            <Text style={styles.activityTime}>il y a 1h</Text>
                        </View>
                    </View>
                    <View style={styles.activityItem}>
                        <View
                            style={[
                                styles.activityIcon,
                                { backgroundColor: "#4DA1A9" },
                            ]}
                        >
                            <Ionicons name="wallet" size={16} color="#FFFFFF" />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityText}>
                                Alex a payé les billets d'avion (847€)
                            </Text>
                            <Text style={styles.activityTime}>il y a 2h</Text>
                        </View>
                    </View>
                    <View style={styles.activityItem}>
                        <View
                            style={[
                                styles.activityIcon,
                                { backgroundColor: "#FFD93D" },
                            ]}
                        >
                            <Ionicons
                                name="document-text"
                                size={16}
                                color="#FFFFFF"
                            />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityText}>
                                Clara a mis à jour les notes partagées
                            </Text>
                            <Text style={styles.activityTime}>il y a 2h</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return renderOverview();
            case "checklist":
                return renderChecklistContent();
            case "expenses":
                return renderExpensesContent();
            case "activities":
                return renderActivitiesContent();
            case "notes":
                return renderNotesContent();
            default:
                return renderOverview();
        }
    };

    const renderChecklistContent = () => (
        <View style={styles.tabContentContainer}>
            <View style={styles.quickNavCard}>
                <View style={styles.quickNavHeader}>
                    <Ionicons name="checkbox" size={24} color="#7ED957" />
                    <Text style={styles.quickNavTitle}>Checklist</Text>
                </View>
                <Text style={styles.quickNavDescription}>
                    Gérez vos tâches et préparez votre voyage
                </Text>
                <TouchableOpacity
                    style={styles.fullFeatureButton}
                    onPress={() => handleNavigateToFeature("Checklist")}
                >
                    <Text style={styles.fullFeatureButtonText}>
                        Ouvrir la checklist complète
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Mini preview checklist */}
            <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Aperçu des tâches</Text>
                <View style={styles.checklistPreview}>
                    <View style={styles.checklistItem}>
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#7ED957"
                        />
                        <Text style={styles.checklistItemText}>
                            Passeports vérifiés
                        </Text>
                    </View>
                    <View style={styles.checklistItem}>
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#7ED957"
                        />
                        <Text style={styles.checklistItemText}>
                            Billets d'avion réservés
                        </Text>
                    </View>
                    <View style={styles.checklistItem}>
                        <Ionicons
                            name="ellipse-outline"
                            size={20}
                            color="#E2E8F0"
                        />
                        <Text
                            style={[
                                styles.checklistItemText,
                                { color: "#666" },
                            ]}
                        >
                            Hébergement à confirmer
                        </Text>
                    </View>
                    <View style={styles.checklistItem}>
                        <Ionicons
                            name="ellipse-outline"
                            size={20}
                            color="#E2E8F0"
                        />
                        <Text
                            style={[
                                styles.checklistItemText,
                                { color: "#666" },
                            ]}
                        >
                            Crème solaire SPF 50+
                        </Text>
                    </View>
                </View>
                <Text style={styles.previewFooter}>
                    73% terminé • 8 tâches restantes
                </Text>
            </View>
        </View>
    );

    const renderExpensesContent = () => (
        <View style={styles.tabContentContainer}>
            <View style={styles.quickNavCard}>
                <View style={styles.quickNavHeader}>
                    <Ionicons name="wallet" size={24} color="#4DA1A9" />
                    <Text style={styles.quickNavTitle}>Dépenses</Text>
                </View>
                <Text style={styles.quickNavDescription}>
                    Suivez votre budget et partagez les frais
                </Text>
                <TouchableOpacity
                    style={[
                        styles.fullFeatureButton,
                        { backgroundColor: "#4DA1A9" },
                    ]}
                    onPress={() => handleNavigateToFeature("Expenses")}
                >
                    <Text style={styles.fullFeatureButtonText}>
                        Gérer les dépenses
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Mini preview expenses */}
            <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Dépenses récentes</Text>
                <View style={styles.expensesPreview}>
                    <View style={styles.expenseItem}>
                        <View style={styles.expenseLeft}>
                            <Text style={styles.expenseLabel}>
                                Restaurant premier soir
                            </Text>
                            <Text style={styles.expenseSubtext}>
                                Payé par Alice
                            </Text>
                        </View>
                        <Text style={styles.expenseAmount}>80€</Text>
                    </View>
                    <View style={styles.expenseItem}>
                        <View style={styles.expenseLeft}>
                            <Text style={styles.expenseLabel}>
                                Courses supermarché
                            </Text>
                            <Text style={styles.expenseSubtext}>
                                Payé par Bob
                            </Text>
                        </View>
                        <Text style={styles.expenseAmount}>45€</Text>
                    </View>
                    <View style={styles.expenseItem}>
                        <View style={styles.expenseLeft}>
                            <Text style={styles.expenseLabel}>
                                Métro journée
                            </Text>
                            <Text style={styles.expenseSubtext}>
                                Payé par Alice
                            </Text>
                        </View>
                        <Text style={styles.expenseAmount}>24€</Text>
                    </View>
                </View>
                <Text style={styles.previewFooter}>
                    Total: 149€ • Clara doit 37€ à Alice
                </Text>
            </View>
        </View>
    );

    const renderActivitiesContent = () => (
        <View style={styles.tabContentContainer}>
            <View style={styles.quickNavCard}>
                <View style={styles.quickNavHeader}>
                    <Ionicons name="calendar" size={24} color="#FF6B6B" />
                    <Text style={styles.quickNavTitle}>Activités</Text>
                </View>
                <Text style={styles.quickNavDescription}>
                    Planifiez votre itinéraire et vos visites
                </Text>
                <TouchableOpacity
                    style={[
                        styles.fullFeatureButton,
                        { backgroundColor: "#FF6B6B" },
                    ]}
                    onPress={() => handleNavigateToFeature("Activities")}
                >
                    <Text style={styles.fullFeatureButtonText}>
                        Voir le planning
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Mini preview activities */}
            <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Programme de la semaine</Text>
                <View style={styles.activitiesPreview}>
                    <View style={styles.activityDay}>
                        <Text style={styles.dayLabel}>Lun 15 Oct</Text>
                        <Text style={styles.activityName}>
                            • Arrivée & Sagrada Familia
                        </Text>
                    </View>
                    <View style={styles.activityDay}>
                        <Text style={styles.dayLabel}>Mar 16 Oct</Text>
                        <Text style={styles.activityName}>
                            • Park Güell & Barrio Gothic
                        </Text>
                    </View>
                    <View style={styles.activityDay}>
                        <Text style={styles.dayLabel}>Mer 17 Oct</Text>
                        <Text style={styles.activityName}>
                            • Plage & Cours de paella
                        </Text>
                    </View>
                    <View style={styles.activityDay}>
                        <Text style={styles.dayLabel}>Jeu 18 Oct</Text>
                        <Text style={styles.activityName}>
                            • Musées & Spectacle flamenco
                        </Text>
                    </View>
                </View>
                <Text style={styles.previewFooter}>
                    12 activités planifiées
                </Text>
            </View>
        </View>
    );

    const renderNotesContent = () => (
        <View style={styles.tabContentContainer}>
            <View style={styles.quickNavCard}>
                <View style={styles.quickNavHeader}>
                    <Ionicons name="document-text" size={24} color="#FFD93D" />
                    <Text style={styles.quickNavTitle}>Notes</Text>
                </View>
                <Text style={styles.quickNavDescription}>
                    Document collaboratif pour partager vos idées
                </Text>
                <TouchableOpacity
                    style={[
                        styles.fullFeatureButton,
                        { backgroundColor: "#FFD93D" },
                    ]}
                    onPress={() => handleNavigateToFeature("Notes")}
                >
                    <Text
                        style={[
                            styles.fullFeatureButtonText,
                            { color: "#333" },
                        ]}
                    >
                        Modifier les notes
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Mini preview notes */}
            <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Dernières notes</Text>
                <View style={styles.notesPreview}>
                    <Text style={styles.noteContent}>
                        ## 🗺️ Lieux d'intérêt{"\n"}- **Sagrada Familia** :
                        réserver en ligne{"\n"}- **Park Güell** : y aller tôt le
                        matin{"\n"}- **Barrio Gothic** : parfait pour déjeuner
                        {"\n\n"}
                        ## 📱 Contacts utiles{"\n"}- Hébergement : +34 xxx xxx
                        xxx{"\n"}- Taxi recommandé : +34 yyy yyy yyy
                    </Text>
                </View>
                <Text style={styles.previewFooter}>
                    Modifiée par Clara il y a 2h
                </Text>
            </View>
        </View>
    );

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    // DEBUG: Logs pour vérifier la synchronisation
    // console.log("🖼️ DEBUG TripDetailsScreen:");
    // console.log("- Trip ID:", tripId);
    // console.log("- User ID:", user?.uid);
    // console.log("- Is Creator:", isCreator);
    // console.log("- Cover Image:", trip.coverImage);
    // console.log("- Trip Data Cover Image:", tripData.coverImage);

    return (
        <SafeAreaView style={styles.container}>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.text.primary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{tripData.title}</Text>
                {isCreator ? (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteTrip}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={24}
                            color="#FF6B6B"
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={{ uri: tripData.coverImage }}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.7)"]}
                        style={styles.heroOverlay}
                    >
                        <View style={styles.heroButtons}>
                            <TouchableOpacity
                                style={styles.floatingBackButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons
                                    name="arrow-back"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                            {isCreator && (
                                <TouchableOpacity
                                    style={styles.floatingDeleteButton}
                                    onPress={handleDeleteTrip}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle}>
                                {tripData.title}
                            </Text>
                            <View style={styles.heroMeta}>
                                <View style={styles.heroMetaItem}>
                                    <Ionicons
                                        name="calendar"
                                        size={16}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.heroMetaText}>
                                        {tripData.dates}
                                    </Text>
                                </View>
                                <View style={styles.heroMetaItem}>
                                    <Ionicons
                                        name="location"
                                        size={16}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.heroMetaText}>
                                        {tripData.duration}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabScrollContainer}
                    >
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[
                                    styles.tab,
                                    activeTab === tab.id && styles.activeTab,
                                ]}
                                onPress={() => {
                                    if (tab.id === "overview") {
                                        setActiveTab(tab.id);
                                    } else {
                                        // Navigation directe vers les autres écrans
                                        switch (tab.id) {
                                            case "checklist":
                                                handleNavigateToFeature(
                                                    "Checklist"
                                                );
                                                break;
                                            case "expenses":
                                                handleNavigateToFeature(
                                                    "Expenses"
                                                );
                                                break;
                                            case "activities":
                                                handleNavigateToFeature(
                                                    "Activities"
                                                );
                                                break;
                                            case "notes":
                                                handleNavigateToFeature(
                                                    "Notes"
                                                );
                                                break;
                                        }
                                    }
                                }}
                            >
                                <Ionicons
                                    name={tab.icon as any}
                                    size={18}
                                    color={
                                        activeTab === tab.id
                                            ? "#FFFFFF"
                                            : "#666"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === tab.id &&
                                            styles.activeTabText,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>{renderTabContent()}</View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        zIndex: 1000,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.9)",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
        flex: 1,
        textAlign: "center",
    },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.9)",
    },
    headerSpacer: {
        width: 40,
        height: 40,
    },
    scrollView: {
        flex: 1,
    },
    heroSection: {
        height: 280,
        position: "relative",
    },
    heroImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    heroOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "space-between",
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 16,
    },
    heroButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    floatingBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-start",
    },
    floatingDeleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-start",
    },
    heroContent: {
        alignItems: "flex-start",
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 12,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    heroMeta: {
        flexDirection: "row",
        gap: 16,
    },
    heroMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    heroMetaText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    tabContainer: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        paddingTop: 8,
    },
    tabScrollContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: "#F5F7FA",
        gap: 6,
        marginBottom: 8,
    },
    activeTab: {
        backgroundColor: "#7ED957",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#666",
    },
    activeTabText: {
        color: "#FFFFFF",
    },
    tabContent: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    overviewContainer: {
        padding: 16,
        gap: 20,
    },
    countdownCard: {
        height: 120,
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 4,
    },
    countdownGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    countdownNumber: {
        fontSize: 48,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    countdownLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#FFFFFF",
        opacity: 0.9,
    },
    countdownIcon: {
        position: "absolute",
        top: 16,
        right: 16,
    },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    statHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    statTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#666",
        marginBottom: 4,
    },
    statSubtext: {
        fontSize: 12,
        color: "#666",
        marginBottom: 12,
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: "#E2E8F0",
        borderRadius: 3,
        marginBottom: 6,
    },
    progressFill: {
        height: 6,
        backgroundColor: "#7ED957",
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#7ED957",
    },
    quickAction: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#666",
    },
    teamSection: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    teamMembers: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    memberCard: {
        position: "relative",
    },
    memberAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    crownBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFD93D",
    },
    addMemberButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F0F2F5",
        borderWidth: 2,
        borderColor: "#7ED957",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    teamSubtext: {
        fontSize: 12,
        color: "#666",
    },
    activitySection: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    activityList: {
        gap: 12,
    },
    activityItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: 14,
        color: "#333",
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 12,
        color: "#666",
    },
    placeholderContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    placeholderTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginTop: 16,
        marginBottom: 8,
    },
    placeholderText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        maxWidth: 250,
    },
    bottomSpacing: {
        height: 40,
    },
    tabContentContainer: {
        padding: 16,
        gap: 20,
    },
    quickNavCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    quickNavHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    quickNavTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    quickNavDescription: {
        fontSize: 12,
        color: "#666",
        marginBottom: 12,
    },
    fullFeatureButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#7ED957",
        borderRadius: 12,
    },
    fullFeatureButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    previewCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    checklistPreview: {
        gap: 12,
    },
    checklistItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    checklistItemText: {
        fontSize: 14,
        color: "#333",
    },
    previewFooter: {
        fontSize: 12,
        color: "#666",
        marginTop: 12,
    },
    expensesPreview: {
        gap: 8,
    },
    expenseItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    expenseLeft: {
        flex: 1,
    },
    expenseLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    expenseSubtext: {
        fontSize: 12,
        color: "#666",
    },
    expenseAmount: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
    },
    activitiesPreview: {
        gap: 8,
    },
    activityDay: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333",
    },
    activityName: {
        fontSize: 14,
        color: "#333",
    },
    notesPreview: {
        marginBottom: 12,
    },
    noteContent: {
        fontSize: 12,
        color: "#333",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
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
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FF6B6B",
        marginBottom: 16,
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
});

export default TripDetailsScreen;
