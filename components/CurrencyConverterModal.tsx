// Currency Converter Modal Component with Frankfurter API
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    convertCurrency,
    formatCurrency,
    useCurrencyRates,
} from "../api/currency";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { useModal, useQuickModals } from "../hooks/useModal";

interface Props {
    visible: boolean;
    onClose: () => void;
}

const CurrencyConverterModal: React.FC<Props> = ({ visible, onClose }) => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const { rates, loading, error, lastUpdated, refetch } =
        useCurrencyRates("EUR");
    const [amount, setAmount] = useState("100");
    const [fromCurrency, setFromCurrency] = useState("EUR");
    const [toCurrency, setToCurrency] = useState("USD");
    const [showAllCurrencies, setShowAllCurrencies] = useState(false);

    const getConversion = () => {
        const numAmount = parseFloat(amount) || 0;
        if (numAmount <= 0 || rates.length === 0) return null;

        return convertCurrency(numAmount, fromCurrency, toCurrency, rates);
    };

    const conversion = getConversion();

    // Devises les plus utilisées en premier
    const getDisplayedRates = () => {
        if (showAllCurrencies) return rates;

        const priority = [
            "EUR",
            "USD",
            "GBP",
            "JPY",
            "CHF",
            "CAD",
            "AUD",
            "CNY",
        ];
        const priorityRates = priority
            .map((code) => rates.find((r) => r.code === code))
            .filter(
                (rate): rate is NonNullable<typeof rate> => rate !== undefined
            );
        const otherRates = rates.filter((r) => !priority.includes(r.code));

        return [...priorityRates, ...otherRates.slice(0, 4)];
    };

    const handleRefresh = async () => {
        try {
            await refetch();
        } catch (err) {
            modal.showError(
                "Erreur",
                "Impossible de mettre à jour les taux de change"
            );
        }
    };

    const renderCurrencySelector = (
        selectedCurrency: string,
        onSelect: (code: string) => void,
        title: string
    ) => (
        <View style={styles.currencySection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {title === "De" && (
                    <TouchableOpacity
                        onPress={() => setShowAllCurrencies(!showAllCurrencies)}
                        style={styles.toggleButton}
                    >
                        <Text style={styles.toggleText}>
                            {showAllCurrencies ? "Moins" : "Plus"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.currencyList}
            >
                {getDisplayedRates().map((rate) => (
                    <TouchableOpacity
                        key={rate.code}
                        style={[
                            styles.currencyItem,
                            selectedCurrency === rate.code &&
                                styles.currencyItemSelected,
                        ]}
                        onPress={() => onSelect(rate.code)}
                    >
                        <Text style={styles.currencyFlag}>{rate.flag}</Text>
                        <Text
                            style={[
                                styles.currencyCode,
                                selectedCurrency === rate.code &&
                                    styles.currencyCodeSelected,
                            ]}
                        >
                            {rate.code}
                        </Text>
                        <Text style={styles.currencySymbol}>{rate.symbol}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                    >
                        <Ionicons
                            name="close"
                            size={24}
                            color={Colors.text.primary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>💱 Convertisseur</Text>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        style={styles.refreshButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#4DA1A9" />
                        ) : (
                            <Ionicons
                                name="refresh"
                                size={20}
                                color="#4DA1A9"
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Last Updated */}
                {lastUpdated && (
                    <View style={styles.updateInfo}>
                        <Text style={styles.updateText}>
                            📡 Mis à jour : {lastUpdated}
                        </Text>
                    </View>
                )}

                <ScrollView style={styles.content}>
                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Amount Input */}
                    <View style={styles.amountSection}>
                        <Text style={styles.sectionTitle}>Montant</Text>
                        <View style={styles.amountInputContainer}>
                            <TextInput
                                style={styles.amountInput}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="Entrez un montant"
                                placeholderTextColor="#999"
                            />
                            <Text style={styles.amountCurrency}>
                                {fromCurrency}
                            </Text>
                        </View>
                    </View>

                    {/* From Currency */}
                    {renderCurrencySelector(
                        fromCurrency,
                        setFromCurrency,
                        "De"
                    )}

                    {/* Swap Button */}
                    <View style={styles.swapContainer}>
                        <TouchableOpacity
                            style={styles.swapButton}
                            onPress={() => {
                                setFromCurrency(toCurrency);
                                setToCurrency(fromCurrency);
                            }}
                        >
                            <Ionicons
                                name="swap-vertical"
                                size={24}
                                color="#4DA1A9"
                            />
                            <Text style={styles.swapText}>Inverser</Text>
                        </TouchableOpacity>
                    </View>

                    {/* To Currency */}
                    {renderCurrencySelector(toCurrency, setToCurrency, "Vers")}

                    {/* Conversion Result */}
                    {conversion && !loading && (
                        <View style={styles.resultSection}>
                            <Text style={styles.resultTitle}>💰 Résultat</Text>
                            <View style={styles.resultCard}>
                                <View style={styles.resultMain}>
                                    <Text style={styles.originalAmount}>
                                        {formatCurrency(
                                            conversion.amount,
                                            conversion.fromCurrency
                                        )}
                                    </Text>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={20}
                                        color="#4DA1A9"
                                    />
                                    <Text style={styles.resultAmount}>
                                        {formatCurrency(
                                            conversion.convertedAmount,
                                            conversion.toCurrency
                                        )}
                                    </Text>
                                </View>
                                <Text style={styles.resultRate}>
                                    💱 1 {conversion.fromCurrency} ={" "}
                                    {conversion.rate.toFixed(4)}{" "}
                                    {conversion.toCurrency}
                                </Text>
                                <Text style={styles.resultDetails}>
                                    Taux mis à jour en temps réel via
                                    Frankfurter
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Quick Conversions */}
                    <View style={styles.quickSection}>
                        <Text style={styles.sectionTitle}>
                            🚀 Conversions rapides
                        </Text>
                        <View style={styles.quickGrid}>
                            {[10, 50, 100, 500].map((quickAmount) => {
                                const quickConversion = convertCurrency(
                                    quickAmount,
                                    fromCurrency,
                                    toCurrency,
                                    rates
                                );
                                return (
                                    <TouchableOpacity
                                        key={quickAmount}
                                        style={styles.quickItem}
                                        onPress={() =>
                                            setAmount(quickAmount.toString())
                                        }
                                    >
                                        <Text style={styles.quickAmount}>
                                            {formatCurrency(
                                                quickAmount,
                                                fromCurrency
                                            )}
                                        </Text>
                                        <Text style={styles.quickResult}>
                                            ={" "}
                                            {formatCurrency(
                                                quickConversion.convertedAmount,
                                                toCurrency
                                            )}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Popular Rates */}
                    <View style={styles.ratesSection}>
                        <Text style={styles.sectionTitle}>
                            📊 Taux populaires (base EUR)
                        </Text>
                        {rates.slice(1, 8).map((rate) => (
                            <TouchableOpacity
                                key={rate.code}
                                style={styles.rateItem}
                                onPress={() => {
                                    setFromCurrency("EUR");
                                    setToCurrency(rate.code);
                                }}
                            >
                                <View style={styles.rateInfo}>
                                    <Text style={styles.rateFlag}>
                                        {rate.flag}
                                    </Text>
                                    <View style={styles.rateDetails}>
                                        <Text style={styles.rateName}>
                                            {rate.name}
                                        </Text>
                                        <Text style={styles.rateCode}>
                                            {rate.code} • {rate.symbol}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.rateValue}>
                                    {rate.rate.toFixed(4)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* API Credit */}
                    <View style={styles.creditSection}>
                        <Text style={styles.creditText}>
                            📡 Données fournies par Frankfurter API
                        </Text>
                        <Text style={styles.creditSubtext}>
                            Taux de change en temps réel • Gratuit et fiable
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E9ECEF",
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
    },
    refreshButton: {
        padding: 8,
    },
    updateInfo: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: "#F0F8FF",
    },
    updateText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
        textAlign: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    errorContainer: {
        backgroundColor: "#FFE6E6",
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
    },
    errorText: {
        color: "#CC0000",
        fontSize: 14,
        fontFamily: Fonts.body.family,
        textAlign: "center",
    },
    amountSection: {
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    toggleButton: {
        backgroundColor: "#4DA1A920",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    toggleText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    amountInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#E9ECEF",
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
        padding: 16,
    },
    amountCurrency: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        paddingRight: 16,
    },
    currencySection: {
        marginVertical: 16,
    },
    currencyList: {
        paddingRight: 20,
    },
    currencyItem: {
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        minWidth: 80,
        borderWidth: 2,
        borderColor: "transparent",
    },
    currencyItemSelected: {
        backgroundColor: "#4DA1A920",
        borderColor: "#4DA1A9",
    },
    currencyFlag: {
        fontSize: 24,
        marginBottom: 4,
    },
    currencyCode: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 2,
    },
    currencyCodeSelected: {
        color: "#4DA1A9",
    },
    currencySymbol: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#666",
    },
    swapContainer: {
        alignItems: "center",
        marginVertical: 16,
    },
    swapButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4DA1A920",
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#4DA1A950",
    },
    swapText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginLeft: 6,
    },
    resultSection: {
        marginVertical: 20,
    },
    resultTitle: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 12,
    },
    resultCard: {
        backgroundColor: "#F0F8FF",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#4DA1A930",
    },
    resultMain: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    originalAmount: {
        fontSize: 18,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#666",
        marginRight: 12,
    },
    resultAmount: {
        fontSize: 24,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: "#4DA1A9",
        marginLeft: 12,
    },
    resultRate: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#666",
        textAlign: "center",
        marginBottom: 6,
    },
    resultDetails: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#999",
        textAlign: "center",
        fontStyle: "italic",
    },
    quickSection: {
        marginVertical: 20,
    },
    quickGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    quickItem: {
        flex: 1,
        minWidth: "22%",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
    },
    quickAmount: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginBottom: 4,
    },
    quickResult: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        color: "#666",
        textAlign: "center",
    },
    ratesSection: {
        marginVertical: 20,
    },
    rateItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    rateInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    rateFlag: {
        fontSize: 24,
        marginRight: 12,
    },
    rateDetails: {
        flex: 1,
    },
    rateName: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 2,
    },
    rateCode: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#666",
    },
    rateValue: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    creditSection: {
        marginVertical: 20,
        padding: 16,
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        alignItems: "center",
    },
    creditText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginBottom: 4,
    },
    creditSubtext: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        color: "#666",
        textAlign: "center",
    },
});

export default CurrencyConverterModal;
