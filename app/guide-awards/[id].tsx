import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';
import { useDesignTokens } from '../../hooks/useDesignTokens';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { guideService, GuideAward } from '../../services/guide.service';

const { width } = Dimensions.get('window');

type Award = GuideAward;

export default function GuideAwardsScreen() {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const tokens = useDesignTokens();
  const { id: guideId } = useLocalSearchParams<{ id: string }>();
  
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guideId) {
      loadAwards();
    }
  }, [guideId]);

  const loadAwards = async () => {
    if (!guideId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await guideService.getGuideAwards(guideId);
      setAwards(response);
      
      // Awards loaded successfully
    } catch (error) {
      // Error loading awards
      setError('Impossibile caricare i premi');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    onTap();
    router.back();
  };

  const handleRestaurantPress = (restaurantId: string) => {
    onTap();
    router.push(`/ristoranti/${restaurantId}`);
  };

  const renderAwardCard = ({ item, index }: { item: Award, index: number }) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.delay(100 + index * 50)}
      style={styles.awardCardWrapper}
    >
      <TouchableOpacity
        style={[styles.awardCard, { backgroundColor: colors.card }, tokens.helpers.touchTarget('comfortable')]}
        onPress={() => handleRestaurantPress(item.restaurant?.id || '')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Premio ${item.title} per ${item.restaurant?.name}, Anno ${item.year}, tocca per vedere il ristorante`}
      >
        {/* Award Header */}
        <View style={styles.awardHeader}>
          <View style={[styles.awardIcon, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="emoji-events" size={24} color="white" />
          </View>
          <View style={styles.awardInfo}>
            <Text style={[styles.awardTitle, textStyles.subtitle(colors.text)]}>
              {item.title}
            </Text>
            <Text style={[styles.awardYear, textStyles.caption(colors.text + '80')]}>
              Anno {item.year}
            </Text>
          </View>
          {item.is_winner && (
            <View style={[styles.winnerBadge, { backgroundColor: '#FFD700' }]}>
              <MaterialIcons name="star" size={16} color="white" />
            </View>
          )}
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantSection}>
          <Image
            source={{
              uri: item.restaurant?.featured_image || 
                   'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
            }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantInfo}>
            <Text style={[styles.restaurantName, textStyles.subtitle(colors.text)]}>
              {item.restaurant?.name}
            </Text>
            <Text style={[styles.restaurantLocation, textStyles.caption(colors.text + '80')]}>
              {item.restaurant?.city}, {item.restaurant?.province}
            </Text>
            {item.restaurant?.category && (
              <View               style={[
                styles.categoryPill,
                { backgroundColor: colors.primary + '20' }
              ]}>
                <Text style={[
                  styles.categoryText,
                  { color: colors.primary },
                  textStyles.label()
                ]}>
                  {item.restaurant?.category?.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Award Description */}
        <Text style={[styles.awardDescription, textStyles.body(colors.text)]}>
          {item.description}
        </Text>

        {/* View Restaurant Button */}
        <View style={styles.viewButtonContainer}>
          <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
          <Text style={[styles.viewButtonText, textStyles.button(colors.primary)]}>
            Vedi Ristorante
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, textStyles.body(colors.text)]}>
            Caricamento premi...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.text + '40'} />
          <Text style={[styles.errorText, textStyles.title(colors.text)]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }, tokens.helpers.touchTarget('recommended')]}
            onPress={() => {
              onTap();
              loadAwards();
            }}
            accessibilityRole="button"
            accessibilityLabel="Riprova a caricare i premi"
          >
            <Text style={styles.retryButtonText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, tokens.helpers.touchTarget('minimum')]} 
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel="Torna indietro"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, textStyles.title(colors.text)]}>
          Premi e Vincitori
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >


        {/* Awards List */}
        {awards.length > 0 ? (
          awards.map((award, index) => renderAwardCard({ item: award, index }))
        ) : (
          <Animated.View 
            style={styles.noAwardsContainer}
            entering={FadeInDown.delay(100)}
          >
            <MaterialIcons name="emoji-events" size={64} color={colors.text + '40'} />
            <Text style={[styles.noAwardsText, textStyles.title(colors.text)]}>
              Nessun premio assegnato
            </Text>
            <Text style={[styles.noAwardsSubtext, textStyles.body(colors.text + '80')]}>
              I premi per questa guida saranno disponibili a breve
            </Text>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  awardCardWrapper: {
    marginBottom: 16,
  },
  awardCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 48,
  },
  awardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  awardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  awardInfo: {
    flex: 1,
  },
  awardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  awardYear: {
    fontSize: 14,
  },
  winnerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  restaurantSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  restaurantImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  awardDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  viewButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noAwardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noAwardsText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  noAwardsSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 32,
  },
});