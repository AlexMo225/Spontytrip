import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
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
import { RootStackParamList } from "../types";

type AddChecklistItemScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "AddChecklistItem"
>;

interface Props {
    navigation: AddChecklistItemScreenNavigationProp;
}

interface ChecklistCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const categories: ChecklistCategory[] = [
    {
        id: "documents",
        name: "Documents",
        icon: "document-text",
        color: "#4DA1A9",
    },
    { id: "clothes", name: "Vêtements", icon: "shirt", color: "#7ED957" },
    { id: "toiletries", name: "Toilette", icon: "water", color: "#FF9500" },
    {
        id: "electronics",
        name: "Électronique",
        icon: "phone-portrait",
        color: "#FF6B6B",
    },
    {
        id: "medication",
        name: "Médicaments",
        icon: "medical",
        color: "#9C27B0",
    },
    {
        id: "other",
        name: "Autre",
        icon: "ellipsis-horizontal",
        color: "#607D8B",
    },
];

const AddChecklistItemScreen: React.FC<Props> = ({ navigation }) => {
    const [itemName, setItemName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("other");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!itemName.trim()) {
            Alert.alert("Erreur", "Veuillez entrer un nom pour l'élément");
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement save logic
            console.log("Saving checklist item:", {
                name: itemName,
                category: selectedCategory,
                notes: notes,
            });

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            Alert.alert("Succès", "Élément ajouté à la checklist", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert("Erreur", "Impossible d'ajouter l'élément");
        } finally {
            setIsLoading(false);
        }
    };

    const renderCategoryOption = (category: ChecklistCategory) => (
        <TouchableOpacity
            key={category.id}
            style={[
                styles.categoryOption,
                selectedCategory === category.id && {
                    backgroundColor: category.color + "20",
                    borderColor: category.color,
                },
            ]}
            onPress={() => setSelectedCategory(category.id)}
        >
            <View
                style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color + "20" },
                ]}
            >
                <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={category.color}
                />
            </View>
            <Text
                style={[
                    styles.categoryText,
                    selectedCategory === category.id && {
                        color: category.color,
                        fontWeight: "600",
                    },
                ]}
            >
                {category.name}
            </Text>
            {selectedCategory === category.id && (
                <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={category.color}
                />
            )}
        </TouchableOpacity>
    );

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
                        color={Colors.text.primary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouvel élément</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Item Name Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nom de l'élément</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ex: Passeport, Chargeur téléphone..."
                        value={itemName}
                        onChangeText={setItemName}
                        maxLength={100}
                    />
                </View>

                {/* Category Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Catégorie</Text>
                    <View style={styles.categoriesContainer}>
                        {categories.map(renderCategoryOption)}
                    </View>
                </View>

                {/* Notes Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
                    <TextInput
                        style={[styles.textInput, styles.notesInput]}
                        placeholder="Ajouter des détails ou rappels..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        maxLength={300}
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!itemName.trim() || isLoading) &&
                            styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!itemName.trim() || isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading
                            ? "Ajout en cours..."
                            : "Ajouter à la checklist"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        ...TextStyles.h3,
        color: Colors.text.primary,
        fontWeight: "600",
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    section: {
        marginTop: Spacing.lg,
    },
    sectionTitle: {
        ...TextStyles.h4,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
        fontWeight: "600",
    },
    textInput: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: 16,
        backgroundColor: Colors.white,
        color: Colors.text.primary,
    },
    notesInput: {
        height: 100,
        paddingTop: Spacing.sm,
    },
    categoriesContainer: {
        gap: Spacing.sm,
    },
    categoryOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: Spacing.sm,
    },
    categoryText: {
        ...TextStyles.body1,
        color: Colors.text.primary,
        flex: 1,
        fontSize: 16,
    },
    bottomSection: {
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.white,
    },
    saveButton: {
        backgroundColor: "rgba(126, 217, 87, 0.91)",
        borderRadius: 12,
        paddingVertical: Spacing.md,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonDisabled: {
        backgroundColor: Colors.lightGray,
    },
    saveButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: "600",
        fontSize: 16,
    },
});

export default AddChecklistItemScreen;
