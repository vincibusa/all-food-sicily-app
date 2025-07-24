import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
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
      activeOpacity={0.8}
    >
      {/* Hero Image with Overlay */}
      <ImageBackground
        source={{ 
          uri: item.featured_image || 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
        }}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Overlay Content */}
        <View style={styles.overlayContent}>
          {/* Top Row: Category and Rating */}
          <View style={styles.topRow}>
            <View style={[styles.categoryBadge, { backgroundColor: item.category?.color || colors.primary }]}>
              <Text style={[styles.categoryText, textStyles.label('white')]}>
                {item.category?.name || (item.cuisine_type?.[0] || 'Elemento')}
              </Text>
            </View>
            
            {item.rating && (
              <View style={styles.ratingBadge}>
                <FontAwesome name="star" size={12} color="#FFD700" />
                <Text style={[styles.ratingText, textStyles.caption('white')]}>
                  {parseFloat(item.rating.toString()).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          
          {/* Bottom Content */}
          <View style={styles.bottomContent}>
            <Text style={[styles.heroTitle, textStyles.subtitle('white')]} numberOfLines={2}>
              {displayTitle}
            </Text>
            
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={14} color="white" />
              <Text style={[styles.locationText, textStyles.caption('rgba(255,255,255,0.9)')]}>
                {item.city}{item.province && `, ${item.province}`}
              </Text>
            </View>
            
            {/* Tags and Price Row */}
            <View style={styles.metaRow}>
              {/* Tags */}
              {formattedTags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {formattedTags.slice(0, 2).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={[styles.tagText, textStyles.caption('rgba(255,255,255,0.8)')]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                  {formattedTags.length > 2 && (
                    <Text style={[styles.moreTagsText, textStyles.caption('rgba(255,255,255,0.7)')]}>
                      +{formattedTags.length - 2}
                    </Text>
                  )}
                </View>
              )}
              
              {/* Price */}
              {item.price_range && (
                <Text style={[styles.priceText, textStyles.body('white')]}>
                  {'€'.repeat(Math.max(1, Math.min(4, item.price_range)))}
                </Text>
              )}
            </View>
            
            {/* Date for guides */}
            {item.created_at && (
              <Text style={[styles.dateText, textStyles.caption('rgba(255,255,255,0.8)')]}>
                {new Date(item.created_at).toLocaleDateString('it-IT')}
              </Text>
            )}
          </View>
        </View>
      </ImageBackground>
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
    borderRadius: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 180,
    justifyContent: 'space-between',
  },
  heroImageStyle: {
    borderRadius: 16,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
  },
  overlayContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontWeight: '600',
    // Dynamic font size handled by useTextStyles
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '600',
    // Dynamic font size handled by useTextStyles
  },
  bottomContent: {
    gap: 6,
  },
  heroTitle: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    // Dynamic font size and line height handled by useTextStyles
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    // Dynamic font size handled by useTextStyles
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tag: {
    marginRight: 8,
  },
  tagText: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    // Dynamic font size and weight handled by useTextStyles
  },
  moreTagsText: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    // Dynamic font size handled by useTextStyles
  },
  priceText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    // Dynamic font size and weight handled by useTextStyles
  },
  dateText: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    marginTop: 2,
    // Dynamic font size handled by useTextStyles
  },
});