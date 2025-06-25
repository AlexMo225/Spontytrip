import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Keyboard,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "../constants/Fonts";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
import firebaseService, { TripNote } from "../services/firebaseService";
import { RootStackParamList } from "../types";

type NotesScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Notes"
>;
type NotesScreenRouteProp = RouteProp<RootStackParamList, "Notes">;

interface Props {
    navigation: NotesScreenNavigationProp;
    route: NotesScreenRouteProp;
}

const NotesScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, tripNotes, loading, error } = useTripSync(tripId);

    // États locaux
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingNote, setEditingNote] = useState<TripNote | null>(null);
    const [noteContent, setNoteContent] = useState("");
    const [isImportant, setIsImportant] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;

    // Redirection automatique silencieuse si le voyage est supprimé
    React.useEffect(() => {
        if (
            (error === "Voyage introuvable" ||
                error === "Accès non autorisé à ce voyage" ||
                error === "Voyage supprimé") &&
            !loading
        ) {
            console.log(
                "🚨 NotesScreen - Redirection automatique - voyage supprimé"
            );

            const timer = setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainApp" }],
                });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [error, navigation, loading]);

    // Fonction pour afficher un message de succès
    const showSuccessMessage = (message: string) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert("Succès", message);
        }
    };

    // Fonction pour formater la date de manière lisible
    const formatDate = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return "À l'instant";
        if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;

        // Format complet pour les dates plus anciennes
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getAuthorInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const canEditNote = (note: TripNote): boolean => {
        return firebaseService.canEditNote(
            note,
            user?.uid || "",
            trip?.creatorId || ""
        );
    };

    const filteredNotes = tripNotes.filter(
        (note) =>
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.createdByName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateNote = () => {
        setEditingNote(null);
        setNoteContent("");
        setIsImportant(false);
        setShowCreateModal(true);

        // Animation d'ouverture
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const handleEditNote = (note: TripNote) => {
        if (!canEditNote(note)) {
            Alert.alert(
                "Accès refusé",
                "Vous ne pouvez modifier que vos propres notes."
            );
            return;
        }

        setEditingNote(note);
        setNoteContent(note.content);
        setIsImportant(note.isImportant || false);
        setShowCreateModal(true);

        // Animation d'ouverture
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const handleDeleteNote = (note: TripNote) => {
        if (!canEditNote(note)) {
            Alert.alert(
                "Accès refusé",
                "Vous ne pouvez supprimer que vos propres notes."
            );
            return;
        }

        Alert.alert(
            "Supprimer cette note ?",
            `Êtes-vous sûr de vouloir supprimer définitivement cette note ?\n\n"${note.content.substring(
                0,
                50
            )}${note.content.length > 50 ? "..." : ""}"`,
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
                            await firebaseService.deleteNote(tripId, note.id);

                            // Logger l'activité de suppression
                            try {
                                await firebaseService.retryLogActivity(
                                    tripId,
                                    user?.uid || "",
                                    user?.displayName ||
                                        user?.email ||
                                        "Utilisateur",
                                    "note_delete",
                                    {}
                                );
                            } catch (logError) {
                                console.error(
                                    "Erreur logging suppression note:",
                                    logError
                                );
                            }

                            showSuccessMessage("Note supprimée avec succès");
                        } catch (error) {
                            Alert.alert(
                                "Erreur",
                                "Impossible de supprimer la note"
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) {
            Alert.alert(
                "Erreur",
                "Le contenu de la note ne peut pas être vide"
            );
            return;
        }

        setSaving(true);
        try {
            if (editingNote) {
                // Modification d'une note existante
                await firebaseService.updateNote(
                    tripId,
                    editingNote.id,
                    noteContent.trim(),
                    user?.uid || "",
                    isImportant
                );
                showSuccessMessage("Note modifiée avec succès");
            } else {
                // Création d'une nouvelle note
                await firebaseService.createNote(
                    tripId,
                    noteContent.trim(),
                    user?.uid || "",
                    user?.displayName || user?.email || "Utilisateur",
                    isImportant
                );

                // Logger l'activité pour nouvelle note
                try {
                    await firebaseService.retryLogActivity(
                        tripId,
                        user?.uid || "",
                        user?.displayName || user?.email || "Utilisateur",
                        "note_add",
                        { isImportant }
                    );
                } catch (logError) {
                    console.error("Erreur logging note:", logError);
                }

                showSuccessMessage("Note créée avec succès");
            }

            handleCloseModal();
        } catch (error) {
            Alert.alert("Erreur", "Impossible de sauvegarder la note");
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        // Animation de fermeture
        Animated.spring(scaleAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start(() => {
            setShowCreateModal(false);
            setEditingNote(null);
            setNoteContent("");
            setIsImportant(false);
            Keyboard.dismiss();
        });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        // La synchronisation se fait automatiquement via useTripSync
        setTimeout(() => setRefreshing(false), 1000);
    };

    const renderNoteCard = ({ item: note }: { item: TripNote }) => (
        <View style={styles.noteCard}>
            {/* Header de la note */}
            <View style={styles.noteHeader}>
                <View style={styles.authorInfo}>
                    <View
                        style={[
                            styles.authorAvatar,
                            {
                                backgroundColor:
                                    note.createdBy === user?.uid
                                        ? "#10B981"
                                        : "#6366F1",
                            },
                        ]}
                    >
                        <Text style={styles.authorInitials}>
                            {getAuthorInitials(note.createdByName)}
                        </Text>
                    </View>
                    <View style={styles.authorDetails}>
                        <Text style={styles.authorName}>
                            {note.createdBy === user?.uid
                                ? "Créé par toi"
                                : note.createdByName}
                        </Text>
                        <Text style={styles.noteDate}>
                            {note.updatedAt.getTime() !==
                            note.createdAt.getTime()
                                ? `Modifié ${formatDate(note.updatedAt)}`
                                : `Créé ${formatDate(note.createdAt)}`}
                        </Text>
                    </View>
                </View>

                {/* Actions et badge important */}
                <View style={styles.noteActions}>
                    {note.isImportant && (
                        <View style={styles.importantBadge}>
                            <Text style={styles.importantStar}>⭐</Text>
                        </View>
                    )}

                    {canEditNote(note) && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => handleEditNote(note)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.editIcon}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteNote(note)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.deleteIcon}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* Contenu de la note avec padding amélioré */}
            <View style={styles.noteContentContainer}>
                <Text style={styles.noteContent}>{note.content}</Text>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>Aucune note pour ce voyage</Text>
            <Text style={styles.emptySubtitle}>Ajoute la première !</Text>
            <Text style={styles.emptyDescription}>
                Partagez vos idées, informations importantes et souvenirs avec
                votre groupe.
            </Text>
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateNote}
            >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Ajouter une note</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>
                        Chargement des notes...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !trip) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>📝</Text>
                    <Text style={styles.errorTitle}>Oups !</Text>
                    <Text style={styles.errorText}>
                        {error || "Impossible de charger les notes"}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Notes</Text>
                        <Text style={styles.headerSubtitle}>
                            {trip.title} • {tripNotes.length} note
                            {tripNotes.length > 1 ? "s" : ""}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Barre de recherche */}
            {tripNotes.length > 0 && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher dans les notes..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#9CA3AF"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery("")}
                            >
                                <Ionicons
                                    name="close"
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Liste des notes */}
            <FlatList
                data={filteredNotes}
                renderItem={renderNoteCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={["#10B981"]}
                        tintColor="#10B981"
                    />
                }
                ListEmptyComponent={renderEmptyState}
            />

            {/* Bouton d'ajout flottant */}
            <TouchableOpacity
                style={styles.floatingAddButton}
                onPress={handleCreateNote}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Modal de création/édition */}
            <Modal
                visible={showCreateModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            { transform: [{ scale: scaleAnim }] },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingNote
                                    ? "Modifier la note"
                                    : "Nouvelle note"}
                            </Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <TextInput
                                style={styles.noteInput}
                                value={noteContent}
                                onChangeText={setNoteContent}
                                placeholder="Écrivez votre note ici...

💡 Idées :
• Informations importantes
• Numéros utiles
• Recommandations
• Souvenirs de voyage"
                                placeholderTextColor="#9CA3AF"
                                multiline={true}
                                textAlignVertical="top"
                                autoFocus={true}
                            />

                            <TouchableOpacity
                                style={styles.importantToggle}
                                onPress={() => setIsImportant(!isImportant)}
                            >
                                <Ionicons
                                    name={isImportant ? "star" : "star-outline"}
                                    size={20}
                                    color={isImportant ? "#F59E0B" : "#9CA3AF"}
                                />
                                <Text
                                    style={[
                                        styles.importantText,
                                        isImportant &&
                                            styles.importantTextActive,
                                    ]}
                                >
                                    Marquer comme importante
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCloseModal}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    (!noteContent.trim() || saving) &&
                                        styles.saveButtonDisabled,
                                ]}
                                onPress={handleSaveNote}
                                disabled={!noteContent.trim() || saving}
                            >
                                {saving ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="checkmark"
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.saveButtonText}>
                                            {editingNote ? "Modifier" : "Créer"}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#637887",
        fontFamily: Fonts.body.family,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        backgroundColor: "#F8F9FA",
    },
    errorEmoji: {
        fontSize: 64,
        color: "#FF6B6B",
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FF6B6B",
        marginTop: 16,
        marginBottom: 8,
        fontFamily: Fonts.heading.family,
    },
    errorText: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
        marginBottom: 24,
        fontFamily: Fonts.body.family,
    },
    retryButton: {
        backgroundColor: "#10B981",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: Fonts.body.family,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#F8F9FA",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitleContainer: {
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        fontFamily: Fonts.heading.family,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: Fonts.body.family,
    },
    floatingAddButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#F8F9FA",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#374151",
        fontFamily: Fonts.body.family,
    },
    listContainer: {
        padding: 20,
    },
    noteCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 0,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    noteHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    authorInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    authorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    authorDetails: {
        marginLeft: 12,
    },
    authorInitials: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        fontFamily: Fonts.body.family,
    },
    authorName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        fontFamily: Fonts.heading.family,
    },
    noteDate: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: Fonts.body.family,
    },
    noteActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    importantBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "#F59E0B",
        borderRadius: 12,
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    noteContent: {
        fontSize: 16,
        lineHeight: 24,
        color: "#374151",
        fontFamily: Fonts.body.family,
    },
    noteContentContainer: {
        padding: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
        textAlign: "center",
        fontFamily: Fonts.heading.family,
    },
    emptySubtitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#10B981",
        marginBottom: 16,
        textAlign: "center",
        fontFamily: Fonts.heading.family,
    },
    emptyDescription: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
        fontFamily: Fonts.body.family,
    },
    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#10B981",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: Fonts.body.family,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 16,
        width: "90%",
        maxWidth: 500,
        maxHeight: "80%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        fontFamily: Fonts.heading.family,
    },
    modalContent: {
        marginBottom: 20,
    },
    noteInput: {
        fontSize: 16,
        lineHeight: 24,
        color: "#374151",
        fontFamily: Fonts.body.family,
        textAlignVertical: "top",
        minHeight: 120,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        backgroundColor: "#F9FAFB",
    },
    importantToggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
    },
    importantText: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: Fonts.body.family,
    },
    importantTextActive: {
        fontWeight: "600",
        color: "#F59E0B",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#6B7280",
        fontFamily: Fonts.body.family,
    },
    saveButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#10B981",
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: "#D1D5DB",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: Fonts.body.family,
    },
    editIcon: {
        fontSize: 16,
    },
    deleteIcon: {
        fontSize: 16,
    },
    importantStar: {
        fontSize: 16,
        color: "#FFFFFF",
    },
});

export default NotesScreen;
