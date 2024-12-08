// PostImage.tsx
import React, { useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SPRING_CONFIG = {
    damping: 12,
    mass: 0.3,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
};

interface PostImageProps {
    imageUrl: string;
    onZoomStart?: () => void;
    onZoomEnd?: () => void;
}

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        aspectRatio: 1,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    imageContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        zIndex: 1,
    },
});

export const PostImage: React.FC<PostImageProps> = ({
    imageUrl,
    onZoomStart,
    onZoomEnd
}) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const originX = useSharedValue(0);
    const originY = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);

    const reset = () => {
        'worklet';
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        overlayOpacity.value = withTiming(0, { duration: 250 });
        if (onZoomEnd) {
            runOnJS(onZoomEnd)();
        }
    };

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            if (onZoomStart) {
                runOnJS(onZoomStart)();
            }
            originX.value = translateX.value;
            originY.value = translateY.value;
        })
        .onUpdate((event) => {
            const newScale = Math.min(Math.max(event.scale, 0.5), 3);
            scale.value = newScale;

            if (newScale > 1) {
                overlayOpacity.value = withTiming(Math.min((newScale - 1) * 0.5, 0.6));
                const centerX = SCREEN_WIDTH / 2;
                const centerY = SCREEN_WIDTH / 2;
                translateX.value = (event.focalX - centerX) * (1 - 1 / newScale);
                translateY.value = (event.focalY - centerY) * (1 - 1 / newScale);
            } else {
                overlayOpacity.value = withTiming(0);
            }
        })
        .onEnd(() => {
            if (scale.value < 1.1) {
                reset();
            }
        });

    const panGesture = Gesture.Pan()
        .averageTouches(true)
        .onUpdate((event) => {
            if (scale.value > 1) {
                const maxX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
                const maxY = (SCREEN_WIDTH * (scale.value - 1)) / 2;

                translateX.value = Math.min(Math.max(
                    originX.value + event.translationX,
                    -maxX
                ), maxX);

                translateY.value = Math.min(Math.max(
                    originY.value + event.translationY,
                    -maxY
                ), maxY);
            }
        })
        .onEnd(() => {
            originX.value = translateX.value;
            originY.value = translateY.value;
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart((event) => {
            if (scale.value > 1) {
                reset();
            } else {
                if (onZoomStart) {
                    runOnJS(onZoomStart)();
                }
                scale.value = withSpring(2, SPRING_CONFIG);
                overlayOpacity.value = withTiming(0.3);

                const centerX = SCREEN_WIDTH / 2;
                const centerY = SCREEN_WIDTH / 2;
                translateX.value = withSpring((event.x - centerX) * 0.5);
                translateY.value = withSpring((event.y - centerY) * 0.5);
            }
        });

    const composedGestures = Gesture.Race(
        doubleTapGesture,
        Gesture.Simultaneous(pinchGesture, panGesture)
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />
            <GestureDetector gesture={composedGestures}>
                <Animated.View style={[styles.imageContainer, animatedStyle]}>
                    <ExpoImage
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        contentFit="cover"
                        transition={150}
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
};