import React, { useCallback, useRef, useState, useMemo } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { HomeNavigationProp } from '..';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    useSharedValue
} from 'react-native-reanimated';
import Pinchable from 'react-native-pinchable';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from 'src/context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardProps = {
    images: string[];
    title: string;
    likes: string;
    navigation: HomeNavigationProp;
    onZoomStateChange?: (state: boolean) => void;
    cardIndex: number;
}

const DEFAULT_BLURHASH = "LEHV6nWB2yk8pyo0adR*.7kCMdnj"; // blurhash แบบเรียบง่าย

function CardComponent({ images, title, likes, navigation, cardIndex }: CardProps) {
    const { theme, isDarkMode } = useTheme();
    const [isLiked, setIsLiked] = React.useState(false);
    const [isBookmarked, setIsBookmarked] = React.useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const flashListRef = useRef<FlashList<string>>(null);

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handleLike = React.useCallback(() => {
        setIsLiked(prev => !prev);
        scale.value = withSequence(
            withSpring(1.2),
            withSpring(1)
        );
    }, []);

    const handleBookmark = React.useCallback(() => {
        setIsBookmarked(prev => !prev);
        opacity.value = withSequence(
            withTiming(0.5),
            withTiming(1)
        );
    }, []);

    const likeIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const bookmarkIconStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    const renderImage = useCallback(({ item: imageUrl, index: imageIndex }: any) => {
        const imageKey = `card-${cardIndex}-image-${imageIndex}`;
        return (
            <View style={[styles.slideContainer]} key={imageKey}>
                <Pinchable>
                    <ExpoImage
                        key={imageKey}
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        placeholder={DEFAULT_BLURHASH}
                    />
                </Pinchable>
            </View>
        );
    }, [cardIndex]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 300,
    }), []);

    return (
        <Animated.View style={[styles.root, { backgroundColor: 'transparent' }]}>
            {/* Header */}
            <View style={[styles.headerContainer]}>
                <Pressable
                    style={styles.userContainer}
                    onPress={() => navigation.navigate("profile_details_screen", { image: images[0], username: title })}
                >
                    <View style={[styles.avatarContainer, { backgroundColor: isDarkMode ? theme.cardBackground : '#fff' }]}>
                        <ExpoImage
                            source={{ uri: images[0] }}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.username, { color: theme.textColor, zIndex: 1000 }]} numberOfLines={1} ellipsizeMode="tail">
                            {title}
                        </Text>
                        <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                            Bangkok, Thailand
                        </Text>
                    </View>
                </Pressable>
                <Pressable style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={theme.textColor} />
                </Pressable>
            </View>

            {/* Image */}
            <View style={styles.carouselContainer}>
                <FlashList
                    ref={flashListRef}
                    data={images}
                    renderItem={renderImage}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={SCREEN_WIDTH}
                    getItemType={() => 'image'}
                    removeClippedSubviews={false}
                    snapToInterval={SCREEN_WIDTH}
                    decelerationRate="fast"
                    overScrollMode="never"
                    keyExtractor={(item, index) => `card-${cardIndex}-image-${index}`}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    style={{ flexGrow: 1 }}
                />

                {/* Pagination Indicators */}
                {images.length > 1 && (
                    <View style={styles.paginationContainer}>
                        {images.map((_, index) => (
                            <View
                                key={`dot-${cardIndex}-${index}`}
                                style={[
                                    styles.paginationDot,
                                    currentIndex === index && styles.paginationDotActive
                                ]}
                            />
                        ))}
                    </View>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <View style={styles.paginationOverlay}>
                        <View style={styles.paginationCounter}>
                            <Text style={styles.paginationText}>
                                {currentIndex + 1} / {images.length}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Actions */}
            <View style={[styles.actionBar, { backgroundColor: theme.backgroundColor }]}>
                <View style={styles.leftActions}>
                    <AnimatedPressable
                        style={[styles.actionButton, likeIconStyle]}
                        onPress={handleLike}
                    >
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={28}
                            color={isLiked ? "#f43f5e" : theme.textColor}
                        />
                    </AnimatedPressable>
                    <Pressable style={styles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={24} color={theme.textColor} />
                    </Pressable>
                    <Pressable style={styles.actionButton}>
                        <Ionicons name="paper-plane-outline" size={24} color={theme.textColor} />
                    </Pressable>
                </View>
                <AnimatedPressable
                    style={[styles.actionButton, bookmarkIconStyle]}
                    onPress={handleBookmark}
                >
                    <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={theme.textColor}
                    />
                </AnimatedPressable>
            </View>

            {/* Engagement Info */}
            <View style={[styles.engagementInfo, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.likesCount, { color: theme.textColor, zIndex: 1000 }]}>
                    {parseInt(likes).toLocaleString()} likes
                </Text>
                <Text style={[styles.caption, { color: theme.textColor, zIndex: 1000 }]}>
                    <Text style={[styles.username, { color: theme.textColor, zIndex: 1000 }]}>{title}</Text>
                    {' '}Exploring the beauty of nature 🌿
                </Text>
                <Text style={[styles.timestamp, { zIndex: 1000 }]}>2 hours ago</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: {
        marginBottom: 16,
        borderRadius: 16,
        width: SCREEN_WIDTH,
        alignSelf: 'center',
        overflow: 'hidden',
        zIndex: 1000,
        elevation: 1000,
    },
    headerContainer: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        zIndex: 1000,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        borderRadius: 24,
        padding: 2,


    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    userInfo: {
        gap: 2,
        width: '70%',
    },
    username: {
        fontSize: 15,
        fontFamily: 'LINESeedSansTH_A_ฺBd',
        color: '#1A1A1A',
        zIndex: 1000,
    },
    location: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'LINESeedSansTH_A_ฺRg',
    },
    moreButton: {
        padding: 0,
    },
    carouselContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 1.8,
        position: 'relative',
    },
    slideContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 1.8,
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 1.8,
    },
    imageGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    actionBar: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionButton: {
        padding: 4,
    },
    engagementInfo: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        gap: 4,
    },
    likesCount: {
        fontSize: 14,
        fontFamily: 'LINESeedSansTH_A_ฺBd',
        color: '#1A1A1A',
    },
    caption: {
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'LINESeedSansTH_A_ฺRg',
        lineHeight: 20,
        zIndex: 1000,
    },
    timestamp: {
        fontSize: 12,
        fontFamily: 'LINESeedSansTH_A_ฺRg',
        color: '#666',
        marginTop: 4,
    },
    paginationContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: '5%',
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 10,
        padding: 3,
        borderRadius: 100,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 2,
    },
    paginationDotActive: {
        backgroundColor: 'white',
    },
    paginationOverlay: {
        position: 'absolute',
        top: "4%",
        right: 20,
        zIndex: 1000,
    },
    paginationCounter: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 100,
    },
    paginationText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '400'
    },
});

export default CardComponent;