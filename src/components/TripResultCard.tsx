import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  saveTripToFirebase,
  updateTripInFirebase,
} from '../services/firebaseService';

import { modifyTripPlan } from '../services/tripApi';

type DayPlan = {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
};

type WeatherData = {
  city?: string;
  country?: string;
  temperature?: number;
  weatherCode?: number;
  windSpeed?: number;
  daily?: {
    dates?: string[];
    maxTemperatures?: number[];
    minTemperatures?: number[];
    rainProbabilities?: number[];
  };
};

type TripPlan = {
  destination: string;
  days: DayPlan[];
  weather?: WeatherData;
  budjetti?: number;
  kulut?: Record<string, number>;
};

type TripResultCardProps = {
  plan: TripPlan | any;
  hideSaveButton?: boolean;
  hideTitle?: boolean;
  tripId?: string;
};

const quickPrompts = [
  'Lisää yöelämää',
  'Halvempi versio',
  'Lisää kylpylä',
  'Lisää ruokapaikkoja',
];

function getWeatherIcon(code?: number): keyof typeof Ionicons.glyphMap {
  if (code === undefined || code === null) return 'partly-sunny';
  if (code === 0) return 'sunny';
  if ([1, 2, 3].includes(code)) return 'partly-sunny';
  if ([45, 48].includes(code)) return 'cloudy';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'rainy';
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'thunderstorm';

  return 'partly-sunny';
}

function getWeatherText(code?: number) {
  if (code === undefined || code === null) return 'Säätieto';
  if (code === 0) return 'Selkeää';
  if ([1, 2, 3].includes(code)) return 'Puolipilvistä';
  if ([45, 48].includes(code)) return 'Sumuista';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Tihkusadetta';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Sadetta';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Lumisadetta';
  if ([95, 96, 99].includes(code)) return 'Ukkosta';

  return 'Säätieto';
}

function getBudgetIcon(label: string): keyof typeof Ionicons.glyphMap {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('majoitus') || normalizedLabel.includes('hotelli')) {
    return 'bed';
  }
  if (normalizedLabel.includes('ruoka') || normalizedLabel.includes('ravintola')) {
    return 'restaurant';
  }
  if (normalizedLabel.includes('liik') || normalizedLabel.includes('kuljetus')) {
    return 'bus';
  }
  if (normalizedLabel.includes('aktivite') || normalizedLabel.includes('näht')) {
    return 'ticket';
  }
  if (normalizedLabel.includes('lento')) {
    return 'airplane';
  }

  return 'wallet';
}

function formatEuro(value: number) {
  return `${Math.round(value)} €`;
}

