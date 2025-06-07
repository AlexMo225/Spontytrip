// Currency conversion service with Frankfurter API
import React from "react";

export interface CurrencyRate {
    code: string;
    name: string;
    rate: number;
    flag: string;
    symbol: string;
}

export interface CurrencyConversion {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    convertedAmount: number;
    rate: number;
    lastUpdated: string;
}

export interface FrankfurterResponse {
    amount: number;
    base: string;
    date: string;
    rates: { [key: string]: number };
}

// Liste complète des devises avec informations détaillées
const currencyInfo: Record<
    string,
    { name: string; flag: string; symbol: string }
> = {
    EUR: { name: "Euro", flag: "🇪🇺", symbol: "€" },
    USD: { name: "Dollar américain", flag: "🇺🇸", symbol: "$" },
    GBP: { name: "Livre sterling", flag: "🇬🇧", symbol: "£" },
    JPY: { name: "Yen japonais", flag: "🇯🇵", symbol: "¥" },
    CHF: { name: "Franc suisse", flag: "🇨🇭", symbol: "CHF" },
    CAD: { name: "Dollar canadien", flag: "🇨🇦", symbol: "C$" },
    AUD: { name: "Dollar australien", flag: "🇦🇺", symbol: "A$" },
    CNY: { name: "Yuan chinois", flag: "🇨🇳", symbol: "¥" },
    MXN: { name: "Peso mexicain", flag: "🇲🇽", symbol: "$" },
    BRL: { name: "Réal brésilien", flag: "🇧🇷", symbol: "R$" },
    KRW: { name: "Won sud-coréen", flag: "🇰🇷", symbol: "₩" },
    SEK: { name: "Couronne suédoise", flag: "🇸🇪", symbol: "kr" },
    NOK: { name: "Couronne norvégienne", flag: "🇳🇴", symbol: "kr" },
    DKK: { name: "Couronne danoise", flag: "🇩🇰", symbol: "kr" },
    RUB: { name: "Rouble russe", flag: "🇷🇺", symbol: "₽" },
    INR: { name: "Roupie indienne", flag: "🇮🇳", symbol: "₹" },
    SGD: { name: "Dollar singapourien", flag: "🇸🇬", symbol: "S$" },
    HKD: { name: "Dollar de Hong Kong", flag: "🇭🇰", symbol: "HK$" },
    TRY: { name: "Livre turque", flag: "🇹🇷", symbol: "₺" },
    ZAR: { name: "Rand sud-africain", flag: "🇿🇦", symbol: "R" },
    THB: { name: "Baht thaïlandais", flag: "🇹🇭", symbol: "฿" },
    NZD: { name: "Dollar néo-zélandais", flag: "🇳🇿", symbol: "NZ$" },
    MAD: { name: "Dirham marocain", flag: "🇲🇦", symbol: "DH" },
    EGP: { name: "Livre égyptienne", flag: "🇪🇬", symbol: "E£" },
    AED: { name: "Dirham des EAU", flag: "🇦🇪", symbol: "د.إ" },
};

// Devises les plus populaires pour les voyageurs
const popularCurrencies = [
    "EUR",
    "USD",
    "GBP",
    "JPY",
    "CHF",
    "CAD",
    "AUD",
    "CNY",
    "MXN",
    "BRL",
    "KRW",
    "SEK",
    "NOK",
    "INR",
    "SGD",
    "HKD",
    "TRY",
    "ZAR",
    "THB",
    "NZD",
    "MAD",
    "EGP",
    "AED",
];

// API Frankfurter (gratuite, pas de clé requise)
const FRANKFURTER_API = "https://api.frankfurter.app";

