import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { apiClient } from '../../services/api';

const { width } = Dimensions.get('window');

const categories = [
  {
    id: 'guida',
    title: 'Guida',
    icon: 'restaurant-menu',
    description: 'La guida completa ai sapori siciliani',
    color: '#FF6B35',
  },
  {
    id: 'premi-speciali',
    title: 'Premi Speciali',
    icon: 'emoji-events',
    description: 'Riconoscimenti di eccellenza',
    color: '#FFD23F',
  },
  {
    id: 'vincitori',
    title: 'I Vincitori',
    icon: 'star',
    description: 'I migliori locali premiati',
    color: '#06FFA5',
  },
  {
    id: 'presentazione',
    title: 'Presentazione',
    icon: 'info',
    description: 'Scopri AllFood Sicily',
    color: '#4ECDC4',
  },
  {
    id: 'sponsor',
    title: 'Sponsor',
    icon: 'handshake',
    description: 'I nostri partner di fiducia',
    color: '#45B7D1',
  },
  {
    id: 'iniziative',
    title: 'Iniziative',
    icon: 'lightbulb',
    description: 'Progetti e eventi speciali',
    color: '#96CEB4',
  },
];

interface Guide {
  id: string;
  title: string;
  featured_image?: string;
  category?: {
    name: string;
    color?: string;
  };
  city?: string;
  province?: string;
}

export default function GuideSpecificCategoriesScreen() {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const { id: guideId } = useLocalSearchParams<{ id: string }>();
  
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (guideId) {
      loadGuide();
    }
  }, [guideId]);

  const loadGuide = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get<Guide>(`/guides/${guideId}`);
      setGuide(response);
      
      // Guide loaded successfully
    } catch (error) {
      // Error loading guide
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    onTap();
    
    if (categoryId === 'guida') {
      // Navigate to guide-specific restaurant search
      router.push(`/guide-search?guideId=${guideId}`);
    } else if (categoryId === 'vincitori') {
      // Navigate to awards page
      router.push(`/guide-awards/${guideId}`);
    } else if (categoryId === 'sponsor') {
      // Navigate to sponsors page
      router.push(`/guide-sponsors/${guideId}`);
    } else {
      // Navigate to guide-specific category content (presentazione, premi-speciali, iniziative)
      router.push(`/guide-category/${categoryId}?guideId=${guideId}`);
    }
  };

  const handleBackPress = () => {
    onTap();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, textStyles.title(colors.text)]}>
          Guida
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <Animated.View
              key={category.id}
              style={styles.categoryWrapper}
              entering={FadeInDown.delay(200 + index * 80)}
            >
              <TouchableOpacity
                style={[styles.categoryCard, { backgroundColor: colors.card }]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.7}
                disabled={loading}
              >
                <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                  <MaterialIcons
                    name={category.icon as any}
                    size={28}
                    color="white"
                  />
                </View>
                <Text style={[styles.categoryTitle, textStyles.subtitle(colors.text)]}>
                  {category.title}
                </Text>
                <Text style={[styles.categoryDescription, textStyles.caption(colors.text + '80')]}>
                  {category.description}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
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
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryWrapper: {
    width: (width - 60) / 2,
    marginBottom: 20,
  },
  categoryCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 220,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryTitle: {
    fontSize: Math.min(width * 0.045, 16),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomPadding: {
    height: 40,
  },
});