import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { RootStackParamList } from "../types";

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, "Chat">;
type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;

interface Props {
    navigation: ChatScreenNavigationProp;
    route: ChatScreenRouteProp;
}

interface Message {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    message: string;
    timestamp: Date;
    isOwn: boolean;
}

// Mock messages data
const mockMessages: Message[] = [
    {
        id: "1",
        userId: "1",
        userName: "Liam Carter",
        userAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        message:
            "Hey everyone! Just arrived in Barcelona. The weather is amazing! 🌞",
        timestamp: new Date("2023-09-20T10:30:00"),
        isOwn: false,
    },
    {
        id: "2",
        userId: "2",
        userName: "Ethan Harper",
        userAvatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        message:
            "That's awesome! Can't wait to explore the city with you guys.",
        timestamp: new Date("2023-09-20T10:35:00"),
        isOwn: true,
    },
    {
        id: "3",
        userId: "3",
        userName: "Olivia Bennett",
        userAvatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
        message:
            "I found this amazing restaurant near Park Güell. Should we go there for dinner?",
        timestamp: new Date("2023-09-20T11:00:00"),
        isOwn: false,
    },
    {
        id: "4",
        userId: "2",
        userName: "Ethan Harper",
        userAvatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        message: "Sounds perfect! What time works for everyone?",
        timestamp: new Date("2023-09-20T11:05:00"),
        isOwn: true,
    },
    {
        id: "5",
        userId: "4",
        userName: "Liam Carter",
        userAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        message: "How about 7 PM? That gives us time to rest and get ready.",
        timestamp: new Date("2023-09-20T11:10:00"),
        isOwn: false,
    },
    {
        id: "6",
        userId: "3",
        userName: "Olivia Bennett",
        userAvatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
        message: "Perfect! I'll make a reservation 👍",
        timestamp: new Date("2023-09-20T11:15:00"),
        isOwn: false,
    },
];

const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>(mockMessages);

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                userId: "2",
                userName: "Ethan Harper",
                userAvatar:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                message: message.trim(),
                timestamp: new Date(),
                isOwn: true,
            };
            setMessages([...messages, newMessage]);
            setMessage("");
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageContainer,
                item.isOwn
                    ? styles.ownMessageContainer
                    : styles.otherMessageContainer,
            ]}
        >
            {!item.isOwn && (
                <Image
                    source={{ uri: item.userAvatar }}
                    style={styles.avatar}
                />
            )}
            <View style={styles.messageContent}>
                {!item.isOwn && (
                    <Text style={styles.userName}>{item.userName}</Text>
                )}
                <View
                    style={[
                        styles.messageBubble,
                        item.isOwn
                            ? styles.ownMessageBubble
                            : styles.otherMessageBubble,
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            item.isOwn
                                ? styles.ownMessageText
                                : styles.otherMessageText,
                        ]}
                    >
                        {item.message}
                    </Text>
                </View>
            </View>
            {item.isOwn && (
                <Image
                    source={{ uri: item.userAvatar }}
                    style={styles.avatar}
                />
            )}
        </View>
    );

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
                <Text style={styles.headerTitle}>Trip to Barcelone</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Messages List */}
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.inputContainer}
            >
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Message"
                        placeholderTextColor="#637887"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity style={styles.photoButton}>
                        <Ionicons
                            name="image-outline"
                            size={24}
                            color="#637887"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendMessage}
                    >
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    messagesList: {
        flex: 1,
    },
    messagesContainer: {
        paddingVertical: 16,
    },
    messageContainer: {
        flexDirection: "row",
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    ownMessageContainer: {
        justifyContent: "flex-end",
    },
    otherMessageContainer: {
        justifyContent: "flex-start",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 8,
    },
    messageContent: {
        flex: 1,
        maxWidth: "70%",
    },
    userName: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#637887",
        marginBottom: 4,
        marginLeft: 12,
    },
    messageBubble: {
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    ownMessageBubble: {
        backgroundColor: "#7ED957",
        borderBottomRightRadius: 6,
    },
    otherMessageBubble: {
        backgroundColor: "#F0F2F5",
        borderBottomLeftRadius: 6,
    },
    messageText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        lineHeight: 20,
    },
    ownMessageText: {
        color: "#FFFFFF",
    },
    otherMessageText: {
        color: Colors.text.primary,
    },
    inputContainer: {
        backgroundColor: Colors.backgroundColors.primary,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: Colors.text.primary,
        backgroundColor: Colors.backgroundColors.primary,
        maxHeight: 100,
    },
    photoButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F0F2F5",
        justifyContent: "center",
        alignItems: "center",
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#4DA1A9",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ChatScreen;
