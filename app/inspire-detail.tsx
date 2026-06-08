import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function InspireDetailScreen() {
  const { city, country, description, image } = useLocalSearchParams();

  const imageUrl = Array.isArray(image) ? image[0] : image;
  const cityName = Array.isArray(city) ? city[0] : city;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.82)']}
          style={styles.heroOverlay}
        >
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          <View style={styles.heroBottom}>
            <Text style={styles.heroLabel}>Suosittu matkakohde</Text>

            <Text style={styles.city}>
              {city}
            </Text>

            <Text style={styles.country}>
              {country}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          Miksi matkustaa tänne?
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Ionicons name="restaurant" size={22} color="#6C4DFF" />
            <Text style={styles.infoText}>Ruoka</Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="business" size={22} color="#6C4DFF" />
            <Text style={styles.infoText}>Kulttuuri</Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="moon" size={22} color="#6C4DFF" />
            <Text style={styles.infoText}>Yöelämä</Text>
          </View>
        </View>
      </View>

      <View style={styles.experienceCard}>
        <Text style={styles.sectionTitle}>
          Matkaidea
        </Text>

        <View style={styles.timeline}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Päivä 1</Text>
            <Text style={styles.timelineText}>
              Tutustu kaupungin keskustaan, kahviloihin ja nähtävyyksiin.
            </Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Päivä 2</Text>
            <Text style={styles.timelineText}>
              Kokeile paikallista ruokaa ja vietä iltaa tunnelmallisissa paikoissa.
            </Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Päivä 3</Text>
            <Text style={styles.timelineText}>
              Rentoudu ja koe kaupungin paikallinen tunnelma ennen kotiinpaluuta.
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: '/',
            params: {
              destination: cityName,
            },
          })
        }
      >
        <LinearGradient
          colors={['#7B61FF', '#4D7CFF']}
          style={styles.buttonGradient}
        >
          <Ionicons name="sparkles" size={20} color="#fff" />

          <Text style={styles.buttonText}>
            Luo matkasuunnitelma
          </Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  content: {
    paddingBottom: 50,
  },

  hero: {
    height: 380,
  },

  heroImage: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  heroOverlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 46,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroBottom: {
    paddingRight: 20,
  },

  heroLabel: {
    color: '#EDE9FE',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },

  city: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '900',
  },

  country: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 30,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#172033',
    marginBottom: 14,
  },

  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },

  infoBox: {
    width: '30%',
    backgroundColor: '#F7F7FF',
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
  },

  infoText: {
    marginTop: 8,
    fontWeight: '800',
    color: '#374151',
  },

  experienceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 30,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  timeline: {
    flexDirection: 'row',
    marginBottom: 22,
  },

  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#6C4DFF',
    marginTop: 5,
    marginRight: 14,
  },

  timelineContent: {
    flex: 1,
  },

  timelineTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#172033',
    marginBottom: 4,
  },

  timelineText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },

  button: {
    marginHorizontal: 20,
    marginTop: 26,
  },

  buttonGradient: {
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },
});