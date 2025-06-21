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
            // Documents essentiels
            {
                title: "Passeport / Carte d'identité",
                category: "documents",
                priority: "high",
            },
            {
                title: "Billets d'avion / train",
                category: "documents",
                priority: "high",
            },
            {
                title: "Réservation hébergement",
                category: "documents",
                priority: "high",
            },
            {
                title: "Assurance voyage",
                category: "documents",
                priority: "medium",
            },

            // Spécifique plage
            {
                title: "Maillot de bain (2-3)",
                category: "other",
                priority: "high",
            },
            {
                title: "Crème solaire SPF 50+",
                category: "other",
                priority: "high",
            },
            {
                title: "Lunettes de soleil",
                category: "other",
                priority: "high",
            },
            {
                title: "Serviette de plage",
                category: "other",
                priority: "high",
            },
            {
                title: "Chapeau / Casquette",
                category: "other",
                priority: "medium",
            },
            { title: "Tongs / Sandales", category: "other", priority: "high" },
            { title: "Parasol portable", category: "other", priority: "low" },
            {
                title: "Sac étanche pour téléphone",
                category: "other",
                priority: "medium",
            },
            {
                title: "Après-soleil / Aloe vera",
                category: "other",
                priority: "medium",
            },

            // Vêtements
            {
                title: "Vêtements légers (coton/lin)",
                category: "other",
                priority: "high",
            },
            { title: "Short / Bermuda", category: "other", priority: "high" },
            { title: "Robe d'été", category: "other", priority: "medium" },
            { title: "Paréo / Sarong", category: "other", priority: "low" },
            {
                title: "Veste légère pour le soir",
                category: "other",
                priority: "medium",
            },

            // Activités
            {
                title: "Masque et tuba",
                category: "activities",
                priority: "low",
            },
            {
                title: "Livre / E-reader",
                category: "activities",
                priority: "medium",
            },
            { title: "Jeux de plage", category: "activities", priority: "low" },

            // Santé & hygiène
            {
                title: "Trousse de premiers secours",
                category: "other",
                priority: "medium",
            },
            {
                title: "Répulsif anti-moustiques",
                category: "other",
                priority: "medium",
            },
            {
                title: "Médicaments personnels",
                category: "other",
                priority: "high",
            },
        ],
    },
    {
        type: "montagne",
        name: "Montagne & Randonnée",
        emoji: "🏔️",
        items: [
            // Documents
            {
                title: "Passeport / Carte d'identité",
                category: "documents",
                priority: "high",
            },
            {
                title: "Billets transport",
                category: "documents",
                priority: "high",
            },
            {
                title: "Réservation hébergement",
                category: "documents",
                priority: "high",
            },
            {
                title: "Assurance voyage + sport",
                category: "documents",
                priority: "high",
            },
            {
                title: "Cartes de randonnée",
                category: "documents",
                priority: "medium",
            },

            // Équipement montagne
            {
                title: "Chaussures de randonnée",
                category: "other",
                priority: "high",
            },
            {
                title: "Sac à dos de randonnée",
                category: "other",
                priority: "high",
            },
            {
                title: "Gourde / Système d'hydratation",
                category: "other",
                priority: "high",
            },
            { title: "Veste imperméable", category: "other", priority: "high" },
            {
                title: "Polaire / Doudoune",
                category: "other",
                priority: "high",
            },
            {
                title: "Pantalon de randonnée",
                category: "other",
                priority: "high",
            },
            {
                title: "Bâtons de marche",
                category: "other",
                priority: "medium",
            },
            {
                title: "Lampe frontale + piles",
                category: "other",
                priority: "medium",
            },
            { title: "Couteau suisse", category: "other", priority: "medium" },

            // Vêtements techniques
            {
                title: "T-shirts techniques",
                category: "other",
                priority: "high",
            },
            {
                title: "Sous-vêtements techniques",
                category: "other",
                priority: "high",
            },
            {
                title: "Chaussettes de randonnée",
                category: "other",
                priority: "high",
            },
            { title: "Bonnet et gants", category: "other", priority: "medium" },
            { title: "Guêtres", category: "other", priority: "low" },

            // Sécurité & navigation
            { title: "Boussole / GPS", category: "other", priority: "medium" },
            {
                title: "Sifflet de secours",
                category: "other",
                priority: "medium",
            },
            {
                title: "Couverture de survie",
                category: "other",
                priority: "low",
            },

            // Santé
            {
                title: "Trousse de premiers secours complète",
                category: "other",
                priority: "high",
            },
            {
                title: "Crème solaire haute protection",
                category: "other",
                priority: "high",
            },
            {
                title: "Lunettes de soleil",
                category: "other",
                priority: "high",
            },
            {
                title: "Médicaments personnels",
                category: "other",
                priority: "high",
            },
            { title: "Anti-douleurs", category: "other", priority: "medium" },
        ],
    },
    {
        type: "citytrip",
        name: "Voyage en ville",
        emoji: "🏙️",
        items: [
            // Documents
            {
                title: "Passeport / Carte d'identité",
                category: "documents",
                priority: "high",
            },
            {
                title: "Billets transport",
                category: "documents",
                priority: "high",
            },
            {
                title: "Réservation hébergement",
                category: "documents",
                priority: "high",
            },
            {
                title: "Assurance voyage",
                category: "documents",
                priority: "medium",
            },
            {
                title: "Cartes de transports locaux",
                category: "documents",
                priority: "medium",
            },
            {
                title: "Guide touristique / Plans",
                category: "documents",
                priority: "low",
            },

            // Vêtements urbains
            {
                title: "Chaussures de marche confortables",
                category: "other",
                priority: "high",
            },
            {
                title: "Tenues décontractées",
                category: "other",
                priority: "high",
            },
            {
                title: "Tenue élégante pour sorties",
                category: "other",
                priority: "medium",
            },
            {
                title: "Veste / Manteau selon saison",
                category: "other",
                priority: "high",
            },
            {
                title: "Parapluie compact",
                category: "other",
                priority: "medium",
            },

            // Électronique & tech
            {
                title: "Smartphone + chargeur",
                category: "other",
                priority: "high",
            },
            { title: "Appareil photo", category: "other", priority: "medium" },
            {
                title: "Batterie externe",
                category: "other",
                priority: "medium",
            },
            {
                title: "Adaptateur électrique",
                category: "other",
                priority: "high",
            },
            { title: "Écouteurs", category: "other", priority: "medium" },

            // Pratique ville
            { title: "Sac à dos de jour", category: "other", priority: "high" },
            {
                title: "Portefeuille voyage",
                category: "other",
                priority: "high",
            },
            {
                title: "Cadenas pour casier",
                category: "other",
                priority: "low",
            },
            {
                title: "Bouteille d'eau réutilisable",
                category: "other",
                priority: "medium",
            },

            // Activités culturelles
            {
                title: "Liste des musées à visiter",
                category: "activities",
                priority: "medium",
            },
            {
                title: "Réservations restaurants",
                category: "activities",
                priority: "low",
            },
            {
                title: "Billets spectacles/concerts",
                category: "activities",
                priority: "low",
            },

            // Santé & confort
            {
                title: "Trousse de premiers secours",
                category: "other",
                priority: "medium",
            },
            {
                title: "Médicaments personnels",
                category: "other",
                priority: "high",
            },
            { title: "Crème hydratante", category: "other", priority: "low" },
        ],
    },
    {
        type: "campagne",
        name: "Séjour à la campagne",
        emoji: "🌾",
        items: [
            // Documents
            {
                title: "Passeport / Carte d'identité",
                category: "documents",
                priority: "high",
            },
            {
                title: "Billets transport",
                category: "documents",
                priority: "high",
            },
            {
                title: "Réservation hébergement",
                category: "documents",
                priority: "high",
            },
            {
                title: "Assurance voyage",
                category: "documents",
                priority: "medium",
            },

            // Vêtements campagne
            {
                title: "Vêtements confortables",
                category: "other",
                priority: "high",
            },
            {
                title: "Chaussures de marche",
                category: "other",
                priority: "high",
            },
            {
                title: "Bottes en caoutchouc",
                category: "other",
                priority: "medium",
            },
            {
                title: "Veste imperméable",
                category: "other",
                priority: "medium",
            },
            { title: "Pull chaud", category: "other", priority: "medium" },
            {
                title: "Chapeau pour le soleil",
                category: "other",
                priority: "medium",
            },

            // Activités nature
            {
                title: "Appareil photo",
                category: "activities",
                priority: "medium",
            },
            { title: "Jumelles", category: "activities", priority: "low" },
            {
                title: "Guide de la faune/flore",
                category: "activities",
                priority: "low",
            },
            {
                title: "Carnet et stylo",
                category: "activities",
                priority: "low",
            },
            {
                title: "Jeux de société",
                category: "activities",
                priority: "medium",
            },
            { title: "Livres", category: "activities", priority: "medium" },

            // Pratique
            { title: "Lampe de poche", category: "other", priority: "medium" },
            {
                title: "Répulsif anti-insectes",
                category: "other",
                priority: "medium",
            },
            { title: "Crème solaire", category: "other", priority: "medium" },
            {
                title: "Sac à dos pour balades",
                category: "other",
                priority: "medium",
            },
            { title: "Gourde", category: "other", priority: "medium" },

            // Confort
            {
                title: "Chaussons / Pantoufles",
                category: "other",
                priority: "low",
            },
            { title: "Plaid pour soirées", category: "other", priority: "low" },
            { title: "Thermos", category: "other", priority: "low" },

            // Santé
            {
                title: "Trousse de premiers secours",
                category: "other",
                priority: "medium",
            },
            {
                title: "Médicaments personnels",
                category: "other",
                priority: "high",
            },
            {
                title: "Anti-allergique (pollen)",
                category: "other",
                priority: "low",
            },
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
