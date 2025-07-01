import { RouteProp } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { ScrollView, Text, View } from "react-native";

import {
    AddExpenseForm,
    ExpensesList,
    ExpensesSummaryHeader,
    SettlementsSection,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import { useExpenses } from "../hooks/useExpenses";
import { useExpensesStyles  } from "../styles/screens";
import { useTripSync } from "../hooks/useTripSync";
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
    const styles = useExpensesStyles();
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

export default ExpensesScreen;
