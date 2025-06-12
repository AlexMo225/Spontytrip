import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { RootStackParamList } from "../types";

type ChecklistScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Checklist"
>;
type ChecklistScreenRouteProp = RouteProp<RootStackParamList, "Checklist">;

interface Props {
    navigation: ChecklistScreenNavigationProp;
    route: ChecklistScreenRouteProp;
}

interface ChecklistItem {
    id: string;
    title: string;
    checked: boolean;
    category: string;
}

interface ChecklistCategory {
    title: string;
    items: ChecklistItem[];
}

const ChecklistScreen: React.FC<Props> = ({ navigation, route }) => {
    const [checklistData, setChecklistData] = useState<ChecklistCategory[]>([
        {
            title: "Essentiels",
            items: [
                {
                    id: "1",
                    title: "Passeport",
                    checked: true,
                    category: "essentials",
                },
                {
                    id: "2",
                    title: "Assurance voyage",
                    checked: false,
                    category: "essentials",
                },
                {
                    id: "3",
                    title: "Visa",
                    checked: false,
                    category: "essentials",
                },
            ],
        },
        {
            title: "Vêtements",
            items: [
                {
                    id: "4",
                    title: "T-shirts",
                    checked: false,
                    category: "clothing",
                },
                {
                    id: "5",
                    title: "Shorts",
                    checked: false,
                    category: "clothing",
                },
                {
                    id: "6",
                    title: "Maillot de bain",
                    checked: false,
                    category: "clothing",
                },
            ],
        },
        {
            title: "Accessoires",
            items: [
                {
                    id: "7",
                    title: "Lunettes de soleil",
                    checked: false,
                    category: "accessories",
                },
                {
                    id: "8",
                    title: "Chapeau",
                    checked: false,
                    category: "accessories",
                },
                {
                    id: "9",
                    title: "Crème solaire",
                    checked: false,
                    category: "accessories",
                },
            ],
        },
    ]);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const toggleItem = (categoryIndex: number, itemIndex: number) => {
        const newData = [...checklistData];
        newData[categoryIndex].items[itemIndex].checked =
            !newData[categoryIndex].items[itemIndex].checked;
        setChecklistData(newData);
    };

    const handleAddItem = () => {
        navigation.navigate("AddChecklistItem", {
            tripId: route.params.tripId,
        });
    };

    const calculateProgress = () => {
        const allItems = checklistData.flatMap((category) => category.items);
        const checkedItems = allItems.filter((item) => item.checked);
        return Math.round((checkedItems.length / allItems.length) * 100);
    };

    const getCheckboxStyle = (checked: boolean) => {
        return [
            styles.checkbox,
            checked ? styles.checkboxChecked : styles.checkboxUnchecked,
        ];
    };

    const getCheckboxIconColor = (checked: boolean) => {
        return checked ? "#FFFFFF" : "transparent";
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleGoBack}
                    style={styles.backButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checklist</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {calculateProgress()}% préparé
                </Text>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${calculateProgress()}%` },
                        ]}
                    />
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {checklistData.map((category, categoryIndex) => (
                    <View key={category.title} style={styles.categoryContainer}>
                        <Text style={styles.categoryTitle}>
                            {category.title}
                        </Text>

                        {category.items.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.itemContainer}
                                onPress={() =>
                                    toggleItem(categoryIndex, itemIndex)
                                }
                                activeOpacity={0.7}
                            >
                                <Text style={styles.itemText}>
                                    {item.title}
                                </Text>
                                <View style={getCheckboxStyle(item.checked)}>
                                    <Ionicons
                                        name="checkmark"
                                        size={16}
                                        color={getCheckboxIconColor(
                                            item.checked
                                        )}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Espace pour le bouton flottant */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Bouton Ajouter élément flottant */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddItem}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Ajouter élément</Text>
            </TouchableOpacity>
        </View>
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
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        flex: 1,
        textAlign: "center",
        fontWeight: "600",
    },
    headerSpacer: {
        width: 40,
    },
    progressContainer: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    progressText: {
        ...TextStyles.body2,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
        fontWeight: "500",
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: Colors.lightGray,
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: Colors.textPrimary,
        borderRadius: 3,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    categoryContainer: {
        marginBottom: Spacing.xl,
    },
    categoryTitle: {
        ...TextStyles.h4,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        fontWeight: "600",
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: Spacing.sm,
        minHeight: 44,
    },
    itemText: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        flex: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: Spacing.md,
    },
    checkboxChecked: {
        backgroundColor: "#7ED957",
        borderWidth: 0,
    },
    checkboxUnchecked: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#6B9EFF",
    },
    bottomSpacer: {
        height: 100,
    },
    addButton: {
        position: "absolute",
        bottom: Spacing.xl,
        left: Spacing.md,
        right: Spacing.md,
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.lg,
    },
    addButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
        marginLeft: Spacing.xs,
    },
});

export default ChecklistScreen;
