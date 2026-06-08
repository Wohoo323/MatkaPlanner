import { Ionicons } from '@expo/vector-icons';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

type InputRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
};

export default function InputRow({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
}: InputRowProps) {
  return (
    <View style={styles.inputRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={24} color="#6C4DFF" />
      </View>

      <View style={styles.inputContent}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 2,
  },
});