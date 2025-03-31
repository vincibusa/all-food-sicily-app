import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SectionContainerProps {
  title: string;
  linkTo: '/' | '/ristoranti' | '/articoli' | '/profilo';
  linkText: string;
  colors: any;
  delayAnimation?: number;
  children: ReactNode;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ 
  title, 
  linkTo, 
  linkText, 
  colors,
  delayAnimation = 0,
  children 
}) => {
  return (
    <Animated.View 
      style={styles.section}
      entering={FadeInDown.delay(delayAnimation).springify()}
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Link href={linkTo} asChild>
          <TouchableOpacity>
            <Text style={[styles.sectionLink, { color: colors.tint }]}>{linkText}</Text>
          </TouchableOpacity>
        </Link>
      </View>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: width > 400 ? 22 : 20, // Responsive font size
    fontWeight: 'bold',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SectionContainer; 