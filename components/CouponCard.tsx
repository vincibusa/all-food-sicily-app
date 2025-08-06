import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../app/context/ThemeContext';
import { Coupon } from '../types';
import { CouponStorage } from '../services/couponStorage';
import { couponService } from '../services/coupon.service';

interface CouponCardProps {
  coupon: Coupon;
  style?: ViewStyle;
  onDownload?: (coupon: Coupon) => void;
  onUse?: (coupon: Coupon) => void;
  showRestaurantName?: boolean;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  style,
  onDownload,
  onUse,
  showRestaurantName = false,
}) => {
  const { colors } = useTheme();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isUsed, setIsUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const couponViewRef = useRef<any>(null);
  const isWeekday = CouponStorage.isWeekday();

  // Check if coupon is downloaded and used on component mount
  useEffect(() => {
    checkCouponStatus();
  }, [coupon.id]);

  const checkCouponStatus = async () => {
    try {
      const downloaded = await CouponStorage.isCouponDownloaded(coupon.id);
      setIsDownloaded(downloaded);

      if (downloaded) {
        const localCoupon = await CouponStorage.getLocalCoupon(coupon.id);
        setIsUsed(localCoupon?.used || false);
      }
    } catch (error) {
      console.error('Error checking coupon status:', error);
    }
  };

  const generateCouponImage = async (): Promise<string> => {
    if (!couponViewRef.current) {
      throw new Error('Coupon view ref not ready');
    }

    try {
      // Usa dimensioni fisse e compatibili
      const result = await captureRef(couponViewRef.current, {
        result: 'tmpfile',
        width: 400,
        height: 500,
        quality: 0.9,
        format: 'png',
      });

      return result;
    } catch (error) {
      console.error('Error generating coupon image:', error);
      throw new Error('Errore nella generazione dell\'immagine');
    }
  };

  const handleDownloadPress = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (isDownloaded) {
        // Se già scaricato, genera e condividi l'immagine
        const imageUri = await generateCouponImage();
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(imageUri, {
            mimeType: 'image/png',
            dialogTitle: `Coupon ${coupon.title}`,
          });
        }
        return;
      }

      // Prima salva il coupon localmente
      await CouponStorage.downloadCoupon(coupon.id);
      setIsDownloaded(true);

      // Poi genera e condividi l'immagine
      const imageUri = await generateCouponImage();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          dialogTitle: `Coupon ${coupon.title}`,
        });
      }

      Alert.alert(
        'Coupon scaricato!',
        `Il coupon "${coupon.title}" è stato salvato nei tuoi coupon e condiviso.`,
        [{ text: 'OK' }]
      );

      onDownload?.(coupon);
    } catch (error) {
      console.error('Error downloading coupon:', error);
      Alert.alert(
        'Errore',
        'Non è stato possibile scaricare il coupon. Riprova.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUsePress = async () => {
    if (loading || isUsed) return;

    if (!isWeekday) {
      Alert.alert(
        'Coupon non valido',
        'I coupon sono validi solo dal lunedì al venerdì.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Usare il coupon?',
      `Vuoi usare il coupon "${coupon.title}"? Una volta usato non potrai più utilizzarlo.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Usa Coupon',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Mark as used locally
              await CouponStorage.useCoupon(coupon.id);
              
              // Increment usage count on server
              await couponService.useCoupon(coupon.id);

              setIsUsed(true);

              Alert.alert(
                'Coupon utilizzato!',
                'Il coupon è stato utilizzato con successo.',
                [{ text: 'OK' }]
              );

              onUse?.(coupon);
            } catch (error) {
              console.error('Error using coupon:', error);
              Alert.alert(
                'Errore',
                'Non è stato possibile utilizzare il coupon. Riprova.',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDiscountValue = () => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    } else {
      return `€${coupon.discount_value}`;
    }
  };

  const getStatusColor = () => {
    if (isUsed) return colors.textSecondary;
    if (!isWeekday) return colors.warning;
    return colors.success;
  };

  const getStatusText = () => {
    if (isUsed) return 'Utilizzato';
    if (!isWeekday) return 'Valido lun-ven';
    return 'Valido oggi';
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginVertical: 6,
      marginHorizontal: 16,
      borderLeftWidth: 4,
      borderLeftColor: isUsed ? colors.textSecondary : colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    // Stili per l'immagine del coupon
    couponImageContainer: {
      position: 'absolute',
      left: -9999,
      top: -9999,
      width: 400,
      backgroundColor: '#ffffff',
      padding: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#000000',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    couponImageHeader: {
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: '#e0e0e0',
      borderStyle: 'dashed',
    },
    couponImageBadge: {
      backgroundColor: '#dc2626',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      marginBottom: 12,
    },
    couponImageBadgeText: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    couponImageTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'center',
      marginBottom: 8,
    },
    couponImageDescription: {
      fontSize: 15,
      color: '#000000',
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 20,
    },
    couponImageRestaurant: {
      fontSize: 17,
      fontWeight: '600',
      color: '#dc2626',
      textAlign: 'center',
    },
    couponImageContent: {
      alignItems: 'center',
      marginBottom: 20,
    },
    couponImageCode: {
      backgroundColor: '#f8f8f8',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 10,
      marginBottom: 15,
      borderWidth: 2,
      borderColor: '#333333',
    },
    couponImageCodeText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000000',
      fontFamily: 'monospace',
      letterSpacing: 2,
    },
    couponImageTerms: {
      fontSize: 13,
      color: '#333333',
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 15,
    },
    couponImageFooter: {
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      paddingTop: 15,
      alignItems: 'center',
    },
    couponImageBranding: {
      fontSize: 14,
      fontWeight: '600',
      color: '#dc2626',
    },
    // Stili per la card normale
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    discountBadge: {
      backgroundColor: isUsed ? colors.textSecondary : colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 60,
      alignItems: 'center',
    },
    discountText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    restaurantName: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
      marginBottom: 8,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    downloadButton: {
      backgroundColor: colors.primary,
    },
    useButton: {
      backgroundColor: colors.success,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '600',
    },
    code: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: colors.textSecondary,
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginTop: 8,
      alignSelf: 'flex-start',
    },
  });

  return (
    <>
      {/* Hidden view for image generation */}
      <View ref={couponViewRef} style={styles.couponImageContainer}>
        <View style={styles.couponImageHeader}>
          <View style={styles.couponImageBadge}>
            <Text style={styles.couponImageBadgeText}>
              {formatDiscountValue()} di sconto
            </Text>
          </View>
          <Text style={styles.couponImageTitle}>{coupon.title}</Text>
          {coupon.description && (
            <Text style={styles.couponImageDescription}>
              {coupon.description}
            </Text>
          )}
          {coupon.restaurant && (
            <Text style={styles.couponImageRestaurant}>
              {coupon.restaurant.name} - {coupon.restaurant.city}
            </Text>
          )}
        </View>

        <View style={styles.couponImageContent}>
          <View style={styles.couponImageCode}>
            <Text style={styles.couponImageCodeText}>
              {coupon.code}
            </Text>
          </View>
          
          <Text style={styles.couponImageTerms}>
            • Valido solo Lunedì-Venerdì{'\n'}
            • Mostra questo coupon al momento dell'ordine{'\n'}
            {coupon.min_order_amount && `• Ordine minimo: €${coupon.min_order_amount}\n`}
            {coupon.usage_limit && `• Utilizzi rimasti: ${coupon.usage_limit - coupon.usage_count}\n`}
            • Non cumulabile con altre offerte
          </Text>
        </View>

        <View style={styles.couponImageFooter}>
          <Text style={styles.couponImageBranding}>
            🍝 Generato tramite All Food Sicily
          </Text>
        </View>
      </View>

      {/* Visible coupon card */}
      <Animated.View entering={FadeInDown.springify()}>
        <TouchableOpacity
          style={[styles.container, style]}
          activeOpacity={0.7}
          disabled={loading}
        >
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {coupon.title}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {formatDiscountValue()}
              </Text>
            </View>
          </View>

          {showRestaurantName && coupon.restaurant && (
            <Text style={styles.restaurantName}>
              {coupon.restaurant.name}
            </Text>
          )}

          {coupon.description && (
            <Text style={styles.description} numberOfLines={3}>
              {coupon.description}
            </Text>
          )}

          <Text style={styles.code}>Codice: {coupon.code}</Text>

          <View style={styles.footer}>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor() },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor() },
                ]}
              >
                {getStatusText()}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.downloadButton]}
                onPress={handleDownloadPress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isDownloaded ? 'Condividi' : 'Scarica'}
                  </Text>
                )}
              </TouchableOpacity>

              {isDownloaded && !isUsed && isWeekday && (
                <TouchableOpacity
                  style={[styles.button, styles.useButton]}
                  onPress={handleUsePress}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Usa</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};