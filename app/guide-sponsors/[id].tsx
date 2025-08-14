import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useTextStyles } from '../../hooks/useAccessibleText';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { guideService, GuideSponsor } from '../../services/guide.service';

const { width } = Dimensions.get('window');

type Sponsor = GuideSponsor & {
  description: string;
  sponsor_type: string;
};

const sponsorTypeIcons = {
  fornitore: 'local-shipping',
  beverage: 'local-bar',
  istituzionale: 'account-balance',
  location: 'place',
  partner: 'handshake',
} as const;

const sponsorTypeColors = {
  fornitore: '#FF6B35',
  beverage: '#FFD23F',
  istituzionale: '#4ECDC4',
  location: '#45B7D1',
  partner: '#96CEB4',
} as const;

export default function GuideSponsorsScreen() {
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const textStyles = useTextStyles();
  const { id: guideId } = useLocalSearchParams<{ id: string }>();
  
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guideId) {
      loadSponsors();
    }
  }, [guideId]);

  const loadSponsors = async () => {
    if (!guideId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await guideService.getGuideSponsors(guideId);
      // Convert to expected format with default values
      const sponsorsWithDefaults = response.map(sponsor => ({
        ...sponsor,
        description: sponsor.description || '',
        sponsor_type: sponsor.sponsor_type || 'partner'
      }));
      setSponsors(sponsorsWithDefaults);
      
      // Sponsors loaded successfully
    } catch (error) {
      // Error loading sponsors
      setError('Impossibile caricare gli sponsor');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    onTap();
    router.back();
  };

  const handleSponsorPress = async (sponsor: Sponsor) => {
    onTap();
    if (sponsor.website_url) {
      try {
        await Linking.openURL(sponsor.website_url);
      } catch (error) {
        // Error opening URL
      }
    }
  };

  const getSponsorIcon = (type: string) => {
    return sponsorTypeIcons[type as keyof typeof sponsorTypeIcons] || 'business';
  };

  const getSponsorColor = (type: string) => {
    return sponsorTypeColors[type as keyof typeof sponsorTypeColors] || colors.primary;
  };

  const groupedSponsors = sponsors.reduce((acc, sponsor) => {
    const type = sponsor.sponsor_type || 'partner';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>);

  const renderSponsorCard = ({ item, index }: { item: Sponsor, index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 50)}
      style={styles.sponsorCardWrapper}
    >
      <TouchableOpacity
        style={[styles.sponsorCard, { backgroundColor: colors.card }]}
        onPress={() => handleSponsorPress(item)}
        activeOpacity={0.7}
      >
        {/* Sponsor Header */}
        <View style={styles.sponsorHeader}>
          <View style={styles.sponsorLogoContainer}>
            {item.logo_url ? (
              <Image
                source={{ uri: item.logo_url }}
                style={styles.sponsorLogo}
              />
            ) : (
              <View style={[
                styles.sponsorIconContainer, 
                { backgroundColor: getSponsorColor(item.sponsor_type) }
              ]}>
                <MaterialIcons
                  name={getSponsorIcon(item.sponsor_type) as any}
                  size={32}
                  color="white"
                />
              </View>
            )}
          </View>
          
          <View style={styles.sponsorInfo}>
            <Text style={[styles.sponsorName, textStyles.subtitle(colors.text)]}>
              {item.name}
            </Text>
            <View style={styles.sponsorMeta}>
              <View style={[
                styles.typePill, 
                { backgroundColor: getSponsorColor(item.sponsor_type) + '20' }
              ]}>
                <MaterialIcons
                  name={getSponsorIcon(item.sponsor_type) as any}
                  size={14}
                  color={getSponsorColor(item.sponsor_type)}
                />
                <Text style={[
                  styles.typeText,
                  { color: getSponsorColor(item.sponsor_type) },
                  textStyles.label()
                ]}>
                  {item.sponsor_type.charAt(0).toUpperCase() + item.sponsor_type.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {item.website_url && (
            <View style={styles.linkIcon}>
              <MaterialIcons name="open-in-new" size={20} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Sponsor Description */}
        <Text style={[styles.sponsorDescription, textStyles.body(colors.text)]}>
          {item.description}
        </Text>

        {/* Website Link */}
        {item.website_url && (
          <View style={styles.websiteContainer}>
            <MaterialIcons name="language" size={16} color={colors.primary} />
            <Text style={[styles.websiteText, textStyles.caption(colors.primary)]}>
              Visita il sito web
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSponsorGroup = (type: string, sponsorsInGroup: Sponsor[], groupIndex: number) => (
    <Animated.View
      key={type}
      entering={FadeInDown.delay(200 + groupIndex * 100)}
      style={styles.sponsorGroup}
    >
      <View style={styles.groupHeader}>
        <View style={[styles.groupIcon, { backgroundColor: getSponsorColor(type) }]}>
          <MaterialIcons
            name={getSponsorIcon(type) as any}
            size={24}
            color="white"
          />
        </View>
        <Text style={[styles.groupTitle, textStyles.title(colors.text)]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
        <Text style={[styles.groupCount, textStyles.caption(colors.text + '80')]}>
          {sponsorsInGroup.length} partner
        </Text>
      </View>

      {sponsorsInGroup.map((sponsor, index) => 
        <View key={sponsor.id}>
          {renderSponsorCard({ item: sponsor, index: groupIndex * 10 + index })}
        </View>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, textStyles.body(colors.text)]}>
            Caricamento sponsor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.text + '40'} />
          <Text style={[styles.errorText, textStyles.title(colors.text)]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              onTap();
              loadSponsors();
            }}
          >
            <Text style={styles.retryButtonText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, textStyles.title(colors.text)]}>
          I Nostri Partner
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >


        {/* Sponsors by Type */}
        {sponsors.length > 0 ? (
          Object.entries(groupedSponsors).map(([type, sponsorsInGroup], groupIndex) => (
            <View key={type}>
              {renderSponsorGroup(type, sponsorsInGroup, groupIndex)}
            </View>
          ))
        ) : (
          <Animated.View 
            style={styles.noSponsorsContainer}
            entering={FadeInDown.delay(100)}
          >
            <MaterialIcons name="handshake" size={64} color={colors.text + '40'} />
            <Text style={[styles.noSponsorsText, textStyles.title(colors.text)]}>
              Nessun sponsor disponibile
            </Text>
            <Text style={[styles.noSponsorsSubtext, textStyles.body(colors.text + '80')]}>
              I partner per questa guida saranno disponibili a breve
            </Text>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  sponsorGroup: {
    marginBottom: 32,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  groupCount: {
    fontSize: 14,
  },
  sponsorCardWrapper: {
    marginBottom: 16,
  },
  sponsorCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sponsorLogoContainer: {
    marginRight: 16,
  },
  sponsorLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  sponsorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorInfo: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sponsorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  linkIcon: {
    marginLeft: 12,
  },
  sponsorDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  websiteText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noSponsorsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noSponsorsText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  noSponsorsSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});