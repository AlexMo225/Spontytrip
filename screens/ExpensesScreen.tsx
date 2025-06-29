import { RouteProp } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";

// 🎯 Import du hook custom et des composants modernes
import { AddExpenseForm } from "../components/AddExpenseForm";
import { ExpensesList } from "../components/ExpensesList";
import { ExpensesSummaryHeader } from "../components/ExpensesSummaryHeader";
import { SettlementsSection } from "../components/SettlementsSection";
import { useExpenses } from "../hooks/useExpenses";
import { RootStackParamList } from "../types";

type ExpensesScreenRouteProp = RouteProp<RootStackParamList, "Expenses">;
type ExpensesScreenNavigationProp = StackScreenProps<
    RootStackParamList,
    "Expenses"
>;

interface Props {
    route: ExpensesScreenRouteProp;
    navigation: ExpensesScreenNavigationProp["navigation"];
}

/**
 * 💰 Page Dépenses - Refonte complète avec logique
 * Architecture moderne : Hook custom + Composants séparés + UX optimisée
 */
const ExpensesScreen: React.FC<Props> = ({ route, navigation }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const {
        trip,
        loading: tripLoading,
        error: tripError,
    } = useTripSync(tripId);
    const {
        expenses,
        summary,
        members,
        loading,
        error,
        syncing,
        addExpense,
        deleteExpense,
        refreshExpenses,
    } = useExpenses(tripId, trip?.members || []);

    // 🚫 Vérifications de protection
    if (!user) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>
                    ❌ Erreur d'authentification
                </Text>
                <Text style={styles.errorText}>
                    Veuillez vous reconnecter pour accéder aux dépenses
                </Text>
            </View>
        );
    }

    if (tripLoading) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Chargement du voyage...</Text>
            </View>
        );
    }

    if (tripError || !trip) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>❌ Erreur de navigation</Text>
                <Text style={styles.errorText}>
                    {tripError ||
                        "Aucun voyage sélectionné. Veuillez retourner à la liste des voyages."}
                </Text>
                <Text
                    style={styles.errorRetry}
                    onPress={() => navigation.goBack()}
                >
                    ← Retour
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>❌ Erreur de connexion</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorRetry} onPress={refreshExpenses}>
                    🔄 Réessayer
                </Text>
            </View>
        );
    }

    console.log("🎯 ExpensesScreen rendu:", {
        tripId: trip?.id || "undefined",
        expensesCount: expenses.length,
        summaryExists: !!summary,
        membersCount: members.length,
        loading,
        syncing,
        myUserId: user?.uid || "undefined",
    });

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 📊 Header avec résumé et mon solde */}
                <ExpensesSummaryHeader
                    summary={summary}
                    loading={loading}
                    syncing={syncing}
                    onRefresh={refreshExpenses}
                />

                {/* 💸 Section "Qui doit qui" */}
                {summary && (
                    <SettlementsSection
                        summary={summary}
                        currentUserId={user.uid}
                    />
                )}

                {/* 📋 Historique des dépenses */}
                <ExpensesList
                    expenses={expenses}
                    members={members}
                    loading={loading}
                    onDeleteExpense={deleteExpense}
                    currentUserId={user.uid}
                />
            </ScrollView>

            {/* ➕ Formulaire d'ajout - Bouton flottant en bas */}
            <View style={styles.addExpenseContainer}>
                <AddExpenseForm
                    members={members}
                    currentUserId={user.uid}
                    onAddExpense={addExpense}
                    syncing={syncing}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120, // Espace pour le bouton d'ajout
    },

    // États d'erreur
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: Colors.backgroundColors.primary,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.error,
        marginBottom: 12,
        textAlign: "center",
    },
    errorText: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 24,
    },
    errorRetry: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "600",
        textDecorationLine: "underline",
    },

    // Conteneur du bouton d'ajout
    addExpenseContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.backgroundColors.primary,
        paddingTop: 10,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default ExpensesScreen;
