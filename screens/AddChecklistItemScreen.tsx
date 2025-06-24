import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
import { RootStackParamList } from "../types";

type AddChecklistItemScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "AddChecklistItem"
>;

type AddChecklistItemScreenRouteProp = RouteProp<
    RootStackParamList,
    "AddChecklistItem"
>;

interface Props {
    navigation: AddChecklistItemScreenNavigationProp;
    route: AddChecklistItemScreenRouteProp;
}

interface ChecklistCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const categories: ChecklistCategory[] = [
    {
        id: "essentials",
        name: "Essentiels",
        icon: "bag",
        color: "#7ED957",
    },
    {
        id: "beach",
        name: "Plage & Soleil",
        icon: "sunny",
        color: "#FF9500",
    },
    {
        id: "clothes",
        name: "Vêtements",
        icon: "shirt",
        color: "#4DA1A9",
    },
    {
        id: "documents",
        name: "Documents",
        icon: "document-text",
        color: "#FF6B6B",
    },
    {
        id: "electronics",
        name: "Électronique",
        icon: "phone-portrait",
        color: "#9C27B0",
    },
    {
        id: "other",
        name: "Autre",
        icon: "ellipsis-horizontal",
        color: "#607D8B",
    },
];

const AddChecklistItemScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const { checklist } = useTripSync(tripId);

    const [itemName, setItemName] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState<string>("essentials");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!itemName.trim()) {
            Alert.alert("Erreur", "Veuillez entrer un nom pour l'élément");
            return;
        }

        if (!user) {
            Alert.alert("Erreur", "Utilisateur non connecté");
            return;
        }

        setIsLoading(true);

        try {
            // Créer le nouvel élément avec ID unique
            const newItem = {
                id: `${tripId}_item_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                tripId: tripId,
                title: itemName.trim(),
                category: selectedCategory,
                isCompleted: false,
                createdBy: user.uid,
                createdAt: new Date(),
            };

            // Ajouter à la liste existante
            const currentItems = checklist?.items || [];
            const updatedItems = [...currentItems, newItem];

            // Sauvegarder dans Firebase
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            await firebaseService.updateChecklist(
                tripId,
                updatedItems,
                user.uid
            );

            console.log("✅ Élément ajouté avec succès:", newItem);
            navigation.goBack();
        } catch (error) {
            console.error("❌ Erreur ajout élément:", error);
            Alert.alert("Erreur", "Impossible d'ajouter l'élément");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const renderCategoryChip = (category: ChecklistCategory) => (
        <TouchableOpacity
            key={category.id}
            style={[
                styles.categoryChip,
                selectedCategory === category.id && {
                    backgroundColor: category.color,
                },
            ]}
            onPress={() => setSelectedCategory(category.id)}
        >
            <Text
                style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && {
                        color: "#FFFFFF",
                    },
                ]}
            >
                {category.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Ajouter un élément</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleCancel}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Item Name Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>
                            Nom de l'élément...
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Passeport, Crème solaire..."
                            value={itemName}
                            onChangeText={setItemName}
                            maxLength={50}
                            autoFocus={true}
                        />
                    </View>

                    {/* Category Selection */}
                    <View style={styles.categorySection}>
                        <View style={styles.categoryChipsContainer}>
                            {categories.map(renderCategoryChip)}
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            (!itemName.trim() || isLoading) &&
                                styles.addButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={!itemName.trim() || isLoading}
                    >
                        <Text style={styles.addButtonText}>
                            {isLoading ? "Ajout..." : "Ajouter"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1E293B",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    inputSection: {
        marginTop: 24,
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#64748B",
        marginBottom: 12,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: "#FFFFFF",
        color: "#1E293B",
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryChipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#64748B",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748B",
    },
    addButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#7ED957",
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonDisabled: {
        backgroundColor: "#CBD5E1",
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});

export default AddChecklistItemScreen;
