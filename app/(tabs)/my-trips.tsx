import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import ParallaxHero from '../../src/components/ParallaxHero';

import {
  deleteTripFromFirebase,
  getTripsFromFirebase,
} from '../../src/services/firebaseService';
import { getCityImage } from '../../src/services/imageService';
import { getDestinationImage } from '../../src/utils/destinationImages';

const heroImage =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop';

export default function MyTripsScreen() {
  const listRef = useRef<FlatList<any>>(null);
  const scrollY = useSharedValue(0);

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tripImages, setTripImages] = useState<Record<string, string>>({});

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const loadTrips = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const data = await getTripsFromFirebase();
      setTrips(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTripImages = useCallback(async () => {
    const tripsMissingImages = trips.filter((trip) => {
      const destination = trip.destination || trip.plan?.destination;

      return destination && !tripImages[trip.id];
    });

    if (tripsMissingImages.length === 0) return;

    const loadedImages = await Promise.all(
      tripsMissingImages.map(async (trip) => {
        const destination = trip.destination || trip.plan?.destination;
        const image = await getCityImage(destination);

        return {
          id: trip.id,
          image,
        };
      })
    );

    setTripImages((currentImages) => {
      const nextImages = { ...currentImages };

      loadedImages.forEach(({ id, image }) => {
        if (image) {
          nextImages[id] = image;
        }
      });

      return nextImages;
    });
  }, [tripImages, trips]);

  // Nayta koko lataustila vain ensimmaisella avauksella.
  useEffect(() => {
    loadTrips(true);
  }, [loadTrips]);

  // Paivita tallennetut matkat tabiin palatessa ilman koko sivun latausanimaatiota.
  useFocusEffect(
    useCallback(() => {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });

      loadTrips(false);
    }, [loadTrips])
  );

  useEffect(() => {
    loadTripImages();
  }, [loadTripImages]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTrips = normalizedSearch
    ? trips.filter((trip) => {
        const destination = String(
          trip.destination || trip.plan?.destination || ''
        ).toLowerCase();

        return destination.includes(normalizedSearch);
      })
    : trips;
  const isSearching = normalizedSearch.length > 0;
  const resultText = isSearching
    ? `${filteredTrips.length} tulosta`
    : `${trips.length} tallennettua matkaa`;

  const handleDeleteTrip = (id: string) => {
    Alert.alert(
      'Poista matka?',
      'Haluatko varmasti poistaa tämän tallennetun matkan?',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTripFromFirebase(id);

              setTrips((currentTrips) =>
                currentTrips.filter((trip) => trip.id !== id)
              );
            } catch (error) {
              console.log(error);
              Alert.alert('Virhe', 'Matkan poistaminen epäonnistui.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <Ionicons name="sparkles" size={28} color="#6C4DFF" />
          </View>

          <Text style={styles.loadingTitle}>Haetaan matkojasi...</Text>

          <Text style={styles.loadingText}>
            Ladataan tallennetut AI-matkasuunnitelmat.
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

  return (
    <View style={styles.page}>
      <Animated.FlatList
        ref={listRef as any}
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        ListHeaderComponent={
          <View>
            <ParallaxHero
              scrollY={scrollY}
              image={heroImage}
              badgeText="AI Saved Trips"
              label="Tallennetut suunnitelmat"
              title="Omat matkat"
              subtitle="Jatka tallennettujen AI-matkasuunnitelmien tarkastelua."
            />

            <Animated.View
              entering={FadeInDown.delay(180).duration(500)}
              style={styles.contentSection}
            >
              <Text style={styles.sectionEyebrow}>Kirjastosi</Text>
              <Text style={styles.sectionTitle}>Tallennetut suunnitelmat</Text>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#8A94A6" />

                <TextInput
                  style={styles.searchInput}
                  placeholder="Hae kohdetta..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />

                {searchQuery.length > 0 && (
                  <Pressable
                    style={styles.clearSearchButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Ionicons name="close" size={18} color="#6B7280" />
                  </Pressable>
                )}
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultText}>{resultText}</Text>

                {isSearching && (
                  <Text style={styles.searchHint}>
                    Haku: {searchQuery.trim()}
                  </Text>
                )}
              </View>
            </Animated.View>
          </View>
        }
        renderItem={({ item, index }) => {
          const destination = item.destination || item.plan?.destination || 'Nimetön matka';
          const tripImage = tripImages[item.id] || getDestinationImage(destination);

          return (
          <Animated.View
            entering={FadeInDown.delay(index * 70).springify().mass(0.8)}
            style={styles.cardWrapper}
          >
            <Pressable
              style={({ pressed }) => [
                styles.tripCard,
                pressed && styles.pressedCard,
              ]}
              onPress={() => {
                router.push({
                  pathname: '/trip-detail',
                  params: {
                    id: item.id,
                    saved: 'true',
                  },
                });
              }}
            >
              <ImageBackground
                source={{ uri: tripImage }}
                style={styles.cardImage}
                imageStyle={styles.cardImageStyle}
              >
                <LinearGradient
                  colors={[
                    'rgba(10,16,30,0.10)',
                    'rgba(10,16,30,0.45)',
                    'rgba(10,16,30,0.88)',
                  ]}
                  style={styles.cardImageOverlay}
                >
                  <View style={styles.cardImageTopRow}>
                    <View style={styles.imageBadge}>
                      <Ionicons name="sparkles" size={13} color="#fff" />
                      <Text style={styles.imageBadgeText}>AI-suunnitelma</Text>
                    </View>

                    <Pressable
                      style={styles.deleteButtonOnImage}
                      onPress={(event) => {
                        event.stopPropagation();
                        handleDeleteTrip(item.id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                    </Pressable>
                  </View>

                  <View>
                    <Text style={styles.imageDestination}>{destination}</Text>

                    <View style={styles.imageMetaRow}>
                      <Ionicons name="calendar" size={14} color="#EEF2FF" />
                      <Text style={styles.imageMetaText}>
                        {item.plan?.days?.length || 0} päivän matka
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>

              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="airplane" size={24} color="#6C4DFF" />
                </View>

                <View style={styles.cardTextBox}>
                  <Text style={styles.destination}>
                    {destination}
                  </Text>

                  <View style={styles.metaRow}>
                    <Ionicons name="calendar" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>
                      {item.plan?.days?.length || 0} päivän matka
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.tag}>
                  <Ionicons name="sparkles" size={13} color="#6C4DFF" />
                  <Text style={styles.tagText}>AI-suunnitelma</Text>
                </View>

                <View style={styles.openRow}>
                  <Text style={styles.openText}>Avaa</Text>
                  <Ionicons name="chevron-forward" size={18} color="#6C4DFF" />
                </View>
              </View>
            </Pressable>
          </Animated.View>
          );
        }}
        ListEmptyComponent={
          <Animated.View
            entering={FadeInDown.delay(180).springify().mass(0.8)}
            style={styles.emptyBox}
          >
            <View style={styles.emptyIcon}>
              <Ionicons
                name={isSearching ? 'search-outline' : 'map-outline'}
                size={34}
                color="#6C4DFF"
              />
            </View>

            <Text style={styles.emptyTitle}>
              {isSearching
                ? 'Haulla ei löytynyt matkoja'
                : 'Ei vielä tallennettuja matkoja'}
            </Text>

            <Text style={styles.emptyText}>
              {isSearching
                ? 'Kokeile toista hakusanaa tai tyhjennä haku nähdäksesi kaikki tallennetut matkat.'
                : 'Luo ensin AI-matkasuunnitelma ja tallenna se, niin se näkyy täällä.'}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && styles.pressedButton,
              ]}
              onPress={() => {
                if (isSearching) {
                  setSearchQuery('');
                  return;
                }

                router.push('/');
              }}
            >
              <Text style={styles.emptyButtonText}>
                {isSearching ? 'Tyhjennä haku' : 'Luo ensimmäinen matka'}
              </Text>
            </Pressable>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  listContent: {
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

  searchBox: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 22,
    minHeight: 54,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF3',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    color: '#172033',
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  clearSearchButton: {
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: '#F1F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  resultText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '900',
  },

  searchHint: {
    flex: 1,
    color: '#6C4DFF',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },

  cardWrapper: {
    paddingHorizontal: 20,
  },

  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  cardImage: {
    height: 168,
  },

  cardImageStyle: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  cardImageOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },

  cardImageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  imageBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },

  deleteButtonOnImage: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: 'rgba(239,68,68,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageDestination: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
  },

  imageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  imageMetaText: {
    color: '#EEF2FF',
    fontSize: 13,
    fontWeight: '800',
  },

  pressedCard: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 21,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  cardTextBox: {
    flex: 1,
  },

  destination: {
    fontSize: 21,
    fontWeight: '900',
    color: '#172033',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },

  metaText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
  },

  cardBottom: {
    marginTop: 16,
    paddingTop: 15,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEEAFE',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  tagText: {
    color: '#6C4DFF',
    fontSize: 12,
    fontWeight: '900',
  },

  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  openText: {
    color: '#6C4DFF',
    fontSize: 14,
    fontWeight: '900',
  },

  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 26,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 26,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#172033',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: '#6C4DFF',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 16,
  },

  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
