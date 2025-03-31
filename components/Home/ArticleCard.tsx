import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Article, RenderItemInfo } from '../../types';

const { width } = Dimensions.get('window');
const AnimatedImage = Animated.createAnimatedComponent(Animated.Image);

interface ArticleCardProps {
  itemInfo: RenderItemInfo<Article>;
  colors: any;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ itemInfo, colors }) => {
  const { item, index } = itemInfo;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
    >
      <Link href={{ pathname: '/articoli', params: { id: item.id } }} asChild>
        <TouchableOpacity style={styles.articleCard}>
          <AnimatedImage 
            source={{ uri: item.image }} 
            style={styles.articleImage}
            entering={FadeInDown.delay(index * 150).springify()} 
          />
          <View style={[styles.articleInfo, { backgroundColor: colors.card }]}>
            <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  articleCard: {
    width: width * 0.75 > 300 ? 280 : width * 0.75, // Responsive width
    height: 220,
    marginRight: 24,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  articleImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  articleInfo: {
    padding: 12,
    height: 70,
    justifyContent: 'center',
  },
  categoryPill: {
    position: 'absolute',
    top: -15,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default ArticleCard; 