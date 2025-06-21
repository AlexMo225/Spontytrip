import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
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
    const { trip, notes, loading, error } = useTripSync(tripId);

    const [isEditing, setIsEditing] = useState(false);
    const [localContent, setLocalContent] = useState("");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Synchroniser le contenu local avec Firebase
    useEffect(() => {
        if (notes?.content !== undefined) {
            setLocalContent(notes.content);
            setHasUnsavedChanges(false);
        }
    }, [notes]);

    const handleContentChange = (text: string) => {
        setLocalContent(text);
        setHasUnsavedChanges(text !== (notes?.content || ""));
    };

    const handleSave = async () => {
        if (!hasUnsavedChanges) return;

        try {
            // Sauvegarder dans Firebase
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            await firebaseService.updateNotes(
                tripId,
                localContent,
                user?.uid || "",
                user?.displayName || user?.email || "Utilisateur"
            );

            setHasUnsavedChanges(false);
            setIsEditing(false);
            Keyboard.dismiss();
        } catch (error) {
            console.error("Erreur sauvegarde notes:", error);
            Alert.alert("Erreur", "Impossible de sauvegarder les notes");
        }
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            Alert.alert(
                "Modifications non sauvegardées",
                "Voulez-vous vraiment annuler vos modifications ?",
                [
                    { text: "Continuer l'édition", style: "cancel" },
                    {
                        text: "Annuler les modifications",
                        style: "destructive",
                        onPress: () => {
                            setLocalContent(notes?.content || "");
                            setHasUnsavedChanges(false);
                            setIsEditing(false);
                            Keyboard.dismiss();
                        },
                    },
                ]
            );
        } else {
            setIsEditing(false);
            Keyboard.dismiss();
        }
    };

    const handleStartEditing = () => {
        setIsEditing(true);
    };

    const formatLastUpdate = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return "À l'instant";
        if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        return `Il y a ${diffDays}j`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7ED957" />
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
                    <Ionicons
                        name="alert-circle-outline"
                        size={64}
                        color="#FF6B6B"
                    />
                    <Text style={styles.errorTitle}>Erreur</Text>
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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notes</Text>

                {isEditing ? (
                    <View style={styles.editActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                !hasUnsavedChanges && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={!hasUnsavedChanges}
                        >
                            <Text style={styles.saveButtonText}>
                                {hasUnsavedChanges
                                    ? "Sauvegarder"
                                    : "Sauvegardé"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleStartEditing}
                    >
                        <Ionicons
                            name="create-outline"
                            size={24}
                            color="#7ED957"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {/* Notes Content */}
                <View style={styles.notesCard}>
                    {isEditing ? (
                        <TextInput
                            style={styles.notesInput}
                            value={localContent}
                            onChangeText={handleContentChange}
                            placeholder="Ajoutez vos notes de voyage ici...

Idées de contenu :
• Informations importantes sur la destination
• Numéros de téléphone utiles
• Adresses de restaurants recommandés
• Activités à ne pas manquer
• Notes de frais et budgets
• Souvenirs de voyage"
                            placeholderTextColor={Colors.textSecondary}
                            multiline={true}
                            textAlignVertical="top"
                            autoFocus={true}
                        />
                    ) : (
                        <View style={styles.notesDisplay}>
                            {localContent ? (
                                <Text style={styles.notesDisplay}>
                                    {localContent}
                                </Text>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Ionicons
                                        name="document-text-outline"
                                        size={64}
                                        color="#E5E7EB"
                                    />
                                    <Text style={styles.emptyTitle}>
                                        Aucune note
                                    </Text>
                                    <Text style={styles.emptyText}>
                                        Commencez par ajouter vos premières
                                        notes de voyage
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.emptyButton}
                                        onPress={handleStartEditing}
                                    >
                                        <Text style={styles.emptyButtonText}>
                                            Ajouter des notes
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>

            {/* Meta Info Footer */}
            {notes?.updatedAt && notes?.updatedByName && !isEditing && (
                <View style={styles.metaInfo}>
                    <View style={styles.metaCard}>
                        <View style={styles.metaRow}>
                            <Ionicons
                                name="person-outline"
                                size={16}
                                color="#6B7280"
                            />
                            <Text style={styles.metaText}>
                                Modifié par {notes.updatedByName}
                            </Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color="#6B7280"
                            />
                            <Text style={styles.metaText}>
                                {formatLastUpdate(new Date(notes.updatedAt))}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Floating Action Button (when not editing) */}
            {!isEditing && localContent && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleStartEditing}
                >
                    <Ionicons name="create" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            )}
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
        fontFamily: "Inter_400Regular",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        backgroundColor: "#F8F9FA",
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FF6B6B",
        marginTop: 16,
        marginBottom: 8,
        fontFamily: "Inter_600SemiBold",
    },
    errorText: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
        marginBottom: 24,
        fontFamily: "Inter_400Regular",
    },
    retryButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
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
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 16,
        fontFamily: "Inter_600SemiBold",
    },
    editActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6B7280",
        fontFamily: "Inter_500Medium",
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "#7ED957",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    saveButtonDisabled: {
        backgroundColor: "#D1D5DB",
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: "Inter_600SemiBold",
    },
    editButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#7ED957",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    notesCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    notesInput: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: "#1F2937",
        textAlignVertical: "top",
        fontFamily: "Inter_400Regular",
    },
    notesDisplay: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: "#1F2937",
        fontFamily: "Inter_400Regular",
    },
    notesText: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        lineHeight: 24,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#6B7280",
        marginTop: 24,
        marginBottom: 12,
        textAlign: "center",
        fontFamily: "Inter_600SemiBold",
    },
    emptyText: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
        fontFamily: "Inter_400Regular",
    },
    emptyButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#7ED957",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: Spacing.xl,
        right: Spacing.xl,
    },
    metaInfo: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        backgroundColor: "#F8F9FA",
    },
    metaCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    metaIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    metaText: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: "Inter_400Regular",
    },
    metaValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1F2937",
        fontFamily: "Inter_500Medium",
    },
    unsavedIndicator: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#F59E0B",
    },
});

export default NotesScreen;
