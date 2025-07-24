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
import { useHaptics } from '../utils/haptics';
import { useTextStyles } from '../hooks/useAccessibleText';
import { SCREEN_TRANSITIONS, createStaggeredAnimation, TransitionType } from '../utils/transitions';
import { SwipeableCard, createFavoriteAction, createShareAction, createInfoAction, SwipeAction } from './SwipeableCard';

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
  enableSwipe?: boolean;
  onFavorite?: (item: ListItem) => void;
  onShare?: (item: ListItem) => void;
  onViewInfo?: (item: ListItem) => void;
  isFavorite?: boolean;
}

export default function ListCard({ 
  item, 
  onPress, 
  delay = 0, 
  enableSwipe = true,
  onFavorite,
  onShare,
  onViewInfo,
  isFavorite = false
}: ListCardProps) {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();

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

  // Create more sophisticated staggered animation based on delay
  const enterAnimation = delay > 0 
    ? createStaggeredAnimation(TransitionType.FADE_UP, 1, delay, 0)[0]
    : SCREEN_TRANSITIONS.list.enter;

  // Configurazione azioni di swipe
  const leftActions: SwipeAction[] = [];
  const rightActions: SwipeAction[] = [];

  // Azione preferiti (sinistra)
  if (onFavorite) {
    leftActions.push(createFavoriteAction(
      () => onFavorite(item),
      isFavorite
    ));
  }

  // Azioni condivisione e info (destra)
  if (onShare) {
    rightActions.push(createShareAction(() => onShare(item)));
  }
  if (onViewInfo) {
    rightActions.push(createInfoAction(() => onViewInfo(item)));
  }

  const cardContent = (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => {
        onTap(); // Haptic feedback
        onPress?.();
      }}
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
            <Text style={[styles.categoryText, textStyles.label('white')]}>
              {item.category?.name || (item.cuisine_type?.[0] || 'Elemento')}
            </Text>
          </View>
          
          <Text style={[styles.title, textStyles.subtitle(colors.text)]} numberOfLines={2}>
            {displayTitle}
          </Text>
          
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color={colors.primary} />
            <Text style={[styles.locationText, textStyles.caption(colors.text + '80')]}>
              {item.city}{item.province && `, ${item.province}`}
            </Text>
          </View>
          
          {/* Tags - show cuisine type for restaurants, tags for guides */}
          {formattedTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formattedTags.slice(0, 2).map((tag, tagIndex) => (
                <View key={tagIndex} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, textStyles.caption(colors.primary)]}>{tag}</Text>
                </View>
              ))}
              {formattedTags.length > 2 && (
                <Text style={[styles.moreTagsText, textStyles.caption(colors.text + '60')]}>
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
                  <Text style={[styles.ratingText, textStyles.caption(colors.text + '80')]}>
                    {parseFloat(item.rating.toString()).toFixed(1)}
                  </Text>
                </View>
              )}
              {item.price_range && (
                <Text style={[styles.priceText, textStyles.body(colors.primary)]}>
                  {'€'.repeat(Math.max(1, Math.min(4, item.price_range)))}
                </Text>
              )}
            </View>
          )}
          
          {/* Date for guides */}
          {item.created_at && (
            <Text style={[styles.dateText, textStyles.caption(colors.text + '60')]}>
              {new Date(item.created_at).toLocaleDateString('it-IT')}
            </Text>
          )}
        </View>
        
        <MaterialIcons name="chevron-right" size={24} color={colors.text + '40'} />
      </TouchableOpacity>
  );

  return (
    <Animated.View entering={enterAnimation}>
      {enableSwipe ? (
        <SwipeableCard
          leftActions={leftActions}
          rightActions={rightActions}
          enabled={enableSwipe}
        >
          {cardContent}
        </SwipeableCard>
      ) : (
        cardContent
      )}
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
    marginBottom: 0, // Dynamic font size handled by useTextStyles
  },
  title: {
    marginBottom: 6, // Dynamic font size and line height handled by useTextStyles
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4, // Dynamic font size handled by useTextStyles
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
    // Dynamic font size and weight handled by useTextStyles
  },
  moreTagsText: {
    // Dynamic font size handled by useTextStyles
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
    marginLeft: 4, // Dynamic font size handled by useTextStyles
  },
  priceText: {
    // Dynamic font size and weight handled by useTextStyles
  },
  dateText: {
    // Dynamic font size handled by useTextStyles
  },
});