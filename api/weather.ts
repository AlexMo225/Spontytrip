// Weather API service using OpenWeatherMap free tier
import React from "react";

export interface WeatherData {
    city: string;
    country: string;
    temperature: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
}

// Mock weather data for popular destinations (since we don't want to use real API keys)
const mockWeatherData: WeatherData[] = [
    {
        city: "Paris",
        country: "France",
        temperature: 22,
        description: "Ensoleillé",
        icon: "sunny",
        humidity: 65,
        windSpeed: 12,
    },
    {
        city: "Londres",
        country: "Royaume-Uni",
        temperature: 18,
        description: "Nuageux",
        icon: "cloudy",
        humidity: 75,
        windSpeed: 15,
    },
    {
        city: "Rome",
        country: "Italie",
        temperature: 28,
        description: "Partiellement nuageux",
        icon: "partly-sunny",
        humidity: 60,
        windSpeed: 8,
    },
    {
        city: "Barcelone",
        country: "Espagne",
        temperature: 25,
        description: "Ensoleillé",
        icon: "sunny",
        humidity: 70,
        windSpeed: 10,
    },
    {
        city: "Amsterdam",
        country: "Pays-Bas",
        temperature: 19,
        description: "Pluvieux",
        icon: "rainy",
        humidity: 80,
        windSpeed: 18,
    },
];

export const fetchWeatherData = async (): Promise<WeatherData[]> => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockWeatherData);
        }, 500);
    });
};

export const useWeatherData = () => {
    const [weatherData, setWeatherData] = React.useState<WeatherData[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadWeather = async () => {
            setLoading(true);
            try {
                const data = await fetchWeatherData();
                setWeatherData(data);
            } catch (error) {
                console.error("Error fetching weather:", error);
            } finally {
                setLoading(false);
            }
        };

        loadWeather();
    }, []);

    return { weatherData, loading };
};
