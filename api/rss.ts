// Service d'articles voyage avec données enrichies
import React from "react";

export interface Article {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    content: string;
    author?: string;
    thumbnail?: string;
    category?:
        | "destination"
        | "plage"
        | "roadtrip"
        | "conseil"
        | "culture"
        | "gastronomie"
        | "aventure"
        | "actualité";
    readTime?: string;
    tags?: string[];
}

// Base complète d'articles voyage variés et intéressants
const TRAVEL_ARTICLES: Article[] = [
    // ÎLES PARADISIAQUES
    {
        title: "Maldives : 10 îles secrètes loin des foules",
        link: "https://spontytrip.com/maldives-iles-secretes",
        pubDate: new Date().toISOString(),
        contentSnippet:
            "Découvrez les atolls les moins fréquentés des Maldives, véritables joyaux préservés aux eaux cristallines...",
        content:
            "Les Maldives ne se résument pas aux resorts de luxe. Voici 10 îles préservées où la nature règne encore en maître, avec des lagons turquoise et des récifs coralliens intact.",
        author: "Sarah Chen, Travel Expert",
        thumbnail:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
        category: "destination",
        readTime: "8 min",
        tags: ["Maldives", "Îles", "Plongée", "Luxe"],
    },
    {
        title: "Seychelles vs Maurice : quelle île choisir ?",
        link: "https://spontytrip.com/seychelles-maurice-comparaison",
        pubDate: new Date(Date.now() - 86400000).toISOString(),
        contentSnippet:
            "Comparatif complet entre ces deux perles de l'océan Indien : plages, activités, budget, culture...",
        content:
            "Guide détaillé pour choisir entre les Seychelles et l'île Maurice selon vos préférences : romantique, famille, aventure ou détente.",
        author: "Marc Dubois, Guide Local",
        thumbnail:
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop",
        category: "destination",
        readTime: "12 min",
        tags: ["Seychelles", "Maurice", "Océan Indien", "Comparatif"],
    },

    // PLAGES EXTRAORDINAIRES
    {
        title: "Les 15 plus belles plages d'Europe méconnues",
        link: "https://spontytrip.com/plages-secretes-europe",
        pubDate: new Date(Date.now() - 172800000).toISOString(),
        contentSnippet:
            "Cala Goloritzé en Sardaigne, Navagio en Grèce, Praia da Marinha au Portugal... Découvrez des plages de rêve sans la foule...",
        content:
            "15 plages européennes d'exception, encore préservées du tourisme de masse. Sable blanc, eaux turquoise et paysages à couper le souffle.",
        author: "Elena Rodriguez, Photographe Voyage",
        thumbnail:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop",
        category: "plage",
        readTime: "10 min",
        tags: ["Europe", "Plages", "Méditerranée", "Secret"],
    },
    {
        title: "Bali : les plages les plus instagrammables",
        link: "https://spontytrip.com/bali-plages-instagram",
        pubDate: new Date(Date.now() - 259200000).toISOString(),
        contentSnippet:
            "Kelingking Beach, Crystal Bay, Sekumpul Falls... Les spots parfaits pour vos photos de voyage à Bali...",
        content:
            "Guide des plus belles plages de Bali avec conseils photo, meilleurs moments pour y aller et accès détaillé.",
        author: "Alex Kim, Influenceur Voyage",
        thumbnail:
            "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=250&fit=crop",
        category: "plage",
        readTime: "7 min",
        tags: ["Bali", "Instagram", "Plages", "Photo"],
    },

    // ROAD TRIPS ÉPIQUES
    {
        title: "Route 66 : itinéraire complet en 21 jours",
        link: "https://spontytrip.com/route-66-itineraire-complet",
        pubDate: new Date(Date.now() - 345600000).toISOString(),
        contentSnippet:
            "De Chicago à Los Angeles, découvrez la mythique Route 66 étape par étape avec budget, hébergements et incontournables...",
        content:
            "Guide complet pour parcourir les 4000 km de la Route 66 : étapes clés, budgets, conseils pratiques et pépites cachées.",
        author: "John Williams, Road Trip Expert",
        thumbnail:
            "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop",
        category: "roadtrip",
        readTime: "15 min",
        tags: ["USA", "Route 66", "Road Trip", "Classique"],
    },
    {
        title: "Islande : tour complet en camping-car",
        link: "https://spontytrip.com/islande-camping-car-tour",
        pubDate: new Date(Date.now() - 432000000).toISOString(),
        contentSnippet:
            "La route circulaire islandaise en 14 jours : geysers, aurores boréales, glaciers et sources chaudes...",
        content:
            "Itinéraire détaillé pour découvrir l'Islande en camping-car : Ring Road, Westfjords, et tous les secrets de l'île de glace et de feu.",
        author: "Ingrid Larsen, Nature Guide",
        thumbnail:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
        category: "roadtrip",
        readTime: "18 min",
        tags: ["Islande", "Camping-car", "Nature", "Aurores"],
    },
    {
        title: "Côte Ouest Australie : Perth à Broome",
        link: "https://spontytrip.com/australie-cote-ouest-roadtrip",
        pubDate: new Date(Date.now() - 518400000).toISOString(),
        contentSnippet:
            "2500 km d'aventure le long de la côte ouest australienne : déserts rouges, plages infinies, faune sauvage...",
        content:
            "Road trip épique de Perth à Broome : Pinnacles Desert, Monkey Mia, Karijini National Park et Cable Beach.",
        author: "Emma Thompson, Aussie Explorer",
        thumbnail:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
        category: "roadtrip",
        readTime: "14 min",
        tags: ["Australie", "Désert", "Faune", "Aventure"],
    },

    // CONSEILS PRATIQUES
    {
        title: "Voyage solo : 20 conseils pour les femmes",
        link: "https://spontytrip.com/voyage-solo-femmes-conseils",
        pubDate: new Date(Date.now() - 604800000).toISOString(),
        contentSnippet:
            "Sécurité, destinations recommandées, astuces budget... Tout pour réussir son premier voyage solo au féminin...",
        content:
            "Guide complet pour voyager seule en toute sécurité : destinations sûres, applications utiles, précautions à prendre.",
        author: "Marie Dubois, Solo Traveler",
        thumbnail:
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop",
        category: "conseil",
        readTime: "12 min",
        tags: ["Solo", "Femmes", "Sécurité", "Conseils"],
    },
    {
        title: "Budget backpacker : voyager avec 30€/jour",
        link: "https://spontytrip.com/backpacker-budget-30-euros",
        pubDate: new Date(Date.now() - 691200000).toISOString(),
        contentSnippet:
            "Auberges, street food, transports locaux... Toutes les astuces pour voyager pas cher sans se priver...",
        content:
            "Stratégies éprouvées pour maintenir un budget de 30€/jour : hébergement, nourriture, transport et activités gratuites.",
        author: "Lucas Martin, Backpacker Pro",
        thumbnail:
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=250&fit=crop",
        category: "conseil",
        readTime: "9 min",
        tags: ["Budget", "Backpacker", "Économies", "Astuces"],
    },

    // CULTURE & GASTRONOMIE
    {
        title: "Street food Asie : 25 plats à goûter absolument",
        link: "https://spontytrip.com/street-food-asie-incontournables",
        pubDate: new Date(Date.now() - 777600000).toISOString(),
        contentSnippet:
            "Pad thaï, ramen, bánh mì, satay... Tour d'horizon des meilleures spécialités de rue en Asie...",
        content:
            "Guide gastronomique de la street food asiatique : où les trouver, comment les commander, et pourquoi vous devez les goûter.",
        author: "Chen Wei, Food Blogger",
        thumbnail:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop",
        category: "gastronomie",
        readTime: "11 min",
        tags: ["Asie", "Street Food", "Gastronomie", "Culture"],
    },
    {
        title: "Japon : guide de l'étiquette pour voyageurs",
        link: "https://spontytrip.com/japon-etiquette-guide-voyage",
        pubDate: new Date(Date.now() - 864000000).toISOString(),
        contentSnippet:
            "Saluer, manger, visiter les temples... Toutes les règles de politesse japonaise pour un voyage respectueux...",
        content:
            "Code de conduite essentiel au Japon : bonnes manières dans les transports, au restaurant, dans les temples et ryokans.",
        author: "Yuki Tanaka, Guide Culturel",
        thumbnail:
            "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=250&fit=crop",
        category: "culture",
        readTime: "8 min",
        tags: ["Japon", "Culture", "Étiquette", "Respect"],
    },

    // AVENTURES & SPORTS
    {
        title: "Trekking Himalaya : Everest Base Camp guide",
        link: "https://spontytrip.com/everest-base-camp-trekking-guide",
        pubDate: new Date(Date.now() - 950400000).toISOString(),
        contentSnippet:
            "16 jours de trek mythique vers le camp de base de l'Everest : préparation, équipement, altitude...",
        content:
            "Guide complet du trek EBC : entraînement physique, matériel nécessaire, acclimatation et étapes jour par jour.",
        author: "Pemba Sherpa, Guide Montagne",
        thumbnail:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
        category: "aventure",
        readTime: "20 min",
        tags: ["Népal", "Trekking", "Everest", "Montagne"],
    },
    {
        title: "Plongée Égypte : top 10 des sites mythiques",
        link: "https://spontytrip.com/plongee-egypte-mer-rouge",
        pubDate: new Date(Date.now() - 1036800000).toISOString(),
        contentSnippet:
            "Ras Mohammed, Brother Islands, épaves du Thistlegorm... Les plus beaux spots de plongée de la mer Rouge...",
        content:
            "Sélection des sites de plongée incontournables en Égypte : coraux, poissons tropicaux, requins et épaves historiques.",
        author: "Ahmed Hassan, Dive Master",
        thumbnail:
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop",
        category: "aventure",
        readTime: "13 min",
        tags: ["Égypte", "Plongée", "Mer Rouge", "Coraux"],
    },

    // ACTUALITÉS VOYAGE
    {
        title: "Visa électronique : nouvelles destinations 2024",
        link: "https://spontytrip.com/visa-electronique-2024-destinations",
        pubDate: new Date(Date.now() - 1123200000).toISOString(),
        contentSnippet:
            "Arabie Saoudite, Oman, Vietnam... Les pays qui facilitent l'entrée avec l'e-visa...",
        content:
            "Tour d'horizon des nouveautés visa 2024 : procédures simplifiées, e-visas et exemptions pour les voyageurs français.",
        author: "Consulat Info",
        thumbnail:
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop",
        category: "actualité",
        readTime: "6 min",
        tags: ["Visa", "Actualité", "Formalités", "2024"],
    },
    {
        title: "Écotourisme : les certifications à connaître",
        link: "https://spontytrip.com/ecotourisme-certifications-guide",
        pubDate: new Date(Date.now() - 1209600000).toISOString(),
        contentSnippet:
            "Green Key, Rainforest Alliance, LEED... Comment identifier les hébergements vraiment éco-responsables...",
        content:
            "Guide des principales certifications environnementales dans le tourisme pour voyager de manière plus responsable.",
        author: "Green Travel Collective",
        thumbnail:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop",
        category: "actualité",
        readTime: "10 min",
        tags: ["Écotourisme", "Environnement", "Certifications", "Responsable"],
    },
];

