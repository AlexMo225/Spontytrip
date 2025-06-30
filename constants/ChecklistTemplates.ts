// Templates de checklist par type de voyage

export interface ChecklistTemplate {
    title: string;
    description?: string;
    category: string;
    priority: "high" | "medium" | "low";
}

export interface TripTypeTemplate {
    type: "plage" | "montagne" | "citytrip" | "campagne";
    name: string;
    emoji: string;
    items: ChecklistTemplate[];
}

export const checklistTemplates: TripTypeTemplate[] = [
    {
        type: "plage",
        name: "Plage & Soleil",
        emoji: "🏖️",
        items: [
            // essentials
            { title: "Crème solaire pour le groupe", category: "essentials", priority: "high" },
            { title: "Sac de plage collectif", category: "essentials", priority: "high" },
            { title: "Jeux de plage (ballon, raquettes, frisbee)", category: "essentials", priority: "medium" },

            // beach
            { title: "Grande serviette/plaid partagé", category: "beach", priority: "high" },
            { title: "Parasol ou tente de plage", category: "beach", priority: "medium" },
            { title: "Glacière commune", category: "beach", priority: "high" },

            // clothes
            { title: "Vêtements de rechange pour tous", category: "clothes", priority: "medium" },
            { title: "Chapeaux/casquettes collectifs", category: "clothes", priority: "high" },
            { title: "Tongs/sandales collectifs", category: "clothes", priority: "medium" },

            // electronics
            { title: "Enceinte Bluetooth partagée", category: "electronics", priority: "medium" },
            { title: "Batterie externe de groupe", category: "electronics", priority: "high" },
            { title: "Appareil photo du groupe", category: "electronics", priority: "medium" },

            // food
            { title: "Snacks/sandwichs à partager", category: "food", priority: "high" },
            { title: "Boissons fraîches collectives", category: "food", priority: "high" },
            { title: "Couverts/verres réutilisables", category: "food", priority: "medium" },

            // transport
            { title: "Plan d'accès/planning covoiturage", category: "transport", priority: "medium" },
            { title: "Liste des chauffeurs volontaires", category: "transport", priority: "medium" },
            { title: "Organisation retour", category: "transport", priority: "medium" },

            // other
            { title: "Jeux de société pour le groupe", category: "other", priority: "low" },
            { title: "Poubelle/sacs pour déchets communs", category: "other", priority: "high" },
            { title: "Playlist collaborative", category: "other", priority: "low" },
        ],
    },

    {
        type: "montagne",
        name: "Montagne & Randonnée",
        emoji: "🏔️",
        items: [
            // essentials
            { title: "Carte de randonnée pour tous", category: "essentials", priority: "high" },
            { title: "Kit de premiers secours collectif", category: "essentials", priority: "high" },
            { title: "Lampe frontale commune", category: "essentials", priority: "high" },

            // clothes
            { title: "Ponchos/pluie de secours collectifs", category: "clothes", priority: "medium" },
            { title: "Bonnets/gants partagés", category: "clothes", priority: "medium" },
            { title: "T-shirts techniques de groupe", category: "clothes", priority: "medium" },

            // electronics
            { title: "Chargeur portable partagé", category: "electronics", priority: "high" },
            { title: "GPS du groupe", category: "electronics", priority: "high" },
            { title: "Appareil photo pour tous", category: "electronics", priority: "medium" },

            // food
            { title: "Rations/snacks collectifs", category: "food", priority: "high" },
            { title: "Barres énergétiques partagées", category: "food", priority: "medium" },
            { title: "Thermos commun pour boissons chaudes", category: "food", priority: "medium" },

            // transport
            { title: "Plan de co-voiturage/parking", category: "transport", priority: "medium" },
            { title: "Liste des conducteurs", category: "transport", priority: "medium" },
            { title: "Répartition véhicules", category: "transport", priority: "medium" },

            // other
            { title: "Sac poubelle pour groupe", category: "other", priority: "high" },
            { title: "Jeu de cartes pour la soirée", category: "other", priority: "low" },
            { title: "Guide local partagé", category: "other", priority: "medium" },
        ],
    },

    {
        type: "citytrip",
        name: "Voyage en ville",
        emoji: "🏙️",
        items: [
            // essentials
            { title: "Plan/itinéraire partagé", category: "essentials", priority: "high" },
            { title: "Liste des lieux à visiter", category: "essentials", priority: "high" },
            { title: "Kit de secours collectif", category: "essentials", priority: "high" },

            // clothes
            { title: "Ponchos/parapluies collectifs", category: "clothes", priority: "medium" },
            { title: "Sacs à dos de jour collectifs", category: "clothes", priority: "high" },
            

            // electronics
            { title: "Batterie externe commune", category: "electronics", priority: "high" },
            { title: "Enceinte pour soirées", category: "electronics", priority: "low" },
            { title: "Appareil photo partagé", category: "electronics", priority: "medium" },

            // food
            { title: "Réservations restaurants pour groupe", category: "food", priority: "high" },
            { title: "Snacks à partager en ville", category: "food", priority: "medium" },
            { title: "Bouteilles d’eau pour tous", category: "food", priority: "high" },

            // transport
            { title: "Pass transport en commun collectif", category: "transport", priority: "high" },
            { title: "Planification taxis/covoiturage", category: "transport", priority: "medium" },
            { title: "Répartition trajets", category: "transport", priority: "medium" },

            // other
            { title: "Liste des événements du groupe", category: "other", priority: "medium" },
            { title: "Billets/entrées partagées", category: "other", priority: "medium" },
            { title: "Jeu collectif pour les trajets", category: "other", priority: "low" },
        ],
    },

    {
        type: "campagne",
        name: "Séjour à la campagne",
        emoji: "🌾",
        items: [
            // essentials
            { title: "Trousse de premiers secours du groupe", category: "essentials", priority: "high" },
            { title: "Lampe torche commune", category: "essentials", priority: "high" },
            { title: "Jeux de société pour tous", category: "essentials", priority: "medium" },

            // clothes
            { title: "Chapeaux/gilets pour tous", category: "clothes", priority: "medium" },
            { title: "Bottes/pluie partagées", category: "clothes", priority: "medium" },
            { title: "Plaid/couverture du groupe", category: "clothes", priority: "medium" },

            // electronics
            { title: "Batterie externe partagée", category: "electronics", priority: "high" },
            { title: "Enceinte Bluetooth collective", category: "electronics", priority: "medium" },
            { title: "Appareil photo de groupe", category: "electronics", priority: "medium" },

            // food
            { title: "Panier pique-nique collectif", category: "food", priority: "high" },
            { title: "Barbecue commun", category: "food", priority: "high" },
            { title: "Bouteilles thermos partagées", category: "food", priority: "medium" },

            // transport
            { title: "Organisation des voitures", category: "transport", priority: "medium" },
            { title: "Cartes/plan des chemins collectifs", category: "transport", priority: "medium" },
            { title: "Plan retour partagé", category: "transport", priority: "medium" },

            // other
            { title: "Sac poubelle/collecte pour tous", category: "other", priority: "high" },
            { title: "Guide nature/observation collective", category: "other", priority: "medium" },
            { title: "Jeux d’extérieur (pétanque, ballon)", category: "other", priority: "medium" },
        ],
    },
];

// Fonction utilitaire pour obtenir le template d'un type de voyage
export const getChecklistTemplate = (
    tripType: "plage" | "montagne" | "citytrip" | "campagne"
): ChecklistTemplate[] => {
    const template = checklistTemplates.find((t) => t.type === tripType);
    return template?.items || [];
};

// Fonction pour obtenir les infos d'un type de voyage
export const getTripTypeInfo = (
    tripType: "plage" | "montagne" | "citytrip" | "campagne"
) => {
    const template = checklistTemplates.find((t) => t.type === tripType);
    return template ? { name: template.name, emoji: template.emoji } : null;
};
