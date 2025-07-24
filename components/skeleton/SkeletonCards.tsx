/**
 * SkeletonCards - Skeleton components specifici per le card dell'app
 * Design system 2025 con animazioni fluide - Versione semplificata
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../app/context/ThemeContext';
import { 
  SkeletonBase, 
  SkeletonText, 
  SkeletonImage, 
  SkeletonBadge, 
  SkeletonIcon,
  SkeletonContainer,
  SkeletonVariant 
} from './SkeletonBase';

// Re-export per convenienza
export { SkeletonVariant } from './SkeletonBase';

// ==========================================
// 🏠 HOME SKELETON COMPONENTS
// ==========================================

/**
 * Skeleton per le card grandi della homepage (guide e ristoranti)
 */
export const SkeletonHeroCard: React.FC<{ variant?: SkeletonVariant }> = ({ 
  variant = SkeletonVariant.SHIMMER 
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
      <SkeletonImage 
        width="100%" 
        height={260}
        borderRadius={12}
        variant={variant}
      />
    </View>
  );
};

/**
 * Skeleton per hero section homepage
 */
export const SkeletonHeroSection: React.FC<{ variant?: SkeletonVariant }> = ({ 
  variant = SkeletonVariant.BREATHING 
}) => {
  return (
    <View style={styles.heroSection}>
      <SkeletonImage 
        width="100%" 
        height={240}
        borderRadius={0}
        variant={variant}
        intensity={0.1}
      />
    </View>
  );
};

// ==========================================
// 📱 LIST SKELETON COMPONENTS  
// ==========================================

/**
 * Skeleton migliorato per ListCard
 */
export const SkeletonListCard: React.FC<{ 
  variant?: SkeletonVariant;
  showRating?: boolean;
}> = ({ 
  variant = SkeletonVariant.SHIMMER,
  showRating = false 
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.listCard, { backgroundColor: colors.card }]}>
      {/* Immagine */}
      <SkeletonImage 
        width={80} 
        height={80} 
        borderRadius={8}
        variant={variant}
        style={{ marginRight: 12 }}
      />
      
      {/* Contenuto */}
      <View style={styles.listCardContent}>
        <SkeletonContainer spacing={8}>
          {/* Badge categoria */}
          <SkeletonBadge width={60} variant={variant} />
          
          {/* Titolo */}
          <SkeletonText 
            width="85%" 
            lineHeight={18}
            variant={variant}
          />
          
          {/* Posizione */}
          <SkeletonText 
            width="65%" 
            lineHeight={14}
            variant={variant}
          />
          
          {/* Tags */}
          <View style={styles.tagsRow}>
            <SkeletonBadge width={45} variant={variant} />
            <SkeletonBadge width={50} variant={variant} />
          </View>
          
          {/* Rating e prezzo (se ristorante) */}
          {showRating && (
            <View style={styles.bottomRow}>
              <View style={styles.ratingContainer}>
                <SkeletonIcon size={12} variant={variant} />
                <SkeletonText 
                  width={25} 
                  lineHeight={12}
                  variant={variant}
                  style={{ marginLeft: 4 }}
                />
              </View>
              <SkeletonText 
                width={30} 
                lineHeight={14}
                variant={variant}
              />
            </View>
          )}
        </SkeletonContainer>
      </View>
      
      {/* Chevron */}
      <SkeletonIcon size={20} variant={variant} />
    </View>
  );
};

// ==========================================
// 👤 PROFILE SKELETON COMPONENTS
// ==========================================

/**
 * Skeleton per header profilo
 */
export const SkeletonProfileHeader: React.FC<{ variant?: SkeletonVariant }> = ({ 
  variant = SkeletonVariant.PULSE 
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
      <SkeletonContainer spacing={16}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <SkeletonBase 
            width={100} 
            height={100} 
            borderRadius={50}
            variant={variant}
          />
        </View>
        
        {/* Nome */}
        <SkeletonText 
          width={120} 
          lineHeight={22}
          variant={variant}
        />
        
        {/* Email */}
        <SkeletonText 
          width={160} 
          lineHeight={16}
          variant={variant}
        />
        
        {/* Pulsante */}
        <SkeletonBase 
          width={120} 
          height={36}
          borderRadius={18}
          variant={variant}
        />
      </SkeletonContainer>
    </View>
  );
};

/**
 * Skeleton per statistiche profilo
 */
export const SkeletonProfileStats: React.FC<{ variant?: SkeletonVariant }> = ({ 
  variant = SkeletonVariant.WAVE 
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.statItem}>
          <SkeletonText 
            width={30} 
            lineHeight={24}
            variant={variant}
          />
          <SkeletonText 
            width={60} 
            lineHeight={12}
            variant={variant}
            style={{ marginTop: 4 }}
          />
        </View>
      ))}
    </View>
  );
};

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  // Hero Card
  heroCard: {
    width: 320,
    height: 260,
    marginRight: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Hero Section
  heroSection: {
    height: 240,
    marginBottom: 20,
  },
  
  // List Card
  listCard: {
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
  
  listCardContent: {
    flex: 1,
  },
  
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
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
  
  // Profile
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  
  avatarContainer: {
    alignItems: 'center',
  },
  
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
});

export default SkeletonListCard;