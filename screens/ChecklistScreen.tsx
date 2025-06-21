import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
import { ChecklistItem, RootStackParamList } from "../types";

type ChecklistScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Checklist"
>;
type ChecklistScreenRouteProp = RouteProp<RootStackParamList, "Checklist">;

interface Props {
    navigation: ChecklistScreenNavigationProp;
    route: ChecklistScreenRouteProp;
}

const ChecklistScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, checklist, loading, error } = useTripSync(tripId);
    const [localItems, setLocalItems] = useState<ChecklistItem[]>([]);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // Synchroniser les items locaux avec Firebase
    useEffect(() => {
        if (checklist?.items) {
            setLocalItems(checklist.items);
        }
    }, [checklist]);

    const isCreator = trip?.creatorId === user?.uid;

    // Fonction utilitaire pour nettoyer les données Firebase
    const cleanFirebaseData = (items: any[]) => {
        return items.map((item) => {
            const cleanItem: any = {};

            // Copier tous les champs définis
            Object.keys(item).forEach((key) => {
                if (item[key] !== undefined) {
                    cleanItem[key] = item[key];
                }
            });

            return cleanItem;
        });
    };

    const handleToggleItem = async (itemId: string) => {
        const item = localItems.find((i) => i.id === itemId);
        if (!item) return;

        const canToggle =
            isCreator || !item.assignedTo || item.assignedTo === user?.uid;
        if (!canToggle) {
            Alert.alert(
                "Permission refusée",
                "Seul le créateur du voyage ou la personne assignée peut modifier cet élément."
            );
            return;
        }

        const newCompletedState = !item.isCompleted;

        // Optimistic update avec Date actuelle pour l'affichage
        setLocalItems((prev) =>
            prev.map((i) =>
                i.id === itemId
                    ? {
                          ...i,
                          isCompleted: newCompletedState,
                          completedBy: newCompletedState
                              ? user?.uid
                              : undefined,
                          completedAt: newCompletedState
                              ? new Date()
                              : undefined,
                      }
                    : i
            )
        );

        try {
            // Mettre à jour dans Firebase avec données nettoyées
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;

            const updatedItems = localItems.map((i) => {
                if (i.id === itemId) {
                    const updatedItem: any = {
                        ...i,
                        isCompleted: newCompletedState,
                    };

                    if (newCompletedState) {
                        updatedItem.completedBy = user?.uid;
                        updatedItem.completedAt = new Date();
                    } else {
                        // Supprimer les champs au lieu de les mettre à undefined
                        delete updatedItem.completedBy;
                        delete updatedItem.completedAt;
                    }

                    return updatedItem;
                }
                return i;
            });

            const cleanedItems = cleanFirebaseData(updatedItems);
            await firebaseService.updateChecklist(
                tripId,
                cleanedItems,
                user?.uid || ""
            );
        } catch (error) {
            console.error("Erreur toggle item:", error);
            // Rollback en cas d'erreur
            if (checklist?.items) {
                setLocalItems(checklist.items);
            }
        }
    };

    const handleAssignItem = (itemId: string) => {
        const item = localItems.find((i) => i.id === itemId);
        if (!item) return;

        // Vérifier les permissions
        const canAssign = isCreator || !item.assignedTo;
        const canUnassign = isCreator || item.assignedTo === user?.uid;

        if (!canAssign && !canUnassign) {
            Alert.alert(
                "Permission refusée",
                "Vous ne pouvez pas modifier l'assignation de cet élément."
            );
            return;
        }

        setSelectedItemId(itemId);
        setAssignModalVisible(true);
    };

    const handleAssignToMember = async (memberId: string | null) => {
        if (!selectedItemId) return;

        try {
            // Optimistic update
            setLocalItems((prev) =>
                prev.map((i) =>
                    i.id === selectedItemId
                        ? { ...i, assignedTo: memberId || undefined }
                        : i
                )
            );

            // Mettre à jour dans Firebase avec données nettoyées
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            const updatedItems = localItems.map((i) => {
                if (i.id === selectedItemId) {
                    const updatedItem: any = { ...i };

                    if (memberId) {
                        updatedItem.assignedTo = memberId;
                    } else {
                        // Supprimer le champ au lieu de le mettre à null
                        delete updatedItem.assignedTo;
                    }

                    return updatedItem;
                }
                return i;
            });

            const cleanedItems = cleanFirebaseData(updatedItems);
            await firebaseService.updateChecklist(
                tripId,
                cleanedItems,
                user?.uid || ""
            );

            setAssignModalVisible(false);
            setSelectedItemId(null);

            // Message de confirmation
            const actionText = memberId ? "assigné" : "désassigné";
            Alert.alert("Succès", `Élément ${actionText} avec succès`);
        } catch (error) {
            console.error("Erreur assignation:", error);
            Alert.alert("Erreur", "Impossible d'assigner l'élément");
            // Rollback en cas d'erreur
            if (checklist?.items) {
                setLocalItems(checklist.items);
            }
        }
    };

    const handleQuickUnassign = async (itemId: string) => {
        try {
            // Optimistic update
            setLocalItems((prev) =>
                prev.map((i) =>
                    i.id === itemId ? { ...i, assignedTo: undefined } : i
                )
            );

            // Mettre à jour dans Firebase avec données nettoyées
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            const updatedItems = localItems.map((i) => {
                if (i.id === itemId) {
                    const updatedItem: any = { ...i };
                    delete updatedItem.assignedTo;
                    return updatedItem;
                }
                return i;
            });

            const cleanedItems = cleanFirebaseData(updatedItems);
            await firebaseService.updateChecklist(
                tripId,
                cleanedItems,
                user?.uid || ""
            );
        } catch (error) {
            console.error("Erreur désassignation:", error);
            Alert.alert("Erreur", "Impossible de désassigner l'élément");
            // Rollback en cas d'erreur
            if (checklist?.items) {
                setLocalItems(checklist.items);
            }
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!isCreator) {
            Alert.alert(
                "Permission refusée",
                "Seul le créateur du voyage peut supprimer des éléments."
            );
            return;
        }

        Alert.alert(
            "Supprimer l'élément",
            "Êtes-vous sûr de vouloir supprimer cet élément ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        // Optimistic update
                        setLocalItems((prev) =>
                            prev.filter((i) => i.id !== itemId)
                        );

                        try {
                            // Supprimer dans Firebase
                            const firebaseService = (
                                await import("../services/firebaseService")
                            ).default;
                            const updatedItems = localItems.filter(
                                (i) => i.id !== itemId
                            );
                            await firebaseService.updateChecklist(
                                tripId,
                                updatedItems,
                                user?.uid || ""
                            );
                        } catch (error) {
                            console.error("Erreur suppression item:", error);
                            // Rollback en cas d'erreur
                            if (checklist?.items) {
                                setLocalItems(checklist.items);
                            }
                        }
                    },
                },
            ]
        );
    };

    const getItemsByCategory = () => {
        const categories = [
            {
                id: "documents",
                name: "Documents",
                icon: "document-text",
                color: "#4DA1A9",
            },
            {
                id: "clothes",
                name: "Vêtements",
                icon: "shirt",
                color: "#7ED957",
            },
            {
                id: "toiletries",
                name: "Toilette",
                icon: "water",
                color: "#FFD93D",
            },
            {
                id: "electronics",
                name: "Électronique",
                icon: "phone-portrait",
                color: "#FF6B6B",
            },
            { id: "health", name: "Santé", icon: "medical", color: "#9B59B6" },
            {
                id: "activities",
                name: "Activités",
                icon: "camera",
                color: "#FF8C00",
            },
            {
                id: "other",
                name: "Autre",
                icon: "ellipsis-horizontal",
                color: "#95A5A6",
            },
        ];

        return categories
            .map((category) => ({
                ...category,
                items: localItems.filter(
                    (item) => item.category === category.id
                ),
            }))
            .filter((category) => category.items.length > 0);
    };

    const calculateProgress = () => {
        if (localItems.length === 0) return 0;
        const completed = localItems.filter((item) => item.isCompleted).length;
        return Math.round((completed / localItems.length) * 100);
    };

    const getMyTasks = () => {
        return localItems.filter((item) => item.assignedTo === user?.uid);
    };

    const getAssignmentStats = () => {
        const assigned = localItems.filter((item) => item.assignedTo).length;
        const unassigned = localItems.length - assigned;
        const myCompleted = localItems.filter(
            (item) => item.assignedTo === user?.uid && item.isCompleted
        ).length;

        return { assigned, unassigned, myCompleted };
    };

    const renderItem = ({ item }: { item: ChecklistItem }) => {
        const canToggle =
            isCreator || !item.assignedTo || item.assignedTo === user?.uid;
        const assignedMember = trip?.members.find(
            (m) => m.userId === item.assignedTo
        );
        const canAssign = isCreator || !item.assignedTo;
        const canUnassign = isCreator || item.assignedTo === user?.uid;

        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity
                    style={[
                        styles.checkbox,
                        item.isCompleted && styles.checkboxChecked,
                        !canToggle && styles.checkboxDisabled,
                    ]}
                    onPress={() => canToggle && handleToggleItem(item.id)}
                    disabled={!canToggle}
                >
                    {item.isCompleted && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                </TouchableOpacity>

                <View style={styles.itemContent}>
                    <Text
                        style={[
                            styles.itemTitle,
                            item.isCompleted && styles.itemTitleChecked,
                        ]}
                    >
                        {item.title}
                    </Text>

                    {/* Indicateur de qui a coché et quand */}
                    {item.isCompleted && item.completedBy && (
                        <View style={styles.completedInfo}>
                            <Ionicons
                                name="checkmark-circle"
                                size={12}
                                color="#7ED957"
                            />
                            <Text style={styles.completedText}>
                                Coché par{" "}
                                {item.completedBy === user?.uid
                                    ? "vous"
                                    : trip?.members.find(
                                          (m) => m.userId === item.completedBy
                                      )?.name ||
                                      trip?.members.find(
                                          (m) => m.userId === item.completedBy
                                      )?.email ||
                                      "un membre"}
                                {item.completedAt &&
                                    (() => {
                                        try {
                                            let date: Date;

                                            // Gérer les différents formats de date
                                            if (
                                                item.completedAt instanceof Date
                                            ) {
                                                date = item.completedAt;
                                            } else if (
                                                typeof item.completedAt ===
                                                "string"
                                            ) {
                                                date = new Date(
                                                    item.completedAt
                                                );
                                            } else if (
                                                typeof item.completedAt ===
                                                "number"
                                            ) {
                                                date = new Date(
                                                    item.completedAt
                                                );
                                            } else if (
                                                item.completedAt &&
                                                typeof item.completedAt ===
                                                    "object" &&
                                                "toDate" in item.completedAt
                                            ) {
                                                // Timestamp Firestore
                                                date = (
                                                    item.completedAt as any
                                                ).toDate();
                                            } else {
                                                return "";
                                            }

                                            // Vérifier que la date est valide
                                            if (isNaN(date.getTime())) {
                                                return "";
                                            }

                                            return ` le ${date.toLocaleDateString(
                                                "fr-FR",
                                                {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                }
                                            )} à ${date.toLocaleTimeString(
                                                "fr-FR",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }
                                            )}`;
                                        } catch (error) {
                                            console.log(
                                                "Erreur formatage date:",
                                                error
                                            );
                                            return "";
                                        }
                                    })()}
                            </Text>
                        </View>
                    )}

                    {/* Assignation Section */}
                    <View style={styles.assignmentSection}>
                        {assignedMember ? (
                            <View style={styles.assignedContainer}>
                                <Avatar
                                    size={20}
                                    imageUrl={assignedMember.avatar}
                                    style={styles.assignedAvatar}
                                />
                                <Text style={styles.assignedText}>
                                    {assignedMember.userId === user?.uid
                                        ? "Vous"
                                        : assignedMember.name ||
                                          assignedMember.email ||
                                          "Membre"}
                                </Text>

                                {/* Bouton de désassignation */}
                                {canUnassign && (
                                    <TouchableOpacity
                                        style={styles.unassignButton}
                                        onPress={() =>
                                            handleQuickUnassign(item.id)
                                        }
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={16}
                                            color="#6B7280"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            /* Bouton d'assignation pour éléments non assignés */
                            canAssign && (
                                <TouchableOpacity
                                    style={styles.assignButton}
                                    onPress={() => handleAssignItem(item.id)}
                                >
                                    <Ionicons
                                        name="person-add-outline"
                                        size={16}
                                        color="#7ED957"
                                    />
                                    <Text style={styles.assignButtonText}>
                                        S'assigner
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>

                {/* Actions du créateur */}
                <View style={styles.itemActions}>
                    {/* Bouton de réassignation pour le créateur */}
                    {isCreator && assignedMember && (
                        <TouchableOpacity
                            style={styles.reassignButton}
                            onPress={() => handleAssignItem(item.id)}
                        >
                            <Ionicons
                                name="swap-horizontal"
                                size={16}
                                color="#4DA1A9"
                            />
                        </TouchableOpacity>
                    )}

                    {/* Bouton de suppression pour le créateur */}
                    {isCreator && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteItem(item.id)}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={16}
                                color="#FF6B6B"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderCategorySection = ({ item: category }: any) => (
        <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
                <View
                    style={[
                        styles.categoryIcon,
                        { backgroundColor: `${category.color}20` },
                    ]}
                >
                    <Ionicons
                        name={category.icon}
                        size={20}
                        color={category.color}
                    />
                </View>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categoryCount}>
                    ({category.items.length})
                </Text>
            </View>

            <FlatList
                data={category.items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
            />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7ED957" />
                    <Text style={styles.loadingText}>
                        Chargement de la checklist...
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
                        {error || "Impossible de charger la checklist"}
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

    const categorizedItems = getItemsByCategory();
    const progress = calculateProgress();
    const myTasks = getMyTasks();
    const assignmentStats = getAssignmentStats();

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
                <Text style={styles.headerTitle}>Checklist</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() =>
                        navigation.navigate("AddChecklistItem", { tripId })
                    }
                >
                    <Ionicons name="add" size={24} color="#7ED957" />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{progress}%</Text>
                    <Text style={styles.statLabel}>Terminé</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{myTasks.length}</Text>
                    <Text style={styles.statLabel}>Mes tâches</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {assignmentStats.assigned}
                    </Text>
                    <Text style={styles.statLabel}>Assignées</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {assignmentStats.unassigned}
                    </Text>
                    <Text style={styles.statLabel}>Libres</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                </View>
                <Text style={styles.progressText}>{progress}% terminé</Text>
            </View>

            {/* Items List */}
            {categorizedItems.length > 0 ? (
                <FlatList
                    data={categorizedItems}
                    renderItem={renderCategorySection}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="checkbox-outline"
                        size={64}
                        color="#E5E5E5"
                    />
                    <Text style={styles.emptyTitle}>Aucun élément</Text>
                    <Text style={styles.emptyText}>
                        Commencez par ajouter des éléments à votre checklist
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() =>
                            navigation.navigate("AddChecklistItem", { tripId })
                        }
                    >
                        <Text style={styles.emptyButtonText}>
                            Ajouter un élément
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Assign Modal */}
            <Modal
                visible={assignModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Assigner l'élément
                            </Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setAssignModalVisible(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.membersList}>
                            {/* Option "Personne" pour désassigner */}
                            <TouchableOpacity
                                style={[
                                    styles.memberOption,
                                    styles.unassignOption,
                                ]}
                                onPress={() => handleAssignToMember(null)}
                            >
                                <View style={styles.unassignIcon}>
                                    <Ionicons
                                        name="person-remove-outline"
                                        size={20}
                                        color="#6B7280"
                                    />
                                </View>
                                <Text style={styles.unassignText}>
                                    Personne (désassigner)
                                </Text>
                            </TouchableOpacity>

                            {/* Liste des membres */}
                            {trip?.members.map((member) => {
                                const isCurrentlyAssigned =
                                    localItems.find(
                                        (item) => item.id === selectedItemId
                                    )?.assignedTo === member.userId;

                                return (
                                    <TouchableOpacity
                                        key={member.userId}
                                        style={[
                                            styles.memberOption,
                                            isCurrentlyAssigned &&
                                                styles.memberOptionSelected,
                                        ]}
                                        onPress={() =>
                                            handleAssignToMember(member.userId)
                                        }
                                    >
                                        <Avatar
                                            size={32}
                                            imageUrl={member.avatar}
                                            style={styles.memberModalAvatar}
                                        />
                                        <View style={styles.memberInfo}>
                                            <Text style={styles.memberName}>
                                                {member.userId === user?.uid
                                                    ? "Vous"
                                                    : member.name || "Membre"}
                                            </Text>
                                            <Text style={styles.memberEmail}>
                                                {member.email}
                                            </Text>
                                        </View>
                                        {isCurrentlyAssigned && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={20}
                                                color="#7ED957"
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
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
    addButton: {
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
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
        fontFamily: "Inter_700Bold",
    },
    statLabel: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: "Inter_400Regular",
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#7ED957",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        fontFamily: "Inter_500Medium",
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    categorySection: {
        marginBottom: 32,
    },
    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
        fontFamily: "Inter_600SemiBold",
    },
    categoryCount: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: "Inter_500Medium",
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    checkboxChecked: {
        backgroundColor: "#7ED957",
        borderColor: "#7ED957",
    },
    checkboxDisabled: {
        backgroundColor: Colors.lightGray,
        borderWidth: 0,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1F2937",
        marginBottom: 4,
        fontFamily: "Inter_500Medium",
    },
    itemTitleChecked: {
        textDecorationLine: "line-through",
        color: "#9CA3AF",
    },
    assignmentSection: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    assignedContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    assignedAvatar: {
        marginRight: 8,
    },
    assignedText: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: "Inter_400Regular",
    },
    unassignButton: {
        marginLeft: 8,
        padding: 4,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        justifyContent: "center",
        alignItems: "center",
    },
    assignButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderWidth: 1,
        borderColor: "#7ED957",
        borderRadius: 8,
        backgroundColor: "#F0FDF4",
    },
    assignButtonText: {
        color: "#7ED957",
        fontSize: 12,
        fontWeight: "500",
        fontFamily: "Inter_500Medium",
        marginLeft: 4,
    },
    itemActions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: "auto",
    },
    reassignButton: {
        marginRight: 8,
        padding: 4,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButton: {
        padding: 4,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingBottom: 100,
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
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 20,
        width: "80%",
        alignItems: "center",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F2937",
        fontFamily: "Inter_600SemiBold",
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
    },
    membersList: {
        width: "100%",
    },
    memberOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        marginBottom: 10,
    },
    memberOptionSelected: {
        backgroundColor: "#FEF2F2",
    },
    unassignOption: {
        backgroundColor: "#FEF2F2",
    },
    unassignIcon: {
        marginRight: 10,
    },
    unassignText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#6B7280",
        fontFamily: "Inter_500Medium",
    },
    memberModalAvatar: {
        marginRight: 10,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1F2937",
        fontFamily: "Inter_500Medium",
    },
    memberEmail: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: "Inter_400Regular",
    },
    completedInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    completedText: {
        fontSize: 12,
        color: "#6B7280",
        fontFamily: "Inter_400Regular",
        marginLeft: 4,
    },
});

export default ChecklistScreen;
