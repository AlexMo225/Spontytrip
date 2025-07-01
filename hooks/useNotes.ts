import { useRef, useState } from "react";
import { Animated, Keyboard } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "./useModal";
import { useTripSync } from "./useTripSync";
import firebaseService, { TripNote } from "../services/firebaseService";

export interface UseNotesReturn {
    trip: any;
    tripNotes: TripNote[];
    loading: boolean;
    error: string | null;
    showCreateModal: boolean;
    editingNote: TripNote | null;
    noteContent: string;
    isImportant: boolean;  
    searchQuery: string;
    refreshing: boolean;
    saving: boolean;
    filteredNotes: TripNote[];
    fadeAnim: Animated.Value;
    scaleAnim: Animated.Value;
    handleCreateNote: () => void;
    handleEditNote: (note: TripNote) => void;
    handleDeleteNote: (note: TripNote) => void;
    handleSaveNote: () => Promise<void>;
    handleCloseModal: () => void;
    handleRefresh: () => Promise<void>;
    setNoteContent: (content: string) => void;
    setIsImportant: (important: boolean) => void;
    setSearchQuery: (query: string) => void;
    formatDate: (date: Date) => string;
    getAuthorInitials: (name: string) => string;
    canEditNote: (note: TripNote) => boolean;
    user: any;
    modal: any;
}

export const useNotes = (tripId: string): UseNotesReturn => {
    const modal = useModal();
    const { user } = useAuth();
    const { trip, tripNotes, loading, error } = useTripSync(tripId);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingNote, setEditingNote] = useState<TripNote | null>(null);
    const [noteContent, setNoteContent] = useState("");
    const [isImportant, setIsImportant] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const filteredNotes = tripNotes.filter(
        (note) =>
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.createdByName.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getAuthorInitials = (name: string): string => {
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const canEditNote = (note: TripNote): boolean => {
        return firebaseService.canEditNote(note, user?.uid || "", trip?.creatorId || "");
    };

    const handleCreateNote = () => {
        setEditingNote(null);
        setNoteContent("");
        setIsImportant(false);
        setShowCreateModal(true);
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const handleEditNote = (note: TripNote) => {
        if (!canEditNote(note)) {
            modal.showError("Acces refuse", "Vous ne pouvez pas modifier cette note.");
            return;
        }
        setEditingNote(note);
        setNoteContent(note.content);
        setIsImportant(note.isImportant || false);
        setShowCreateModal(true);
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const handleDeleteNote = (note: TripNote) => {
        if (!canEditNote(note)) {
            modal.showError("Acces refuse", "Vous ne pouvez pas supprimer cette note.");
            return;
        }
        modal.showDelete(
            "Supprimer cette note ?",
            "Etes-vous sur de vouloir supprimer cette note ?",
            async () => {
                try {
                    await firebaseService.deleteNote(tripId, note.id);
                    modal.showSuccess("Note supprimee !", "La note a ete supprimee.");
                } catch (error) {
                    modal.showError("Erreur", "Impossible de supprimer la note.");
                }
            }
        );
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) {
            modal.showError("Note vide", "Votre note doit contenir du texte.");
            return;
        }
        setSaving(true);
        try {
            if (editingNote) {
                await firebaseService.updateNote(tripId, editingNote.id, noteContent.trim(), user?.uid || "", isImportant);
                modal.showSuccess("Note modifiee !", "La note a ete modifiee.");
            } else {
                await firebaseService.createNote(tripId, noteContent.trim(), user?.uid || "", user?.displayName || "Utilisateur", isImportant);
                modal.showSuccess("Note creee !", "La note a ete creee.");
            }
            handleCloseModal();
        } catch (error) {
            modal.showError("Erreur", "Impossible de sauvegarder la note.");
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        Keyboard.dismiss();
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setShowCreateModal(false);
            setEditingNote(null);
            setNoteContent("");
            setIsImportant(false);
        });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return {
        trip,
        tripNotes,
        loading,
        error,
        showCreateModal,
        editingNote,
        noteContent,
        isImportant,
        searchQuery,
        refreshing,
        saving,
        filteredNotes,
        fadeAnim,
        scaleAnim,
        handleCreateNote,
        handleEditNote,
        handleDeleteNote,
        handleSaveNote,
        handleCloseModal,
        handleRefresh,
        setNoteContent,
        setIsImportant,
        setSearchQuery,
        formatDate,
        getAuthorInitials,
        canEditNote,
        user,
        modal,
    };
};
