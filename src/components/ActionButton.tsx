import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  variant?: 'primary' | 'blue' | 'dark';
};

export default function ActionButton({
  icon,
  title,
  subtitle,
  onPress,
  variant = 'primary',
}: Props) {
  const colors = {
    primary: {
      iconBg: '#EEEAFE',
      iconColor: '#6C4DFF',
      bg: '#F7F5FF',
    },
    blue: {
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      bg: '#F0F9FF',
    },
    dark: {
      iconBg: '#E5E7EB',
      iconColor: '#172033',
      bg: '#F8FAFC',
    },
  };

  const theme = colors[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: theme.bg },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.actionIconBox, { backgroundColor: theme.iconBg }]}>
        <Ionicons name={icon} size={27} color={theme.iconColor} />
      </View>

      <View style={styles.actionTextBox}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.chevronBox}>
        <Ionicons
          name="chevron-forward"
          size={22}
          color="#9CA3AF"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  actionIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  actionTextBox: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#172033',
  },

  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },

  chevronBox: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});