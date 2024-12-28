import React, { useCallback, useMemo, useRef, useState } from 'react';
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
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import Pinchable from 'react-native-pinchable';

interface FeedInfo {
    id: string
    images: string[]
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
    placeholder: string
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen")

const ZoomableImage = ({ item, index, onZoomStateChange, onOpenBottomSheet, placeholder }: ZoomableImageProps) => {
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

    const [isZoomed, setIsZoomed] = useState(false);

    const notifyZoomState = useCallback((zoomed: boolean) => {
        setIsZoomed(zoomed);
        if (onZoomStateChange) {
            onZoomStateChange(zoomed);
        }
    }, [onZoomStateChange]);

    const resetTransform = useCallback(() => {
        'worklet';
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(notifyZoomState)(false);
    }, [notifyZoomState]);

    const pinchGesture = useMemo(() =>
        Gesture.Pinch()
            .onStart(() => {
                isZooming.value = true;
                runOnJS(notifyZoomState)(true);
            })
            .onUpdate((event) => {
                const newScale = savedScale.value * event.scale;
                scale.value = Math.min(Math.max(newScale, 1), 4);

                const centerX = event.focalX;
                const centerY = event.focalY;

                const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
                const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

                translateX.value = Math.min(
                    Math.max(savedTranslateX.value + (centerX - SCREEN_WIDTH / 2) / 4, -maxTranslateX),
                    maxTranslateX
                );
                translateY.value = Math.min(
                    Math.max(savedTranslateY.value + (centerY - SCREEN_HEIGHT / 2) / 4, -maxTranslateY),
                    maxTranslateY
                );
            })
            .onEnd(() => {
                savedScale.value = scale.value;
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;

                if (scale.value <= 1) {
                    resetTransform();
                }
            })
            .runOnJS(true),
        [resetTransform, notifyZoomState]
    );

    const panGesture = useMemo(() =>
        Gesture.Pan()
            .minPointers(2)
            .enabled(scale.value > 1)
            .onStart(() => {
                runOnJS(notifyZoomState)(true);
            })
            .onUpdate((event) => {
                if (scale.value > 1) {
                    const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
                    const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

                    translateX.value = Math.min(
                        Math.max(savedTranslateX.value + event.translationX, -maxTranslateX),
                        maxTranslateX
                    );
                    translateY.value = Math.min(
                        Math.max(savedTranslateY.value + event.translationY, -maxTranslateY),
                        maxTranslateY
                    );
                }
            })
            .onEnd(() => {
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
            }),
        [notifyZoomState]
    );

    const tapGesture = useMemo(() =>
        Gesture.Tap()
            .numberOfTaps(2)
            .onStart((event) => {
                if (scale.value > 1) {
                    resetTransform();
                } else {
                    scale.value = withSpring(2, {
                        damping: 15,
                        stiffness: 100
                    });
                    savedScale.value = 2;
                }
            }),
        [resetTransform]
    );

    const composedGestures = useMemo(() =>
        Gesture.Simultaneous(
            Gesture.Race(pinchGesture, tapGesture),
            panGesture
        ),
        [pinchGesture, panGesture, tapGesture]
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));


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

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const flashListRef = useRef(null);


    const renderImage = useCallback(({ item: imageUrl, index }: any) => (
        <View style={styles.slideContainer}>
            {/* <GestureHandlerRootView style={styles.gestureContainer}>
                <GestureDetector gesture={composedGestures}>
                    <Animated.View style={[styles.imageWrapper, animatedStyle]}> */}
            <Pinchable >
                <ExpoImage
                    source={imageUrl}
                    style={[
                        styles.image,
                        errorStates[`${item.id}-${index}`] && styles.imageError
                    ]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    placeholder={"LEHV6nWB2yk8pyo0adR*.7kCMdnj"}
                    onLoadStart={() => handleImageLoadStart(`${item.id}-${index}`)}
                    onLoad={() => handleImageLoad(`${item.id}-${index}`)}
                    onError={() => handleImageError(`${item.id}-${index}`)}
                />
                {errorStates[`${item.id}-${index}`] && (
                    <View style={styles.errorOverlay}>
                        <Ionicons name="image-outline" size={48} color="#999" />
                        <Text style={styles.errorText}>Unable to load image</Text>
                    </View>
                )}
            </Pinchable>
            {/* </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView> */}
        </View>
    ), [composedGestures, animatedStyle, errorStates]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentImageIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };


    return (
        <View style={styles.container}>
            <FlashList
                ref={flashListRef}
                data={item.images}
                renderItem={renderImage}
                horizontal
                pagingEnabled
                scrollEnabled={!isZoomed}
                showsHorizontalScrollIndicator={false}
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onViewableItemsChanged}
                estimatedItemSize={SCREEN_WIDTH}
                initialScrollIndex={0}
                getItemType={() => 'image'}
                removeClippedSubviews={false}
                snapToInterval={SCREEN_WIDTH}
                decelerationRate="fast"
                overScrollMode="never"
                style={styles.flashListContainer}
            />

            {item.images.length > 1 && (
                <View style={styles.paginationContainer}>
                    {item.images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                currentImageIndex === index && styles.paginationDotActive
                            ]}
                        />
                    ))}
                </View>
            )}

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

            {item.images.length > 1 && (
                <View style={styles.paginationOverlay}>
                    <View style={styles.paginationCounter}>
                        <Text style={styles.paginationText}>
                            {currentImageIndex + 1} / {item.images.length}
                        </Text>
                    </View>
                </View>
            )}
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
        zIndex: 10, // เพิ่ม zIndex
    },
    detailsPanel: {
        position: 'absolute',
        bottom: "13%",
        left: 0,
        right: 0,
        padding: 8,
        zIndex: 10, // เพิ่ม zIndex
    },
    paginationContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: '25%',
        alignSelf: 'center',
        backgroundColor: 'transparent',
        zIndex: 10, // เพิ่ม zIndex
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 3,
    },
    paginationDotActive: {
        backgroundColor: 'white',
    },
    slideContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gestureContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH,
    },
    flashListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationOverlay: {
        position: 'absolute',
        top: "24%",
        right: 20,
        zIndex: 1000,
    },
    paginationCounter: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
    },
    paginationText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '400'
    },
});

export default ZoomableImage;
