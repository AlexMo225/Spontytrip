export interface WeatherData {
    current: {
        time: string;
        temperature_2m: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        weather_code: number;
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        relative_humidity_2m: number[];
        wind_speed_10m: number[];
        weather_code: number[];
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
    };
}

export interface LocationWeather {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    current: {
        temperature: number;
        humidity: number;
        windSpeed: number;
        condition: string;
        icon: string;
    };
    forecast: Array<{
        date: string;
        day: string;
        high: number;
        low: number;
        condition: string;
        icon: string;
    }>;
}

// Mapping des codes météo Open-Meteo vers des descriptions et icônes
const getWeatherInfo = (code: number) => {
    const weatherCodes: { [key: number]: { condition: string; icon: string } } =
        {
            0: { condition: "Ensoleillé", icon: "☀️" },
            1: { condition: "Principalement ensoleillé", icon: "🌤️" },
            2: { condition: "Partiellement nuageux", icon: "⛅" },
            3: { condition: "Nuageux", icon: "☁️" },
            45: { condition: "Brouillard", icon: "🌫️" },
            48: { condition: "Brouillard givrant", icon: "🌫️" },
            51: { condition: "Bruine légère", icon: "🌦️" },
            53: { condition: "Bruine modérée", icon: "🌦️" },
            55: { condition: "Bruine dense", icon: "🌧️" },
            61: { condition: "Pluie légère", icon: "🌧️" },
            63: { condition: "Pluie modérée", icon: "🌧️" },
            65: { condition: "Pluie forte", icon: "⛈️" },
            71: { condition: "Neige légère", icon: "🌨️" },
            73: { condition: "Neige modérée", icon: "❄️" },
            75: { condition: "Neige forte", icon: "❄️" },
            95: { condition: "Orage", icon: "⛈️" },
            96: { condition: "Orage avec grêle légère", icon: "⛈️" },
            99: { condition: "Orage avec grêle forte", icon: "⛈️" },
        };

    return weatherCodes[code] || { condition: "Inconnu", icon: "🌡️" };
};

// Coordonnées de villes populaires pour les exemples
const popularCities = [
    { city: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
    {
        city: "Londres",
        country: "Royaume-Uni",
        latitude: 51.5074,
        longitude: -0.1278,
    },
    { city: "Tokyo", country: "Japon", latitude: 35.6762, longitude: 139.6503 },
    {
        city: "New York",
        country: "États-Unis",
        latitude: 40.7128,
        longitude: -74.006,
    },
    {
        city: "Sydney",
        country: "Australie",
        latitude: -33.8688,
        longitude: 151.2093,
    },
    {
        city: "Barcelone",
        country: "Espagne",
        latitude: 41.3851,
        longitude: 2.1734,
    },
    { city: "Rome", country: "Italie", latitude: 41.9028, longitude: 12.4964 },
    {
        city: "Bangkok",
        country: "Thaïlande",
        latitude: 13.7563,
        longitude: 100.5018,
    },
];

export const getWeatherData = async (
    latitude: number,
    longitude: number
): Promise<WeatherData> => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`
        );

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données météo");
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur API Open-Meteo:", error);
        throw error;
    }
};

export const getLocationWeather = async (
    city: string,
    country: string,
    latitude: number,
    longitude: number
): Promise<LocationWeather> => {
    try {
        const weatherData = await getWeatherData(latitude, longitude);
        const currentWeatherInfo = getWeatherInfo(
            weatherData.current.weather_code
        );

        // Générer les prévisions pour les 5 prochains jours
        const forecast = weatherData.daily.time
            .slice(1, 6)
            .map((date, index) => {
                const weatherInfo = getWeatherInfo(
                    weatherData.daily.weather_code[index + 1]
                );
                const dateObj = new Date(date);

                return {
                    date: date,
                    day: dateObj.toLocaleDateString("fr-FR", {
                        weekday: "short",
                    }),
                    high: Math.round(
                        weatherData.daily.temperature_2m_max[index + 1]
                    ),
                    low: Math.round(
                        weatherData.daily.temperature_2m_min[index + 1]
                    ),
                    condition: weatherInfo.condition,
                    icon: weatherInfo.icon,
                };
            });

        return {
            city,
            country,
            latitude,
            longitude,
            current: {
                temperature: Math.round(weatherData.current.temperature_2m),
                humidity: weatherData.current.relative_humidity_2m,
                windSpeed: Math.round(weatherData.current.wind_speed_10m),
                condition: currentWeatherInfo.condition,
                icon: currentWeatherInfo.icon,
            },
            forecast,
        };
    } catch (error) {
        console.error("Erreur lors de la récupération de la météo:", error);
        throw error;
    }
};

export const getPopularCitiesWeather = async (): Promise<LocationWeather[]> => {
    try {
        const weatherPromises = popularCities.map((city) =>
            getLocationWeather(
                city.city,
                city.country,
                city.latitude,
                city.longitude
            )
        );

        const results = await Promise.allSettled(weatherPromises);

        return results
            .filter(
                (result): result is PromiseFulfilledResult<LocationWeather> =>
                    result.status === "fulfilled"
            )
            .map((result) => result.value);
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de la météo des villes populaires:",
            error
        );
        return [];
    }
};

export const searchCityWeather = async (
    cityName: string
): Promise<LocationWeather | null> => {
    try {
        // D'abord, essayer de géocoder la ville avec Nominatim (OpenStreetMap)
        const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                cityName
            )}&limit=1&addressdetails=1`
        );

        if (!geoResponse.ok) {
            throw new Error("Erreur lors de la géolocalisation");
        }

        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            return null;
        }

        const location = geoData[0];
        const latitude = parseFloat(location.lat);
        const longitude = parseFloat(location.lon);
        const city =
            location.address?.city ||
            location.address?.town ||
            location.address?.village ||
            location.display_name.split(",")[0];
        const country = location.address?.country || "Inconnu";

        return await getLocationWeather(city, country, latitude, longitude);
    } catch (error) {
        console.error("Erreur lors de la recherche météo de ville:", error);
        return null;
    }
};
