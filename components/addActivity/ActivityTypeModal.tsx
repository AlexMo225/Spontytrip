import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ActivityType, activityTypes } from "../../utils/activityConstants";

interface ActivityTypeModalProps {
    visible: boolean;
    selectedType: string;
    onClose: () => void;
    onSelectType: (typeId: string) => void;
}

export const ActivityTypeModal: React.FC<ActivityTypeModalProps> = ({
    visible,
    selectedType,
    onClose,
    onSelectType,
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={[
                        styles.modalContent,
                        { width: "90%", maxHeight: "70%" },
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Type d'activité</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close-outline"
                                size={24}
                                color="#111827"
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.typeList}>
                        {activityTypes.map((type: ActivityType) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeOption,
                                    selectedType === type.id &&
                                        styles.typeOptionSelected,
                                ]}
                                onPress={() => {
                                    onSelectType(type.id);
                                    onClose();
                                }}
                            >
                                <View
                                    style={[
                                        styles.typeIcon,
                                        { backgroundColor: type.color },
                                    ]}
                                >
                                    <Ionicons
                                        name={type.icon}
                                        size={16}
                                        color="white"
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.typeText,
                                        selectedType === type.id &&
                                            styles.typeTextSelected,
                                    ]}
                                >
                                    {type.name}
                                </Text>
                                {selectedType === type.id && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color="#4DA1A9"
                                        style={styles.checkIcon}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    typeList: {
        padding: 12,
    },
    typeOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        marginBottom: 8,
    },
    typeOptionSelected: {
        backgroundColor: "#F0FDFB",
        borderColor: "#4DA1A9",
    },
    typeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    typeText: {
        flex: 1,
        fontSize: 16,
        color: "#111827",
    },
    typeTextSelected: {
        color: "#4DA1A9",
        fontWeight: "500",
    },
    checkIcon: {
        marginLeft: 8,
    },
});
