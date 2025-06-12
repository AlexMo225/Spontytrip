import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { RootStackParamList } from "../types";

type TripDetailsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "TripDetails"
>;
type TripDetailsScreenRouteProp = RouteProp<RootStackParamList, "TripDetails">;

interface Props {
    navigation: TripDetailsScreenNavigationProp;
    route: TripDetailsScreenRouteProp;
}

interface TripMember {
    id: string;
    name: string;
    avatar: string;
}

interface TripSection {
    id: string;
    title: string;
    itemCount: number;
    icon: string;
}

// Données d'exemple pour les membres du voyage
const mockMembers: TripMember[] = [
    {
        id: "1",
        name: "Sarah",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
    },
    {
        id: "2",
        name: "Liam",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
        id: "3",
        name: "Emma",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
        id: "4",
        name: "James",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
        id: "5",
        name: "Olivia",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
];

// Données d'exemple pour les sections du voyage
const mockSections: TripSection[] = [
    {
        id: "1",
        title: "Bagages",
        itemCount: 12,
        icon: "list-outline",
    },
    {
        id: "2",
        title: "Vols",
        itemCount: 3,
        icon: "airplane-outline",
    },
    {
        id: "3",
        title: "Hébergement",
        itemCount: 2,
        icon: "home-outline",
    },
    {
        id: "4",
        title: "Transport",
        itemCount: 1,
        icon: "car-outline",
    },
    {
        id: "5",
        title: "Activités",
        itemCount: 1,
        icon: "calendar-outline",
    },
];

const TripDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;

    const handleNavigateToFeature = (feature: string) => {
        switch (feature) {
            case "Checklist":
                navigation.navigate("Checklist", { tripId });
                break;
            case "Activities":
                navigation.navigate("Activities", { tripId });
                break;
            case "Chat":
                navigation.navigate("Chat", { tripId });
                break;
            case "Memories":
                navigation.navigate("Gallery", { tripId });
                break;
        }
    };

    const renderMember = (member: TripMember, index: number) => (
        <View
            key={member.id}
            style={[styles.memberContainer, { marginLeft: index > 0 ? -8 : 0 }]}
        >
            <Image
                source={{ uri: member.avatar }}
                style={styles.memberAvatar}
            />
        </View>
    );

    const renderSection = (section: TripSection) => (
        <TouchableOpacity key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionIcon}>
                <Ionicons
                    name={section.icon as any}
                    size={24}
                    color="#637887"
                />
            </View>
            <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionCount}>
                    {section.itemCount} élément
                    {section.itemCount > 1 ? "s" : ""}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* En-tête */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.text.primary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>SpontyTrip</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Image de destination */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=400&fit=crop&auto=format&q=80",
                        }}
                        style={styles.destinationImage}
                    />
                </View>

                {/* Informations du voyage */}
                <View style={styles.tripInfo}>
                    <Text style={styles.tripTitle}>
                        Paris, France • 12 - 15 Oct
                    </Text>

                    {/* Membres */}
                    <View style={styles.membersContainer}>
                        {mockMembers.map((member, index) =>
                            renderMember(member, index)
                        )}
                    </View>
                </View>

                {/* Boutons de fonctionnalités */}
                <View style={styles.featuresContainer}>
                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => handleNavigateToFeature("Checklist")}
                    >
                        <Text style={styles.featureButtonText}>Liste</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => handleNavigateToFeature("Activities")}
                    >
                        <Text style={styles.featureButtonText}>Activités</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => handleNavigateToFeature("Chat")}
                    >
                        <Text style={styles.featureButtonText}>Discussion</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.featureButton}
                        onPress={() => handleNavigateToFeature("Memories")}
                    >
                        <Text style={styles.featureButtonText}>Souvenirs</Text>
                    </TouchableOpacity>
                </View>

                {/* Sections */}
                <View style={styles.sectionsContainer}>
                    {mockSections.map(renderSection)}
                </View>

                {/* Espacement du bas */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.backgroundColors.primary,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        flex: 1,
        textAlign: "center",
        marginRight: 40,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        height: 250,
        backgroundColor: "#F0F2F5",
    },
    destinationImage: {
        width: "100%",
        height: "100%",
    },
    tripInfo: {
        padding: 20,
    },
    tripTitle: {
        fontSize: 24,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 16,
    },
    membersContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    memberContainer: {
        borderRadius: 25,
        borderWidth: 3,
        borderColor: Colors.backgroundColors.primary,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    featuresContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        justifyContent: "space-between",
        marginBottom: 30,
    },
    featureButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 12,
        alignItems: "center",
    },
    featureButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#637887",
    },
    sectionsContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    sectionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 16,
    },
    sectionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.backgroundColors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    sectionContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    sectionCount: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    bottomSpacing: {
        height: 32,
    },
});

export default TripDetailsScreen;
