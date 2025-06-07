export interface Country {
    name: {
        common: string;
        official: string;
        nativeName?: { [key: string]: { official: string; common: string } };
    };
    cca2: string;
    cca3: string;
    capital?: string[];
    region: string;
    subregion?: string;
    population: number;
    area: number;
    languages?: { [key: string]: string };
    currencies?: {
        [key: string]: {
            name: string;
            symbol: string;
        };
    };
    timezones: string[];
    continents: string[];
    flags: {
        png: string;
        svg: string;
        alt?: string;
    };
    coatOfArms?: {
        png?: string;
        svg?: string;
    };
    latlng: number[];
    maps: {
        googleMaps: string;
        openStreetMaps: string;
    };
    borders?: string[];
    independent?: boolean;
    status: string;
}

export interface CountryInfo {
    name: string;
    officialName: string;
    capital: string;
    region: string;
    subregion: string;
    population: number;
    area: number;
    languages: string[];
    currencies: Array<{
        name: string;
        symbol: string;
        code: string;
    }>;
    timezones: string[];
    flag: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    maps: {
        google: string;
        openStreetMap: string;
    };
    borders: string[];
    continent: string;
}

export interface PopularDestination {
    country: string;
    capital: string;
    region: string;
    flag: string;
    currency: string;
    language: string;
    timezone: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    description: string;
    attractions: string[];
    bestTime: string;
    budget: "Économique" | "Moyen" | "Élevé";
}

// Destinations populaires avec des infos voyage
const popularDestinationsData: {
    [key: string]: {
        description: string;
        attractions: string[];
        bestTime: string;
        budget: "Économique" | "Moyen" | "Élevé";
    };
} = {
    France: {
        description:
            "Pays de l'art de vivre, de la gastronomie et du patrimoine historique exceptionnel.",
        attractions: [
            "Tour Eiffel",
            "Château de Versailles",
            "Louvre",
            "Provence",
            "Côte d'Azur",
        ],
        bestTime: "Mai - Septembre",
        budget: "Moyen",
    },
    Japan: {
        description:
            "Mélange fascinant entre traditions ancestrales et modernité technologique.",
        attractions: [
            "Mont Fuji",
            "Temples de Kyoto",
            "Tokyo",
            "Osaka",
            "Jardins zen",
        ],
        bestTime: "Mars - Mai, Octobre - Novembre",
        budget: "Élevé",
    },
    Italy: {
        description:
            "Berceau de l'art, de l'architecture et de la cuisine méditerranéenne.",
        attractions: [
            "Colisée",
            "Venise",
            "Toscane",
            "Côte amalfitaine",
            "Vatican",
        ],
        bestTime: "Avril - Juin, Septembre - Octobre",
        budget: "Moyen",
    },
    Spain: {
        description:
            "Pays de la passion, du flamenco et des plages méditerranéennes.",
        attractions: [
            "Sagrada Familia",
            "Alhambra",
            "Plages de la Costa Brava",
            "Madrid",
            "Séville",
        ],
        bestTime: "Mai - Septembre",
        budget: "Moyen",
    },
    Thailand: {
        description:
            "Royaume du sourire aux temples dorés et plages paradisiaques.",
        attractions: [
            "Bangkok",
            "Phuket",
            "Chiang Mai",
            "Temples bouddhistes",
            "Îles Phi Phi",
        ],
        bestTime: "Novembre - Mars",
        budget: "Économique",
    },
    "United Kingdom": {
        description:
            "Histoire royale, châteaux emblématiques et paysages verdoyants.",
        attractions: [
            "Big Ben",
            "Château de Windsor",
            "Écosse",
            "Stonehenge",
            "Pays de Galles",
        ],
        bestTime: "Mai - Septembre",
        budget: "Élevé",
    },
    Australia: {
        description: "Continent aux paysages époustouflants et faune unique.",
        attractions: [
            "Sydney Opera House",
            "Grande Barrière de Corail",
            "Uluru",
            "Melbourne",
            "Outback",
        ],
        bestTime: "Mars - Mai, Septembre - Novembre",
        budget: "Élevé",
    },
    "United States": {
        description:
            "Diversité de paysages et de cultures dans un pays continent.",
        attractions: [
            "Grand Canyon",
            "New York",
            "Californie",
            "Floride",
            "Parcs nationaux",
        ],
        bestTime: "Avril - Juin, Septembre - Octobre",
        budget: "Élevé",
    },
    // Données de fallback par défaut
    default: {
        description:
            "Destination fascinante avec de nombreuses merveilles à découvrir.",
        attractions: [
            "Sites historiques",
            "Paysages naturels",
            "Culture locale",
        ],
        bestTime: "Toute l'année",
        budget: "Moyen",
    },
};

