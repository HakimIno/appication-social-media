import React, { useCallback, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { HomeNavigationProp } from '..';
import Zoom from 'react-native-zoom-reanimated'
import { ZoomOverlay } from 'src/components/ZoomOverlay';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import LikeAnimation from './LikeAnimation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen")

const styles = StyleSheet.create({
    root: {
        borderRadius: 15,
        backgroundColor: 'white',
        paddingVertical: 10,
        zIndex: 0 // เพิ่ม
    },
    headerContainer: {
        paddingVertical: 5,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'

    },
    cardImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 5,
        zIndex: 100
    },
    cardInfo: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 0
    },
    cardTitle: {
        fontWeight: 'bold',
    },
    cardLikes: {
        opacity: 0.35,
        fontSize: 13,
        fontWeight: 'bold',
    },
    imageWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // เพิ่ม
        zIndex: 1 // เพิ่ม
    },
    avatarContainer: {
        borderRadius: 50,
        padding: 2,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'white',
    },
    userInfo: {
        gap: 2,
    },
    username: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    location: {
        fontSize: 13,
        color: '#666',
    },
    image: {
        width: SCREEN_WIDTH - 32,
        height: (SCREEN_WIDTH - 32) * 1.1,
        borderRadius: 16,
    },
    actionBar: {
        paddingVertical: 14,
    },
    actionButtons: {
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
        marginTop: 8,
        gap: 4,
    },
    likesCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    caption: {
        fontSize: 14,
        color: '#1A1A1A',
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    likeAnimation: {
        position: 'absolute',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});


export interface CardProps {
    image: string;
    title: string;
    likes: string;
    navigation: HomeNavigationProp;
    onZoomStateChange: any
    index: number
}


const Card: React.FC<CardProps & ViewProps> = ({
    style,
    image,
    title,
    likes,
    navigation,
    index,
    onZoomStateChange,
    ...props
}) => {

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const originX = useSharedValue(0);
    const originY = useSharedValue(0);
    const isZooming = useSharedValue(false);
    const likeScale = useSharedValue(0);

    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});

    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);

    const handleDoubleTapLike = () => {
        if (!isLiked) {
            setIsLiked(true);
            setShowLikeAnimation(true);
        }
    };

    const SPRING_CONFIG = {
        damping: 15,
        mass: 0.5,
        stiffness: 100,
    };

    const notifyZoomState = useCallback((zoomed: boolean) => {
        if (onZoomStateChange) runOnJS(onZoomStateChange)(zoomed);
    }, [onZoomStateChange]);

    const resetTransform = () => {
        'worklet';
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(notifyZoomState)(false);
    };

    const pinchGesture = Gesture.Pinch()
        .onStart((e) => {
            runOnJS(notifyZoomState)(true);
            originX.value = e.focalX;
            originY.value = e.focalY;
        })
        .onUpdate((e) => {
            const newScale = Math.min(Math.max(savedScale.value * e.scale, 1), 5);
            scale.value = newScale;

            if (scale.value > 1) {
                const moveX = (e.focalX - originX.value) / scale.value;
                const moveY = (e.focalY - originY.value) / scale.value;
                translateX.value = savedTranslateX.value + moveX;
                translateY.value = savedTranslateY.value + moveY;
            }
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;

            resetTransform();
        });

    const panGesture = Gesture.Pan()
        .enabled(scale.value > 1)
        .onStart(() => {
            runOnJS(notifyZoomState)(true);
        })
        .onUpdate((e) => {
            if (scale.value > 1) {
                const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
                const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

                translateX.value = Math.min(
                    Math.max(savedTranslateX.value + e.translationX / scale.value, -maxTranslateX),
                    maxTranslateX
                );
                translateY.value = Math.min(
                    Math.max(savedTranslateY.value + e.translationY / scale.value, -maxTranslateY),
                    maxTranslateY
                );
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart((e) => {
            runOnJS(handleDoubleTapLike)();
        });


    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }
        ],
        zIndex: scale.value > 1 ? 999 : 1,
    }));

    const composedGestures = Gesture.Simultaneous(
        doubleTapGesture,
        Gesture.Race(pinchGesture, panGesture)
    );



    return (
        <View style={[styles.root, style]} {...props}>
            <View style={styles.headerContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        onPress={() => navigation.navigate("profile_details_screen", { image, username: title })}>
                        <ExpoImage
                            source={{ uri: image }}
                            style={styles.avatar}
                        />
                    </Pressable>
                    <View>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardLikes}>{likes} likes</Text>
                    </View>
                </View>
                <Ionicons name="ellipsis-vertical" size={20} color="#242424" />
            </View>
            <GestureDetector gesture={composedGestures}>
                <Animated.View
                    style={[
                        styles.imageWrapper,
                        animatedStyle,
                    ]}
                >
                    <ExpoImage
                        source={image}
                        style={[
                            {
                                width: SCREEN_WIDTH,
                                height: SCREEN_HEIGHT / 1.8,
                            }
                        ]}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                        priority="high"
                    />
                    {showLikeAnimation && (
                        <LikeAnimation
                            onAnimationComplete={() => setShowLikeAnimation(false)}
                        />
                    )}
                </Animated.View>
            </GestureDetector>

            <View style={styles.actionBar}>
                <View style={styles.actionButtons}>
                    <View style={styles.leftActions}>
                        <Pressable
                            style={styles.actionButton}
                            onPress={() => setIsLiked(!isLiked)}
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={28}
                                color={isLiked ? "#f43f5e" : "#1A1A1A"}
                            />
                        </Pressable>

                        <Pressable style={styles.actionButton}>
                            <Ionicons name="chatbubble-outline" size={26} color="#1A1A1A" />
                        </Pressable>
                        <Pressable style={styles.actionButton}>
                            <Ionicons name="paper-plane-outline" size={26} color="#1A1A1A" />
                        </Pressable>
                    </View>
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => setIsBookmarked(!isBookmarked)}
                    >
                        <Ionicons
                            name={isBookmarked ? "bookmark" : "bookmark-outline"}
                            size={26}
                            color="#1A1A1A"
                        />
                    </Pressable>
                </View>
                <View style={styles.engagementInfo}>
                    <Text style={styles.likesCount}>
                        {likes.toLocaleString()} likes
                    </Text>
                    {/* {caption && (
                        <Text style={styles.caption}>
                            <Text style={{ fontWeight: '600' }}>{username}</Text>
                            {' '}{caption}
                        </Text>
                    )}
                    <Text style={styles.timestamp}>{timestamp}</Text> */}
                </View>
            </View>
        </View >
    );
};

export default Card;