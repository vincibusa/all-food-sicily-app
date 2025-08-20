import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
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
  loading?: boolean;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  showSearchResults,
  onCloseResults,
  filteredResults,
  onSelectResult,
  loading = false,
}) => {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

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
      <View style={[
        styles.searchContainer, 
        { 
          backgroundColor: colors.card,
          borderColor: isFocused ? colors.primary : colors.border,
          borderWidth: isFocused ? 2 : 1,
        }
      ]}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={isFocused ? colors.primary : colors.text} 
          style={styles.searchIcon} 
        />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cerca i migliori locali e hotel in sicilia..."
          placeholderTextColor={colors.text + '80'}
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel="Campo di ricerca ristoranti e hotel"
          accessibilityHint="Digita per cercare ristoranti e hotel in Sicilia"

          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading && searchQuery.length > 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : searchQuery.length > 0 ? (
          <TouchableOpacity 
            onPress={() => {
              onSearchChange('');
              onCloseResults();
              inputRef.current?.blur();
            }}
            accessibilityLabel="Cancella ricerca"
            accessibilityHint="Tocca per cancellare il testo di ricerca"
            accessibilityRole="button"
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="clear" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Search Results Dropdown */}
      {showSearchResults && filteredResults.length > 0 && (
        <View style={[styles.searchResultsContainer, { backgroundColor: colors.card }]}>
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {filteredResults.slice(0, 5).map((item, index) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                style={[
                  styles.searchResultItem, 
                  { 
                    borderBottomColor: colors.border,
                    borderBottomWidth: index === filteredResults.slice(0, 5).length - 1 ? 0 : 0.5
                  }
                ]}
                onPress={() => {
                  onTap();
                  onSelectResult(item);
                  inputRef.current?.blur();
                }}
                accessibilityLabel={`${item.name}, ${item.type === 'restaurant' ? 'ristorante' : 'hotel'} a ${item.city}`}
                accessibilityHint="Tocca per visualizzare i dettagli"
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                <View style={[
                  styles.searchResultIcon,
                  { backgroundColor: colors.primary + '20' }
                ]}>
                  <MaterialIcons 
                    name={item.type === 'restaurant' ? 'restaurant' : 'hotel'} 
                    size={18} 
                    color={colors.primary} 
                  />
                </View>
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
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 78 : 70,
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
    paddingVertical: 16,
    minHeight: 56,
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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