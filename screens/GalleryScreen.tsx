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
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { RootStackParamList } from "../types";

type GalleryScreenNavigationProp = StackNavigationProp<RootStackParamList, "Gallery">;
type GalleryScreenRouteProp = RouteProp<RootStackParamList, "Gallery">;

interface Props {
    navigation: GalleryScreenNavigationProp;
    route: GalleryScreenRouteProp;
}

interface Photo {
    id: string;
    imageUrl: string;
    userName: string;
    date: string;
    userId: string;
}

// Mock photos data
const mockPhotos: Photo[] = [
    {
        id: '1',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        userName: 'Liam Carter',
        date: '2023-08-15',
        userId: '1'
    },
    {
        id: '2',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
        userName: 'Olivia Bennett',
        date: '2023-08-16',
        userId: '3'
    },
    {
        id: '3',
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop',
        userName: 'Ethan Harper',
        date: '2023-08-17',
        userId: '2'
    },
    {
        id: '4',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
        userName: 'Sophia Turner',
        date: '2023-08-18',
        userId: '4'
    },
    {
        id: '5',
        imageUrl: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=400&h=400&fit=crop',
        userName: 'Noah Foster',
        date: '2023-08-19',
        userId: '5'
    },
    {
        id: '6',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        userName: 'Ava Coleman',
        date: '2023-08-20',
        userId: '6'
    }
];

const GalleryScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;
    const [selectedTab, setSelectedTab] = useState<'all' | 'my'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [photos, setPhotos] = useState<Photo[]>(mockPhotos);

    // Filter photos based on selected tab and search
    const filteredPhotos = photos.filter(photo => {
        const matchesSearch = photo.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            photo.date.includes(searchQuery);
        const matchesTab = selectedTab === 'all' || 
                          (selectedTab === 'my' && photo.userId === '2'); // Assuming current user is Ethan Harper
        return matchesSearch && matchesTab;
    });

    const renderPhoto = ({ item }: { item: Photo }) => (
        <TouchableOpacity style={styles.photoCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.photoImage} />
            <View style={styles.photoInfo}>
                <Text style={styles.photoUserName}>{item.userName}</Text>
                <Text style={styles.photoDate}>{item.date}</Text>
            </View>
        </TouchableOpacity>
    );

    const handleAddPhoto = () => {
        // Handle photo upload
        console.log('Add photo functionality');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Memories</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search-outline" size={20} color="#637887" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search memories"
                        placeholderTextColor="#637887"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        selectedTab === 'all' && styles.activeTab
                    ]}
                    onPress={() => setSelectedTab('all')}
                >
                    <Text style={[
                        styles.tabText,
                        selectedTab === 'all' && styles.activeTabText
                    ]}>
                        All
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        selectedTab === 'my' && styles.activeTab
                    ]}
                    onPress={() => setSelectedTab('my')}
                >
                    <Text style={[
                        styles.tabText,
                        selectedTab === 'my' && styles.activeTabText
                    ]}>
                        My Photos
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Photos Grid */}
            <FlatList
                data={filteredPhotos}
                renderItem={renderPhoto}
                keyExtractor={(item) => item.id}
                numColumns={2}
                style={styles.photosList}
                contentContainerStyle={styles.photosContainer}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.row}
            />

            {/* Add Photo Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
                <Ionicons name="add" size={24} color="#4DA1A9" />
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
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    searchInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F2F5",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: Colors.text.primary,
    },
    tabsContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 16,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.text.primary,
    },
    tabText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#637887",
    },
    activeTabText: {
        color: Colors.text.primary,
        fontWeight: "600",
    },
    photosList: {
        flex: 1,
    },
    photosContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    row: {
        justifyContent: "space-between",
    },
    photoCard: {
        width: "48%",
        marginBottom: 16,
    },
    photoImage: {
        width: "100%",
        height: 160,
        borderRadius: 12,
        marginBottom: 8,
    },
    photoInfo: {
        paddingHorizontal: 4,
    },
    photoUserName: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 2,
    },
    photoDate: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    addButton: {
        position: "absolute",
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#E8F5E8",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default GalleryScreen;
