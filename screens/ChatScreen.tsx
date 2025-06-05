import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Layout } from "../constants/Spacing";
import { RootStackParamList } from "../types";

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, "Chat">;
type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;

interface Props {
    navigation: ChatScreenNavigationProp;
    route: ChatScreenRouteProp;
}

const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ChatScreen</Text>
            <Text style={styles.subtitle}>Trip ID: {tripId}</Text>
            <Text style={styles.subtitle}>En attente de la maquette Figma</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...Layout.container,
        ...Layout.centerContent,
        backgroundColor: Colors.background,
    },
    title: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        ...TextStyles.body1,
        color: Colors.textSecondary,
    },
});

export default ChatScreen;