export const fetchCurrencyRates = async (
    baseCurrency: string = "EUR"
): Promise<CurrencyRate[]> => {
    try {
        // Récupérer les taux depuis Frankfurter API
        const currencies = popularCurrencies
            .filter((c) => c !== baseCurrency)
            .join(",");
        const response = await fetch(
            `${FRANKFURTER_API}/latest?from=${baseCurrency}&to=${currencies}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FrankfurterResponse = await response.json();

        // Convertir en format CurrencyRate
        const rates: CurrencyRate[] = [];

        // Ajouter la devise de base avec taux 1
        if (currencyInfo[baseCurrency]) {
            rates.push({
                code: baseCurrency,
                name: currencyInfo[baseCurrency].name,
                rate: 1,
                flag: currencyInfo[baseCurrency].flag,
                symbol: currencyInfo[baseCurrency].symbol,
            });
        }

        // Ajouter les autres devises avec leurs taux
        Object.entries(data.rates).forEach(([code, rate]) => {
            if (currencyInfo[code]) {
                rates.push({
                    code,
                    name: currencyInfo[code].name,
                    rate,
                    flag: currencyInfo[code].flag,
                    symbol: currencyInfo[code].symbol,
                });
            }
        });

        return rates;
    } catch (error) {
        console.warn("Frankfurter API failed, using fallback data:", error);

        // Données de fallback en cas d'erreur API
        return getFallbackRates(baseCurrency);
    }
};

// Données de secours si l'API ne fonctionne pas
const getFallbackRates = (baseCurrency: string): CurrencyRate[] => {
    const fallbackRates: Record<string, number> = {
        EUR: 1,
        USD: 1.09,
        GBP: 0.85,
        JPY: 160.5,
        CHF: 0.97,
        CAD: 1.48,
        AUD: 1.65,
        CNY: 7.89,
        MXN: 18.5,
        BRL: 5.42,
        KRW: 1450.0,
        SEK: 11.5,
        NOK: 11.8,
        INR: 90.5,
        SGD: 1.45,
        HKD: 8.5,
        TRY: 32.1,
        ZAR: 20.2,
        THB: 38.9,
        NZD: 1.78,
        MAD: 10.8,
        EGP: 53.7,
        AED: 4.0,
    };

    return popularCurrencies.map((code) => ({
        code,
        name: currencyInfo[code].name,
        rate:
            baseCurrency === "EUR"
                ? fallbackRates[code] || 1
                : (fallbackRates[code] || 1) /
                  (fallbackRates[baseCurrency] || 1),
        flag: currencyInfo[code].flag,
        symbol: currencyInfo[code].symbol,
    }));
};

export const convertCurrency = (
    amount: number,
    fromCode: string,
    toCode: string,
    rates: CurrencyRate[]
): CurrencyConversion => {
    const fromRate = rates.find((r) => r.code === fromCode)?.rate || 1;
    const toRate = rates.find((r) => r.code === toCode)?.rate || 1;

    // Calcul de conversion
    const convertedAmount = (amount / fromRate) * toRate;
    const rate = toRate / fromRate;

    return {
        amount,
        fromCurrency: fromCode,
        toCurrency: toCode,
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        rate: Math.round(rate * 10000) / 10000,
        lastUpdated: new Date().toLocaleString("fr-FR"),
    };
};

export const formatCurrency = (
    amount: number,
    currencyCode: string
): string => {
    const currency = currencyInfo[currencyCode];
    if (!currency) return amount.toString();

    // Formatage spécial pour certaines devises
    switch (currencyCode) {
        case "JPY":
        case "KRW":
            // Pas de décimales pour ces devises
            return `${currency.symbol} ${Math.round(amount).toLocaleString(
                "fr-FR"
            )}`;
        default:
            return `${currency.symbol} ${amount.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
    }
};

export const useCurrencyRates = (baseCurrency: string = "EUR") => {
    const [rates, setRates] = React.useState<CurrencyRate[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = React.useState<string>("");

    const loadRates = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchCurrencyRates(baseCurrency);
            setRates(data);
            setLastUpdated(new Date().toLocaleString("fr-FR"));
        } catch (err) {
            setError("Erreur lors du chargement des taux de change");
            console.error("Error fetching currency rates:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadRates();
    }, [baseCurrency]);

    return { rates, loading, error, lastUpdated, refetch: loadRates };
};
