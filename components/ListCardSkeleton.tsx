/**
 * ListCardSkeleton - Updated to use new skeleton system
 * Maintains backward compatibility while using enhanced animations
 */

import React from 'react';
import { SkeletonListCard, SkeletonVariant } from './skeleton/SkeletonCards';

interface ListCardSkeletonProps {
  /**
   * Animazione da utilizzare
   */
  variant?: SkeletonVariant;
  
  /**
   * Mostra rating per ristoranti
   */
  showRating?: boolean;
}

export default function ListCardSkeleton({ 
  variant = SkeletonVariant.SHIMMER,
  showRating = false 
}: ListCardSkeletonProps = {}) {
  return (
    <SkeletonListCard 
      variant={variant}
      showRating={showRating}
    />
  );
} 