export const getAllCountries = async (): Promise<Country[]> => {
    try {
        const response = await fetch(
            "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,subregion,population,area,languages,currencies,timezones,continents,flags,coatOfArms,latlng,maps,borders,independent,status"
        );

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des pays");
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur API RestCountries:", error);
        throw error;
    }
};

export const getCountryByName = async (
    name: string
): Promise<CountryInfo | null> => {
    try {
        const response = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(
                name
            )}?fullText=false&fields=name,cca2,cca3,capital,region,subregion,population,area,languages,currencies,timezones,continents,flags,coatOfArms,latlng,maps,borders,independent,status`
        );

        if (!response.ok) {
            return null;
        }

        const countries: Country[] = await response.json();

        if (countries.length === 0) {
            return null;
        }

        const country = countries[0];

        return {
            name: country.name.common,
            officialName: country.name.official,
            capital: country.capital?.[0] || "N/A",
            region: country.region,
            subregion: country.subregion || "",
            population: country.population,
            area: country.area,
            languages: country.languages
                ? Object.values(country.languages)
                : [],
            currencies: country.currencies
                ? Object.entries(country.currencies).map(([code, curr]) => ({
                      code,
                      name: curr.name,
                      symbol: curr.symbol || "",
                  }))
                : [],
            timezones: country.timezones,
            flag: country.flags.png,
            coordinates: {
                latitude: country.latlng[0],
                longitude: country.latlng[1],
            },
            maps: {
                google: country.maps.googleMaps,
                openStreetMap: country.maps.openStreetMaps,
            },
            borders: country.borders || [],
            continent: country.continents[0] || country.region,
        };
    } catch (error) {
        console.error("Erreur lors de la recherche du pays:", error);
        return null;
    }
};

export const getCountryByCode = async (
    code: string
): Promise<CountryInfo | null> => {
    try {
        const response = await fetch(
            `https://restcountries.com/v3.1/alpha/${code}?fields=name,cca2,cca3,capital,region,subregion,population,area,languages,currencies,timezones,continents,flags,coatOfArms,latlng,maps,borders,independent,status`
        );

        if (!response.ok) {
            return null;
        }

        const country: Country = await response.json();

        return {
            name: country.name.common,
            officialName: country.name.official,
            capital: country.capital?.[0] || "N/A",
            region: country.region,
            subregion: country.subregion || "",
            population: country.population,
            area: country.area,
            languages: country.languages
                ? Object.values(country.languages)
                : [],
            currencies: country.currencies
                ? Object.entries(country.currencies).map(([code, curr]) => ({
                      code,
                      name: curr.name,
                      symbol: curr.symbol || "",
                  }))
                : [],
            timezones: country.timezones,
            flag: country.flags.png,
            coordinates: {
                latitude: country.latlng[0],
                longitude: country.latlng[1],
            },
            maps: {
                google: country.maps.googleMaps,
                openStreetMap: country.maps.openStreetMaps,
            },
            borders: country.borders || [],
            continent: country.continents[0] || country.region,
        };
    } catch (error) {
        console.error("Erreur lors de la recherche du pays par code:", error);
        return null;
    }
};

