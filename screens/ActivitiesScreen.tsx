import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { RootStackParamList } from "../types";

type ActivitiesScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Activities"
>;
type ActivitiesScreenRouteProp = RouteProp<RootStackParamList, "Activities">;

interface Props {
    navigation: ActivitiesScreenNavigationProp;
    route: ActivitiesScreenRouteProp;
}

interface Activity {
    id: string;
    title: string;
    description: string;
    suggestedBy: string;
    imageUrl: string;
    likes: number;
    comments: number;
    isLiked: boolean;
}

// Mock activities data
const mockActivities: Activity[] = [
    {
        id: "1",
        title: "Hiking in the Mountains",
        description: "Enjoy a scenic hike with breathtaking views.",
        suggestedBy: "Alex",
        imageUrl:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        likes: 12,
        comments: 3,
        isLiked: false,
    },
    {
        id: "2",
        title: "Beach Volleyball",
        description: "Join a fun game of beach volleyball.",
        suggestedBy: "Sarah",
        imageUrl:
            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
        likes: 8,
        comments: 2,
        isLiked: true,
    },
    {
        id: "3",
        title: "City Exploration",
        description: "Explore the city's hidden gems and local spots.",
        suggestedBy: "Mark",
        imageUrl:
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
        likes: 15,
        comments: 5,
        isLiked: false,
    },
];

const ActivitiesScreen: React.FC<Props> = ({ navigation, route }) => {
    const tripId = route.params?.tripId;
    const [activities, setActivities] = useState<Activity[]>(mockActivities);

    const handleLike = (activityId: string) => {
        setActivities((prevActivities) =>
            prevActivities.map((activity) =>
                activity.id === activityId
                    ? {
                          ...activity,
                          isLiked: !activity.isLiked,
                          likes: activity.isLiked
                              ? activity.likes - 1
                              : activity.likes + 1,
                      }
                    : activity
            )
        );
    };

    const renderActivity = ({ item }: { item: Activity }) => (
        <View style={styles.activityCard}>
            <View style={styles.activityContent}>
                <Text style={styles.suggestedBy}>
                    Suggested by {item.suggestedBy}
                </Text>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDescription}>
                    {item.description}
                </Text>

                <View style={styles.activityFooter}>
                    <View style={styles.stats}>
                        <TouchableOpacity
                            style={styles.statButton}
                            onPress={() => handleLike(item.id)}
                        >
                            <Ionicons
                                name={item.isLiked ? "heart" : "heart-outline"}
                                size={20}
                                color={item.isLiked ? "#FF6B6B" : "#637887"}
                            />
                            <Text style={styles.statText}>{item.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statButton}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={20}
                                color="#637887"
                            />
                            <Text style={styles.statText}>{item.comments}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.activityImageContainer}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.activityImage}
                />
            </View>
        </View>
    );

    const handleAddActivity = () => {
        console.log("Add new activity");
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
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
                <Text style={styles.headerTitle}>Activities</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Activities List */}
            <FlatList
                data={activities}
                renderItem={renderActivity}
                keyExtractor={(item) => item.id}
                style={styles.activitiesList}
                contentContainerStyle={styles.activitiesContainer}
                showsVerticalScrollIndicator={false}
            />

            {/* Add Activity Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddActivity}
            >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Activity</Text>
            </TouchableOpacity>
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
    activitiesList: {
        flex: 1,
    },
    activitiesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    activityCard: {
        flexDirection: "row",
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        marginBottom: 20,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    activityContent: {
        flex: 1,
        marginRight: 16,
    },
    suggestedBy: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginBottom: 4,
    },
    activityTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 8,
    },
    activityDescription: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 22,
        marginBottom: 16,
    },
    activityFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    stats: {
        flexDirection: "row",
        alignItems: "center",
    },
    statButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
    },
    statText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginLeft: 4,
    },
    activityImageContainer: {
        width: 120,
        height: 80,
    },
    activityImage: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    addButton: {
        position: "absolute",
        bottom: 30,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4DA1A9",
        borderRadius: 25,
        paddingVertical: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 8,
    },
});

export default ActivitiesScreen;
