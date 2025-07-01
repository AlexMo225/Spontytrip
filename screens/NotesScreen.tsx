import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotes } from "../hooks/useNotes";
import { useNotesStyles  } from "../styles/screens";
import { TripNote } from "../services/firebaseService";
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
    const { tripId } = route.params;
    const notes = useNotes(tripId);
    const styles = useNotesStyles();

    React.useEffect(() => {
        if (
            (notes.error === "Voyage introuvable" ||
                notes.error === "Accès non autorisé à ce voyage" ||
                notes.error === "Voyage supprimé") &&
            !notes.loading
        ) {
            const timer = setTimeout(() => {
                navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [notes.error, navigation, notes.loading]);

    const renderNoteCard = ({ item: note }: { item: TripNote }) => (
        <Animated.View
            style={[
                styles.noteCard,
                {
                    transform: [{ scale: notes.fadeAnim }],
                    opacity: notes.fadeAnim,
                },
            ]}
        >
            <View style={styles.noteHeader}>
                <View style={styles.authorInfo}>
                    <View
                        style={[
                            styles.authorAvatar,
                            {
                                backgroundColor:
                                    note.createdBy === notes.user?.uid
                                        ? "#10B981"
                                        : "#6366F1",
                            },
                        ]}
                    >
                        <Text style={styles.authorInitials}>
                            {notes.getAuthorInitials(note.createdByName)}
                        </Text>
                    </View>
                    <View style={styles.authorDetails}>
                        <Text style={styles.authorName}>
                            {note.createdBy === notes.user?.uid
                                ? "Créé par toi"
                                : note.createdByName}
                        </Text>
                        <Text style={styles.noteDate}>
                            {note.updatedAt.getTime() !==
                            note.createdAt.getTime()
                                ? `Modifié le ${notes.formatDate(
                                      note.updatedAt
                                  )}`
                                : `Créé le ${notes.formatDate(note.createdAt)}`}
                        </Text>
                    </View>
                </View>

                <View style={styles.noteActions}>
                    {note.isImportant && (
                        <View style={styles.importantBadge}>
                            <Ionicons name="star" size={16} color="#F59E0B" />
                        </View>
                    )}
                    {notes.canEditNote(note) && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => notes.handleEditNote(note)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="pencil"
                                    size={16}
                                    color="#3B82F6"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => notes.handleDeleteNote(note)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="trash"
                                    size={16}
                                    color="#EF4444"
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.noteContentContainer}>
                <Text style={styles.noteContent}>{note.content}</Text>
            </View>
        </Animated.View>
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
                onPress={notes.handleCreateNote}
                activeOpacity={0.7}
            >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Ajouter une note</Text>
            </TouchableOpacity>
        </View>
    );

    if (notes.loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>
                        Chargement des notes...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (notes.error && notes.error !== "Voyage introuvable") {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>❌</Text>
                    <Text style={styles.errorTitle}>Oups !</Text>
                    <Text style={styles.errorText}>
                        {notes.error || "Impossible de charger les notes"}
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

    if (!notes.trip) return null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Notes</Text>
                    <Text style={styles.headerSubtitle}>
                        {notes.trip.title} • {notes.tripNotes.length} note
                        {notes.tripNotes.length > 1 ? "s" : ""}
                    </Text>
                </View>
            </View>

            {notes.tripNotes.length > 0 && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher dans les notes..."
                            value={notes.searchQuery}
                            onChangeText={notes.setSearchQuery}
                            placeholderTextColor="#9CA3AF"
                        />
                        {notes.searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => notes.setSearchQuery("")}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {notes.filteredNotes.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={notes.filteredNotes}
                    renderItem={renderNoteCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={notes.refreshing}
                            onRefresh={notes.handleRefresh}
                            colors={["#10B981"]}
                            tintColor="#10B981"
                        />
                    }
                />
            )}

            <TouchableOpacity
                style={styles.floatingAddButton}
                onPress={notes.handleCreateNote}
                activeOpacity={0.7}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <Modal
                visible={notes.showCreateModal}
                transparent={true}
                animationType="fade"
                onRequestClose={notes.handleCloseModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
                >
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            { transform: [{ scale: notes.scaleAnim }] },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {notes.editingNote
                                    ? "Modifier la note"
                                    : "Nouvelle note"}
                            </Text>
                            <TouchableOpacity
                                onPress={notes.handleCloseModal}
                                activeOpacity={0.7}
                            >
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
                                placeholder="Écrivez votre note ici..."
                                value={notes.noteContent}
                                onChangeText={notes.setNoteContent}
                                multiline
                                textAlignVertical="top"
                                placeholderTextColor="#9CA3AF"
                                autoFocus
                            />

                            <TouchableOpacity
                                style={styles.importantToggle}
                                onPress={() =>
                                    notes.setIsImportant(!notes.isImportant)
                                }
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={
                                        notes.isImportant
                                            ? "star"
                                            : "star-outline"
                                    }
                                    size={24}
                                    color={
                                        notes.isImportant
                                            ? "#F59E0B"
                                            : "#9CA3AF"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.importantText,
                                        notes.isImportant &&
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
                                onPress={notes.handleCloseModal}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    (!notes.noteContent.trim() ||
                                        notes.saving) &&
                                        styles.saveButtonDisabled,
                                ]}
                                onPress={notes.handleSaveNote}
                                disabled={
                                    !notes.noteContent.trim() || notes.saving
                                }
                                activeOpacity={0.7}
                            >
                                {notes.saving ? (
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
                                            {notes.editingNote
                                                ? "Modifier"
                                                : "Créer"}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default NotesScreen;
