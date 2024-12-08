import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface FeedInfo {
    id: string
    image: string
    title: string
    likes: number
    comments: number
    description: string
}

interface ZoomableImageProps {
    item: FeedInfo
    index: number
    onZoomStateChange?: (isZoomed: boolean) => void
    onOpenBottomSheet?: () => void
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen")
const PLACEHOLDER_BLURHASH = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const ZoomableImage = ({ item, index, onZoomStateChange, onOpenBottomSheet }: ZoomableImageProps) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const originX = useSharedValue(0);
    const originY = useSharedValue(0);
    const isZooming = useSharedValue(false);

    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});

    const [isLiked, setIsLiked] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
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
            if (scale.value > 1) {
                resetTransform();
            } else {
                runOnJS(notifyZoomState)(true);
                scale.value = withSpring(2, SPRING_CONFIG);
                savedScale.value = 2;

                const tapX = e.x - SCREEN_WIDTH / 2;
                const tapY = e.y - SCREEN_HEIGHT / 2;
                translateX.value = withSpring(-tapX / 2, SPRING_CONFIG);
                translateY.value = withSpring(-tapY / 2, SPRING_CONFIG);
                savedTranslateX.value = -tapX / 2;
                savedTranslateY.value = -tapY / 2;
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const composedGestures = Gesture.Simultaneous(
        Gesture.Race(doubleTapGesture, pinchGesture),
        panGesture
    );

    const handleImageLoadStart = useCallback((id: string) => {
        setLoadingStates(prev => ({ ...prev, [id]: true }));
    }, []);

    const handleImageLoad = useCallback((id: string) => {
        setLoadingStates(prev => ({ ...prev, [id]: false }));
        setErrorStates(prev => ({ ...prev, [id]: false }));
    }, []);

    const handleImageError = useCallback((id: string) => {
        setLoadingStates(prev => ({ ...prev, [id]: false }));
        setErrorStates(prev => ({ ...prev, [id]: true }));
    }, []);

    const handleLike = useCallback(() => {
        setIsLiked(prev => !prev);
    }, []);

    const toggleDetails = useCallback(() => {
        setShowDetails(prev => !prev);
    }, []);


    return (
        <View style={styles.container}>
            <GestureHandlerRootView style={styles.container}>
                <GestureDetector gesture={composedGestures}>
                    <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                        <ExpoImage
                            source={item.image}
                            style={[
                                styles.image,
                                errorStates[item.id] && styles.imageError
                            ]}
                            contentFit="cover"
                            transition={200}
                            placeholder={PLACEHOLDER_BLURHASH}
                            onLoadStart={() => handleImageLoadStart(item.id)}
                            onLoad={() => handleImageLoad(item.id)}
                            onError={() => handleImageError(item.id)}
                            cachePolicy="memory-disk"
                            priority="high"
                        />

                        {loadingStates[item.id] && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#fff" />
                                <Text style={styles.errorText}>Loading...</Text>
                            </View>
                        )}

                        {errorStates[item.id] && (
                            <View style={styles.errorOverlay}>
                                <Ionicons name="image-outline" size={48} color="#999" />
                                <Text style={styles.errorText}>Unable to load image</Text>
                            </View>
                        )}
                    </Animated.View>

                </GestureDetector>

                <View style={styles.socialContainer}>
                    <Pressable onPress={handleLike} style={styles.iconButton}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={28}
                            color={isLiked ? "#ff4444" : "white"}
                        />
                        {!!item.likes && (
                            <Text style={styles.socialText}>{item.likes}</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.iconButton} onPress={onOpenBottomSheet}>
                        <Ionicons name="chatbubble-outline" size={26} color="white" />
                        {!!item.comments && (
                            <Text style={styles.socialText}>{item.comments}</Text>
                        )}
                    </Pressable>
                </View>

                <View style={styles.detailsPanel}>
                    <Text style={styles.detailsTitle} numberOfLines={1}>{item.title}</Text>
                    {item.description && (
                        <Text style={styles.detailsDescription} numberOfLines={2}>{item.description}</Text>
                    )}
                </View>
            </GestureHandlerRootView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -10
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 1.8,
        borderRadius: 8,
    },
    imageError: {
        backgroundColor: '#f3f4f6'
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: '#999',
        marginTop: 8,
    },
    socialContainer: {
        position: 'absolute',
        bottom: "5%",
        left: -10,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    iconButton: {
        marginRight: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    socialText: {
        marginLeft: 4,
        color: 'white',
        fontSize: 16,
    },
    detailsPanel: {
        position: 'absolute',
        bottom: "13%",
        left: 0,
        right: 0,
        padding: 8
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#d1d5db',
    },
    detailsDescription: {
        fontSize: 13,
        color: '#d1d5db',
    },
    detailsStats: {
        fontSize: 14,
        color: '#888',
    },
});

export default ZoomableImage;
