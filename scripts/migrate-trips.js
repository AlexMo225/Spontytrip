/*
 * =====================================================
 * SCRIPT DE MIGRATION - 
 * =====================================================
 *
 *
 * =====================================================
 */

/*
const admin = require("firebase-admin");
const serviceAccount = require("../path/to/serviceAccountKey.json"); // À adapter

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://spontytrip-dfcfe.firebaseio.com",
});

const db = admin.firestore();

async function migrateTripsWithMemberIds() {
    try {
        console.log("🔄 Migration des voyages avec memberIds...");

        const tripsSnapshot = await db.collection("trips").get();
        const batch = db.batch();
        let updateCount = 0;

        tripsSnapshot.docs.forEach((doc) => {
            const tripData = doc.data();

            if (!tripData.memberIds && tripData.members && tripData.creatorId) {
                const memberIds = [
                    tripData.creatorId,
                    ...tripData.members.map((member) => member.userId),
                ];

                // Supprimer les doublons
                const uniqueMemberIds = [...new Set(memberIds)];

                batch.update(doc.ref, {
                    memberIds: uniqueMemberIds,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                updateCount++;
                console.log(
                    `✅ Voyage ${doc.id} mis à jour avec ${uniqueMemberIds.length} membres`
                );
            }
        });

        if (updateCount > 0) {
            await batch.commit();
            console.log(
                `✅ Migration terminée: ${updateCount} voyages mis à jour`
            );
        } else {
            console.log("ℹ️ Aucun voyage à migrer");
        }
    } catch (error) {
        console.error("❌ Erreur migration voyages:", error);
    }

    process.exit(0);
}

migrateTripsWithMemberIds();
*/
