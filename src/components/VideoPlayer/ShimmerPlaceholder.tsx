import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

export const ShimmerPlaceholder: React.FC = () => {
    const shimmerValue = useSharedValue(0);

    useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerValue.value * 200 }],
    }));

    return (
        <View style={[StyleSheet.absoluteFill, styles.shimmerContainer]}>
            <Animated.View style={[styles.shimmer, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    shimmerContainer: {
        overflow: 'hidden',
        backgroundColor: '#E0E0E0',
    },
    shimmer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        transform: [{ skewX: '-20deg' }],
    },
});