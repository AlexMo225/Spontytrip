import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Text, View } from "react-native";
import { useEditTripScreenStyle } from "../hooks/useEditTripScreenStyle";
import { RootStackParamList } from "../types";

type EditTripScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "EditTrip"
>;
type EditTripScreenRouteProp = RouteProp<RootStackParamList, "EditTrip">;

interface Props {
    navigation: EditTripScreenNavigationProp;
    route: EditTripScreenRouteProp;
}

const EditTripScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;
    const styles = useEditTripScreenStyle();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>EditTripScreen</Text>
            <Text style={styles.subtitle}>Trip ID: {tripId}</Text>
            <Text style={styles.subtitle}>En attente de la maquette Figma</Text>
        </View>
    );
};

export default EditTripScreen;
