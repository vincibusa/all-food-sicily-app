import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../app/context/ThemeContext';

export interface ListItem {
  id: string;
  title: string;
  name?: string;
  featured_image: string;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  city: string;
  province: string;
  tags?: string[] | null;
  cuisine_type?: string[];
  created_at?: string;
  rating?: string | number;
  price_range?: number;
}

interface ListCardProps {
  item: ListItem;
  onPress?: () => void;
  delay?: number;
}

export default function ListCard({ item, onPress, delay = 0 }: ListCardProps) {
  const { colors } = useTheme();

  // Use title for guides, name for restaurants
  const displayTitle = item.title || item.name || '';
  
  // Use tags for guides, cuisine_type for restaurants
  const displayTags = item.tags || item.cuisine_type || [];
  
  // Format display tags
  const formattedTags = displayTags.map(tag => 
    typeof tag === 'string' ? 
    tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ') : 
    String(tag)
  );

  return (
    <Animated.View entering={FadeInDown.delay(delay)}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={{ 
            uri: item.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
          }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: item.category?.color || colors.primary }]}>
            <Text style={styles.categoryText}>
              {item.category?.name || (item.cuisine_type?.[0] || 'Elemento')}
            </Text>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {displayTitle}
          </Text>
          
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.text + '80' }]}>
              {item.city}{item.province && `, ${item.province}`}
            </Text>
          </View>
          
          {/* Tags - show cuisine type for restaurants, tags for guides */}
          {formattedTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formattedTags.slice(0, 2).map((tag, tagIndex) => (
                <View key={tagIndex} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                </View>
              ))}
              {formattedTags.length > 2 && (
                <Text style={[styles.moreTagsText, { color: colors.text + '60' }]}>
                  +{formattedTags.length - 2}
                </Text>
              )}
            </View>
          )}
          
          {/* Rating and Price for restaurants */}
          {(item.rating || item.price_range) && (
            <View style={styles.bottomRow}>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <FontAwesome name="star" size={12} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: colors.text + '80' }]}>
                    {parseFloat(item.rating.toString()).toFixed(1)}
                  </Text>
                </View>
              )}
              {item.price_range && (
                <Text style={[styles.priceText, { color: colors.primary }]}>
                  {'€'.repeat(Math.max(1, Math.min(4, item.price_range)))}
                </Text>
              )}
            </View>
          )}
          
          {/* Date for guides */}
          {item.created_at && (
            <Text style={[styles.dateText, { color: colors.text + '60' }]}>
              {new Date(item.created_at).toLocaleDateString('it-IT')}
            </Text>
          )}
        </View>
        
        <MaterialIcons name="chevron-right" size={24} color={colors.text + '40'} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 11,
  },
});