export default function TripResultCard({
  plan,
  hideSaveButton = false,
  hideTitle = false,
  tripId,
}: TripResultCardProps) {
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [aiMessage, setAiMessage] = useState('');
  const [modifying, setModifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setCurrentPlan(plan);
    setSaved(false);
    setHasUnsavedChanges(false);
  }, [plan]);

  if (!currentPlan || !currentPlan.days || !Array.isArray(currentPlan.days)) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={34} color="#6C4DFF" />

          <Text style={styles.errorTitle}>Suunnitelmaa ei voitu näyttää</Text>

          <Text style={styles.errorText}>
            Tarkista backend-yhteys ja yritä uudelleen.
          </Text>
        </View>
      </View>
    );
  }

  const handleSaveTrip = async () => {
    if (saving || saved || (tripId && !hasUnsavedChanges)) return;

    try {
      setSaving(true);

      if (tripId) {
        await updateTripInFirebase(tripId, {
          destination: currentPlan.destination,
          plan: currentPlan,
        });

        Alert.alert(
          'Päivitetty!',
          'Tallennettu matkasuunnitelma päivitettiin.'
        );
      } else {
        await saveTripToFirebase({
          destination: currentPlan.destination,
          plan: currentPlan,
        });

        Alert.alert(
          'Tallennettu!',
          'Matka tallennettiin omiin matkoihin.'
        );
      }

      setSaved(true);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Virhe',
        tripId
          ? 'Matkan päivittäminen epäonnistui.'
          : 'Matkan tallennus epäonnistui.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleModifyTrip = async (message: string) => {
    if (!message.trim() || modifying) return;

    try {
      setModifying(true);

      const updatedPlan = await modifyTripPlan({
        currentPlan,
        message: message.trim(),
      });

      setCurrentPlan(updatedPlan);
      setAiMessage('');
      setSaved(false);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Virhe',
        'AI-muokkaus epäonnistui. Tarkista backend-yhteys.'
      );
    } finally {
      setModifying(false);
    }
  };

  const weather = currentPlan.weather;
  const weatherIcon = getWeatherIcon(weather?.weatherCode);
  const weatherText = getWeatherText(weather?.weatherCode);
  const showSaveControls = !hideSaveButton || Boolean(tripId);
  const saveDisabled = saving || saved || Boolean(tripId && !hasUnsavedChanges);
  const saveStatusIcon = hasUnsavedChanges ? 'alert-circle' : 'checkmark-circle';
  const saveStatusText = tripId
    ? hasUnsavedChanges
      ? 'Muutoksia ei ole vielä tallennettu.'
      : saved
        ? 'Muutokset on tallennettu.'
        : 'Tallennettu versio ajan tasalla.'
    : saved
      ? 'Matka on tallennettu omiin matkoihin.'
      : 'Voit tallentaa suunnitelman omiin matkoihin.';
  const saveButtonText = saving
    ? tripId
      ? 'Päivitetään...'
      : 'Tallennetaan...'
    : saved
      ? tripId
        ? 'Päivitetty'
        : 'Tallennettu'
      : tripId
        ? hasUnsavedChanges
          ? 'Tallenna muutokset'
          : 'Ei uusia muutoksia'
        : 'Tallenna matka';
  const budgetEntries = Object.entries(currentPlan.kulut ?? {})
    .map(([key, value]) => ({
      key,
      value: Number(value) || 0,
      icon: getBudgetIcon(key),
    }))
    .filter((entry) => entry.value > 0);
  const budgetTotal = budgetEntries.reduce(
    (total, entry) => total + entry.value,
    0
  );
  const biggestBudgetItem = budgetEntries.reduce(
    (biggest, entry) => (entry.value > biggest.value ? entry : biggest),
    { key: '', value: 0, icon: 'wallet' as keyof typeof Ionicons.glyphMap }
  );

  return (
    <View style={styles.container}>
      {!hideTitle && (
        <Animated.View entering={FadeInDown.duration(450)}>
          <Text style={styles.mainTitle}>
            Matkasuunnitelma: {currentPlan.destination}
          </Text>
        </Animated.View>
      )}

      {weather && (
        <Animated.View entering={FadeInDown.delay(80).springify().mass(0.8)}>
          <View style={styles.weatherCard}>
            <View style={styles.weatherTopRow}>
              <View>
                <Text style={styles.weatherEyebrow}>Sää kohteessa</Text>

                <Text style={styles.weatherLocation}>
                  {weather.city || currentPlan.destination}
                  {weather.country ? `, ${weather.country}` : ''}
                </Text>
              </View>

              <View style={styles.weatherIconBox}>
                <Ionicons name={weatherIcon} size={30} color="#fff" />
              </View>
            </View>

            <View style={styles.weatherMiddleRow}>
              <Text style={styles.weatherTemperature}>
                {weather.temperature !== undefined && weather.temperature !== null
                  ? `${Math.round(weather.temperature)}°`
                  : '--°'}
              </Text>

              <View style={styles.weatherStatusBox}>
                <Text style={styles.weatherStatus}>{weatherText}</Text>

                <Text style={styles.weatherWind}>
                  Tuuli {weather.windSpeed ?? '-'} km/h
                </Text>
              </View>
            </View>

            {weather.daily?.dates && weather.daily.dates.length > 0 && (
              <View style={styles.dailyWeatherRow}>
                {weather.daily.dates.slice(0, 3).map((date: string, index: number) => (
                  <View key={date} style={styles.dailyWeatherBox}>
                    <Text style={styles.dailyDate}>
                      {new Date(date).toLocaleDateString('fi-FI', {
                        weekday: 'short',
                      })}
                    </Text>

                    <Text style={styles.dailyTemp}>
                      {Math.round(weather.daily?.maxTemperatures?.[index] ?? 0)}°
                    </Text>

                    <View style={styles.rainRow}>
                      <Ionicons name="rainy-outline" size={12} color="#D1D5DB" />

                      <Text style={styles.dailyRain}>
                        {weather.daily?.rainProbabilities?.[index] ?? 0}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      )}

      <Text style={styles.sectionHeading}>Päiväohjelma</Text>

      {currentPlan.days.map((dayItem: DayPlan, index: number) => (
        <Animated.View
          key={`${dayItem.day}-${dayItem.morning}-${index}`}
          entering={FadeInDown.delay(index * 70).springify().mass(0.8)}
          >
            <View style={styles.timelineRow}>
              <View style={styles.timelineRail}>
              {index < currentPlan.days.length - 1 && (
                <View style={styles.timelineLine} />
              )}

              <View style={styles.timelineDot}>
                <Text style={styles.timelineDotText}>{dayItem.day}</Text>
              </View>
            </View>

            <View style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayHeaderIcon}>
                  <Ionicons name="calendar" size={20} color="#6C4DFF" />
                </View>

                <View>
                  <Text style={styles.dayTitle}>Päivä {dayItem.day}</Text>
                  <Text style={styles.daySubtitle}>Aamu, iltapäivä ja ilta</Text>
                </View>
              </View>

              <PlanSection icon="sunny" title="Aamu" text={dayItem.morning} />
              <PlanSection
                icon="partly-sunny"
                title="Iltapäivä"
                text={dayItem.afternoon}
              />
              <PlanSection icon="moon" title="Ilta" text={dayItem.evening} />
            </View>
          </View>
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.delay(160).springify().mass(0.8)}>
        <View style={styles.aiCard}>
          <View style={styles.aiTopBadge}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text style={styles.aiTopBadgeText}>AI Assistant</Text>
          </View>

          <View style={styles.aiHeader}>
            <View style={styles.aiIconBox}>
              <Ionicons name="chatbubble-ellipses" size={25} color="#6C4DFF" />
            </View>

            <View style={styles.aiHeaderText}>
              <Text style={styles.aiTitle}>Haluatko muuttaa suunnitelmaa?</Text>

              <Text style={styles.aiSubtitle}>
                Kerro mitä haluat vaihtaa, lisätä tai poistaa.
              </Text>
            </View>
          </View>

          <View style={styles.quickPromptRow}>
            {quickPrompts.map((prompt) => (
              <Pressable
                key={prompt}
                style={({ pressed }) => [
                  styles.quickPrompt,
                  pressed && styles.quickPromptPressed,
                ]}
                onPress={() => handleModifyTrip(prompt)}
                disabled={modifying}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.chatInputBox}>
            <TextInput
              style={styles.chatInput}
              placeholder="Esim. vaihda päivä 2 kylpylään..."
              placeholderTextColor="#9CA3AF"
              value={aiMessage}
              onChangeText={setAiMessage}
              multiline
            />

            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.pressedButton,
                modifying && styles.savingButton,
              ]}
              onPress={() => handleModifyTrip(aiMessage)}
              disabled={modifying || !aiMessage.trim()}
            >
              {modifying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={19} color="#fff" />
              )}
            </Pressable>
          </View>

          {modifying && (
            <Text style={styles.modifyingText}>
              AI päivittää suunnitelmaa...
            </Text>
          )}
        </View>
      </Animated.View>

      {budgetEntries.length > 0 && (
        <Animated.View entering={FadeInDown.delay(180).springify().mass(0.8)}>
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <View style={styles.budgetIcon}>
                <Ionicons name="wallet" size={22} color="#16A34A" />
              </View>

              <View>
                <Text style={styles.budgetTitle}>Budjettiarvio</Text>

                <Text style={styles.budgetSubtitle}>
                  Arvioidut kulut ja suurimmat menoerät
                </Text>
              </View>
            </View>

            <View style={styles.budgetTotalBox}>
              <View>
                <Text style={styles.budgetTotalLabel}>Yhteensä</Text>
                <Text style={styles.budgetTotalValue}>
                  {formatEuro(budgetTotal)}
                </Text>
              </View>

              {biggestBudgetItem.key.length > 0 && (
                <View style={styles.biggestBudgetBadge}>
                  <Ionicons name="trending-up" size={14} color="#16A34A" />
                  <Text style={styles.biggestBudgetText}>
                    Suurin: {biggestBudgetItem.key}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.budgetList}>
              {budgetEntries.map((entry) => {
                const progress = budgetTotal > 0
                  ? Math.max(6, Math.round((entry.value / budgetTotal) * 100))
                  : 0;

                return (
                  <View key={entry.key} style={styles.budgetRow}>
                    <View style={styles.budgetRowTop}>
                      <View style={styles.budgetLabelBox}>
                        <View style={styles.budgetCategoryIcon}>
                          <Ionicons name={entry.icon} size={17} color="#16A34A" />
                        </View>

                        <Text style={styles.budgetLabel}>{entry.key}</Text>
                      </View>

                      <Text style={styles.budgetValue}>
                        {formatEuro(entry.value)}
                      </Text>
                    </View>

                    <View style={styles.budgetProgressTrack}>
                      <View
                        style={[
                          styles.budgetProgressFill,
                          { width: `${progress}%` },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>
      )}

      {showSaveControls && (
        <Animated.View entering={FadeInDown.delay(220).duration(450)}>
          <View
            style={[
              styles.saveStatusBox,
              hasUnsavedChanges && styles.unsavedStatusBox,
              saved && styles.savedStatusBox,
            ]}
          >
            <Ionicons
              name={saveStatusIcon}
              size={17}
              color={hasUnsavedChanges ? '#B45309' : '#16A34A'}
            />

            <Text
              style={[
                styles.saveStatusText,
                hasUnsavedChanges && styles.unsavedStatusText,
              ]}
            >
              {saveStatusText}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              saved && styles.savedButton,
              saving && styles.savingButton,
              saveDisabled && !saving && styles.disabledSaveButton,
              pressed && !saveDisabled && styles.pressedButton,
            ]}
            onPress={handleSaveTrip}
            disabled={saveDisabled}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'cloud-upload'}
              size={20}
              color="#fff"
            />

            <Text style={styles.saveButtonText}>{saveButtonText}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

type PlanSectionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
};

function PlanSection({ icon, title, text }: PlanSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={20} color="#6C4DFF" />
      </View>

      <View style={styles.sectionTextBox}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
  },

  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#172033',
    marginBottom: 16,
  },

  weatherCard: {
    backgroundColor: '#172033',
    borderRadius: 34,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 9,
  },

  weatherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  weatherEyebrow: {
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
  },

  weatherLocation: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
  },

  weatherIconBox: {
    width: 62,
    height: 62,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  weatherMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 20,
  },

  weatherTemperature: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    marginRight: 20,
  },

  weatherStatusBox: {
    flex: 1,
  },

  weatherStatus: {
    color: '#EEF2FF',
    fontSize: 18,
    fontWeight: '900',
  },

  weatherWind: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 5,
  },

  dailyWeatherRow: {
    flexDirection: 'row',
    gap: 9,
  },

  dailyWeatherBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: 'center',
  },

  dailyDate: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  dailyTemp: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },

  rainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },

  dailyRain: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '800',
  },

  sectionHeading: {
    fontSize: 25,
    fontWeight: '900',
    color: '#172033',
    marginBottom: 16,
  },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  timelineRail: {
    width: 44,
    alignItems: 'center',
    position: 'relative',
  },

  timelineLine: {
    position: 'absolute',
    top: 48,
    bottom: -18,
    width: 3,
    borderRadius: 999,
    backgroundColor: '#DCD7FF',
  },

  timelineDot: {
    width: 42,
    height: 42,
    borderRadius: 17,
    backgroundColor: '#6C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C4DFF',
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  timelineDotText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
  },

  dayCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  dayHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  dayTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#172033',
  },

  daySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 3,
  },

  section: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  sectionTextBox: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#374151',
    marginBottom: 4,
  },

  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },

  aiCard: {
    backgroundColor: '#fff',
    borderRadius: 34,
    padding: 18,
    marginTop: 6,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 7,
  },

  aiTopBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6C4DFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },

  aiTopBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  aiIconBox: {
    width: 56,
    height: 56,
    borderRadius: 21,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  aiHeaderText: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#172033',
  },

  aiSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 19,
  },

  quickPromptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },

  quickPrompt: {
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  quickPromptPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  quickPromptText: {
    color: '#6C4DFF',
    fontSize: 12,
    fontWeight: '900',
  },

  chatInputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F7F9FC',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },

  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 104,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: '#172033',
    fontSize: 14,
    fontWeight: '700',
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: '#6C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modifyingText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },

  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 18,
    marginTop: 4,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  budgetIcon: {
    width: 52,
    height: 52,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  budgetTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#172033',
  },

  budgetSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 3,
  },

  budgetTotalBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  budgetTotalLabel: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },

  budgetTotalValue: {
    color: '#172033',
    fontSize: 32,
    fontWeight: '900',
  },

  biggestBudgetBadge: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  biggestBudgetText: {
    flexShrink: 1,
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  budgetList: {
    gap: 12,
  },

  budgetRow: {
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },

  budgetRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 9,
  },

  budgetLabelBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  budgetCategoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  budgetLabel: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    textTransform: 'capitalize',
    fontWeight: '900',
  },

  budgetValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#172033',
  },

  budgetProgressTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
    overflow: 'hidden',
  },

  budgetProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#16A34A',
  },

  saveButton: {
    backgroundColor: '#6C4DFF',
    borderRadius: 22,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
    marginBottom: 18,
    shadowColor: '#6C4DFF',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  pressedButton: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  savingButton: {
    opacity: 0.75,
  },

  disabledSaveButton: {
    opacity: 0.55,
  },

  savedButton: {
    backgroundColor: '#16A34A',
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },

  saveStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 10,
  },

  unsavedStatusBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },

  savedStatusBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },

  saveStatusText: {
    flex: 1,
    color: '#15803D',
    fontSize: 13,
    fontWeight: '800',
  },

  unsavedStatusText: {
    color: '#B45309',
  },

  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#172033',
    marginTop: 12,
  },

  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
});
