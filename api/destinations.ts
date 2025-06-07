// Trending destinations service
import React from 'react';

export interface TrendingDestination {
    id: string;
    name: string;
    country: string;
    description: string;
    image: string;
    trending: boolean;
    category: 'plage' | 'montagne' | 'citytrip' | 'campagne';
    avgPrice: string;
    bestTime: string;
    highlights: string[];
}

// Mock trending destinations data
const mockDestinations: TrendingDestination[] = [
    {
        id: '1',
        name: 'Santorin',
        country: 'Grèce',
        description: 'Île grecque aux couchers de soleil magiques',
        image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop',
        trending: true,
        category: 'plage',
        avgPrice: '150€/nuit',
        bestTime: 'Mai-Oct',
        highlights: ['Couchers de soleil', 'Villages blancs', 'Plages volcaniques']
    },
    {
        id: '2',
        name: 'Kyoto',
        country: 'Japon',
        description: 'Ancienne capitale aux temples millénaires',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        trending: true,
        category: 'citytrip',
        avgPrice: '120€/nuit',
        bestTime: 'Mar-Mai, Sep-Nov',
        highlights: ['Temples', 'Jardins zen', 'Geishas']
    },
    {
        id: '3',
        name: 'Banff',
        country: 'Canada',
        description: 'Parc national aux paysages époustouflants',
        image: 'https://images.unsplash.com/photo-1441906363718-4e70474037d5?w=400&h=300&fit=crop',
        trending: false,
        category: 'montagne',
        avgPrice: '180€/nuit',
        bestTime: 'Juin-Sep',
        highlights: ['Lacs turquoise', 'Randonnées', 'Faune sauvage']
    },
    {
        id: '4',
        name: 'Lisbonne',
        country: 'Portugal',
        description: 'Capitale colorée aux collines pittoresques',
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop',
        trending: true,
        category: 'citytrip',
        avgPrice: '80€/nuit',
        bestTime: 'Avr-Oct',
        highlights: ['Tramways', 'Pastéis de nata', 'Fado']
    },
    {
        id: '5',
        name: 'Provence',
        country: 'France',
        description: 'Région de lavande et villages perchés',
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop',
        trending: false,
        category: 'campagne',
        avgPrice: '110€/nuit',
        bestTime: 'Mai-Sep',
        highlights: ['Champs de lavande', 'Marchés locaux', 'Villages médiévaux']
    },
    {
        id: '6',
        name: 'Maldives',
        country: 'Maldives',
        description: 'Paradis tropical aux eaux cristallines',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        trending: true,
        category: 'plage',
        avgPrice: '400€/nuit',
        bestTime: 'Nov-Avr',
        highlights: ['Bungalows sur pilotis', 'Plongée', 'Détente absolue']
    }
];

export const fetchTrendingDestinations = async (): Promise<TrendingDestination[]> => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockDestinations);
        }, 400);
    });
};

export const useTrendingDestinations = () => {
    const [destinations, setDestinations] = React.useState<TrendingDestination[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadDestinations = async () => {
            setLoading(true);
            try {
                const data = await fetchTrendingDestinations();
                setDestinations(data);
            } catch (error) {
                console.error('Error fetching destinations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDestinations();
    }, []);

    const trendingDestinations = destinations.filter(d => d.trending);
    const allDestinations = destinations;

    return { 
        destinations: allDestinations, 
        trendingDestinations, 
        loading 
    };
}; 