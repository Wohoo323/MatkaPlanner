import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

import ActionButton from '../../src/components/ActionButton';
import InputRow from '../../src/components/InputRow';
import ParallaxHero from '../../src/components/ParallaxHero';
import TripResultCard from '../../src/components/TripResultCard';
import { getCityImage } from '../../src/services/imageService';
import { generateTripPlan } from '../../src/services/tripApi';

const loadingSteps = [
  'Etsitään parhaat ideat kohteeseen...',
  'Rakennetaan päiväohjelmaa...',
  'Yhdistetään kiinnostukset ja budjetti...',
  'Viimeistellään matkasuunnitelmaa...',
];

const homeHeroImage =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  const params = useLocalSearchParams();

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('');

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [heroCityImage, setHeroCityImage] = useState('');

  const heroDestination =
    showForm || plan
      ? plan?.destination || destination
      : '';

  const heroImage =
    heroDestination
      ? heroCityImage || homeHeroImage
      : homeHeroImage;

  const resetHomeState = () => {
    setPlan(null);
    setShowForm(false);
    setDestination('');
    setInterests('');
    setBudget('');
    setStartDate(null);
    setEndDate(null);
    setHeroCityImage('');
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useFocusEffect(
    useCallback(() => {
      if (!params.destination) {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: false,
        });

        resetHomeState();
      }
    }, [params.destination])
  );

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingStep((current) => (current + 1) % loadingSteps.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const trimmedDestination = heroDestination.trim();

    if (!trimmedDestination) {
      setHeroCityImage('');
      return;
    }

    setHeroCityImage('');

    let cancelled = false;
    const timeout = setTimeout(async () => {
      const image = await getCityImage(trimmedDestination);

      if (!cancelled && image) {
        setHeroCityImage(image);
      }
    }, 650);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [heroDestination]);

  useEffect(() => {
    if (params.destination) {
      const selectedDestination = Array.isArray(params.destination)
        ? params.destination[0]
        : params.destination;

      setDestination(selectedDestination);
      setPlan(null);
      setShowForm(true);

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 330,
          animated: true,
        });
      }, 150);
    }
  }, [params.destination]);

  const openForm = () => {
    setShowForm(true);
    setPlan(null);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 330,
        animated: true,
      });
    }, 150);
  };

  const getDays = () => {
    if (!startDate || !endDate) return '';

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays.toString() : '';
  };

  const handleGenerateTrip = async () => {
    if (!destination.trim()) {
      Alert.alert('Puuttuva tieto', 'Kirjoita ensin matkakohde.');
      return;
    }

    if (!startDate) {
      Alert.alert('Puuttuva tieto', 'Valitse matkan aloituspäivä.');
      return;
    }

    if (!endDate) {
      Alert.alert('Puuttuva tieto', 'Valitse matkan päättymispäivä.');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert(
        'Tarkista päivämäärät',
        'Päättymispäivän pitää olla aloituspäivän jälkeen.'
      );
      return;
    }

    if (!interests.trim()) {
      Alert.alert(
        'Puuttuva tieto',
        'Kirjoita ainakin yksi kiinnostuksen kohde, esimerkiksi ruoka, kulttuuri tai kylpylä.'
      );
      return;
    }

    if (!budget.trim()) {
      Alert.alert('Puuttuva tieto', 'Kirjoita matkan budjetti.');
      return;
    }

    setLoadingStep(0);
    setLoading(true);
    setPlan(null);

    try {
      const generatedPlan = await generateTripPlan({
        destination: destination.trim(),
        days: getDays(),
        interests: interests.trim(),
        budget: budget.trim(),
      });

      setPlan(generatedPlan);
      setShowForm(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 330,
          animated: true,
        });
      }, 150);
    } catch (error) {
      setPlan({
        error: true,
        message: 'Virhe yhteydessä backendiin.',
      });

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.ScrollView
        ref={scrollViewRef as any}
        style={styles.page}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        <ParallaxHero
          scrollY={scrollY}
          image={heroImage}
          badgeText="AI Travel Planner"
          label={heroDestination ? 'Suunnitteilla oleva matka' : 'Suunnittele fiksummin'}
          title={heroDestination ? heroDestination : 'MatkaPlanner'}
          subtitle={
            heroDestination
              ? ''
              : 'Luo personoitu matkasuunnitelma tekoälyn avulla muutamassa sekunnissa.'
          }
        />

        {!showForm && !plan && (
          <Animated.View
            entering={FadeInDown.delay(180).duration(500)}
            style={styles.actionsSection}
          >
            <View style={styles.actionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>Aloita tästä</Text>
                <Text style={styles.sectionTitle}>Mitä haluat tehdä?</Text>
              </View>

              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#6C4DFF" />
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>

            <ActionButton
              icon="sparkles"
              title="Luo matkasuunnitelma"
              subtitle="Tee uusi AI-avusteinen matkasuunnitelma"
              onPress={openForm}
              variant="primary"
            />

            <ActionButton
              icon="earth"
              title="Inspiroidu"
              subtitle="Tutustu kohdeideoihin ja matkavinkkeihin"
              onPress={() => router.push('/inspire')}
              variant="blue"
            />

            <ActionButton
              icon="bookmark"
              title="Omat matkat"
              subtitle="Avaa tallennetut matkasuunnitelmat"
              onPress={() => router.push('/my-trips')}
              variant="dark"
            />
          </Animated.View>
        )}

        {showForm && (
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={styles.formCard}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="sparkles" size={24} color="#6C4DFF" />

              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Luo matkasuunnitelma</Text>
                <Text style={styles.cardSubtitle}>
                  Kerro matkasi tiedot ja luodaan suunnitelma.
                </Text>
              </View>
            </View>

            <InputRow
              icon="location"
              label="Matkakohde"
              placeholder="Esim. Krakova, Pariisi, Bali..."
              value={destination}
              onChangeText={setDestination}
            />

            <View style={styles.dateRow}>
              <Pressable
                style={styles.dateBox}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar" size={22} color="#6C4DFF" />

                <View>
                  <Text style={styles.dateLabel}>Aloituspäivä</Text>
                  <Text style={styles.dateText}>
                    {startDate
                      ? startDate.toLocaleDateString('fi-FI')
                      : 'Valitse'}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.dateBox}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar" size={22} color="#6C4DFF" />

                <View>
                  <Text style={styles.dateLabel}>Päättymispäivä</Text>
                  <Text style={styles.dateText}>
                    {endDate
                      ? endDate.toLocaleDateString('fi-FI')
                      : 'Valitse'}
                  </Text>
                </View>
              </Pressable>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}

            <InputRow
              icon="heart"
              label="Kiinnostukset"
              placeholder="Esim. ruoka, kylpylä, kulttuuri..."
              value={interests}
              onChangeText={setInterests}
            />

            <InputRow
              icon="wallet"
              label="Budjetti"
              placeholder="Esim. 1000€ koko matkalle"
              value={budget}
              onChangeText={setBudget}
            />

            <Pressable onPress={handleGenerateTrip} disabled={loading}>
              <LinearGradient
                colors={['#7B61FF', '#4D7CFF']}
                style={styles.mainButton}
              >
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.mainButtonText}>
                  {loading ? 'Luodaan...' : 'Luo matkasuunnitelma'}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => {
                resetHomeState();

                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: 0,
                    animated: true,
                  });
                }, 100);
              }}
            >
              <Text style={styles.backText}>Takaisin etusivulle</Text>
            </Pressable>
          </Animated.View>
        )}

        {loading && (
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={styles.aiLoadingCard}
          >
            <View style={styles.aiLoadingIcon}>
              <Ionicons name="sparkles" size={28} color="#6C4DFF" />
            </View>

            <Text style={styles.aiLoadingTitle}>
              AI suunnittelee matkaasi...
            </Text>

            <Text style={styles.aiLoadingText}>
              {loadingSteps[loadingStep]}
            </Text>

            <View style={styles.loadingDots}>
              <View style={styles.loadingDot} />
              <View style={styles.loadingDot} />
              <View style={styles.loadingDot} />
            </View>

            <ActivityIndicator
              size="small"
              color="#6C4DFF"
              style={{ marginTop: 14 }}
            />
          </Animated.View>
        )}

        {plan && (
          <Animated.View entering={FadeInDown.duration(500)}>
            <TripResultCard plan={plan} />

            <Pressable
              onPress={() => {
                resetHomeState();

                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: 0,
                    animated: true,
                  });
                }, 100);
              }}
              style={styles.homeButton}
            >
              <Text style={styles.homeButtonText}>Takaisin etusivulle</Text>
            </Pressable>
          </Animated.View>
        )}
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  scrollContent: {
    paddingBottom: 110,
  },

  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
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

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEEAFE',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  aiBadgeText: {
    color: '#6C4DFF',
    fontSize: 12,
    fontWeight: '900',
  },

  formCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 10,
  },

  cardHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 18,
  },

  cardHeaderText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#172033',
  },

  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 3,
  },

  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F7F9FC',
    borderRadius: 18,
    padding: 14,
  },

  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    marginBottom: 2,
  },

  dateText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },

  mainButton: {
    height: 58,
    borderRadius: 18,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  mainButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },

  backText: {
    marginTop: 18,
    textAlign: 'center',
    color: '#6C4DFF',
    fontWeight: '800',
  },

  aiLoadingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
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

  aiLoadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  aiLoadingTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#172033',
    textAlign: 'center',
  },

  aiLoadingText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    minHeight: 22,
  },

  loadingDots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 16,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#6C4DFF',
    opacity: 0.45,
  },

  homeButton: {
    backgroundColor: '#172033',
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 18,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});
