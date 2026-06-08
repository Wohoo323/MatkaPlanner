import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import TripResultCard from '../src/components/TripResultCard';
import { getTripById } from '../src/services/firebaseService';
import { getCityImage } from '../src/services/imageService';
import { getDestinationImage } from '../src/utils/destinationImages';

export default function TripDetailScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  const { id, saved } = useLocalSearchParams();

  const isSavedTrip = saved === 'true';

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string>('');

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    loadTrip();
  }, []);

  useEffect(() => {
    if (trip) {
      loadHeroImage();
    }
  }, [trip]);

  const loadTrip = async () => {
    try {
      const data = await getTripById(id as string);
      setTrip(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const destination = trip?.destination || trip?.plan?.destination || 'Matka';

  const loadHeroImage = async () => {
    const fallbackImage = getDestinationImage(destination);
    setHeroImage(fallbackImage);

    const unsplashImage = await getCityImage(destination);

    if (unsplashImage) {
      setHeroImage(unsplashImage);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <Ionicons name="sparkles" size={28} color="#6C4DFF" />
          </View>

          <Text style={styles.loadingTitle}>Avataan matkaa...</Text>

          <Text style={styles.loadingText}>
            Haetaan tallennettu AI-matkasuunnitelma.
          </Text>

          <ActivityIndicator
            size="small"
            color="#6C4DFF"
            style={{ marginTop: 14 }}
          />
        </View>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={42} color="#6C4DFF" />
        <Text style={styles.errorTitle}>Matkaa ei löytynyt</Text>
        <Text style={styles.errorText}>
          Tallennettua matkasuunnitelmaa ei voitu näyttää.
        </Text>
      </View>
    );
  }

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
        image={heroImage || getDestinationImage(destination)}
        badgeText="AI Trip Plan"
        label="Matkasuunnitelma"
        title={destination}
        subtitle={`${trip.plan?.days?.length || 0} päivän AI-avusteinen suunnitelma.`}
      />

      <Animated.View entering={FadeInDown.delay(180).duration(500)}>
        <TripResultCard
          plan={trip.plan}
          hideSaveButton={isSavedTrip}
          hideTitle
          tripId={id as string}
        />
      </Animated.View>
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

  center: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  loadingCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  loadingTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#172033',
    textAlign: 'center',
  },

  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#172033',
    marginTop: 14,
  },

  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 21,
  },
});
