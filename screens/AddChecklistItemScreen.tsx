import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../hooks/useModal";
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
    description: string;
}

const categories: ChecklistCategory[] = [
    {
        id: "essentials",
        name: "Essentiels",
        icon: "bag",
        color: "#7ED957",
        description: "Articles indispensables pour le voyage",
    },
    {
        id: "beach",
        name: "Plage & Soleil",
        icon: "sunny",
        color: "#FF9500",
        description: "Équipement pour la plage et protection solaire",
    },
    {
        id: "clothes",
        name: "Vêtements",
        icon: "shirt",
        color: "#4DA1A9",
        description: "Tenues et accessoires vestimentaires",
    },
    {
        id: "documents",
        name: "Documents",
        icon: "document-text",
        color: "#FF6B6B",
        description: "Papiers importants et documents de voyage",
    },
    {
        id: "electronics",
        name: "Électronique",
        icon: "phone-portrait",
        color: "#9C27B0",
        description: "Appareils et accessoires électroniques",
    },
    {
        id: "transport",
        name: "Transport",
        icon: "car",
        color: "#4CAF50",
        description: "Éléments liés aux déplacements",
    },
    {
        id: "food",
        name: "Nourriture",
        icon: "restaurant",
        color: "#FF5722",
        description: "Provisions et snacks",
    },
    {
        id: "other",
        name: "Autre",
        icon: "ellipsis-horizontal",
        color: "#607D8B",
        description: "Autres éléments divers",
    },
];

const AddChecklistItemScreen: React.FC<Props> = ({ navigation, route }) => {
    const modal = useModal();
    const { user } = useAuth();
    const { tripId } = route.params;
    const { checklist } = useTripSync(tripId);

    const [itemName, setItemName] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState<string>("essentials");
    const [isLoading, setIsLoading] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleSave = async () => {
        if (!itemName.trim()) {
            modal.showError("Erreur", "Veuillez entrer un nom pour l'élément");
            return;
        }

        if (!user) {
            modal.showError("Erreur", "Utilisateur non connecté");
            return;
        }

        setIsLoading(true);

        try {
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

            const currentItems = checklist?.items || [];
            const updatedItems = [...currentItems, newItem];

            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            await firebaseService.updateChecklist(
                tripId,
                updatedItems,
                user.uid
            );

            try {
                await firebaseService.retryLogActivity(
                    tripId,
                    user.uid,
                    user.displayName || user.email || "Utilisateur",
                    "checklist_add",
                    { title: itemName.trim(), category: selectedCategory }
                );
            } catch (logError) {
                console.error("Erreur logging checklist:", logError);
            }

            console.log("✅ Élément ajouté avec succès:", newItem);

            // Animation de sortie
            Animated.timing(animation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => navigation.goBack());
        } catch (error) {
            console.error("❌ Erreur ajout élément:", error);
            modal.showError("Erreur", "Impossible d'ajouter l'élément");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => navigation.goBack());
    };

    const selectedCategoryData = categories.find(
        (cat) => cat.id === selectedCategory
    );

    const renderCategoryItem = (category: ChecklistCategory) => {
        const isSelected = selectedCategory === category.id;
        return (
            <TouchableOpacity
                key={category.id}
                style={[
                    styles.categoryItem,
                    isSelected && { backgroundColor: category.color + "20" },
                    isSelected && { borderColor: category.color },
                ]}
                onPress={() => setSelectedCategory(category.id)}
            >
                <View
                    style={[
                        styles.iconContainer,
                        isSelected && { backgroundColor: category.color },
                    ]}
                >
                    <Ionicons
                        name={category.icon as any}
                        size={24}
                        color={isSelected ? "#FFF" : category.color}
                    />
                </View>
                <Text
                    style={[
                        styles.categoryName,
                        isSelected && {
                            color: category.color,
                            fontWeight: "600",
                        },
                    ]}
                >
                    {category.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: animation,
                        transform: [
                            {
                                translateY: animation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCancel}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color={Colors.text.secondary}
                            />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Nouvel élément</Text>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                (!itemName.trim() || isLoading) &&
                                    styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={!itemName.trim() || isLoading}
                        >
                            <Text
                                style={[
                                    styles.saveButtonText,
                                    (!itemName.trim() || isLoading) &&
                                        styles.saveButtonTextDisabled,
                                ]}
                            >
                                {isLoading ? "..." : "Ajouter"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Input Section */}
                        <View style={styles.inputSection}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Nom de l'élément..."
                                placeholderTextColor={Colors.text.secondary}
                                value={itemName}
                                onChangeText={setItemName}
                                maxLength={50}
                                autoFocus={true}
                            />
                            {selectedCategoryData && (
                                <View style={styles.selectedCategoryInfo}>
                                    <Ionicons
                                        name={selectedCategoryData.icon as any}
                                        size={16}
                                        color={selectedCategoryData.color}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryDescription,
                                            {
                                                color: selectedCategoryData.color,
                                            },
                                        ]}
                                    >
                                        {selectedCategoryData.description}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Categories Grid */}
                        <View style={styles.categoriesContainer}>
                            <Text style={styles.sectionTitle}>Catégorie</Text>
                            <View style={styles.categoriesGrid}>
                                {categories.map(renderCategoryItem)}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    content: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    closeButton: {
        padding: 8,
    },
    saveButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: Colors.primary,
    },
    saveButtonDisabled: {
        backgroundColor: Colors.primary + "50",
    },
    saveButtonText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 15,
    },
    saveButtonTextDisabled: {
        color: "#FFF" + "80",
    },
    scrollContent: {
        flex: 1,
    },
    inputSection: {
        padding: 16,
    },
    textInput: {
        fontSize: 24,
        fontWeight: "500",
        color: Colors.text.primary,
        paddingVertical: 12,
    },
    selectedCategoryInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        paddingVertical: 8,
    },
    categoryDescription: {
        fontSize: 14,
        marginLeft: 8,
        opacity: 0.8,
    },
    categoriesContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 16,
    },
    categoriesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8,
    },
    categoryItem: {
        width: (Dimensions.get("window").width - 64) / 2,
        marginHorizontal: 8,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        backgroundColor: "#FFF",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 15,
        color: Colors.text.primary,
    },
});

export default AddChecklistItemScreen;
