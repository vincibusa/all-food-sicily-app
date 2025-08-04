import React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/context/ThemeContext';
import { useHaptics } from '../../utils/haptics';

interface SearchItem {
  id: string;
  name: string;
  city: string;
  province: string;
  type: 'restaurant' | 'hotel';
}

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  showSearchResults: boolean;
  onCloseResults: () => void;
  filteredResults: SearchItem[];
  onSelectResult: (item: SearchItem) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  showSearchResults,
  onCloseResults,
  filteredResults,
  onSelectResult,
}) => {
  const { colors } = useTheme();
  const { onTap } = useHaptics();

  return (
    <View style={styles.container}>
      {/* Search overlay to close results when tapping outside */}
      {showSearchResults && (
        <TouchableOpacity
          style={styles.searchOverlay}
          activeOpacity={1}
          onPress={onCloseResults}
        />
      )}
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <MaterialIcons name="search" size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cerca i migliori locali e hotel in sicilia..."
          placeholderTextColor={colors.text + '80'}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => {
            onSearchChange('');
            onCloseResults();
          }}>
            <MaterialIcons name="clear" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Search Results Dropdown */}
      {showSearchResults && filteredResults.length > 0 && (
        <View style={[styles.searchResultsContainer, { backgroundColor: colors.card }]}>
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {filteredResults.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  onTap();
                  onSelectResult(item);
                }}
              >
                <View style={styles.searchResultContent}>
                  <Text style={[styles.searchResultName, { color: colors.text }]} numberOfLines={1}>
                    {item.name || 'Nome non disponibile'}
                  </Text>
                  <Text style={[styles.searchResultLocation, { color: colors.text + '80' }]} numberOfLines={1}>
                    {item.city || 'Città'}, {item.province || 'Provincia'}
                  </Text>
                </View>
                <MaterialIcons name="arrow-forward" size={16} color={colors.text + '60'} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {showSearchResults && filteredResults.length === 0 && (
        <View style={[styles.searchResultsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.noResultsContainer}>
            <MaterialIcons name="search-off" size={24} color={colors.text + '60'} />
            <Text style={[styles.noResultsText, { color: colors.text + '80' }]}>
              Nessun locale o hotel trovato
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {
      elevation: 3,
    }),
    zIndex: 1001,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 78 : 50,
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 12,
    marginHorizontal: 0,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    } : {
      elevation: 8,
    }),
    zIndex: 1000,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchResultLocation: {
    fontSize: 14,
    fontWeight: '400',
  },
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
});