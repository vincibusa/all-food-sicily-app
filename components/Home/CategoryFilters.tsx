import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export interface CategoryFilter {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor?: string;
}

interface CategoryFiltersProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  categories?: CategoryFilter[];
  enableNavigation?: boolean;
}

const defaultCategories: CategoryFilter[] = [
  {
    id: 'sconti',
    name: 'Sconti',
    icon: 'local-offer',
    color: '#E91E63',
    backgroundColor: '#FCE4EC',
  },
  {
    id: 'up-to-50',
    name: 'Fino al 50%',
    icon: 'percent',
    color: '#FF6B35',
    backgroundColor: '#FFF3E0',
  },
  {
    id: '2-for-1',
    name: 'Prendi 2 Paghi 1',
    icon: 'looks-two',
    color: '#8B4513',
    backgroundColor: '#F5F5DC',
  },
  {
    id: 'special',
    name: 'Special',
    icon: 'star',
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  {
    id: 'promo',
    name: 'Promo',
    icon: 'card-giftcard',
    color: '#9C27B0',
    backgroundColor: '#F3E5F5',
  },
  {
    id: 'free',
    name: 'Free',
    icon: 'money-off',
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
];

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  selectedCategory,
  onCategorySelect,
  categories = defaultCategories,
  enableNavigation = false,
}) => {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    onTap();
    onCategorySelect(categoryId);
    
    // Se la navigazione è abilitata, naviga alla pagina dei ristoranti con filtro coupon
    if (enableNavigation) {
      if (categoryId === 'sconti') {
        // Il filtro "sconti" mostra tutti i ristoranti con coupon attivi
        router.push({
          pathname: '/(tabs)/ristoranti',
          params: { 
            category: categoryId,
            showOnlyWithCoupons: 'true'
          }
        });
      } else {
        // Altri filtri specifici per tipo di coupon
        const params: { category: string; couponType?: string } = { 
          category: categoryId,
          couponType: categoryId
        };
        
        router.push({
          pathname: '/(tabs)/ristoranti',
          params
        });
      }
    }
  };

    return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeInDown.delay(200)}
        style={styles.filtersContainer}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category.id;
            
            return (
              <Animated.View
                key={category.id}
                entering={FadeInDown.delay(300 + index * 100)}
                style={styles.categoryWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: isSelected 
                        ? category.backgroundColor || colors.primary 
                        : colors.card,
                      borderColor: isSelected 
                        ? category.color 
                        : colors.border,
                    }
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isSelected 
                        ? category.color 
                        : category.backgroundColor || colors.card,
                    }
                  ]}>
                    <MaterialIcons
                      name={category.icon as any}
                      size={20}
                      color={isSelected ? 'white' : category.color}
                    />
                  </View>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? category.color : colors.text,
                      fontWeight: isSelected ? '600' : '500',
                    }
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  filtersContainer: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingRight: 0,
  },
  categoryWrapper: {
    alignItems: 'center',
    marginRight: 0,
    minWidth: 80,
  },
  categoryButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {
      elevation: 2,
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
}); 