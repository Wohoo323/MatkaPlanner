import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import ParallaxHero from '../src/components/ParallaxHero';

const cityBreakImage =
  'https://images.unsplash.com/photo-1494783367193-149034c05e8f?q=80&w=1200&auto=format&fit=crop';

const destinations = [
  {
    city: 'Krakova',
    country: 'Puola',
    description: 'Historiaa, yöelämää, hyvää ruokaa ja rentoja kylpylöitä.',
    tags: ['Ruoka', 'Historia', 'Yöelämä'],
    image:
      'https://images.unsplash.com/photo-1519197924294-4ba991a11128?q=80&w=1200&auto=format&fit=crop',
  },
  {
    city: 'Rooma',
    country: 'Italia',
    description: 'Täydellinen kohde kulttuurille, ruoalle ja kävelyretkille.',
    tags: ['Kulttuuri', 'Ruoka', 'Nähtävyydet'],
    image:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop',
  },
  {
    city: 'Barcelona',
    country: 'Espanja',
    description: 'Rantaa, arkkitehtuuria, tapas-paikkoja ja rentoa tunnelmaa.',
    tags: ['Ranta', 'Kaupunki', 'Rento'],
    image:
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    city: 'Pariisi',
    country: 'Ranska',
    description: 'Romanttinen kaupunkiloma museoilla, kahviloilla ja kävelyillä.',
    tags: ['Museot', 'Kahvilat', 'Romantiikka'],
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop',
  },
  {
    city: 'Tokio',
    country: 'Japani',
    description: 'Moderni suurkaupunki, teknologiaa, ruokaa ja kulttuuria.',
    tags: ['Teknologia', 'Ruoka', 'Kulttuuri'],
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function InspireScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    }, [])
  );

  return (
    <Animated.ScrollView
      ref={scrollViewRef as any}
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={scrollHandler}
    >
      <ParallaxHero
        scrollY={scrollY}
        image={cityBreakImage}
        badgeText="AI Travel Ideas"
        label="Matkaideat"
        title="Inspiroidu"
        subtitle="Löydä seuraava matkakohde ja tee siitä AI-matkasuunnitelma."
      />

      <Animated.View
        entering={FadeInDown.delay(180).duration(500)}
        style={styles.contentSection}
      >
        <Text style={styles.sectionEyebrow}>Suositukset</Text>
        <Text style={styles.sectionTitle}>Suositut kohteet</Text>
      </Animated.View>

      {destinations.map((item, index) => (
        <Animated.View
          key={item.city}
          entering={FadeInDown.delay(index * 70).springify().mass(0.8)}
          style={styles.cardWrapper}
        >
          <Pressable
            style={({ pressed }) => [
              styles.destinationCard,
              pressed && styles.pressedCard,
            ]}
            onPress={() => {
              router.push({
                pathname: '/inspire-detail',
                params: {
                  city: item.city,
                  country: item.country,
                  description: item.description,
                  image: item.image,
                },
              });
            }}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.cardImage}
              imageStyle={styles.cardImageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.78)']}
                style={styles.cardOverlay}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.locationBadge}>
                    <Ionicons name="location" size={14} color="#fff" />
                    <Text style={styles.locationBadgeText}>{item.country}</Text>
                  </View>
                </View>

                <View>
                  <Text style={styles.city}>{item.city}</Text>
                  <Text style={styles.country}>{item.country}</Text>
                </View>
              </LinearGradient>
            </ImageBackground>

            <View style={styles.cardBody}>
              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.tagsRow}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.openText}>Katso idea</Text>
                <Ionicons name="chevron-forward" size={20} color="#6C4DFF" />
              </View>
            </View>
          </Pressable>
        </Animated.View>
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  content: {
    paddingBottom: 110,
  },

  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 16,
  },

  sectionEyebrow: {
    color: '#6C4DFF',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#172033',
  },

  cardWrapper: {
    paddingHorizontal: 20,
  },

  destinationCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.11,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  cardImage: {
    height: 205,
  },

  cardImageStyle: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  cardOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  locationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },

  city: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },

  country: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  cardBody: {
    padding: 18,
  },

  description: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  tag: {
    backgroundColor: '#EEEAFE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  tagText: {
    color: '#6C4DFF',
    fontSize: 12,
    fontWeight: '800',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  openText: {
    color: '#6C4DFF',
    fontSize: 15,
    fontWeight: '900',
  },
});