export const getCountriesByRegion = async (
    region: string
): Promise<CountryInfo[]> => {
    try {
        const response = await fetch(
            `https://restcountries.com/v3.1/region/${encodeURIComponent(
                region
            )}?fields=name,cca2,cca3,capital,region,subregion,population,area,languages,currencies,timezones,continents,flags,coatOfArms,latlng,maps,borders,independent,status`
        );

        if (!response.ok) {
            throw new Error(
                "Erreur lors de la récupération des pays de la région"
            );
        }

        const countries: Country[] = await response.json();

        return countries.map((country) => ({
            name: country.name.common,
            officialName: country.name.official,
            capital: country.capital?.[0] || "N/A",
            region: country.region,
            subregion: country.subregion || "",
            population: country.population,
            area: country.area,
            languages: country.languages
                ? Object.values(country.languages)
                : [],
            currencies: country.currencies
                ? Object.entries(country.currencies).map(([code, curr]) => ({
                      code,
                      name: curr.name,
                      symbol: curr.symbol || "",
                  }))
                : [],
            timezones: country.timezones,
            flag: country.flags.png,
            coordinates: {
                latitude: country.latlng[0],
                longitude: country.latlng[1],
            },
            maps: {
                google: country.maps.googleMaps,
                openStreetMap: country.maps.openStreetMaps,
            },
            borders: country.borders || [],
            continent: country.continents[0] || country.region,
        }));
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des pays par région:",
            error
        );
        return [];
    }
};

export const getPopularDestinations = async (): Promise<
    PopularDestination[]
> => {
    try {
        const popularCountryNames = Object.keys(popularDestinationsData);
        const countries = await Promise.all(
            popularCountryNames.map((name) => getCountryByName(name))
        );

        return countries
            .filter((country): country is CountryInfo => country !== null)
            .map((country) => {
                // Mapping des noms de pays pour gérer les différences entre API et nos données
                const countryNameMapping: { [key: string]: string } = {
                    "United States": "United States",
                    "United Kingdom": "United Kingdom",
                    France: "France",
                    Japan: "Japan",
                    Italy: "Italy",
                    Spain: "Spain",
                    Thailand: "Thailand",
                    Australia: "Australia",
                };

                const mappedName =
                    countryNameMapping[country.name] || country.name;
                let data = popularDestinationsData[mappedName];

                // Utiliser les données de fallback si aucune correspondance
                if (!data) {
                    console.warn(
                        `Aucune donnée trouvée pour le pays: ${country.name} (mappé: ${mappedName}), utilisation des données par défaut`
                    );
                    data = popularDestinationsData.default;
                }

                return {
                    country: country.name,
                    capital: country.capital,
                    region: country.region,
                    flag: country.flag,
                    currency: country.currencies[0]?.name || "N/A",
                    language: country.languages[0] || "N/A",
                    timezone: country.timezones[0] || "N/A",
                    coordinates: country.coordinates,
                    description: data.description,
                    attractions: data.attractions,
                    bestTime: data.bestTime,
                    budget: data.budget,
                };
            });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des destinations populaires:",
            error
        );
        return [];
    }
};

export const searchCountries = async (
    query: string
): Promise<CountryInfo[]> => {
    try {
        if (query.length < 2) {
            return [];
        }

        const response = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(
                query
            )}?fields=name,cca2,cca3,capital,region,subregion,population,area,languages,currencies,timezones,continents,flags,coatOfArms,latlng,maps,borders,independent,status`
        );

        if (!response.ok) {
            return [];
        }

        const countries: Country[] = await response.json();

        return countries.map((country) => ({
            name: country.name.common,
            officialName: country.name.official,
            capital: country.capital?.[0] || "N/A",
            region: country.region,
            subregion: country.subregion || "",
            population: country.population,
            area: country.area,
            languages: country.languages
                ? Object.values(country.languages)
                : [],
            currencies: country.currencies
                ? Object.entries(country.currencies).map(([code, curr]) => ({
                      code,
                      name: curr.name,
                      symbol: curr.symbol || "",
                  }))
                : [],
            timezones: country.timezones,
            flag: country.flags.png,
            coordinates: {
                latitude: country.latlng[0],
                longitude: country.latlng[1],
            },
            maps: {
                google: country.maps.googleMaps,
                openStreetMap: country.maps.openStreetMaps,
            },
            borders: country.borders || [],
            continent: country.continents[0] || country.region,
        }));
    } catch (error) {
        console.error("Erreur lors de la recherche de pays:", error);
        return [];
    }
};
