import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Oops!" }} />
            <View style={styles.container}>
                <Text style={styles.title}>Cette page n&apos;existe pas.</Text>
                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>Retour à l&apos;accueil</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 16,
        color: "#007AFF",
        textDecorationLine: "underline",
    },
});
