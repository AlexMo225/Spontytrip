import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Layout } from "../constants/Spacing";
import { RootStackParamList } from "../types";

type CreateTripScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "CreateTrip"
>;
type CreateTripScreenRouteProp = RouteProp<RootStackParamList, "CreateTrip">;

interface Props {
    navigation: CreateTripScreenNavigationProp;
    route: CreateTripScreenRouteProp;
}

const CreateTripScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>CreateTripScreen</Text>
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

export default CreateTripScreen;
