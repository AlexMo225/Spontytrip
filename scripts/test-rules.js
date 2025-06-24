/*
 * =====================================================
 * SCRIPT DE TEST DES RÈGLES FIRESTORE 
 * =====================================================
 *
 * =====================================================
 */

/*
// Test simple des règles Firebase depuis l'application
// À exécuter dans la console du navigateur ou dans un composant de test

import firebaseService from "../services/firebaseService";

async function testFirebaseRules() {
    try {
        console.log("🧪 Test des règles Firebase...");

        // Test 1: Récupération des voyages utilisateur
        console.log("📋 Test 1: Récupération des voyages");
        const trips = await firebaseService.getUserTrips("test-user-id");
        console.log("✅ Voyages récupérés:", trips.length);

        // Test 2: Récupération d'un voyage spécifique
        if (trips.length > 0) {
            console.log("📋 Test 2: Récupération voyage spécifique");
            const trip = await firebaseService.getTripById(trips[0].id);
            console.log("✅ Voyage récupéré:", trip?.title);

            // Test 3: Récupération des sous-collections
            console.log("📋 Test 3: Récupération des sous-collections");

            const unsubscribeChecklist = firebaseService.subscribeToChecklist(
                trips[0].id,
                (checklist) => {
                    console.log(
                        "✅ Checklist récupérée:",
                        checklist?.items.length,
                        "items"
                    );
                }
            );

            const unsubscribeExpenses = firebaseService.subscribeToExpenses(
                trips[0].id,
                (expenses) => {
                    console.log(
                        "✅ Dépenses récupérées:",
                        expenses?.expenses.length,
                        "dépenses"
                    );
                }
            );

            const unsubscribeActivities = firebaseService.subscribeToActivities(
                trips[0].id,
                (activities) => {
                    console.log(
                        "✅ Activités récupérées:",
                        activities?.activities.length,
                        "activités"
                    );
                }
            );

            // Nettoyer les listeners après 5 secondes
            setTimeout(() => {
                unsubscribeChecklist();
                unsubscribeExpenses();
                unsubscribeActivities();
                console.log("🧹 Listeners nettoyés");
            }, 5000);
        }

        console.log("🎉 Tests terminés avec succès");
    } catch (error) {
        console.error("❌ Erreur lors des tests:", error);
    }
}

// Exporter pour utilisation
export { testFirebaseRules };
*/
