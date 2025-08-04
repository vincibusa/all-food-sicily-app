import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
});

interface BackButtonProps {
  style?: ViewStyle;
}

export default function BackButton({ style }: BackButtonProps) {
  const navigation = useNavigation();
  return (
    <Pressable style={[styles.backButton, style]} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="black" />
    </Pressable>
  );
}