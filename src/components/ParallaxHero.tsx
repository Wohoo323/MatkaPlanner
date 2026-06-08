import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import Animated, {
    Extrapolation,
    FadeInDown,
    FadeInUp,
    interpolate,
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';

type Props = {
  scrollY: SharedValue<number>;
  image: string;
  badgeText: string;
  label: string;
  title: string;
  subtitle: string;
};

export default function ParallaxHero({
  scrollY,
  image,
  badgeText,
  label,
  title,
  subtitle,
}: Props) {
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 360],
          [0, 90],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-120, 0, 360],
          [1.25, 1, 1.05],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 190],
      [1, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 190],
          [0, -35],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={styles.heroWrapper}>
      <Animated.View style={[styles.heroImageContainer, imageStyle]}>
        <ImageBackground source={{ uri: image }} style={styles.hero}>
          <LinearGradient
            colors={[
              'rgba(10,16,30,0.10)',
              'rgba(10,16,30,0.45)',
              'rgba(10,16,30,0.88)',
            ]}
            style={styles.heroOverlay}
          >
            <Animated.View entering={FadeInUp.duration(500)} style={styles.topRow}>
              <View />

              <View style={styles.brandBadge}>
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={styles.brandBadgeText}>{badgeText}</Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(150).duration(600)}
            >
              <Animated.View style={[styles.heroContent, textStyle]}>
                <Text style={styles.heroLabel}>{label}</Text>
                <Text style={styles.heroTitle}>{title}</Text>
                <Text style={styles.heroSubtitle}>{subtitle}</Text>
              </Animated.View>
            </Animated.View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    height: 360,
    overflow: 'hidden',
    backgroundColor: '#101827',
  },

  heroImageContainer: {
    height: 420,
  },

  hero: {
    height: 420,
  },

  heroOverlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 98,
    justifyContent: 'space-between',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },

  brandBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },

  heroContent: {
    marginTop: 'auto',
  },

  heroLabel: {
    color: '#DCD7FF',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 10,
  },

  heroSubtitle: {
    color: '#EEF2FF',
    fontSize: 18,
    lineHeight: 27,
    maxWidth: 350,
  },
});
