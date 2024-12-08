import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const SPRING_CONFIG = {
    damping: 20,
    mass: 0.5,
    stiffness: 150,
    overshootClamping: true,
};

interface ZoomableImageProps {
    source: string;
    onZoomStateChange?: (isZoomed: boolean) => void;
}

const InstagramZoomableImage = ({ source, onZoomStateChange }: ZoomableImageProps) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const originX = useSharedValue(0);
    const originY = useSharedValue(0);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const notifyZoomState = useCallback((zoomed: boolean) => {
        onZoomStateChange?.(zoomed);
    }, [onZoomStateChange]);

    const resetToInitialPosition = () => {
        'worklet';
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(notifyZoomState)(false);
    };

    const calculateMaxTranslation = (currentScale: number) => {
        'worklet';
        const horizotalBoundary = (imageSize.width * (currentScale - 1)) / 2;
        const verticalBoundary = (imageSize.height * (currentScale - 1)) / 2;
        return { horizotalBoundary, verticalBoundary };
    };

    const constrainTranslation = (tx: number, ty: number, currentScale: number) => {
        'worklet';
        const { horizotalBoundary, verticalBoundary } = calculateMaxTranslation(currentScale);
        return {
            x: Math.min(Math.max(tx, -horizotalBoundary), horizotalBoundary),
            y: Math.min(Math.max(ty, -verticalBoundary), verticalBoundary),
        };
    };

    const pinchGesture = Gesture.Pinch()
        .onStart((e) => {
            runOnJS(notifyZoomState)(true);
            originX.value = e.focalX;
            originY.value = e.focalY;
        })
        .onUpdate((e) => {
            const newScale = Math.min(Math.max(savedScale.value * e.scale, 1), 3);
            scale.value = newScale;

            if (newScale > 1) {
                const moveX = (e.focalX - originX.value) / newScale;
                const moveY = (e.focalY - originY.value) / newScale;
                const constrained = constrainTranslation(
                    savedTranslateX.value + moveX,
                    savedTranslateY.value + moveY,
                    newScale
                );
                translateX.value = constrained.x;
                translateY.value = constrained.y;
            }
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value === 1) {
                resetToInitialPosition();
            } else {
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
            }
        });

    const panGesture = Gesture.Pan()
        .enabled(scale.value > 1)
        .averageTouches(true)
        .onStart(() => {
            runOnJS(notifyZoomState)(true);
        })
        .onUpdate((e) => {
            if (scale.value > 1) {
                const constrained = constrainTranslation(
                    savedTranslateX.value + e.translationX / scale.value,
                    savedTranslateY.value + e.translationY / scale.value,
                    scale.value
                );
                translateX.value = constrained.x;
                translateY.value = constrained.y;
            }
        })
        .onEnd(() => {
            if (scale.value > 1) {
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
            }
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart((e) => {
            if (scale.value > 1) {
                resetToInitialPosition();
            } else {
                runOnJS(notifyZoomState)(true);
                scale.value = withSpring(2, SPRING_CONFIG);
                savedScale.value = 2;

                const tapX = e.x - imageSize.width / 2;
                const tapY = e.y - imageSize.height / 2;
                const constrained = constrainTranslation(-tapX / 2, -tapY / 2, 2);
                translateX.value = withSpring(constrained.x, SPRING_CONFIG);
                translateY.value = withSpring(constrained.y, SPRING_CONFIG);
                savedTranslateX.value = constrained.x;
                savedTranslateY.value = constrained.y;
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

    return (
        <GestureHandlerRootView>
            <GestureDetector gesture={composedGestures}>
                <Animated.View style={styles.container}>
                    <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                        <ExpoImage
                            source={source}
                            style={[styles.image, { width: SCREEN_WIDTH, height: 100 }]}
                            contentFit="cover"
                            transition={200}
                            onLoad={({ source: { width, height } }) => {
                                const aspectRatio = width / height;
                                let newWidth = SCREEN_WIDTH;
                                let newHeight = SCREEN_WIDTH / aspectRatio;

                                if (newHeight > SCREEN_HEIGHT * 0.8) {
                                    newHeight = SCREEN_HEIGHT * 0.8;
                                    newWidth = newHeight * aspectRatio;
                                }

                                setImageSize({ width: newWidth, height: newHeight });
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        backgroundColor: '#f3f4f6',
    },
});

export default InstagramZoomableImage;