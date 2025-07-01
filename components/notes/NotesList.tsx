import React from "react";
import { Animated, FlatList, RefreshControl } from "react-native";
import { TripNote } from "../../services/firebaseService";
import { NoteCard } from "./NoteCard";

interface NotesListProps {
    notes: TripNote[];
    user: any;
    refreshing: boolean;
    fadeAnim: Animated.Value;
    canEditNote: (note: TripNote) => boolean;
    formatDate: (date: Date) => string;
    getAuthorInitials: (name: string) => string;
    onRefresh: () => Promise<void>;
    onEdit: (note: TripNote) => void;
    onDelete: (note: TripNote) => void;
}

export const NotesList: React.FC<NotesListProps> = ({
    notes,
    user,
    refreshing,
    fadeAnim,
    canEditNote,
    formatDate,
    getAuthorInitials,
    onRefresh,
    onEdit,
    onDelete,
}) => {
    const renderNote = ({ item }: { item: TripNote }) => (
        <NoteCard
            note={item}
            user={user}
            canEditNote={canEditNote}
            formatDate={formatDate}
            getAuthorInitials={getAuthorInitials}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <FlatList
                data={notes}
                renderItem={renderNote}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#10B981"]}
                        tintColor="#10B981"
                    />
                }
            />
        </Animated.View>
    );
};
