import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useHaptics } from '../utils/haptics';

interface FilterOption {
  id: string;
  name: string;
}

interface Category extends FilterOption {
  color: string;
}

interface AdvancedFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryName: string) => void;
  cities?: FilterOption[];
  selectedCity?: string;
  onCitySelect?: (cityName: string) => void;
  onResetFilters: () => void;
  colors: any;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  showFilters,
  setShowFilters,
  categories,
  selectedCategory,
  onCategorySelect,
  cities = [],
  selectedCity = 'Tutte',
  onCitySelect = () => {},
  onResetFilters,
  colors,
}) => {
  const { onTap } = useHaptics();
  return (
    <View style={styles.filtersSection}>
      {/* Toggle Button */}
      <View style={styles.additionalFiltersContainer}>
        <TouchableOpacity
          style={[styles.filterToggle, { backgroundColor: colors.card, borderColor: colors.primary + '20' }]}
          onPress={() => {
            onTap();
            setShowFilters(!showFilters);
          }}
        >
          <View style={[styles.filterToggleIcon, { backgroundColor: colors.primary + '15' }]}> 
            <MaterialIcons name="tune" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.filterToggleText, { color: colors.text }]}>Filtri avanzati</Text>
          <View style={styles.filterBadgeContainer}>
            {(selectedCity !== 'Tutte' || selectedCategory !== 'Tutti') && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}> 
                <Text style={styles.filterBadgeText}>
                  {(selectedCity !== 'Tutte' ? 1 : 0) + (selectedCategory !== 'Tutti' ? 1 : 0)}
                </Text>
              </View>
            )}
            <MaterialIcons 
              name={showFilters ? "expand-less" : "expand-more"} 
              size={20} 
              color={colors.text + '60'} 
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Expandable Filters */}
      {showFilters && (
        <Animated.View 
          entering={FadeInDown.duration(300)}
          style={[styles.expandedFilters, { backgroundColor: colors.card }]}
        >
          {/* Categoria */}
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Categoria</Text>
            <View style={styles.filterButtonsGrid}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.filterButton,
                    { backgroundColor: selectedCategory === item.name ? colors.primary : colors.background },
                    { borderColor: colors.primary + '30' }
                  ]}
                  onPress={() => {
                    onTap();
                    onCategorySelect(item.name);
                  }}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      { color: selectedCategory === item.name ? 'white' : colors.text }
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Città (opzionale) */}
          {cities.length > 0 && (
            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Città</Text>
              <View style={styles.filterButtonsGrid}>
                {cities.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.filterButton,
                      { backgroundColor: selectedCity === item.name ? colors.primary : colors.background },
                      { borderColor: colors.primary + '30' }
                    ]}
                    onPress={() => {
                      onTap();
                      onCitySelect(item.name);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        { color: selectedCity === item.name ? 'white' : colors.text }
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Reset Button */}
          {(selectedCity !== 'Tutte' || selectedCategory !== 'Tutti') && (
            <View style={styles.resetContainer}>
              <TouchableOpacity
                style={[styles.resetFiltersButton, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                onPress={() => {
                  onTap();
                  onResetFilters();
                }}
              >
                <MaterialIcons name="refresh" size={16} color={colors.primary} />
                <Text style={[styles.resetFiltersText, { color: colors.primary }]}>Cancella Filtri</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filtersSection: {
    marginBottom: 8,
  },
  additionalFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  filterToggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filterBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  expandedFilters: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  filterButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resetContainer: {
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  resetFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resetFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default AdvancedFilters; 