// Fonction pour obtenir des articles par catégorie
export const getArticlesByCategory = (
    category?: Article["category"],
    limit: number = 10
): Article[] => {
    if (!category) return getRandomArticles(limit);
    return TRAVEL_ARTICLES.filter(
        (article) => article.category === category
    ).slice(0, limit);
};

// Fonction pour obtenir des articles aléatoires
export const getRandomArticles = (limit: number = 10): Article[] => {
    const shuffled = [...TRAVEL_ARTICLES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
};

// Fonction pour rechercher des articles
export const searchArticles = (
    query: string,
    limit: number = 10
): Article[] => {
    const lowercaseQuery = query.toLowerCase();
    return TRAVEL_ARTICLES.filter(
        (article) =>
            article.title.toLowerCase().includes(lowercaseQuery) ||
            article.contentSnippet.toLowerCase().includes(lowercaseQuery) ||
            (article.tags &&
                article.tags.some((tag) =>
                    tag.toLowerCase().includes(lowercaseQuery)
                ))
    ).slice(0, limit);
};

// Hook principal pour les articles voyage
export const useTravelArticles = (category?: Article["category"]) => {
    const [articles, setArticles] = React.useState<Article[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const loadArticles = async () => {
        setLoading(true);
        setError(null);

        // Simulation d'un appel API
        setTimeout(() => {
            try {
                const data = category
                    ? getArticlesByCategory(category, 10)
                    : getRandomArticles(10);

                setArticles(data);
            } catch (err) {
                setError("Erreur lors du chargement des articles");
                setArticles([]);
            } finally {
                setLoading(false);
            }
        }, 500); // Simulation de temps de chargement
    };

    React.useEffect(() => {
        loadArticles();
    }, [category]);

    return { articles, loading, error, refetch: loadArticles };
};

// Maintien de la compatibilité avec l'ancien système
export const useRssArticles = useTravelArticles;
