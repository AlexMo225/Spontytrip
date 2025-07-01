import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { TripMember } from "../../services/firebaseService";
import { ChecklistItem as ChecklistItemType } from "../../types";
import { ChecklistItem } from "./ChecklistItem";

interface ChecklistCategorySectionProps {
    category: string;
    items: ChecklistItemType[];
    members: TripMember[];
    currentUserId: string;
    isCreator: boolean;
    onToggleItem: (itemId: string) => void;
    onAssignItem: (itemId: string) => void;
    onDeleteItem: (itemId: string) => void;
    getMemberColor: (memberId: string) => string;
}

/**
 * 📋 Section de catégorie pour la checklist
 */
export const ChecklistCategorySection: React.FC<
    ChecklistCategorySectionProps
> = ({
    category,
    items,
    members,
    currentUserId,
    isCreator,
    onToggleItem,
    onAssignItem,
    onDeleteItem,
    getMemberColor,
}) => {
    const getCategoryColor = (categoryName: string) => {
        const colors: { [key: string]: string } = {
            essentials: Colors.primary,
            documents: Colors.secondary,
            clothing: Colors.success,
            tech: Colors.warning,
            health: Colors.error,
            food: Colors.info,
            activities: Colors.accent,
            transport: Colors.warning,
            accommodation: Colors.primary,
            other: Colors.text.secondary,
        };
        return colors[categoryName] || Colors.text.secondary;
    };

    const getCategoryEmoji = (categoryName: string) => {
        const emojis: { [key: string]: string } = {
            essentials: "🎯",
            documents: "📄",
            clothing: "👕",
            tech: "📱",
            health: "🏥",
            food: "🍎",
            activities: "🎪",
            transport: "🚗",
            accommodation: "🏨",
            other: "📦",
        };
        return emojis[categoryName] || "📦";
    };

    const completedItems = items.filter((item) => item.isCompleted).length;
    const totalItems = items.length;

    return (
        <View style={styles.categorySection}>
            {/* En-tête de la catégorie */}
            <View
                style={[
                    styles.categoryHeader,
                    { backgroundColor: getCategoryColor(category) + "20" },
                ]}
            >
                <Text
                    style={[
                        styles.categoryTitle,
                        { color: getCategoryColor(category) },
                    ]}
                >
                    {getCategoryEmoji(category)}{" "}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <Text style={styles.categoryCount}>
                    {completedItems}/{totalItems}
                </Text>
            </View>

            {/* Liste des items de la catégorie */}
            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <ChecklistItem
                        item={item}
                        members={members}
                        currentUserId={currentUserId}
                        isCreator={isCreator}
                        onToggle={onToggleItem}
                        onAssign={onAssignItem}
                        onDelete={onDeleteItem}
                        getMemberColor={getMemberColor}
                    />
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    categorySection: {
        marginBottom: 20,
    },
    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    categoryCount: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
});
