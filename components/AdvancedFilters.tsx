import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn, SlideInDown, withSpring } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useHaptics } from '../utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface FilterOption {
  id: string;
  name: string;
  count?: number;
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
  // Hotel-specific filters
  hotelTypes?: FilterOption[];
  selectedHotelType?: string;
  onHotelTypeSelect?: (typeName: string) => void;
  hotelTypesLabel?: string; // Personalizza l'etichetta per hotelTypes
  hotelTypesIcon?: string; // Personalizza l'icona per hotelTypes
  starRatings?: FilterOption[];
  selectedStarRating?: string;
  onStarRatingSelect?: (rating: string) => void;
  onResetFilters: () => void;
  colors: any;
  showMapButton?: boolean;
  isMapView?: boolean;
  onToggleMapView?: () => void;
  totalResults?: number;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  showFilters,
  setShowFilters,
  categories,
  selectedCategory = 'Tutti',
  onCategorySelect,
  cities = [],
  selectedCity = 'Tutte',
  onCitySelect = () => {},
  hotelTypes = [],
  selectedHotelType = 'Tutti',
  onHotelTypeSelect = () => {},
  hotelTypesLabel = 'Tipo Struttura', // Default label
  hotelTypesIcon = 'hotel', // Default icon
  starRatings = [],
  selectedStarRating = 'Tutte',
  onStarRatingSelect = () => {},
  onResetFilters,
  colors,
  showMapButton = false,
  isMapView = false,
  onToggleMapView = () => {},
  totalResults = 0,
}) => {
  const { onTap } = useHaptics();
  
  const activeFiltersCount = 
    (selectedCity && selectedCity !== 'Tutte' ? 1 : 0) + 
    (selectedCategory && selectedCategory !== 'Tutti' ? 1 : 0) +
    (selectedHotelType && selectedHotelType !== 'Tutti' && selectedHotelType !== 'Tutte' ? 1 : 0) +
    (selectedStarRating && selectedStarRating !== 'Tutte' ? 1 : 0);
  
  
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <View style={styles.filtersSection}>
      {/* Filters and Map Toggle Row */}
      <View style={styles.additionalFiltersContainer}>
        <View style={styles.filtersRow}>
          {/* Enhanced Filter Toggle Button */}
          <Animated.View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[
                styles.filterToggle, 
                { 
                  backgroundColor: showFilters ? colors.primary + '10' : colors.card,
                  borderColor: showFilters ? colors.primary : colors.primary + '20',
                  borderWidth: showFilters ? 2 : 1,
                }
              ]}
              onPress={() => {
                onTap();
                setShowFilters(!showFilters);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.filterToggleIcon, 
                { 
                  backgroundColor: showFilters ? colors.primary : colors.primary + '15',
                }
              ]}> 
                <MaterialIcons 
                  name="tune" 
                  size={18} 
                  color={showFilters ? 'white' : colors.primary} 
                />
              </View>
              <View style={styles.filterToggleContent}>
                <Text style={[
                  styles.filterToggleText, 
                  { 
                    color: showFilters ? colors.primary : colors.text,
                    fontWeight: showFilters ? '700' : '600'
                  }
                ]}>
                  Filtri avanzati
                </Text>
                {hasActiveFilters && (
                  <Text style={[styles.filterSubtext, { color: colors.text + '80' }]}>
                    {activeFiltersCount} filtro{activeFiltersCount > 1 ? 'i' : ''} attivo{activeFiltersCount > 1 ? 'i' : ''}
                  </Text>
                )}
              </View>
              <View style={styles.filterBadgeContainer}>
                {hasActiveFilters && (
                  <Animated.View 
                    entering={FadeIn.duration(200)}
                    style={[styles.filterBadge, { backgroundColor: colors.primary }]}
                  > 
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </Animated.View>
                )}
                <MaterialIcons 
                  name={showFilters ? "expand-less" : "expand-more"} 
                  size={22} 
                  color={showFilters ? colors.primary : colors.text + '60'} 
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Enhanced Map Toggle Button */}
          {showMapButton && (
            <Animated.View entering={FadeIn.delay(100)}>
              <TouchableOpacity
                style={[
                  styles.mapToggleButton,
                  {
                    backgroundColor: isMapView ? colors.primary : colors.card,
                    borderColor: isMapView ? colors.primary : colors.primary + '30',
                    borderWidth: isMapView ? 2 : 1,
                    shadowColor: isMapView ? colors.primary : '#000',
                    shadowOpacity: isMapView ? 0.3 : 0.08,
                  }
                ]}
                onPress={() => {
                  onTap();
                  onToggleMapView();
                }}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.mapToggleIconContainer,
                  { backgroundColor: isMapView ? 'rgba(255,255,255,0.2)' : colors.primary + '15' }
                ]}>
                  <MaterialIcons 
                    name={isMapView ? "list" : "map"} 
                    size={20} 
                    color={isMapView ? 'white' : colors.primary} 
                  />
                </View>
                <Text style={[
                  styles.mapToggleText,
                  { 
                    color: isMapView ? 'white' : colors.primary,
                    fontWeight: isMapView ? '700' : '600'
                  }
                ]}>
                  {isMapView ? 'Lista' : 'Mappa'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Enhanced Expandable Filters */}
      {showFilters && (
        <Animated.View 
          entering={SlideInDown.duration(400).springify()}
          style={[styles.expandedFilters, { backgroundColor: colors.card }]}
        >
          {/* Categories Section with Color Coding */}
          {categories.length > 0 && (
          <View style={styles.filterRow}>
            <View style={styles.filterHeader}>
              <MaterialIcons name="category" size={20} color={colors.primary} />
              <Text style={[styles.filterLabel, { color: colors.text }]}>Categorie</Text>
              <View style={[styles.filterCount, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.filterCountText, { color: colors.primary }]}>
                  {categories.length}
                </Text>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContainer}
              style={styles.categoryScroll}
            >
              {categories.map((item, index) => {
                const isSelected = selectedCategory === item.name;
                const categoryColor = item.color || colors.primary;
                
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeIn.delay(index * 50).duration(300)}
                    style={styles.categoryChipWrapper}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? categoryColor : colors.background,
                          borderColor: isSelected ? categoryColor : categoryColor + '40',
                          borderWidth: isSelected ? 2 : 1,
                          shadowColor: isSelected ? categoryColor : '#000',
                          shadowOpacity: isSelected ? 0.3 : 0.05,
                        }
                      ]}
                      onPress={() => {
                        onTap();
                        onCategorySelect(item.name);
                      }}
                      activeOpacity={0.8}
                    >
                      {/* Color indicator dot */}
                      <View style={[
                        styles.colorDot,
                        { 
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.9)' : categoryColor,
                        }
                      ]} />
                      <Text
                        style={[
                          styles.categoryChipText,
                          { 
                            color: isSelected ? 'white' : colors.text,
                            fontWeight: isSelected ? '700' : '600'
                          }
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.count && (
                        <View style={[
                          styles.itemCount,
                          { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : categoryColor + '15' }
                        ]}>
                          <Text style={[
                            styles.itemCountText,
                            { color: isSelected ? 'white' : categoryColor }
                          ]}>
                            {item.count}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>
          )}

          {/* Cities Section */}
          {cities.length > 0 && (
            <View style={styles.filterRow}>
              <View style={styles.filterHeader}>
                <MaterialIcons name="location-city" size={20} color={colors.primary} />
                <Text style={[styles.filterLabel, { color: colors.text }]}>Città</Text>
                <View style={[styles.filterCount, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.filterCountText, { color: colors.primary }]}>
                    {cities.length}
                  </Text>
                </View>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cityScrollContainer}
                style={styles.cityScroll}
              >
                {cities.map((item, index) => {
                  const isSelected = selectedCity === item.name;
                  
                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeIn.delay((categories.length + index) * 50).duration(300)}
                      style={styles.cityChipWrapper}
                    >
                      <TouchableOpacity
                        style={[
                          styles.cityChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.background,
                            borderColor: isSelected ? colors.primary : colors.primary + '30',
                            borderWidth: isSelected ? 2 : 1,
                            shadowColor: isSelected ? colors.primary : '#000',
                            shadowOpacity: isSelected ? 0.25 : 0.05,
                          }
                        ]}
                        onPress={() => {
                          onTap();
                          onCitySelect(item.name);
                        }}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons 
                          name="place" 
                          size={16} 
                          color={isSelected ? 'white' : colors.primary} 
                        />
                        <Text
                          style={[
                            styles.cityChipText,
                            { 
                              color: isSelected ? 'white' : colors.text,
                              fontWeight: isSelected ? '700' : '600'
                            }
                          ]}
                        >
                          {item.name}
                        </Text>
                        {item.count && (
                          <View style={[
                            styles.itemCount,
                            { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.primary + '15' }
                          ]}>
                            <Text style={[
                              styles.itemCountText,
                              { color: isSelected ? 'white' : colors.primary }
                            ]}>
                              {item.count}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Hotel Types Section */}
          {hotelTypes.length > 0 && (
            <View style={styles.filterRow}>
              <View style={styles.filterHeader}>
                <MaterialIcons name={hotelTypesIcon as any} size={20} color={colors.primary} />
                <Text style={[styles.filterLabel, { color: colors.text }]}>{hotelTypesLabel}</Text>
                <View style={[styles.filterCount, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.filterCountText, { color: colors.primary }]}>
                    {hotelTypes.length}
                  </Text>
                </View>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cityScrollContainer}
                style={styles.cityScroll}
              >
                {hotelTypes.map((item, index) => {
                  const isSelected = selectedHotelType === item.name;
                  
                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeIn.delay((categories.length + cities.length + index) * 50).duration(300)}
                      style={styles.cityChipWrapper}
                    >
                      <TouchableOpacity
                        style={[
                          styles.cityChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.background,
                            borderColor: isSelected ? colors.primary : colors.primary + '30',
                            borderWidth: isSelected ? 2 : 1,
                            shadowColor: isSelected ? colors.primary : '#000',
                            shadowOpacity: isSelected ? 0.25 : 0.05,
                          }
                        ]}
                        onPress={() => {
                          onTap();
                          onHotelTypeSelect(item.name);
                        }}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons 
                          name={hotelTypesIcon as any} 
                          size={16} 
                          color={isSelected ? 'white' : colors.primary} 
                        />
                        <Text
                          style={[
                            styles.cityChipText,
                            { 
                              color: isSelected ? 'white' : colors.text,
                              fontWeight: isSelected ? '700' : '600'
                            }
                          ]}
                        >
                          {item.name}
                        </Text>
                        {item.count && (
                          <View style={[
                            styles.itemCount,
                            { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.primary + '15' }
                          ]}>
                            <Text style={[
                              styles.itemCountText,
                              { color: isSelected ? 'white' : colors.primary }
                            ]}>
                              {item.count}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Star Ratings Section */}
          {starRatings.length > 0 && (
            <View style={styles.filterRow}>
              <View style={styles.filterHeader}>
                <MaterialIcons name="star" size={20} color={colors.primary} />
                <Text style={[styles.filterLabel, { color: colors.text }]}>Stelle</Text>
                <View style={[styles.filterCount, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.filterCountText, { color: colors.primary }]}>
                    {starRatings.length}
                  </Text>
                </View>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cityScrollContainer}
                style={styles.cityScroll}
              >
                {starRatings.map((item, index) => {
                  const isSelected = selectedStarRating === item.name;
                  
                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeIn.delay((categories.length + cities.length + hotelTypes.length + index) * 50).duration(300)}
                      style={styles.cityChipWrapper}
                    >
                      <TouchableOpacity
                        style={[
                          styles.cityChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.background,
                            borderColor: isSelected ? colors.primary : colors.primary + '30',
                            borderWidth: isSelected ? 2 : 1,
                            shadowColor: isSelected ? colors.primary : '#000',
                            shadowOpacity: isSelected ? 0.25 : 0.05,
                          }
                        ]}
                        onPress={() => {
                          onTap();
                          onStarRatingSelect(item.name);
                        }}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons 
                          name="grade" 
                          size={16} 
                          color={isSelected ? 'white' : colors.primary} 
                        />
                        <Text
                          style={[
                            styles.cityChipText,
                            { 
                              color: isSelected ? 'white' : colors.text,
                              fontWeight: isSelected ? '700' : '600'
                            }
                          ]}
                        >
                          {item.name}
                        </Text>
                        {item.count && (
                          <View style={[
                            styles.itemCount,
                            { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.primary + '15' }
                          ]}>
                            <Text style={[
                              styles.itemCountText,
                              { color: isSelected ? 'white' : colors.primary }
                            ]}>
                              {item.count}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Enhanced Reset Section */}
          {hasActiveFilters && (
            <Animated.View 
              entering={FadeIn.delay(400).duration(300)}
              style={styles.resetContainer}
            >
              <TouchableOpacity
                style={[
                  styles.resetFiltersButton, 
                  { 
                    borderColor: colors.primary, 
                    backgroundColor: colors.primary + '10',
                    shadowColor: colors.primary,
                    shadowOpacity: 0.2,
                  }
                ]}
                onPress={() => {
                  onTap();
                  onResetFilters();
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="refresh" size={18} color={colors.primary} />
                <Text style={[styles.resetFiltersText, { color: colors.primary }]}>
                  Cancella tutti i filtri
                </Text>
                <View style={[styles.resetBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.resetBadgeText}>{activeFiltersCount}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filtersSection: {
    marginBottom: 12,
  },
  additionalFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  
  // Enhanced Filter Toggle
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    height: 64,
  },
  filterToggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterToggleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  filterToggleText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  filterSubtext: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  filterBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
  },

  // Enhanced Map Toggle
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 120,
    justifyContent: 'center',
    height: 64,
  },
  mapToggleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  mapToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Enhanced Expandable Section
  expandedFilters: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Filter Sections
  filterRow: {
    marginBottom: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  filterCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Filter Grids
  filterButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Scrollable Categories
  categoryScroll: {
    marginHorizontal: -8, // Offset container padding
  },
  categoryScrollContainer: {
    paddingHorizontal: 8,
    paddingRight: 16, // Extra padding at the end
  },
  categoryChipWrapper: {
    marginRight: 8,
  },

  // Category Chips
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
    minWidth: 80, // Minimum width for consistency
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Scrollable Cities
  cityScroll: {
    marginHorizontal: -8, // Offset container padding
  },
  cityScrollContainer: {
    paddingHorizontal: 8,
    paddingRight: 16, // Extra padding at the end
  },
  cityChipWrapper: {
    marginRight: 8,
  },

  // City Chips
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
    minWidth: 70, // Minimum width for consistency
  },
  cityChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Item Counts
  itemCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    marginLeft: 4,
  },
  itemCountText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Reset Section
  resetContainer: {
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  resetFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  resetFiltersText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resetBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
  },
});

export default AdvancedFilters; 