import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileHeaderProps {
  avatar?: React.ReactNode;
  name: string;
  email: string;
  onEditPress?: () => void;
}

export default function ProfileHeader({
  avatar,
  name,
  email,
  onEditPress,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          avatar
        ) : (
          <View style={styles.defaultAvatar}>
            <MaterialCommunityIcons
              name="account"
              size={34}
              color={Colors.white}
            />
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={[TextStyles.h3, styles.name]}>{name}</Text>
        <Text style={[TextStyles.bodySmall, styles.email]}>{email}</Text>
      </View>

      {onEditPress && (
        <Pressable style={styles.editButton} onPress={onEditPress}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={18}
            color={Colors.text.primary}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  avatarContainer: {
    marginRight: Spacing.lg,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },
  email: {
    color: Colors.text.secondary,
  },
  editButton: {
    padding: Spacing.md,
  },
});
