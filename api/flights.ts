// Flight search service
import React from "react";

export interface FlightOffer {
    id: string;
    departure: {
        city: string;
        airport: string;
        date: string;
        time: string;
    };
    arrival: {
        city: string;
        airport: string;
        date: string;
        time: string;
    };
    airline: string;
    price: number;
    originalPrice: number;
    duration: string;
    stops: number;
    discount: number;
    class: "economy" | "business" | "first";
}

export interface FlightSearchParams {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    class: "economy" | "business" | "first";
}

// Mock flight offers
const mockFlightOffers: FlightOffer[] = [
    {
        id: "1",
        departure: {
            city: "Paris",
            airport: "CDG",
            date: "2024-03-15",
            time: "08:30",
        },
        arrival: {
            city: "Rome",
            airport: "FCO",
            date: "2024-03-15",
            time: "10:45",
        },
        airline: "Air France",
        price: 149,
        originalPrice: 199,
        duration: "2h 15m",
        stops: 0,
        discount: 25,
        class: "economy",
    },
    {
        id: "2",
        departure: {
            city: "Paris",
            airport: "ORY",
            date: "2024-03-16",
            time: "14:20",
        },
        arrival: {
            city: "Barcelone",
            airport: "BCN",
            date: "2024-03-16",
            time: "16:00",
        },
        airline: "Vueling",
        price: 89,
        originalPrice: 129,
        duration: "1h 40m",
        stops: 0,
        discount: 31,
        class: "economy",
    },
    {
        id: "3",
        departure: {
            city: "Paris",
            airport: "CDG",
            date: "2024-03-20",
            time: "11:15",
        },
        arrival: {
            city: "Londres",
            airport: "LHR",
            date: "2024-03-20",
            time: "11:45",
        },
        airline: "British Airways",
        price: 128,
        originalPrice: 168,
        duration: "1h 30m",
        stops: 0,
        discount: 24,
        class: "economy",
    },
    {
        id: "4",
        departure: {
            city: "Paris",
            airport: "CDG",
            date: "2024-03-22",
            time: "06:45",
        },
        arrival: {
            city: "Amsterdam",
            airport: "AMS",
            date: "2024-03-22",
            time: "08:15",
        },
        airline: "KLM",
        price: 95,
        originalPrice: 135,
        duration: "1h 30m",
        stops: 0,
        discount: 30,
        class: "economy",
    },
    {
        id: "5",
        departure: {
            city: "Paris",
            airport: "CDG",
            date: "2024-03-25",
            time: "19:30",
        },
        arrival: {
            city: "Lisbonne",
            airport: "LIS",
            date: "2024-03-25",
            time: "21:15",
        },
        airline: "TAP Portugal",
        price: 112,
        originalPrice: 162,
        duration: "2h 45m",
        stops: 0,
        discount: 31,
        class: "economy",
    },
];

export const searchFlights = async (
    params: FlightSearchParams
): Promise<FlightOffer[]> => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            // Filter offers based on search params (simplified)
            const filteredOffers = mockFlightOffers.filter(
                (offer) =>
                    offer.arrival.city
                        .toLowerCase()
                        .includes(params.to.toLowerCase()) ||
                    offer.departure.city
                        .toLowerCase()
                        .includes(params.from.toLowerCase())
            );
            resolve(
                filteredOffers.length > 0 ? filteredOffers : mockFlightOffers
            );
        }, 600);
    });
};

export const getBestFlightOffers = async (): Promise<FlightOffer[]> => {
    // Return best deals (highest discount)
    return new Promise((resolve) => {
        setTimeout(() => {
            const bestOffers = [...mockFlightOffers]
                .sort((a, b) => b.discount - a.discount)
                .slice(0, 4);
            resolve(bestOffers);
        }, 300);
    });
};

export const useFlightOffers = () => {
    const [offers, setOffers] = React.useState<FlightOffer[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadOffers = async () => {
            setLoading(true);
            try {
                const data = await getBestFlightOffers();
                setOffers(data);
            } catch (error) {
                console.error("Error fetching flight offers:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOffers();
    }, []);

    return { offers, loading };
};
